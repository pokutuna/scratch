# Kitesurf をローカルとブラウザで動かす

[Kitesurf](https://github.com/cloudflare/kitesurf) は、Cloudflare Workers の上で動くブラウザエンジンです ([2026-11-12 の changelog](https://developers.cloudflare.com/changelog/post/2026-11-12-kitesurf-open-source/))。HTML を解析し、CSS を適用し、ページの JavaScript を実行し、Chrome を使わずにスクリーンショットを描きます。クライアントからは Chrome DevTools Protocol (CDP) で操作します。

このエントリでは、次の 2 つを試しました。

- A: エンジン一式を `wrangler dev` でローカルに起動し、Puppeteer から操作する
- B: Rust 製の中核の wasm だけを取り出し、GitHub Pages のような静的ホスティングで動かす

B の結果は `site/` に置いてあり、公開ページで触れます。

## 構成

Kitesurf は、Rust の中核と、それを動かす TypeScript の Worker 群でできています。

| 部品 | 中身 | 動く場所 |
| --- | --- | --- |
| `packages/core` | Stylo (CSS)、Blitz (DOM、layout、描画)、Boa (JS)、`SceneRasterizer` | wasm |
| `packages/engine` | CDP サーバ、ページの起動、サブリソースの取得 | Worker |
| `packages/page-script`, `dom-shim` | ページ用の DOM API、スクリプトの実行、ナビゲーション | ページごとの Worker |
| `packages/page-renderer` | scene をラスタライズする | 描画用の Worker |

エンジンは、ページごとに別の Worker を `env.LOADER.load()` (Dynamic Workers の Worker Loader) で起動します。Cloudflare にデプロイするには Workers Paid プランが必要です。

## A: ローカルで動かす

### 準備

- Bazelisk と GNU tar (macOS: `brew install bazelisk gnu-tar`)
- Node.js 22 以上と pnpm

### 手順

```sh
make download   # vendor/kitesurf に clone する (コミットは Makefile で固定)
make build      # Bazel で wasm と Worker のバンドルを作る (初回は約 15 分)
KITESURF_PORT=8799 make dev
```

`9229` (wrangler の inspector) が使用中なら、`KITESURF_INSPECTOR_PORT=9239` も指定します。

別のターミナルで Puppeteer からスクリーンショットを撮ります。

```sh
cd a-local
pnpm install
KITESURF_PORT=8799 node screenshot.mjs https://example.com/ ../out/example.png
```

### 結果

- ローカルの workerd では、Paid プランなしで Worker Loader が動きます
- `page.goto` からスクリーンショットまで、example.com で約 0.7 秒、Hacker News で約 1.3 秒でした
- `page.evaluate` も動きます。エンジン内の Boa で実行されます

## B: ブラウザだけで動かす

### 方針

エンジン全体をブラウザに移すには、Worker Loader の代わり (Web Worker など) と CDP サーバの代わりが必要です。加えて、ブラウザからは CORS のため任意のサイトを取得できません。

一方で、中核の wasm (`kitesurf_core_bg.wasm`) は wasm-bindgen の web ターゲットで、JS 側への import がなく、単体で初期化できます。そこで、Worker を通さずに次の経路を直接呼びました。

1. `register_ua_fonts()` で Noto Sans、Serif、Mono を登録する
2. `new DomHandle(html, baseUrl)` で HTML を解析する
3. `setViewport()` と `prepareForPaint()` で style と layout を計算する
4. `renderScene()` で描画命令の列 (scene) を作る
5. `SceneRasterizer` に `renderSceneInlineResources()` の結果とフォントを渡し、`rasterize(scene, "rgba")` で画素にする

`rasterize` の `"rgba"` 出力は、先頭 8 バイトに幅と高さ (u32 LE) があり、その後に RGBA が続きます。

画像や CSS などのサブリソースは、wasm が `__setBridgeFetchResource()` で登録した関数に `(requestId, url, kind, corsMode)` で取得を依頼してきます。この関数は `init` より前に登録します。取得した中身を `dom.deliverResource(id, bytes)` (失敗なら `deliverResourceError(id)`) で渡し、`pumpResourceMessages()` を呼んでから `prepareForPaint()` し直します。CSS の中の画像のように依頼が増えるので、依頼がなくなるまで繰り返します。

`b-browser/` の 2 つのスクリプトは、この経路を Node で確かめるものです。Node 26 では wasm の例外処理 (exnref) にフラグが要ります。

```sh
cd b-browser
node probe.mjs sample.html ../out/probe.png
node --experimental-wasm-exnref probe-url.mjs https://en.wikipedia.org/api/rest_v1/page/html/Kitesurfing ../out/wiki.png
```

### site/ の作り方

```sh
make build   # A と同じ
make site    # core の wasm とフォントを site/vendor/ にコピーする
make serve   # http://localhost:8000 で確かめる
```

`site/worker.js` が Web Worker 上で wasm を動かし、`site/main.js` が結果を canvas に描きます。例はタブで切り替えます。「URL を開く」タブでは、ページの HTML を取得して左に入れ、サブリソースも取得して描きます。

### 結果

- Flexbox、Grid、グラデーション、transform、表、インライン SVG、日本語 (CJK フォントを登録したとき) が描けます
- 800×600 で、layout は 10 から 50 ms、ラスタライズは 5 から 170 ms でした
- 配信するのは wasm 27 MB (gzip 後 約 8 MB) とフォント約 11 MB です。CJK フォントは、HTML に CJK の文字があるときだけ読み込みます
- ページの `<script>` は実行しません。DOM API は page-script と dom-shim (TypeScript) にあり、Worker の RPC を前提にしているためです。Boa 自体は同じ wasm に入っていて、`ks_eval_sync()` で DOM なしの式を評価できます
- Boa から DOM には触れないので、DevTools のように DOM を調べる「DOM コンソール」は、Worker (ブラウザの JS) で動かしています。最後に描いた `DomHandle` を残しておき、その `querySelectorAll()`、`textContent()`、`innerTextRendered()`、`outerHTML()`、`computedStyleValue()`、`nodeInfo()` で `$` と `$$` を作りました。定型のコードは `site/snippets.js` にあります
- 描画結果のリンクはクリックで開けます。どの要素を押したかは、エンジンの `elementFromPoint(x, y)` (layout の結果を使う hit test) で求め、`closestInTree(id, "a[href]")` でリンクを探します。マウスを載せると、リンク先を左下に出します。移動 (取得して描き直す) と戻る、進むはこのページの JS が受け持ちます。本家のエンジンでは、DOM イベントの発火とリンクを開く既定の動作は page-script (TypeScript) にあり、wasm にはないためです
- `:hover` の見た目は変わりません。core に hover の状態を設定する API が見当たりませんでした
- Wikipedia の `/api/rest_v1/page/html/<記事名>` は `/w/rest.php/v1/page/<記事名>/html` にリダイレクトされます。記事の中のリンクは `<base href="//en.wikipedia.org/wiki/">` を基準に解決します
- `ks_call_cdp(fn_src, this, args, ...)` にホストの関数を渡して Boa から呼べるかも試しましたが、Promise が解決せず止まりました
- URL を開くときは、ブラウザの `fetch` で取得するので、CORS を許可しているサイトに限られます。GitHub Pages と Wikipedia の REST API (`/api/rest_v1/page/html/<記事名>`) は `access-control-allow-origin: *` を返すので開けます。Wikipedia の記事の URL (`/wiki/<記事名>`) は REST API の URL に置き換えます
- Wikipedia の Kitesurfing の記事は、リソース 47 件 (CSS と画像) の取得に約 1.1 秒、ラスタライズに約 50 ms でした。遅延読み込みの画像 (`data-src`) は描かれません

## ライセンス

`site/vendor/` には Kitesurf のビルド結果 (Apache License 2.0、`LICENSE` と `NOTICE`) と Noto フォント (SIL Open Font License 1.1、`fonts/OFL.txt`) が入っています。
