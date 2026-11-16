"""段階 0: Scrapbox のエクスポートを読み、ページ数と文字数を年ごとに数える。

どの年の範囲を検索対象にするかを決めるための集計。年はページの作成日時 (created) で決める。

    uv run python scripts/s0_count_by_year.py data/export.json
"""

import json
import sys
from collections import defaultdict
from datetime import datetime, timezone


def line_text(line) -> str:
    # エクスポート時に「メタデータを含める」を選ぶと、行が {"text", "created", "updated"} になる
    return line["text"] if isinstance(line, dict) else line


def main(path: str) -> None:
    with open(path, encoding="utf-8") as f:
        export = json.load(f)
    pages = export["pages"]

    stats = defaultdict(lambda: {"pages": 0, "lines": 0, "chars": 0})
    for page in pages:
        year = datetime.fromtimestamp(page["created"], tz=timezone.utc).year
        # 1 行目はタイトルと同じなので本文から除く
        body = [line_text(l) for l in page["lines"][1:]]
        s = stats[year]
        s["pages"] += 1
        s["lines"] += len(body)
        s["chars"] += sum(len(t) for t in body)

    print(f"project: {export.get('name')}  pages: {len(pages)}")
    print(
        f"{'year':>4} {'pages':>7} {'lines':>8} {'chars':>10} {'chars/page':>10} {'cum pages':>10}"
    )
    cum = 0
    # 新しい年から積み上げ、「直近 N 年」に絞ったときの規模が分かるようにする
    for year in sorted(stats, reverse=True):
        s = stats[year]
        cum += s["pages"]
        print(
            f"{year:>4} {s['pages']:>7} {s['lines']:>8} {s['chars']:>10}"
            f" {s['chars'] // max(s['pages'], 1):>10} {cum:>10}"
        )
    total_chars = sum(s["chars"] for s in stats.values())
    print(f"total chars: {total_chars}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data/export.json")
