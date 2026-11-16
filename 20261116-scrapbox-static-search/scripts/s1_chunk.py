"""段階 1: ページをチャンクに分け、Scrapbox の記法を取り除いたテキストにする。

検索の単位はページではなくチャンク (ページの一部) にする。長いページを 1 本のベクトルにすると
内容が平均されて特徴が薄れるため。ページの順位は、そのページのチャンクのうち最もよく一致したもので決める。

分け方:
  1. 本文を「ブロック」に分ける。空行と、インデントなしの見出し行 (`[* 見出し]`) がブロックの境目になる
  2. ブロックを前から順に詰め、TARGET_CHARS を超えたら次のチャンクにする
  3. MAX_CHARS を超える 1 ブロックは、インデントなしの行 (アウトラインの親) の位置で分ける
各チャンクの先頭にはページのタイトルを付ける。本文でタイトルの語に触れていない部分もタイトルで引けるようにするため。

    uv run python scripts/s1_chunk.py data/export.json data/chunks.jsonl
"""

import json
import re
import sys
from datetime import datetime, timezone
from urllib.parse import quote

PROJECT = "pokutuna"
TARGET_CHARS = 600  # これを超えたらチャンクを閉じる
MAX_CHARS = 1200  # 1 ブロックがこれを超えたら分ける

URL = r"https?://[^\s\]]+"


def clean_line(text: str) -> str:
    """Scrapbox の記法を外し、検索に使う素のテキストにする。"""
    text = text.strip()
    text = re.sub(
        r"\[[^\[\]]*?\.icon(\*\d+)?\]", "", text
    )  # [claude.icon] などのアイコン
    # [URL タイトル] / [タイトル URL] は、タイトルだけ残す
    text = re.sub(rf"\[({URL})\s+([^\]]+)\]", r"\2", text)
    text = re.sub(rf"\[([^\]]+?)\s+({URL})\]", r"\1", text)
    text = re.sub(rf"\[({URL})\]", "", text)  # 画像などの URL だけのリンク
    text = re.sub(
        r"\[[*/\-_!]+\s+([^\]]*)\]", r"\1", text
    )  # [* 太字] [/ 斜体] [- 打ち消し]
    text = re.sub(r"\[([^\]]+)\]", r"\1", text)  # [ページリンク]
    text = re.sub(URL, "", text)  # 裸の URL
    text = re.sub(r"(^|\s)#(\S+)", r"\1\2", text)  # #タグ
    text = re.sub(r"^>\s*", "", text)  # 引用
    text = re.sub(r"`([^`]*)`", r"\1", text)  # インラインコード
    return re.sub(r"\s+", " ", text).strip()


def indent(text: str) -> int:
    return len(text) - len(text.lstrip(" \t　"))


def is_heading(text: str) -> bool:
    return indent(text) == 0 and re.match(r"^\[\*+ ", text) is not None


def blocks_of(lines: list[str]) -> list[list[str]]:
    """本文の行をブロックに分ける。各ブロックは元の行 (インデント付き) のリスト。"""
    blocks: list[list[str]] = [[]]
    in_code = False
    for raw in lines:
        # code: ブロックの中身は捨てる (ファイル名の行だけ残す)。コード片は日本語の意味検索の雑音になるため
        if in_code:
            if raw.strip() and indent(raw) > code_indent:
                continue
            in_code = False
        if raw.lstrip().startswith("code:"):
            in_code, code_indent = True, indent(raw)
        if raw.strip() == "" or is_heading(raw):
            blocks.append([])
        if raw.strip():
            blocks[-1].append(raw)
    return [b for b in blocks if b]


def split_large(block: list[str]) -> list[list[str]]:
    """MAX_CHARS を超えるブロックを、インデントなしの行の位置で分ける。それでも長ければ行で切る。"""
    parts: list[list[str]] = [[]]
    size = 0
    for raw in block:
        n = len(clean_line(raw))
        top = indent(raw) == 0
        if parts[-1] and size + n > MAX_CHARS and (top or size > MAX_CHARS * 1.5):
            parts.append([])
            size = 0
        parts[-1].append(raw)
        size += n
    return parts


def chunk_page(page: dict) -> list[dict]:
    title = page["title"]
    lines = [l["text"] if isinstance(l, dict) else l for l in page["lines"][1:]]

    pieces: list[list[str]] = []
    for block in blocks_of(lines):
        size = sum(len(clean_line(l)) for l in block)
        pieces.extend(split_large(block) if size > MAX_CHARS else [block])

    groups: list[list[str]] = [[]]
    for piece in pieces:
        size = sum(len(clean_line(l)) for l in groups[-1])
        if groups[-1] and size >= TARGET_CHARS:
            groups.append([])
        groups[-1].extend(piece)

    year = datetime.fromtimestamp(page["created"], tz=timezone.utc).year
    chunks = []
    for group in groups:
        body = "\n".join(t for t in (clean_line(l) for l in group) if t)
        if not body and chunks:
            continue  # 記法を外して空になったブロック (画像だけなど)
        chunks.append(
            {
                "id": f"{page['id']}#{len(chunks)}",
                "page_id": page["id"],
                "title": title,
                "url": f"https://scrapbox.io/{PROJECT}/{quote(title.replace(' ', '_'))}",
                "year": year,
                # 埋め込みと検索に使うテキスト。先頭にタイトルを付ける
                "text": f"{title}\n{body}".strip(),
            }
        )
    return chunks


def main(src: str, dst: str) -> None:
    with open(src, encoding="utf-8") as f:
        pages = json.load(f)["pages"]
    chunks = [c for p in pages for c in chunk_page(p)]
    with open(dst, "w", encoding="utf-8") as f:
        for c in chunks:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")

    sizes = sorted(len(c["text"]) for c in chunks)
    n = len(sizes)
    pct = {q: sizes[int(n * q)] for q in (0.1, 0.5, 0.9, 0.99)}
    print(f"pages: {len(pages)}  chunks: {n}  chars: {sum(sizes)}")
    print("chunk chars p10/p50/p90/p99/max:", *pct.values(), sizes[-1])


if __name__ == "__main__":
    main(*(sys.argv[1:] or ["data/export.json", "data/chunks.jsonl"]))
