"""段階 7: ブラウザで検索するためのデータを site/data/ に書き出す。

ベクトル検索の 4 ファイルは段階 5 の index_* をそのまま写す。環境変数 TEACHER で選んだ教師モデルのものを使う
(公開しているページは gemini)。ほかに次のものを書く。

- vocab.json: 単語表の語 (行の順)
- pages.json: ページのタイトル、URL、年
- chunks.json: チャンクごとのページ番号と、表示用の抜粋 (本文の先頭 SNIPPET_CHARS 字)
- bm25.json: BM25 の転置インデックス。語 -> [チャンク番号, 出現回数, チャンク番号, 出現回数, ...] と、チャンクの語数

あわせて、ブラウザ側の計算を確かめるため、検証用クエリと正解のページ番号を data/val_queries.json に書く
(公開しないので data/ に置く)。

    TEACHER=gemini uv run python scripts/s7_export_site.py
"""

import json
import re
import shutil
from collections import Counter
from pathlib import Path

import teacher
from evaluate import load_eval_set
from s2_teacher_search import load_chunks

OUT = Path("site/data")
SNIPPET_CHARS = 120
# git のコミット SHA (40 桁の 16 進数)。gitleaks がトークンと誤検知するので、抜粋では 7 桁に縮め、
# BM25 の転置インデックスには入れない (検索語として使うことはない)
GIT_SHA = re.compile(r"\b([0-9a-f]{7})[0-9a-f]{33}\b")


def write_json(name: str, obj: object) -> None:
    with open(OUT / name, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name in ["words.i8", "word_scale.f32", "docs.i8", "doc_scale.f32"]:
        shutil.copy(teacher.data_path(f"index_{name}"), OUT / name)
    with open(teacher.data_path("index_meta.json")) as f:
        meta = json.load(f)
    write_json("meta.json", {"dims": meta["dims"], "teacher": teacher.NAME})
    shutil.copy("data/vocab.json", OUT / "vocab.json")

    chunks = load_chunks()
    page_no: dict[str, int] = {}
    pages = []
    for c in chunks:
        if c["page_id"] not in page_no:
            page_no[c["page_id"]] = len(pages)
            pages.append({"title": c["title"], "url": c["url"], "year": c["year"]})
    write_json("pages.json", pages)
    write_json(
        "chunks.json",
        [
            {
                "page": page_no[c["page_id"]],
                # 先頭行はタイトルなので外し、改行は空白にする
                "snippet": GIT_SHA.sub(
                    r"\1", c["text"].split("\n", 1)[-1].replace("\n", " ")
                )[:SNIPPET_CHARS],
            }
            for c in chunks
        ],
    )

    with open("data/chunk_tokens.json", encoding="utf-8") as f:
        chunk_tokens = json.load(f)
    postings: dict[str, list[int]] = {}
    for i, tokens in enumerate(chunk_tokens):
        for term, tf in Counter(tokens).items():
            if GIT_SHA.fullmatch(term):
                continue
            postings.setdefault(term, []).extend([i, tf])
    write_json(
        "bm25.json", {"lengths": [len(t) for t in chunk_tokens], "postings": postings}
    )

    ev = load_eval_set()
    with open("data/val_queries.json", "w", encoding="utf-8") as f:
        json.dump(
            [{"query": q, "page": int(p)} for q, p in zip(ev.queries, ev.target)],
            f,
            ensure_ascii=False,
        )

    for path in sorted(OUT.iterdir()):
        print(f"{path}  {path.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
