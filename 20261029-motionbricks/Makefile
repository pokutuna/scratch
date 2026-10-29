# Colab CLI (https://pypi.org/project/google-colab-cli/) で T4 のセッションを使って実行する
SESSION ?= motionbricks
SCENARIOS := $(wildcard scenarios/*.json)
NAMES := $(basename $(notdir $(SCENARIOS)))

.PHONY: session upload run download stop poses site

# T4 のセッションを作る。作ったセッションは stop するまで使い回す
session:
	colab new -s $(SESSION) --gpu T4

# スクリプトとシナリオを VM の /content/work/ に置く
upload:
	echo "import os; [os.makedirs(f'/content/work/{d}', exist_ok=True) for d in ('scenarios', 'poses')]" | colab exec -s $(SESSION)
	colab upload -s $(SESSION) generate.py /content/work/generate.py
	colab upload -s $(SESSION) render.py /content/work/render.py
	$(foreach f,$(SCENARIOS),colab upload -s $(SESSION) $(f) /content/work/$(f);)
	$(foreach f,$(wildcard poses/*.npz),colab upload -s $(SESSION) $(f) /content/work/$(f);)

# ノートブックを実行する。セルの出力は motionbricks_output.ipynb に書かれる
run: upload
	colab exec -s $(SESSION) --timeout 1800 -f motionbricks.ipynb

# 生成した BVH と動画を out/ に取ってくる
download:
	mkdir -p out
	$(foreach n,$(NAMES),$(foreach e,bvh npz mp4,colab download -s $(SESSION) /content/work/out/$(n).$(e) out/$(n).$(e);))

stop:
	colab stop -s $(SESSION)

# out/*.npz を、site/ のビューアーが読む JSON にする
site:
	uv run export_site.py $(wildcard out/*.npz)

# 写真の姿勢推定 (GEM-X、手元の CPU で動く) ------------------------------------

PHOTOS := $(wildcard input/*)
GEM := gem-x/.venv/bin

# GEM-X を gem-x/ に入れ、Body Pose の重み、人物検出器、SOMA 0.3.3 のアセットを取ってくる
gem-x:
	git clone --depth 1 https://github.com/NVlabs/GEM-X gem-x
	cd gem-x && uv venv .venv --python 3.12 && uv pip install -p .venv -e '.[video]' huggingface_hub matplotlib
	cd gem-x && $(abspath $(GEM))/hf download nvidia/GEM-X body_s240000.ckpt body_config.json --local-dir weights
	cd gem-x && $(abspath $(GEM))/hf download nvidia/SOMA-X SOMA_neutral.npz SOMA_template_rig.usda SOMA_procedural_transforms.json correctives_model.pt --revision v0.3.3 --local-dir assets/soma
	curl --fail -L https://download.openmmlab.com/mmpose/v1/projects/rtmposev1/onnx_sdk/yolox_x_8xb8-300e_humanart-a39d44ed.zip -o gem-x/weights/yolox_humanart.zip
	unzip -p gem-x/weights/yolox_humanart.zip '*/end2end.onnx' > gem-x/weights/yolox_humanart.onnx
	rm gem-x/weights/yolox_humanart.zip

# input/ の写真ごとに姿勢を推定し、poses/<名前>.pt と確認用の .png、generate.py が読む .npz を書く
poses: gem-x
	mkdir -p poses
	$(foreach f,$(PHOTOS),cd gem-x && .venv/bin/gem-infer pose-image --task body --input ../$(f) --release body --checkpoint weights/body_s240000.ckpt --soma-assets assets/soma --device cpu --output ../poses/$(basename $(notdir $(f))).pt && cd ..;)
	$(GEM)/python overlay.py poses/*.pt
	$(GEM)/python photo_pose.py poses/*.pt
