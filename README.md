# scratch

https://pokutuna.github.io/scratch/yyyymmdd-slug/

見かけた技術やライブラリを雑に試す & 置いておくリポジトリ

何か試すごとにディレクトリ `yyyymmdd-slug/` を作ってファイルやコードをを配置する
中身に決まりはなく、言語、ツール、ビルド方法はディレクトリに任せる
ただし、セットアップや実行の方法は、そのディレクトリの README や、Makefile、package.json、pyproject.toml など言語ごとの標準的なファイルを見れば分かるようにする

```
20261027-foo/
├── README.md
├── ...        # その他何でも
└── site/      # GitHub Pages に公開する静的ファイル(任意)
```

### コミットしないもの

- エントリで生成されるもの (依存、キャッシュ、ダウンロードしたデータ、出力) は、そのエントリの `.gitignore` に書く。リポジトリ直下の `.gitignore` には、どのエントリでも共通するもの (`node_modules/` など) だけを書く
- 50 MB を超えるファイルはコミットしない。データセットやモデルなどは、取得するコマンドをエントリの Makefile に `download` ターゲットとして書く

```
20261027-foo/
├── .gitignore  # data/
├── Makefile    # make download で data/ に取得する
└── data/
```

```make
download: data/sample.csv

data/sample.csv:
	mkdir -p data
	curl -fsSL -o $@ https://example.com/sample.csv
```

## セットアップ

clone したら pre-commit hook を有効にする。hook は gitleaks で secret を検出し、`.github/scripts/check.mjs` でディレクトリ名、README.md の有無、`site/` 内の絶対パス参照、ファイルサイズを検査する

```
git config core.hooksPath .githooks
```

公開したくない語 (勤務先の名前、社内のホスト名など) は `~/.config/scratch/gitleaks.toml` に gitleaks のルールとして書く。hook はこのファイルがあれば追加で検査する。語の一覧そのものを公開しないよう、リポジトリには置かない

```toml
[[rules]]
id = "private-words"
description = "公開したくない語"
regex = '''(?i)(example-corp|internal\.example\.com)'''
```

## 公開

`site/` を置いたディレクトリだけが GitHub Pages に公開される

- トップページには全ディレクトリが日付の新しい順に並ぶ
- `site/` があるものは公開ページへ、ないものは GitHub 上のディレクトリへリンクする

### site/ の作り方

- `site/` の中身はコミットする (CI ではビルドしない)
- 公開先がサブディレクトリになるため、アセットは相対パスで参照する
- 画像は 1 か所にだけ置き、README とページの両方から相対パスで参照する

#### HTML を直接置く場合

```
20261027-foo/
├── README.md       # 画像は ./site/images/... で参照する
└── site/
    ├── index.html  # 手で書く
    └── images/     # ページで使う画像
```

#### Vite を使う場合

```
20261027-foo/
├── README.md       # 画像は ./images/... で参照する
├── vite.config.js  # base: './', build.outDir: 'site'
├── index.html      # ソース。npx vite build で site/ に出力される
├── main.js
├── images/         # ページで使う画像。ビルド時に site/assets/ へ出力される
└── site/           # ビルド結果。手で編集しない
    ├── index.html
    └── assets/
```
