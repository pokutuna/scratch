# scratch

https://pokutuna.github.io/scratch/yyyymmdd-slug/

見かけた技術やライブラリを雑に試す & 置いておくリポジトリ

何か試すごとにディレクトリ `yyyymmdd-slug/` を作ってファイルやコードをを配置する
中身に決まりはなく、言語、ツール、ビルド方法はディレクトリに任せる

```
20261027-foo/
├── README.md
├── ...        # その他何でも
└── site/      # GitHub Pages に公開する静的ファイル(任意)
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
