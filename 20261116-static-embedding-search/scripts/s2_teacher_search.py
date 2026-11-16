"""段階 2 の確認: クエリも教師モデルで埋め込んで検索する。

ブラウザでは教師モデルを動かせないので、これは最終形ではなく「単語表で近似する前の上限」の参考。
後の段階で、単語表で作ったクエリベクトルの結果をこれと比べる。

    uv run python scripts/s2_teacher_search.py "動画をプログラムで作る" "相手を賢く見せる言葉"
"""

import json
import sys

import numpy as np

import teacher


def load_chunks(path: str = "data/chunks.jsonl") -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f]


def rank_pages(
    scores: np.ndarray, chunks: list[dict], k: int = 5
) -> list[tuple[float, dict]]:
    """チャンクのスコアをページごとにまとめる。ページのスコアは最もよく一致したチャンクのスコア。"""
    best: dict[str, tuple[float, dict]] = {}
    for i in np.argsort(-scores):
        c = chunks[i]
        if c["page_id"] not in best:
            best[c["page_id"]] = (float(scores[i]), c)
            if len(best) == k:
                break
    return list(best.values())


def main(queries: list[str]) -> None:
    chunks = load_chunks()
    doc_vecs = np.load("data/chunk_vecs.npy")
    query_vecs = teacher.encode_queries(queries)
    for query, q in zip(queries, query_vecs):
        print(f"\n# {query}")
        for score, c in rank_pages(doc_vecs @ q, chunks):
            snippet = c["text"].split("\n", 1)[-1].replace("\n", " ")[:50]
            print(f"  {score:.3f}  {c['title']}  | {snippet}")


if __name__ == "__main__":
    main(sys.argv[1:])
