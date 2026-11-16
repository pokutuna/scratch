# 使い方
#   make issue                 # 検証用の Issue を作る
#   make attach ISSUE=<番号>   # site/ のテストファイルを Artifact として添付する
#   make help-artifact         # gh issue artifact create のヘルプを表示する

REPO ?= pokutuna/scratch
ISSUE ?=

DOCS := $(sort $(wildcard site/0*.html site/0*.md))
TXT  := $(sort $(wildcard site/0*.txt))

.PHONY: issue attach attach-docs attach-txt help-artifact check-issue

issue:
	gh issue create -R $(REPO) \
		--title "Issue Artifact の検証" \
		--body "20261116-gh-issue-artifact/ のテストファイルを Artifact として添付して表示を確かめる。"

attach: attach-docs attach-txt

# "ファイル#名前" の形式で名前を付けて添付する
attach-docs: check-issue
	@for f in $(DOCS); do \
		name=$$(basename $$f | sed -E 's/\.[a-z]+$$//'); \
		echo "attach $$f as $$name"; \
		gh issue artifact create -R $(REPO) $(ISSUE) "$$f#$$name" || exit 1; \
	done

# テキストは標準入力から渡す
attach-txt: check-issue
	@for f in $(TXT); do \
		name=$$(basename $$f | sed -E 's/\.[a-z]+$$//'); \
		echo "attach $$f as $$name"; \
		cat $$f | gh issue artifact create -R $(REPO) $(ISSUE) --body-file - --name "$$name" || exit 1; \
	done

check-issue:
	@test -n "$(ISSUE)" || { echo "ISSUE=<番号> を指定する"; exit 1; }

help-artifact:
	gh issue artifact create --help
