"""段階 4b: LLM にページを読ませ、そのページを探す人が打ちそうなクエリを書かせる。

合成のクエリ (段階 4a) は本文の語そのものなので、言い換えに弱い。LLM には本文にない語での言い換えを含めて書かせる。
OpenRouter 経由で DeepSeek V4.1 Flash を使う。API キーは環境変数 OPENROUTER_API_KEY から読む。
結果は 1 ページ 1 行で追記し、途中で止めても続きから再開できる。

    uv run python scripts/s4_queries_llm.py --limit 20   # 試しに 20 ページ
    uv run python scripts/s4_queries_llm.py              # 全ページ
"""

import argparse
import json
import os
import time
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

MODEL = "deepseek/deepseek-v4.1-flash-1017"
OUT = "queries/llm.jsonl"
MAX_PAGE_CHARS = 8000

PROMPT = """次は個人のメモ (Scrapbox のページ) です。このページを後から探す人が、検索窓に打ちそうな短いクエリを {n} 個書いてください。

- 1 つのクエリは 2〜6 語程度。文ではなく検索語の並びや短いフレーズにする
- 少なくとも 1 つは、本文に出てこない語を使った言い換えにする (何をしたいか、何に困っているかの言葉で)
- ページが長い場合は、異なる部分を探すクエリにする
- 日本語のページなら日本語で。技術用語やツール名は元の表記のままでよい

出力は JSON で {{"queries": ["...", "..."]}} の形だけを返してください。

---
タイトル: {title}

{body}"""


def queries_per_page(n_chunks: int) -> int:
    # 1 ページ 2 件を基本に、長いページは後半の内容も拾えるよう増やす
    return 2 if n_chunks <= 2 else 3 if n_chunks <= 5 else 4


def ask(title: str, body: str, n: int) -> list[str]:
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(
            {
                "model": MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": PROMPT.format(n=n, title=title, body=body),
                    }
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.7,
            }
        ).encode(),
        headers={
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json",
        },
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                content = json.load(res)["choices"][0]["message"]["content"]
            queries = json.loads(content)["queries"]
            return [q.strip() for q in queries if isinstance(q, str) and q.strip()]
        except Exception as e:  # ネットワークや JSON の崩れはやり直す
            if attempt == 2:
                print(f"failed: {title}: {e}")
                return []
            time.sleep(2**attempt)
    return []


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    args = ap.parse_args()

    pages: dict[str, list[dict]] = defaultdict(list)
    with open("data/chunks.jsonl", encoding="utf-8") as f:
        for line in f:
            c = json.loads(line)
            pages[c["page_id"]].append(c)

    done = set()
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            done = {json.loads(line)["page_id"] for line in f}
    todo = [pid for pid in pages if pid not in done][: args.limit]

    def work(page_id: str) -> dict:
        chunks = pages[page_id]
        title = chunks[0]["title"]
        # チャンクのテキストは先頭にタイトルが付いているので外してつなぐ
        body = "\n".join(c["text"].split("\n", 1)[-1] for c in chunks)[:MAX_PAGE_CHARS]
        return {
            "page_id": page_id,
            "title": title,
            "queries": ask(title, body, queries_per_page(len(chunks))),
        }

    with ThreadPoolExecutor(8) as pool, open(OUT, "a", encoding="utf-8") as f:
        for i, result in enumerate(pool.map(work, todo), 1):
            if result["queries"]:
                f.write(json.dumps(result, ensure_ascii=False) + "\n")
                f.flush()
            if i % 100 == 0:
                print(f"{i}/{len(todo)}")
    print(f"done: {len(todo)} pages")


if __name__ == "__main__":
    main()
