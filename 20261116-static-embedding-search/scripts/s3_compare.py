"""段階 3 の確認: 学習前の単語表で作ったクエリベクトルを、教師モデルのクエリベクトルと比べる。

- cos(static, teacher): 単語表のクエリベクトルが教師のクエリベクトルにどれだけ近いか。段階 4 の学習はこれを大きくする
- 上位 3 ページ: 教師のクエリベクトルで検索した場合と、単語表で検索した場合

    uv run python scripts/s3_compare.py [vecs.npy weights.npy]
引数を省くと、学習前の表 (word_vecs0.npy、word_idf.npy) を使う。
"""

import json
import sys

import numpy as np

import static
import teacher
from s2_teacher_search import load_chunks, rank_pages

QUERIES = [
    "相手を賢く見せる言葉",
    "ログをエラーとして報告させる",
    "pandas でデータを集計",
    "動画をプログラムで作る",
    "ターミナルの操作を gif にする",
    "敬語の言い回し",
    "Go で mutex を使う",
    "データ分析の可視化ライブラリ",
]


def main(
    vecs_path: str = teacher.data_path("word_vecs0.npy"), weights_path: str = "data/word_idf.npy"
) -> None:
    chunks = load_chunks()
    doc_vecs = np.load(teacher.data_path("chunk_vecs.npy"))
    with open("data/vocab.json", encoding="utf-8") as f:
        index = {w: i for i, w in enumerate(json.load(f))}
    vecs, weights = np.load(vecs_path), np.load(weights_path)

    teacher_q = teacher.encode_queries(QUERIES)
    cosines = []
    for query, tokens, tq in zip(QUERIES, static.tokenize(QUERIES), teacher_q):
        sq = static.embed_query(tokens, index, vecs, weights)
        print(f"\n# {query}  tokens={tokens}")
        if sq is None:
            print("  (表にある語がない)")
            continue
        cosines.append(float(sq @ tq))
        print(f"  cos(static, teacher) = {cosines[-1]:.3f}")
        t_pages = [c["title"] for _, c in rank_pages(doc_vecs @ tq, chunks, 3)]
        s_pages = [c["title"] for _, c in rank_pages(doc_vecs @ sq, chunks, 3)]
        print(f"  teacher: {' / '.join(t_pages)}")
        print(f"  static : {' / '.join(s_pages)}")
    print(f"\nmean cos(static, teacher) = {np.mean(cosines):.3f}")


if __name__ == "__main__":
    main(*sys.argv[1:])
