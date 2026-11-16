# GitHub Issue Artifact

GitHub Issue に HTML、Markdown、テキストを添付し、Issue 画面の右パネルで表示する Issue Artifact (preview) を試す。

- 公式ドキュメント: [Using artifacts with issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/using-artifacts-with-issues)、[REST API endpoints for issue artifacts](https://docs.github.com/en/rest/issues/artifacts)、[Changelog: Issue artifacts are now in public preview](https://github.blog/changelog/2026-10-28-issue-artifacts-are-now-in-public-preview/)
- 参考記事: [GitHub IssueにArtifactとしてHTMLとMarkdownを添付できるようになった](https://zenn.dev/kesin11/articles/20261114_github_issue_artifact)
- 検証用 Issue: https://github.com/pokutuna/scratch/issues/12
- 公開ページ: 検証用の HTML を普通のブラウザで開いたもの。Issue Artifact での見え方と比べる基準にする。各カードの下に、パネルで開いたときの結果を書いている。冒頭に検証用 Issue、artifact、この README、参考記事へのリンクがある

## 使い方

`gh` 2.103.0 以降が必要。`gh issue artifact` は 2.103.0 で追加された。

```sh
make probe              # site/index.html と site/images/sample.png を生成する
make attach ISSUE=12    # 検証用の HTML と Markdown を Issue に添付する
make download ISSUE=12  # 保存された artifact を out/ に取得する
```

手で添付するときは次のように書く。ファイル名の後ろの `#` 以降が artifact の名前になる。

```sh
gh issue artifact create 12 "site/index.html#Probe HTML"
gh issue artifact create 12 "probe/probe.md#Probe Markdown" --attach "site/images/sample.png#サンプル PNG"
some-command 2>&1 | gh issue artifact create 12 --body-file - --name "log"
```

## ファイル

- `probe/probe.html`: 検証用 HTML のテンプレート。表示、画像、JavaScript、HTML と CSS だけの操作、アニメーション、リンクと埋め込みを 1 枚で確かめる。各カードの `.art` の行に、パネルでの結果を手で書いている
- `probe/probe.md`: 検証用 Markdown。表、タスクリスト、アラート、数式、Mermaid、`--attach` で添付した画像
- `scripts/build-probe.mjs`: テスト用の PNG を生成し、テンプレートに data URI として埋め込んで `site/` に書き出す

## 分かった制約

- 種類は `generic` (Markdown)、`embedded_html` (HTML)、リンクの 3 つ。`.html` / `.htm` は自動で `embedded_html` になる
- 公開リポジトリでも、GitHub にサインインしていないと artifact が見えない。Issue 下部の一覧も出ず、`/issues/<n>/artifacts/<m>` の URL を開いても Issue 本文しか表示されない
- Markdown 内の相対パスの画像は、`--attach` で同じファイルを渡すと `https://github.com/user-attachments/assets/...` に書き換えて保存される。`--attach` のパスは Markdown ファイルのあるディレクトリを基準に解決される
- HTML は送ったままの内容で保存される (`gh issue artifact download` で取得して比較。data URI の PNG だけ圧縮後のバイト列が変わったが、展開したピクセルは同じ)
- API の `bodyHtml` は HTML を Markdown として描画したもので、パネルの表示とは別物。CSS の `@media` が `@media` という org へのメンションリンクになっていた
- artifact 名には括弧などの記号を使えない。含まれていると取り除かれる (`gh issue artifact create --help`)

## HTML のプレビューの仕組み

ブラウザの DevTools と、パネルの描画スクリプトを読んで確かめた (2026-11-17 時点)。

- パネルを開くと、最初は Source (ソースコード) が表示される。Preview に切り替えると「Previewing runs this code, which may send its contents to external sites.」という注意が出る。歯車の設定に「Show preview by default」がある
- プレビューは `https://viewscreen.githubusercontent.com/view/embedded_html?url=client://sandbox` の iframe で、`sandbox="allow-scripts"` だけが付いている。popup、フォーム送信、上位フレームの遷移は許可されていない
- iframe の幅は、Issue の右に開いた状態で 510px、最大化すると 1824px (ウィンドウ幅 1920px のとき)
- HTML は `innerHTML` で差し込まれる。そのため `<script>` 要素は実行されない
- 次の CSP がかかっている。読み込めるのは data URI の画像とフォント、インラインの CSS と、インラインのイベントハンドラーだけ

  ```
  default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline';
  img-src data: blob:; font-src data:; connect-src 'none'; media-src 'none';
  object-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none';
  form-action 'none'; base-uri 'none'; manifest-src 'none';
  frame-ancestors 'self' https://github.com https://*.github.com;
  ```

- `script-src 'unsafe-inline'` のため、`onclick` や `onload` などのインラインのイベントハンドラーは動く。`<img src="data:..." onload="...">` を置けば、表示時にコードを実行できる。canvas の `requestAnimationFrame` のループもこの方法で動いた
- 外部の `<script src>` や `<link rel="stylesheet">` が含まれていると、「External scripts and styles are not supported in embedded HTML previews.」というエラーになる

## パネルでの描画結果

`site/index.html` を Issue #12 に添付し、Chrome でサインインして確かめた。番号は検証用 HTML のカードに対応する。

| 番号 | 内容 | 結果 |
| --- | --- | --- |
| A1 | `<style>` 要素 | ✓ |
| A2 | `style` 属性 | ✓ |
| A3 | インライン SVG | ✓ |
| A4 | 表 | ✓ |
| A5 | `prefers-color-scheme` | ✓ ブラウザの設定に従う |
| A6 | メディアクエリーでの幅の判定 | ✓ 右に開いた状態では 400〜599px の範囲 |
| A7 | Google Fonts | ✗ CSP の `style-src` で拒否 |
| B1 | data URI の PNG | ✓ |
| B2 | 相対パスの PNG | ✗ `viewscreen.githubusercontent.com/view/images/sample.png` として解決され、CSP で拒否 |
| B3 | 外部の画像 | ✗ CSP の `img-src` で拒否 |
| B4 | CSS の背景に data URI の SVG | ✓ |
| C1 | インラインの `<script>` | ✗ 実行されない |
| C2 | `onclick` | ✓ |
| C3 | `javascript:` の URL | ✗ |
| C4 | `<noscript>` | 中身は表示されない (スクリプト有効として扱われる) |
| C5 | `<script>` から始める canvas アニメーション | ✗ |
| C6 | cdnjs の外部スクリプト | ✗ |
| C7 | `<img onload>` での自動実行 | ✓ |
| C8 | `onload` から始める canvas アニメーション | ✓ |
| D1 | チェックボックスと `:checked` | ✓ |
| D2 | `<details>` | ✓ |
| D3 | `<details name>` の排他開閉 | ✓ |
| D4 | ラジオボタンと `:has()` のタブ | ✓ |
| D5 | `:target` | ✓ |
| D6 | `popover` | ✓ |
| D7 | `command` 属性でダイアログを開く | ✓ |
| D8 | `:hover` | ✓ |
| D9 | scroll-snap | ✓ |
| E1 | `@keyframes` | ✓ |
| E2 | SVG の `<animate>` | ✓ 表示と同時に動く |
| E3 | SVG の `<set begin="click">` | ✓ |
| F1 | `target="_blank"` のリンク | ✗ `allow-popups` がなく開かない |
| F2 | 通常のリンク | ✗ iframe 内で遷移し、CSP の `frame-src` で拒否されてエラー画面になる |
| F3 | `<iframe>` の埋め込み | ✗ CSP の `frame-src` で拒否 |
| F4 | フォーム送信 | ✗ `allow-forms` がなく送信されない |

参考記事との違い:

- 記事では JavaScript は動かないとされていたが、インラインのイベントハンドラーは動く。動かないのは `<script>` 要素
- 記事では SVG アニメーションはクリックで動くとされていたが、`<animate>` は表示と同時に動いた

### Markdown

`probe/probe.md` では、表、タスクリスト、アラート、`<details>`、数式、Mermaid、コードのハイライト、`--attach` で添付した画像がすべて Issue 本文と同じように描画された。Mermaid は別の viewscreen の iframe で描画される。
