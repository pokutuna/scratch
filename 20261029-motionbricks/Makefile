# Colab CLI (https://pypi.org/project/google-colab-cli/) で T4 のセッションを使って実行する
SESSION ?= motionbricks
SCENARIOS := $(wildcard scenarios/*.json)
NAMES := $(basename $(notdir $(SCENARIOS)))

.PHONY: session upload run download stop

# T4 のセッションを作る。作ったセッションは stop するまで使い回す
session:
	colab new -s $(SESSION) --gpu T4

# スクリプトとシナリオを VM の /content/work/ に置く
upload:
	echo "import os; os.makedirs('/content/work/scenarios', exist_ok=True)" | colab exec -s $(SESSION)
	colab upload -s $(SESSION) generate.py /content/work/generate.py
	colab upload -s $(SESSION) render.py /content/work/render.py
	$(foreach f,$(SCENARIOS),colab upload -s $(SESSION) $(f) /content/work/$(f);)

# ノートブックを実行する。セルの出力は motionbricks_output.ipynb に書かれる
run: upload
	colab exec -s $(SESSION) --timeout 1800 -f motionbricks.ipynb

# 生成した BVH と動画を out/ に取ってくる
download:
	mkdir -p out
	$(foreach n,$(NAMES),colab download -s $(SESSION) /content/work/out/$(n).bvh out/$(n).bvh; colab download -s $(SESSION) /content/work/out/$(n).mp4 out/$(n).mp4;)

stop:
	colab stop -s $(SESSION)
