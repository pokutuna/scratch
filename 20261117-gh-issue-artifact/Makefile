ISSUE ?= 12

.PHONY: probe attach download

# site/index.html と site/images/sample.png を生成する
probe:
	node scripts/build-probe.mjs

# 検証用の HTML と Markdown を Issue に artifact として添付する (make attach ISSUE=12)
attach: probe
	gh issue artifact create $(ISSUE) "site/index.html#Probe HTML"
	gh issue artifact create $(ISSUE) "probe/probe.md#Probe Markdown" --attach "site/images/sample.png#サンプル PNG"

# Issue の artifact を out/ に取得し、保存された内容を確かめる
download:
	mkdir -p out
	gh issue artifact download $(ISSUE) --dir out --clobber
