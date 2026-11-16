KITESURF_REPO := https://github.com/cloudflare/kitesurf
KITESURF_REV  := 4a2903813a22b08d4f3cc64a4b35339d0293a5d1
KITESURF_DIR  := vendor/kitesurf

# Bazel のビルドは GNU tar を要求する (macOS: brew install bazelisk gnu-tar)
export PATH := /opt/homebrew/opt/gnu-tar/libexec/gnubin:$(PATH)

CORE_PKG   := $(KITESURF_DIR)/packages/core/pkg
FONTS      := $(KITESURF_DIR)/packages/engine/public/fonts
SITE_FONTS := NotoSans.ttf NotoSans-Italic.ttf NotoSerif.ttf NotoSansMono.ttf NotoSansCJKsc-Regular.woff2 OFL.txt

.PHONY: download build dev site notices serve

download: $(KITESURF_DIR)

$(KITESURF_DIR):
	mkdir -p vendor
	git clone $(KITESURF_REPO) $@
	git -C $@ checkout $(KITESURF_REV)

# wasm と各 Worker のバンドルを Bazel でビルドする (初回は Rust のビルドで長くかかる)
build: $(KITESURF_DIR)
	cd $(KITESURF_DIR) && pnpm install --frozen-lockfile && pnpm run build

# wrangler dev で http://127.0.0.1:8787 にエンジンを起動する
dev: $(KITESURF_DIR)
	cd $(KITESURF_DIR) && pnpm run dev

# build で作った core の wasm とフォントを site/vendor/ にコピーする (site/ はコミットする)
site:
	rm -rf site/vendor && mkdir -p site/vendor/fonts
	cp $(CORE_PKG)/kitesurf_core.js $(CORE_PKG)/kitesurf_core_bg.wasm site/vendor/
	cp $(addprefix $(FONTS)/,$(SITE_FONTS)) site/vendor/fonts/
	cp $(KITESURF_DIR)/licenses/OFL-1.1-Noto-SC.txt site/vendor/fonts/
	cp $(KITESURF_DIR)/LICENSE site/vendor/LICENSE.txt
	cp $(KITESURF_DIR)/NOTICE site/vendor/NOTICE.txt
	$(MAKE) notices

# wasm に入る Rust crate のライセンスを cargo-about で集める (brew install cargo-about)。
# 本家のリリースと同じ設定とテンプレートを使い、対象を core の wasm にする
notices:
	cd $(KITESURF_DIR) && node scripts/get-patched-vendor-crates.mjs > /dev/null && \
	  cargo about generate --locked --fail --config .config/about.toml \
	    --manifest-path packages/core/Cargo.toml --target wasm32-unknown-unknown \
	    --output-file $(CURDIR)/site/vendor/THIRD_PARTY_NOTICES.txt scripts/rust-notices.hbs

# site/ をローカルで配信する
serve:
	cd site && python3 -m http.server 8000
