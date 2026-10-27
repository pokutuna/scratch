# scratch

見かけた技術やライブラリを雑に試して置いておく個人リポジトリ。試すごとに `yyyymmdd-slug/` を作り、`site/` を置いたものだけ GitHub Pages に公開する。エントリの置き方と `site/` の作り方は README.md を読む。

## 構成

- `yyyymmdd-slug/`: エントリ。言語、ツール、ビルド方法はエントリごとに自由
- `.github/scripts/`: リポジトリ全体の Node スクリプト (依存なし、Node 24)
  - `build-pages.mjs`: 各エントリの `site/` を集め、トップページを生成する。`.github/workflows/pages.yml` が main への push で実行する
  - `check.mjs`: エントリが README.md の置き方に沿っているかを検査する。ディレクトリ名、README.md の有無、`site/` 内の絶対パス参照、50 MB を超えるファイルをエラーに、Vite のビルド忘れを警告にする。`.githooks/pre-commit` (gitleaks も実行) と `.github/workflows/check.yml` が使う

## コマンド

- エントリの検査: `node .github/scripts/check.mjs`
- 公開ページをローカルで確認: `node .github/scripts/build-pages.mjs _site` で `_site/` に出力する

## ルール

- 頼まれない限り、作業中のエントリの外は変更しない
- エントリで作業するときは、まずそのエントリの README と、Makefile、package.json、pyproject.toml など言語ごとの標準的なファイルを読む。セットアップや実行の方法を変えたら、それらのファイルも合わせて更新する
- エントリで生成するものやダウンロードするデータは、そのエントリの `.gitignore` で除外する。取得するコマンドはエントリの Makefile に `download` ターゲットとして書く
- リポジトリと `site/` は公開される。secret は `.env` に置き、Vite の `VITE_*` にも入れない (ビルド結果に埋め込まれる)
- 個人情報と仕事に関する情報 (勤務先の名前、社内の URL やホスト名、業務のデータ) をコード、サンプルデータ、画像に含めない
