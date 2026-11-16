"""段階 4a: ページから学習用クエリを機械的に作る。

単語表の学習 (段階 4c) には「クエリのテキスト」が要る。教師モデルでそのクエリ全体を埋め込んだベクトルに、
単語表で作ったベクトルを近づけるように学習するため。ここでは本文から次のものを取り出す。
- ページのタイトル
- インデントなしの見出し行 (`[* 見出し]`)
- タイトルと見出しをつないだもの (`Remotion の仕組み 資料`)

    uv run python scripts/s4_queries_synth.py data/export.json data/queries_synth.jsonl
"""

import json
import sys

from s1_chunk import clean_line, is_heading

MAX_CHARS = 60  # 長すぎるものはクエリらしくないので除く


def main(src: str, dst: str) -> None:
    with open(src, encoding="utf-8") as f:
        pages = json.load(f)["pages"]

    queries: dict[str, str] = {}  # query -> page_id (重複を除く)
    for page in pages:
        title = page["title"]
        candidates = [title]
        for line in page["lines"][1:]:
            text = line["text"] if isinstance(line, dict) else line
            if is_heading(text):
                heading = clean_line(text)
                candidates += [heading, f"{title} {heading}"]
        for q in candidates:
            if 2 <= len(q) <= MAX_CHARS:
                queries.setdefault(q, page["id"])

    with open(dst, "w", encoding="utf-8") as f:
        for q, page_id in queries.items():
            f.write(
                json.dumps(
                    {"query": q, "page_id": page_id, "source": "synth"},
                    ensure_ascii=False,
                )
                + "\n"
            )
    print(f"{len(queries)} queries")


if __name__ == "__main__":
    main(*(sys.argv[1:] or ["data/export.json", "data/queries_synth.jsonl"]))
