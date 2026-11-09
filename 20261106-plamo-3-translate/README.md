# PLaMo 3 Translate をブラウザで動かす

公開ページ: https://pokutuna.github.io/scratch/20261106-plamo-3-translate/

Preferred Networks (PFN) が公開している翻訳特化 LLM PLaMo 3 Translate ([重み公開の記事](https://www.preferred.jp/ja/blog/tech/plamo-3-translate-weight-release/)、[PLaMo翻訳での提供開始の記事](https://www.preferred.jp/ja/blog/tech/plamo-3-translate-product-release/)) を、[wllama](https://github.com/ngxson/wllama) (llama.cpp の WebAssembly 版、WebGPU 対応) でブラウザ内で動かす。モデルは公式の GGUF ([pfnet/plamo-3-translate-0.8b-GGUF](https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF)) を Hugging Face から直接取得する。

```
npm install
npm run dev
```

開いたページで「モデルを読み込む」を押し、読み込みが終わったら「翻訳」を押す。`npx vite build` で `site/` に出力する。

モデルは [PLaMo Community License](https://plamo.preferredai.jp/info/plamo-community-license-ja) で公開されている (個人・非商用は無料、商用は登録が要る)。このエントリはモデルを再配布せず、ページを開いた人のブラウザが Hugging Face から直接取得する。ページには「Built with PLaMo」、ライセンスへのリンク、PFN とは関係ない個人の試作であることを書いている。

## 仕組み

- GGUF は版 (コミット) を固定した `resolve/<sha>/` の URL から取得し、ブラウザの OPFS (Origin Private File System) に保存する。2 回目以降はダウンロードせず OPFS から読む。モデルをこのリポジトリや公開先に置き直すことはしない
- wllama 3.8.1 の `loadModel()` に GGUF の Blob を渡し、`n_gpu_layers` で全層を WebGPU に載せる
- 翻訳先はモデルカードの「対応言語」の 53 言語と `ja(easy)` から選べる (`languages.js`)。中国語は `zh-hans` と `zh-hant` に分かれる。`COMMON` に挙げた言語を先頭の「よく使う」にまとめる
- 「多段翻訳」をオンにすると、日本語 → 英語 → 日本語 のように前の段の訳文を次の段の原文にして続けて翻訳する。段は追加・削除でき、同じ言語に戻してもよい。オンにしたときは原文に合わせて往復する 2 段にする。原文にひらがなかカタカナがあれば 英語 → 日本語、なければ 日本語 → 原文の言語 (指定がなければ英語)
- プロンプトはモデルカードにある PFML3 形式を `main.js` の `buildPrompt()` で組み立て、`createCompletion()` に渡す。チャットテンプレートは使わない
- 「翻訳オプション」で、モデルが受け付ける次のものを渡せる。順序は GGUF 同梱のチャットテンプレートに合わせている
  - コンテキスト: 翻訳の参考にする背景の文章 (`<|plamo:tag|>context`)。指示ではなく参考情報として扱われる
  - 用語集: 1 行に `原文の語=訳語`。区切りは `=` `:` タブ (全角も可) のうち最初の 1 文字 (`<|plamo:tag|>glossary`)
  - 原文の言語 (`input` の `lang`)。多段翻訳の 2 段目以降は前の段の翻訳先を使う
  - 文体: `plain` (常体) / `polite` (敬体)。翻訳先が `ja` の段にだけ付く
- Vite の dev server では COOP/COEP ヘッダを付け、wllama がマルチスレッドで動く。GitHub Pages ではヘッダを付けられないのでシングルスレッドになるが、WebGPU を使えば生成速度はほぼ変わらない

## 動かすまでに要った回避策

wllama 3.8.1 (2026-10-02) が同梱する llama.cpp は、PLaMo 3 のアーキテクチャには対応しているが、`plamo3` トークナイザ ([ggml-org/llama.cpp#30045](https://github.com/ggml-org/llama.cpp/pull/30045)、2026-10-06) より古い。そのままでは `unknown tokenizer: 'plamo3'` で読み込めない。

- wllama の `kv_overrides` で `tokenizer.ggml.model` を上書きしようとすると、wasm 側の `GGML_ASSERT(... "KV overrides not terminated with empty key")` で落ちる
- 代わりに、取得した GGUF のヘッダにある `plamo3` を同じ長さの `plamo2` に書き換えてから渡している (`patchTokenizer()`)。#30045 以前の llama.cpp と同じく PLaMo 2 のトークナイザで分割されるので、公式実装とトークン列が少し違うことがある ([#30043](https://github.com/ggml-org/llama.cpp/issues/30043))

wllama が #30045 以降の llama.cpp を取り込めば、この書き換えは要らなくなる。

## 試した結果

M シリーズ Mac の Claude アプリ内ブラウザ (Chromium、WebGPU は Metal) で 0.8B Q4_K_M (573 MB) を動かした。

| | プロンプト処理 | 生成 |
| --- | ---: | ---: |
| WebGPU | 220 tok/s | 50 tok/s |
| CPU (WASM、5 スレッド) | 68 tok/s | 41 tok/s |

- 初回は取得に 40〜50 秒 (ネットワーク次第)、ロードに 2〜3 秒。2 回目以降は OPFS から読むので、ロードの 2 秒だけ
- 英→日: 「会議は来週の月曜日に変更となりました。ぜひ予定を空けていただき、新しい日程でご都合がつかない場合はお知らせください。」
- 日→英 (吾輩は猫である の冒頭): "I am a cat. I have no name yet. I have no idea where I was born. All I remember is that I was meowing and crying in some dim, damp place."

### やさしい日本語 (`ja(easy)`)

モデルカードの本文には書かれていないが、同梱のチャットテンプレート (`chat_template.jinja`) は言語コードとして `ja(easy)` を特別に受け付ける。PFML3 では `<|plamo:key|>lang<|plamo:val|>ja(easy)` と書く。0.8B で試した結果:

- 日→やさしい日本語: 「台風の接近に伴い、明日は公共交通機関の計画運休が実施される見込みです。…」→「台風が近づいているので、明日はバスや電車などの乗り物が、予定より早く止まるかもしれません。急いでいないときや、必要ないときの外出はしないでください。…」(「計画運休」の言い換えは少しずれている)
- 英→やさしい日本語: 「会議の日にちを、来週の月曜日に変えました。カレンダーを更新してください。」

0.8B は CPU でも十分速く、WebGPU の効果はプロンプト処理 (長文の入力) で大きい。

### 翻訳オプション

0.8B で試した結果:

- コンテキスト: "He picked up the mouse and moved it to the left." は、指定なしやペットの話の文脈では「ネズミ」、パソコン教室の文脈では「彼はマウスを手に取り、左に動かした。」になった
- 用語集: 「吾輩は猫である。名前はまだ無い。」→ en で、`猫=neko` は効いて "I am a neko." になったが、`吾輩=Wagahai` は効かず "I" のままだった
- 文体: 英→日で `plain` は「昨日店に行った。…小さいけど速い。」、`polite` は「行きました。…小さいですが速いです。」。日→日 (`ja` → `ja`) では敬体の原文は `plain` でも変わらなかった
- 日→日: 翻訳先を `ja` にすると、言い回しが少し整う程度でほぼそのまま。`ja(easy)` では硬い文がやさしい日本語に言い換えられる

### GitHub Pages (COOP/COEP なし)

COOP/COEP なしの静的サーバーで `site/` を開くと、`crossOriginIsolated` が false になり threads=1 で動く。WebGPU で 0.8B Q4_K_M はプロンプト処理 104 tok/s、生成 45 tok/s で、生成はマルチスレッドとほぼ同じだった。

## 未確認・課題

- 最初は Cache API に置こうとしたが、Claude アプリ内ブラウザでは 573 MB の `cache.put()` が `UnknownError` で失敗したので OPFS にした。OPFS の `createWritable()` を持たない Safari では試していない
- WebGPU がないブラウザでは CPU のシングルスレッドで動くので遅い。マルチスレッドにするには coi-serviceworker などで cross-origin isolation を有効にする必要がある
- OPFS はオリジンごとなので、dev server (localhost:5173 など) と公開ページではそれぞれダウンロードする
- 2B (1.8 GB) は試していない。2 GB を超えるモデルは分割が要る
