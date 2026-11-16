"""段階 4 の確認: 学習前後の単語表を、検証用クエリでの検索結果で比べる。

検証用クエリは、どのページを読んで書かれたかが分かっている。そのページが検索結果の上位に来る割合 (Hit@K) を、
教師モデルのクエリベクトルと各単語表とで比べる。測り方は evaluate.py にある。

    uv run python scripts/s4_compare_tables.py init:word_vecs0:word_idf synth:word_vecs_synth:word_weights_synth ...
"""

import sys

import numpy as np

import static
from evaluate import load_eval_set, page_ranks, summary


def main(tables: list[str]) -> None:
    ev = load_eval_set()
    doc_vecs = np.load("data/chunk_vecs.npy")

    def report(name: str, query_vecs: np.ndarray) -> None:
        cos = (query_vecs * ev.teacher).sum(1).mean()
        print(
            f"{name:<12} cos(teacher) {cos:.3f}  {summary(page_ranks(query_vecs, doc_vecs, ev))}"
        )

    print(f"{len(ev.queries)} val queries")
    report("teacher", ev.teacher)
    for spec in tables:
        name, vecs_name, weights_name = spec.split(":")
        vecs = np.load(f"data/{vecs_name}.npy")
        weights = np.load(f"data/{weights_name}.npy")
        report(
            name,
            np.stack(
                [static.embed_query(t, ev.index, vecs, weights) for t in ev.tokens]
            ),
        )


if __name__ == "__main__":
    main(sys.argv[1:])
