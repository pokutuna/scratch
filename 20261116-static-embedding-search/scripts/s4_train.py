"""段階 4c: Tokenlearn。単語ベクトルの重み付き和が、教師モデルのクエリベクトルに近づくよう表を学習する。

学習前の表 (段階 3) は、語を 1 つずつ教師モデルに通しただけのもの。複数語のクエリでは、単語ベクトルの和と、
クエリ全体を教師モデルに通したベクトルとがずれる。学習用クエリ t ごとに教師のベクトル y_t を用意し、次を最小にする。

    L = Σ_t (1 - cos(q_t, y_t))  +  μ/2 Σ_i ||e_i - e_i⁰||²  +  λ/2 Σ_i (w_i - w_i⁰)²
    q_t = Σ_{i∈t} w_i e_i

第 2、第 3 項は、学習用クエリにあまり出てこない語のベクトルと重みが初期値から離れすぎないようにする正則化。
最適化は Adagrad。検証用クエリでの cos の平均が良くならなくなったら止める。

検証用クエリは、LLM のクエリから文字列のハッシュで 10% を固定で取り分ける。学習に使うクエリの組み合わせを変えても
同じ検証用クエリで比べられるようにするため。s3_compare.py のクエリも学習から除く。

    uv run python scripts/s4_train.py --sources synth --name synth
    uv run python scripts/s4_train.py --sources synth,llm --name synth_llm
"""

import argparse
import hashlib
import json
import os

import numpy as np
import torch

import static
import teacher
from s3_compare import QUERIES as COMPARE_QUERIES

MU = 0.05  # 単語ベクトルを初期値に引き戻す強さ
LAMBDA = 0.01  # 重みを初期値に引き戻す強さ (弱め)
LR_VEC = 0.01
LR_WEIGHT = 0.05
BATCH = 64
MAX_EPOCHS = 12
PATIENCE = 2
MIN_WEIGHT = 0.01


def load_queries() -> tuple[dict[str, list[str]], list[str]]:
    """学習用クエリを出どころごとに読み、検証用クエリを取り分ける。"""
    with open("data/queries_synth.jsonl", encoding="utf-8") as f:
        synth = [json.loads(line)["query"] for line in f]
    with open("queries/llm.jsonl", encoding="utf-8") as f:
        llm = [q for line in f for q in json.loads(line)["queries"]]

    def is_val(q: str) -> bool:
        return hashlib.sha256(q.encode()).digest()[0] < 26  # 約 10%

    val = sorted({q for q in llm if is_val(q)})
    excluded = set(val) | set(COMPARE_QUERIES)
    train = {
        "synth": sorted(set(synth) - excluded),
        "llm": sorted(set(llm) - excluded),
    }
    return train, val


def teacher_vectors(queries: list[str]) -> np.ndarray:
    """教師モデルのクエリベクトル。クエリの文字列をキーにキャッシュする。"""
    path = teacher.data_path("query_teacher.npz")
    cache: dict[str, np.ndarray] = {}
    if os.path.exists(path):
        z = np.load(path)
        cache = dict(zip(z["texts"].tolist(), z["vecs"]))
    missing = sorted({q for q in queries if q not in cache})
    if missing:
        cache.update(zip(missing, teacher.encode_queries(missing)))
        texts = list(cache)
        np.savez(path, texts=np.array(texts), vecs=np.stack([cache[t] for t in texts]))
    return np.stack([cache[q] for q in queries])


def to_batch(
    token_lists: list[list[str]], index: dict[str, int]
) -> tuple[torch.Tensor, torch.Tensor]:
    """語の列を、語彙の番号を詰めた行列 (足りない分は 0) とマスクにする。"""
    ids = [[index[t] for t in tokens if t in index] for tokens in token_lists]
    width = max(len(x) for x in ids)
    padded = torch.zeros(len(ids), width, dtype=torch.long)
    mask = torch.zeros(len(ids), width)
    for row, x in enumerate(ids):
        padded[row, : len(x)] = torch.tensor(x)
        mask[row, : len(x)] = 1
    return padded, mask


def embed(
    E: torch.Tensor, w: torch.Tensor, ids: torch.Tensor, mask: torch.Tensor
) -> torch.Tensor:
    return ((w[ids] * mask)[..., None] * E[ids]).sum(1)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", default="synth,llm")
    ap.add_argument("--name", required=True)
    args = ap.parse_args()

    with open("data/vocab.json", encoding="utf-8") as f:
        vocab = json.load(f)
    index = {w: i for i, w in enumerate(vocab)}
    E0 = torch.from_numpy(np.load(teacher.data_path("word_vecs0.npy")))
    w0 = torch.from_numpy(np.load("data/word_idf.npy"))

    train_by_source, val = load_queries()
    train = [q for s in args.sources.split(",") for q in train_by_source[s]]

    # 表にある語を 1 つも含まないクエリは、単語表ではベクトルを作れないので除く
    def usable(queries: list[str]) -> tuple[list[str], list[list[str]]]:
        pairs = [
            (q, t)
            for q, t in zip(queries, static.tokenize(queries))
            if any(x in index for x in t)
        ]
        return [q for q, _ in pairs], [t for _, t in pairs]

    train, train_tokens = usable(train)
    val, val_tokens = usable(val)
    covered = {x for t in train_tokens for x in t if x in index}
    print(f"train {len(train)} queries ({args.sources}), val {len(val)} queries")
    print(
        f"vocab covered by train queries: {len(covered)}/{len(vocab)} ({len(covered) / len(vocab):.0%})"
    )

    Y = torch.from_numpy(teacher_vectors(train))
    Y_val = torch.from_numpy(teacher_vectors(val))
    val_ids, val_mask = to_batch(val_tokens, index)

    E = E0.clone().requires_grad_()
    w = w0.clone().requires_grad_()
    opt = torch.optim.Adagrad(
        [{"params": [E], "lr": LR_VEC}, {"params": [w], "lr": LR_WEIGHT}]
    )

    def val_cos() -> float:
        with torch.no_grad():
            q = embed(E, w, val_ids, val_mask)
            return torch.nn.functional.cosine_similarity(q, Y_val).mean().item()

    best = (val_cos(), E.detach().clone(), w.detach().clone(), 0)
    print(f"epoch 0  val cos {best[0]:.4f}")
    rng = np.random.default_rng(0)
    n = len(train)
    for epoch in range(1, MAX_EPOCHS + 1):
        order = rng.permutation(n)  # エポックごとにクエリの順番を混ぜる
        for start in range(0, n, BATCH):
            idx = order[start : start + BATCH]
            ids, mask = to_batch([train_tokens[i] for i in idx], index)
            q = embed(E, w, ids, mask)
            fit = (1 - torch.nn.functional.cosine_similarity(q, Y[idx])).sum()
            # 正則化は全クエリに対する項なので、バッチの割合 (B/N) だけ掛ける
            reg = MU / 2 * ((E - E0) ** 2).sum() + LAMBDA / 2 * ((w - w0) ** 2).sum()
            loss = fit + len(idx) / n * reg
            opt.zero_grad()
            loss.backward()
            opt.step()
            with torch.no_grad():
                w.clamp_(min=MIN_WEIGHT)
        score = val_cos()
        print(f"epoch {epoch}  val cos {score:.4f}")
        if score > best[0]:
            best = (score, E.detach().clone(), w.detach().clone(), epoch)
        elif epoch - best[3] >= PATIENCE:
            break

    score, E_best, w_best, epoch = best
    out_vecs = teacher.data_path(f"word_vecs_{args.name}.npy")
    np.save(out_vecs, E_best.numpy())
    np.save(teacher.data_path(f"word_weights_{args.name}.npy"), w_best.numpy())
    print(
        f"best: epoch {epoch}  val cos {score:.4f}  -> {out_vecs}"
    )


if __name__ == "__main__":
    main()
