"""段階 4 の確認: 学習前後の単語表を、検証用クエリでの検索結果で比べる。

検証用クエリ (LLM のクエリから取り分けた約 10%) は、どのページを読んで書かれたかが分かっている。
そのページが検索結果の上位に来る割合 (Hit@K) を、教師モデルのクエリベクトルと各単語表とで比べる。

    uv run python scripts/s4_compare_tables.py init:word_vecs0:word_idf synth:word_vecs_synth:word_weights_synth ...
"""

import json
import sys

import numpy as np

import static
from s2_teacher_search import load_chunks
from s4_train import load_queries, teacher_vectors


def page_ranking(
    scores: np.ndarray, page_of_chunk: np.ndarray, n_pages: int
) -> np.ndarray:
    """チャンクのスコアからページの順位 (スコアの高い順のページ番号) を作る。"""
    best = np.full(n_pages, -np.inf)
    np.maximum.at(best, page_of_chunk, scores)
    return np.argsort(-best)


def main(tables: list[str]) -> None:
    chunks = load_chunks()
    page_ids = sorted({c["page_id"] for c in chunks})
    page_no = {p: i for i, p in enumerate(page_ids)}
    page_of_chunk = np.array([page_no[c["page_id"]] for c in chunks])
    doc_vecs = np.load("data/chunk_vecs.npy")

    with open("data/vocab.json", encoding="utf-8") as f:
        index = {w: i for i, w in enumerate(json.load(f))}
    with open("queries/llm.jsonl", encoding="utf-8") as f:
        source = {
            q: page_no[r["page_id"]]
            for line in f
            for r in [json.loads(line)]
            for q in r["queries"]
        }

    _, val = load_queries()
    tokens = static.tokenize(val)
    keep = [i for i, t in enumerate(tokens) if any(x in index for x in t)]
    val = [val[i] for i in keep]
    tokens = [tokens[i] for i in keep]
    target = np.array([source[q] for q in val])
    teacher_q = teacher_vectors(val)

    def report(name: str, query_vecs: np.ndarray) -> None:
        ranks = np.array(
            [
                np.where(page_ranking(doc_vecs @ q, page_of_chunk, len(page_ids)) == t)[
                    0
                ][0]
                for q, t in zip(query_vecs, target)
            ]
        )
        cos = (query_vecs * teacher_q).sum(1).mean()
        print(
            f"{name:<12} cos(teacher) {cos:.3f}  Hit@1 {np.mean(ranks < 1):.1%}"
            f"  Hit@5 {np.mean(ranks < 5):.1%}  Hit@10 {np.mean(ranks < 10):.1%}  MRR {np.mean(1 / (ranks + 1)):.3f}"
        )

    print(f"{len(val)} val queries")
    report("teacher", teacher_q)
    for spec in tables:
        name, vecs_name, weights_name = spec.split(":")
        vecs, weights = (
            np.load(f"data/{vecs_name}.npy"),
            np.load(f"data/{weights_name}.npy"),
        )
        report(
            name,
            np.stack([static.embed_query(t, index, vecs, weights) for t in tokens]),
        )


if __name__ == "__main__":
    main(sys.argv[1:])
