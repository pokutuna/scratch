"""段階 2: チャンクを教師モデルで「文書として」埋め込む。

これがブラウザで検索するときの文書側のベクトルになる。文書側は実行時に計算しないので、重いモデルを使ってよい。
出力の行の順番は chunks.jsonl の行の順番と同じ。

    uv run python scripts/s2_embed_docs.py data/chunks.jsonl data/chunk_vecs.npy
"""

import json
import sys
import time

import numpy as np

import teacher


def main(src: str, dst: str) -> None:
    with open(src, encoding="utf-8") as f:
        texts = [json.loads(line)["text"] for line in f]

    start = time.time()
    vecs = teacher.encode_documents(texts)
    elapsed = time.time() - start
    np.save(dst, vecs)
    print(
        f"{len(texts)} chunks -> {vecs.shape} in {elapsed:.0f}s ({len(texts) / elapsed:.1f} chunks/s)"
    )

    # 文書同士の cosine の分布。ここが 1 に近いほど、どの文書も似たベクトルになっていて検索で区別しにくい
    rng = np.random.default_rng(0)
    i, j = rng.integers(0, len(vecs), (2, 20000))
    sims = (vecs[i] * vecs[j]).sum(1)[i != j]
    print(
        f"random pair cosine: mean {sims.mean():.3f}  p10 {np.percentile(sims, 10):.3f}  p90 {np.percentile(sims, 90):.3f}"
    )


if __name__ == "__main__":
    main(*(sys.argv[1:] or ["data/chunks.jsonl", "data/chunk_vecs.npy"]))
