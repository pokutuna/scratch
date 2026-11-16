"""段階 5: 単語表と文書ベクトルを、ブラウザに送れる大きさに縮める。

float32 のままだと、単語表は 15,724 語 × 768 次元 × 4 バイト = 48 MB、文書ベクトルは 8 MB ある。
次の 3 つを順に試し、検証用クエリでの成績 (evaluate.py) がどれだけ落ちるかを測る。

1. 重みの畳み込み: 検索ではクエリベクトルの大きさは順位に関係しない (どの文書とも同じ倍率がかかる)。
   なので正規化は省いてよく、w_i e_i を 1 つのベクトルとして表に持てば、検索時は行を足すだけになる。
2. PCA で次元を減らす: 文書ベクトルの主成分の上位 d 個の軸に、文書と単語表の両方を射影する。
   主成分の軸は平均を引いた文書ベクトルで求めるが、射影するのは平均を引く前の文書ベクトル。射影後の文書は
   正規化し直す (落とした軸の分だけ長さが変わり、そのままだと長さの違いが順位に混ざるため)。
   平均を引いてから射影して正規化すると、768 次元のまま回転しただけでも成績が落ちる。平均を引くこと自体は、
   q·(d - m) = q·d - q·m の q·m が文書によらないので順位を変えないが、その後の正規化で文書ごとに
   違う倍率がかかってしまう。
3. int8 に量子化する: 行ごとに、絶対値の最大が 127 になる倍率 s で割って丸める。行 = s × int8 の値。
   単語表では s を語ごとに持つので、クエリは Σ s_i × (int8 の行) で作れる。

    uv run python scripts/s5_quantize.py                     # 比較を表示する
    uv run python scripts/s5_quantize.py --dims 256 --save   # 選んだ設定で data/index_* に書き出す
"""

import argparse
import json

import numpy as np

from evaluate import EvalSet, load_eval_set, page_ranks, summary

TABLE = "synth_llm"  # 段階 4 で選んだ単語表


def fold_weights(vecs: np.ndarray, weights: np.ndarray) -> np.ndarray:
    return vecs * weights[:, None]


def fit_pca(doc_vecs: np.ndarray, dims: int) -> np.ndarray:
    """文書ベクトルの上位 dims 個の主成分 (768 × dims の行列) を返す。"""
    _, _, vt = np.linalg.svd(doc_vecs - doc_vecs.mean(0), full_matrices=False)
    return vt[:dims].T


def normalize(x: np.ndarray) -> np.ndarray:
    return x / np.linalg.norm(x, axis=1, keepdims=True)


def quantize(x: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """行ごとの対称な int8 量子化。(int8 の値, 行ごとの倍率) を返す。"""
    scale = np.abs(x).max(1) / 127
    scale[scale == 0] = 1
    return np.round(x / scale[:, None]).astype(np.int8), scale.astype(np.float32)


def dequantize(q: np.ndarray, scale: np.ndarray) -> np.ndarray:
    return q.astype(np.float32) * scale[:, None]


def query_vecs(table: np.ndarray, ev: EvalSet) -> np.ndarray:
    """重みを畳み込んだ表の行を足すだけ。正規化しない。"""
    return np.stack(
        [
            table[[ev.index[t] for t in tokens if t in ev.index]].sum(0)
            for tokens in ev.tokens
        ]
    )


def megabytes(rows: int, dims: int, quantized: bool) -> float:
    # int8 なら 1 要素 1 バイトと、行ごとの倍率 (float32) が 4 バイト
    return rows * (dims + 4 if quantized else dims * 4) / 1e6


def compare(ev: EvalSet, doc_vecs: np.ndarray, table: np.ndarray) -> None:
    def report(
        label: str, words: np.ndarray, docs: np.ndarray, dims: int, quantized: bool
    ) -> None:
        size = megabytes(len(words), dims, quantized) + megabytes(
            len(docs), dims, quantized
        )
        print(
            f"{label:<22} {size:6.1f} MB  {summary(page_ranks(query_vecs(words, ev), docs, ev))}"
        )

    report("768 float32", table, doc_vecs, 768, False)
    report(
        "768 int8",
        dequantize(*quantize(table)),
        dequantize(*quantize(doc_vecs)),
        768,
        True,
    )
    for dims in [512, 384, 256, 192, 128, 64]:
        proj = fit_pca(doc_vecs, dims)
        words, docs = table @ proj, normalize(doc_vecs @ proj)
        report(f"PCA {dims} float32", words, docs, dims, False)
        report(
            f"PCA {dims} int8",
            dequantize(*quantize(words)),
            dequantize(*quantize(docs)),
            dims,
            True,
        )


def save(doc_vecs: np.ndarray, table: np.ndarray, dims: int) -> None:
    """ブラウザ向けに書き出す。

    文書の倍率も捨てられない。倍率は文書ごとに違う (各行の絶対値の最大で決まる) ので、捨てると文書ごとに
    違う倍率がかかったのと同じになり、順位が崩れる。単語の倍率はクエリを作るときに、文書の倍率は
    スコア (int8 の内積) に掛ける。
    """
    proj = fit_pca(doc_vecs, dims)
    words, word_scale = quantize(table @ proj)
    docs, doc_scale = quantize(normalize(doc_vecs @ proj))
    words.tofile("data/index_words.i8")
    word_scale.tofile("data/index_word_scale.f32")
    docs.tofile("data/index_docs.i8")
    doc_scale.tofile("data/index_doc_scale.f32")
    with open("data/index_meta.json", "w") as f:
        json.dump(
            {"dims": dims, "words": len(words), "docs": len(docs), "table": TABLE}, f
        )
    print(f"saved: {words.nbytes + word_scale.nbytes + docs.nbytes + doc_scale.nbytes:,} bytes")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dims", type=int, default=256)
    ap.add_argument("--save", action="store_true")
    args = ap.parse_args()

    doc_vecs = np.load("data/chunk_vecs.npy")
    table = fold_weights(
        np.load(f"data/word_vecs_{TABLE}.npy"),
        np.load(f"data/word_weights_{TABLE}.npy"),
    )
    if args.save:
        save(doc_vecs, table, args.dims)
    else:
        compare(load_eval_set(), doc_vecs, table)


if __name__ == "__main__":
    main()
