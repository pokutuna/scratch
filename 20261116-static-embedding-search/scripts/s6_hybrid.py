"""段階 6: ベクトル検索と BM25 を RRF で合成する。

単語表によるベクトル検索は言い換えに強いが、固有名詞や珍しい語の一致には弱い (表にない語は無視され、
表にある語も平均的な方向に引っ張られる)。BM25 はその逆。両者の順位を RRF (Reciprocal Rank Fusion) で合成する。

    RRF(p) = 1 / (k + rank_ベクトル(p)) + α / (k + rank_BM25(p))
    rank は 1 始まり。BM25 で見つからない (どの語も含まない) ページは第 2 項を足さない。α は BM25 の重み

スコアの値ではなく順位だけを使うので、cosine (0.7〜0.9 に集まる) と BM25 (0〜数十) の尺度の違いを気にしなくてよい。

ベクトル検索は段階 5 で書き出した int8 のファイル (data/index_*) を、ブラウザと同じ計算で使う。
BM25 の単語分割は単語表と同じ site/tokenize.mjs で、段階 3 で保存した data/chunk_tokens.json を使う。

    uv run python scripts/s6_hybrid.py
"""

import json
import math
from collections import Counter

import numpy as np

import teacher
from evaluate import EvalSet, load_eval_set, summary, target_ranks, to_page_scores

K1 = 1.2
B = 0.75
RRF_K = 10  # 小さいほど上位の順位差を重く見る。よく使われる値は 60
BM25_WEIGHT = 0.5  # BM25 の順位の重み。1 だと言い換えのクエリで単語表だけより悪くなった


class BM25:
    def __init__(self, docs: list[list[str]]):
        self.n_docs = len(docs)
        lengths = np.array([len(d) for d in docs], dtype=np.float32)
        norm = K1 * (
            1 - B + B * lengths / lengths.mean()
        )  # 文書の長さによる補正 (文書ごとに固定)
        # 語 -> (その語を含む文書の番号, その文書での BM25 の tf の部分) の転置インデックス
        postings: dict[str, tuple[list[int], list[float]]] = {}
        for i, doc in enumerate(docs):
            for term, tf in Counter(doc).items():
                ids, parts = postings.setdefault(term, ([], []))
                ids.append(i)
                parts.append(tf * (K1 + 1) / (tf + norm[i]))
        self.postings = {
            t: (np.array(ids), np.array(parts)) for t, (ids, parts) in postings.items()
        }

    def idf(self, term: str) -> float:
        df = len(self.postings[term][0])
        return math.log((self.n_docs - df + 0.5) / (df + 0.5) + 1)

    def scores(self, tokens: list[str]) -> np.ndarray:
        out = np.zeros(self.n_docs, dtype=np.float32)
        for term in set(tokens):
            if term in self.postings:
                ids, parts = self.postings[term]
                out[ids] += self.idf(term) * parts
        return out


def load_index() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """段階 5 のファイルを読む。(単語表 int8, 単語の倍率, 文書 int8, 文書の倍率)"""
    with open(teacher.data_path("index_meta.json")) as f:
        dims = json.load(f)["dims"]
    words = np.fromfile(teacher.data_path("index_words.i8"), np.int8).reshape(-1, dims)
    docs = np.fromfile(teacher.data_path("index_docs.i8"), np.int8).reshape(-1, dims)
    word_scale = np.fromfile(teacher.data_path("index_word_scale.f32"), np.float32)
    doc_scale = np.fromfile(teacher.data_path("index_doc_scale.f32"), np.float32)
    return words, word_scale, docs, doc_scale


def vector_scores(ev: EvalSet) -> np.ndarray:
    """(クエリ, チャンク) のスコア。クエリ = Σ 倍率 × int8 の行、スコア = 文書の倍率 × int8 の内積。"""
    words, word_scale, docs, doc_scale = load_index()
    queries = np.stack(
        [
            (word_scale[ids, None] * words[ids]).sum(0)
            for ids in (
                [ev.index[t] for t in tokens if t in ev.index] for tokens in ev.tokens
            )
        ]
    )
    return (queries @ docs.T.astype(np.float32)) * doc_scale


def ranks_in(page_scores: np.ndarray) -> np.ndarray:
    """各クエリでの、各ページの順位 (1 始まり)。"""
    order = np.argsort(-page_scores, axis=1, kind="stable")
    ranks = np.empty_like(order)
    np.put_along_axis(
        ranks, order, np.arange(1, page_scores.shape[1] + 1)[None, :], axis=1
    )
    return ranks


def rrf(
    vector: np.ndarray, bm25: np.ndarray, k: int = RRF_K, bm25_weight: float = BM25_WEIGHT
) -> np.ndarray:
    """ページのスコア 2 つを RRF で合成する。BM25 でスコアが 0 のページ (どの語も含まない) は BM25 の分を足さない。"""
    return 1 / (k + ranks_in(vector)) + bm25_weight * np.where(
        bm25 > 0, 1 / (k + ranks_in(bm25)), 0
    )


def lexical_overlap(ev: EvalSet, chunk_tokens: list[list[str]]) -> np.ndarray:
    """クエリの語のうち、正解のページに出てくる語の割合。"""
    page_words = [
        set(w for c in chunk_tokens[start:end] for w in c)
        for start, end in zip(
            ev.page_starts, list(ev.page_starts[1:]) + [len(chunk_tokens)]
        )
    ]
    return np.array(
        [
            np.mean([t in page_words[p] for t in tokens])
            for tokens, p in zip(ev.tokens, ev.target)
        ]
    )


def main() -> None:
    ev = load_eval_set()
    with open("data/chunk_tokens.json", encoding="utf-8") as f:
        chunk_tokens = json.load(f)
    bm25 = BM25(chunk_tokens)

    pages_bm25 = to_page_scores(np.stack([bm25.scores(t) for t in ev.tokens]), ev)
    pages_vec = to_page_scores(vector_scores(ev), ev)
    pages_teacher = to_page_scores(ev.teacher @ np.load(teacher.data_path("chunk_vecs.npy")).T, ev)

    overlap = lexical_overlap(ev, chunk_tokens)
    low = overlap < 0.5
    rows = {
        "BM25": pages_bm25,
        "単語表": pages_vec,
        **{
            f"単語表 + BM25 (k={k}, ×{a})": rrf(pages_vec, pages_bm25, k, a)
            for k in [10, 60]
            for a in [1.0, 0.5, 0.3]
        },
        "教師 (参考)": pages_teacher,
        f"教師 + BM25 (k={RRF_K}, ×{BM25_WEIGHT})": rrf(pages_teacher, pages_bm25),
    }
    for label, mask in [
        (f"全体 {len(ev.queries)} 件", slice(None)),
        (f"正解ページとの語の重なりが 50% 未満 {low.sum()} 件", low),
    ]:
        print(f"\n# {label}")
        for name, scores in rows.items():
            print(f"{name:<20} {summary(target_ranks(scores, ev)[mask])}")


if __name__ == "__main__":
    main()
