# GitHub Issue Artifact を試す

GitHub Issue に HTML や Markdown を Artifact として添付し、Issue 画面の右側パネルで表示できる機能 (2026-10-28 から Public Preview)。`gh issue artifact create` で添付できる。どの HTML 表現が Issue 上で動くかを確かめる。

- [Issue artifacts are now in public preview - GitHub Changelog](https://github.blog/changelog/2026-10-28-issue-artifacts-are-now-in-public-preview/)
- [Using artifacts with issues - GitHub Docs](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/using-artifacts-with-issues)
- [GitHub IssueにArtifactとしてHTMLとMarkdownを添付できるようになった (Zenn)](https://zenn.dev/kesin11/articles/20261114_github_issue_artifact)

## 使い方

`gh issue artifact` に対応した gh が必要。

```sh
make issue                # 検証用の Issue を作る (REPO=owner/name で変更できる)
make attach ISSUE=<番号>  # site/ のテストファイルをすべて添付する
make help-artifact        # gh issue artifact create --help
```

`make attach` は次の 2 通りで添付する。

```sh
# ファイルを "パス#名前" で渡す
gh issue artifact create -R pokutuna/scratch <番号> "site/01-static.html#01-static"
# 標準入力から渡す
cat site/07-log.txt | gh issue artifact create -R pokutuna/scratch <番号> --body-file - --name 07-log
```

通常のブラウザでの表示は GitHub Pages で確認できる: https://pokutuna.github.io/scratch/20261116-gh-issue-artifact/

## テストファイル

| ファイル | 確かめること |
| --- | --- |
| `site/01-static.html` | インライン CSS、SVG の棒グラフ、テーブル、CSS Grid |
| `site/02-interaction.html` | JS (onclick、script タグ)、noscript、checkbox / radio + `:checked`、details、popover 属性、`:target`、`:hover`、外部リンク |
| `site/03-animation.html` | CSS @keyframes、transition、SVG animate / animateTransform、requestAnimationFrame + canvas |
| `site/04-resources.html` | 画像 (data URI、相対パス、絶対 URL 2 種)、CSS background、Google Fonts、iframe、form |
| `site/05-theme.html` | prefers-color-scheme (GitHub のダークモードに追従するか)、パネル幅での media query、横にはみ出す要素 |
| `site/06-markdown.md` | 表、タスクリスト、alert、details、Mermaid、数式、画像、コードのハイライト |
| `site/07-log.txt` | テキストファイルを標準入力から添付したときの表示 |

## 結果

Zenn の記事で確かめられている項目は次のとおり。JS は動かず、HTML、CSS、SVG だけで完結するものは動く。画像は data URI なら表示され、相対パスでは表示されない。

| 項目 | 記事の結果 | このエントリでの結果 |
| --- | --- | --- |
| 静的 HTML (CSS、SVG、テーブル) | ○ | |
| JS (onclick) | × | |
| JS (script タグ) | - | |
| noscript の中身 | - | |
| checkbox + `:checked` | ○ | |
| radio + `:checked` のタブ | - | |
| details | ○ | |
| popover 属性 | - | |
| `:target` | - | |
| CSS @keyframes | ○ | |
| SVG animate | ○ (クリックすると動く) | |
| requestAnimationFrame + canvas | × | |
| 画像 (data URI) | ○ | |
| 画像 (相対パス) | × | |
| 画像 (絶対 URL) | - | |
| Google Fonts | - | |
| iframe | - | |
| prefers-color-scheme | - | |
| Markdown の Mermaid、数式 | - | |
| テキストファイル | ○ | |
