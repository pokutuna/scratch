.PHONY: prompts generate analyze serve

# experiment.json から全試行のプロンプトを runs/prompts.jsonl に書き出す
prompts:
	node prompts.mjs

# 出力がまだない試行を claude -p で生成する (実行者の Claude Code の設定は読まない)
generate:
	node generate.mjs

# runs/ の本文を形態素解析し、site/data.js を作る
analyze:
	uv run analyze.py

serve:
	cd site && python3 -m http.server 8765 --bind 127.0.0.1
