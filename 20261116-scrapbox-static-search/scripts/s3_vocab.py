"""段階 3: 語彙を決め、単語ベクトルと重みの初期値を作る。

クエリのベクトルは、クエリの語ごとに表から単語ベクトル e_i と重み w_i を引き、重み付きの和を正規化して作る。
    q = Σ w_i e_i / ||Σ w_i e_i||
この段階では学習をせず、次の初期値で表を作る。
- e_i: 語を 1 語だけのクエリとして教師モデルに通したベクトル (`検索クエリ: 汽水域`)
- w_i: チャンクの集合で計算した IDF。多くのチャンクに出る語 (よくある語) ほど小さい

    uv run python scripts/s3_vocab.py
"""

import json
import math
from collections import Counter

import numpy as np

import static
import teacher

MIN_COUNT = 2  # コーパス全体で 2 回以上出る語だけを語彙にする。1 回きりの語はほぼ検索されず、表を大きくするだけ


def main() -> None:
    with open("data/chunks.jsonl", encoding="utf-8") as f:
        chunks = [json.loads(line) for line in f]
    chunk_tokens = static.tokenize([c["text"] for c in chunks])
    # BM25 (段階 6) でも使うので保存しておく
    with open("data/chunk_tokens.json", "w", encoding="utf-8") as f:
        json.dump(chunk_tokens, f, ensure_ascii=False)

    count = Counter(t for tokens in chunk_tokens for t in tokens)
    df = Counter(
        t for tokens in chunk_tokens for t in set(tokens)
    )  # その語を含むチャンクの数
    vocab = sorted(t for t, c in count.items() if c >= MIN_COUNT)
    print(
        f"tokens: {sum(count.values())}  distinct: {len(count)}  vocab (count>={MIN_COUNT}): {len(vocab)}"
    )

    # BM25 と同じ形の IDF
    n = len(chunks)
    idf = np.array(
        [math.log((n - df[t] + 0.5) / (df[t] + 0.5) + 1) for t in vocab],
        dtype=np.float32,
    )

    vecs = teacher.encode_queries(vocab)

    with open("data/vocab.json", "w", encoding="utf-8") as f:
        json.dump(vocab, f, ensure_ascii=False)
    np.save("data/word_vecs0.npy", vecs)
    np.save("data/word_idf.npy", idf)

    order = np.argsort(idf)
    print("lowest idf: ", " ".join(f"{vocab[i]}({idf[i]:.2f})" for i in order[:12]))
    print("highest idf:", " ".join(f"{vocab[i]}({idf[i]:.2f})" for i in order[-8:]))


if __name__ == "__main__":
    main()
