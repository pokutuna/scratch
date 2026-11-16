# Scrapbox のページを静的な単語表で意味検索する

Modern Web Guidance の検索と同じ方式を、自分の Scrapbox のページで試す。文書はビルド時に Embedding モデルで埋め込み、クエリは「単語ごとのベクトルの表」を引いて足すだけでベクトルにする。実行時にモデルが要らないので、検索をブラウザ (`site/`) だけで動かせる。

- 教師モデル: [cl-nagoya/ruri-v3-310m](https://huggingface.co/cl-nagoya/ruri-v3-310m) (ローカルで実行、768 次元、クエリには `検索クエリ: `、文書には `検索文書: ` を付ける)
- データ: 2026-11-16 時点の [pokutuna の Scrapbox](https://scrapbox.io/pokutuna/) のエクスポート (JSON、9.7 MB、1,361 ページ)。`data/export.json` に置き、コミットしない

## 段階

コードは段階ごとに `scripts/s<N>_*.py` に分け、段階の順に読めば仕組みを追えるようにする。

| 段階 | スクリプト | 内容 |
| --- | --- | --- |
| 0 | `s0_count_by_year.py` | ページ数と文字数を年ごとに数え、対象の範囲を決める |
| 1 | `s1_chunk.py` | ページをチャンクに分け、記法を外したテキストにする (`data/chunks.jsonl`) |
| 2 | `s2_embed_docs.py` | チャンクを教師モデルで文書として埋め込む (`data/chunk_vecs.npy`) |
| 2 | `s2_teacher_search.py` | 確認用。クエリも教師モデルで埋め込んで検索する |
| 3 | `s3_vocab.py` | 語彙を決め、単語ベクトルと重みの初期値を作る (`data/vocab.json`、`word_vecs0.npy`、`word_idf.npy`) |
| 3 | `s3_compare.py` | 確認用。単語表で作ったクエリベクトルを教師モデルのものと比べる |
| 4 | `s4_queries_synth.py` | ページのタイトルと見出しから学習用クエリを作る (`data/queries_synth.jsonl`) |
| 4 | `s4_queries_llm.py` | LLM にページを読ませて学習用クエリを書かせる (`queries/llm.jsonl`) |
| 4 | `s4_train.py` | 単語ベクトルと重みを、教師モデルのクエリベクトルに近づくよう学習する (`data/word_vecs_<名前>.npy`、`word_weights_<名前>.npy`) |
| 4 | `s4_compare_tables.py` | 確認用。学習前後の単語表を、検証用クエリでの検索結果 (Hit@K) で比べる |

共有するコード:

- `scripts/teacher.py`: 教師モデルの呼び出し
- `lib/tokenize.mjs`: 単語分割。ビルド時 (Node) と検索時 (ブラウザ) で同じファイルを使う。Python からは `scripts/tokenize_cli.mjs` を介して呼ぶ
- `scripts/static.py`: 単語表からクエリのベクトルを作る計算 (ブラウザで行う計算と同じ)

### 段階 0 の結果

本文 (1 行目のタイトルを除く) は全体で約 255 万字、1 ページあたり平均約 1,900 字。2018 年は 32 ページと少ない。

| 年 | ページ | 文字数 |
| --- | ---: | ---: |
| 2026 | 150 | 283,563 |
| 2025 | 203 | 354,463 |
| 2024 | 233 | 460,460 |
| 2023 | 185 | 346,818 |
| 2022 | 85 | 110,653 |
| 2021 | 92 | 235,602 |
| 2020 | 210 | 508,406 |
| 2019 | 171 | 236,589 |
| 2018 | 32 | 17,629 |

全年を対象にする。

### 段階 1: チャンク化

Scrapbox には Markdown の見出しがないので、空行とインデントなしの `[* 見出し]` の行でブロックに分け、600 字を超えるまで前から詰めてチャンクにする。1,200 字を超えるブロックは、インデントなしの行 (アウトラインの親) の位置で分ける。各チャンクの先頭にはページのタイトルを付ける。

テキストからは次のものを除く。意味検索の雑音になり、埋め込みの長さも食うため。

- URL (`[URL タイトル]` はタイトルだけ残す)、アイコン (`[xxx.icon]`)
- `code:` ブロックの中身 (ファイル名の行は残す)
- 太字やリンクの括弧、`#` タグの `#`、引用の `>`

| 項目 | 値 |
| --- | --- |
| チャンク数 | 2,607 (1,361 ページ) |
| 文字数 | 約 155 万字 (記法と URL、コードを除いた後) |
| チャンクの文字数 | 中央値 641、90% 点 1,081、最大 2,592 |
| 1 チャンクだけのページ | 845 ページ |

### 段階 2: 文書の埋め込み

チャンクの先頭に `検索文書: ` を付けて ruri-v3-310m に通し、L2 正規化した 768 次元のベクトルにする。sentence-transformers を MPS (Apple Silicon の GPU) で動かし、2,607 チャンクで 109 秒 (1 秒あたり 24 チャンク) かかった。

無作為に選んだチャンク 2 つの cosine は平均 0.78 (10% 点 0.74、90% 点 0.82) で、無関係な文書同士でも高めに出る。検索では値そのものではなく順位を使う。

クエリも教師モデルで埋め込んで検索すると (`s2_teacher_search.py`)、言い換えたクエリでも目的のページが上位に来る。これが、後の段階で単語表に置き換えたときに目指す上限になる。

| クエリ | 1 位のページ (cosine) |
| --- | --- |
| 相手を賢く見せる言葉 | 賢そうな言葉 (0.871) |
| ログをエラーとして報告させる | Stackdriver Logging / ErrorReporting に標準出力/エラー出力を拾わせる (0.875) |
| pandas でデータを集計 | Numpy & Pandas (0.906) |

#### MLX を使わなかった理由

[mlx-embeddings](https://github.com/Blaizzy/mlx-embeddings) は ModernBERT に対応しているので、同じ 200 チャンクを埋め込んで比べた。1 秒あたり 21.6 チャンクで MPS (28.9) より遅く、MPS の出力との cosine も平均 0.87 (最小 0.76) と一致しなかった。プーリングかトークナイザの扱いが ruri-v3 の設定と違うと考えられる。速度の利点がないので、原因は追わずに sentence-transformers を使う。

### 段階 3: 単語表の初期値

#### 単語の分け方

日本語は `Intl.Segmenter` (ブラウザと Node に組み込みの、ICU の辞書による単語分割) で分ける。単語表は「語 → ベクトル」の表なので、ビルド時と検索時で区切り方が 1 文字でも違うと、その語のベクトルが使われない。そこで次のことを確かめた。

- `Intl.Segmenter` だけで分けると、Node 26 (ICU 78) と Chromium 156 で 326 チャンク中 162 件の結果が違った。違いはほぼすべて `package.json` や `code:x.go` のように `.` や `:` を含む英数字で、Node は 1 語に、Chromium は 2 語に分ける。日本語の部分の違いは 1 件だけだった
- 英数字の語を先に正規表現で取り出し、残りだけを `Intl.Segmenter` に渡すと、全 2,607 チャンクで Node、Chromium、JavaScriptCore (`jsc`、Safari と同じシステムのエンジン) の結果が一致した。Firefox は確かめていない

辞書にない語は `モー / ダル`、`賢 / く` のように崩れるが、ビルド時と検索時で同じように崩れるので、段階 4 の学習がその区切りに合わせて表を調整する。比べた文字 bigram は語彙が約 2 倍 (2 回以上出る語で 29,595) になるので使わなかった。

#### 語彙と初期値

チャンク全体に 2 回以上出る 15,724 語を語彙にする。各語を 1 語だけのクエリ (`検索クエリ: 汽水域`) として教師モデルに通したベクトルを単語ベクトルの初期値に、チャンクの集合での IDF を重みの初期値にする。IDF が最も小さい語は `ない`、`code`、`れ`、`さ` などで、よく出る語ほど和の中で軽く扱われる。

#### 学習前の結果

単語表で作ったクエリベクトルと、教師モデルのクエリベクトルの cosine は、8 件のクエリで平均 0.916 だった。値は高いが、上位のページは教師モデルの結果とかなりずれる。文書同士の cosine が 0.74〜0.82 に集まっているので、クエリベクトルが少しずれるだけで順位が入れ替わる。

| クエリ | 教師モデルの 1 位 | 単語表の 1 位 |
| --- | --- | --- |
| 相手を賢く見せる言葉 | 賢そうな言葉 | 賢そうな言葉 |
| pandas でデータを集計 | Numpy & Pandas | Numpy & Pandas |
| ログをエラーとして報告させる | Stackdriver Logging / ErrorReporting に… | A comprehensive taxonomy of hallucinations in… |
| 動画をプログラムで作る | キー表示付きの gif を作る | 見た 2026/11 |
| データ分析の可視化ライブラリ | Plotly | 定常性 |

`敬語の言い回し` は 2 語とも 1 回しか出ないので語彙に入らず、ベクトルを作れなかった。

### 段階 4: 単語表の学習 (Tokenlearn)

学習前の表は、語を 1 つずつ教師モデルに通しただけなので、複数語のクエリでは「単語ベクトルの和」と「クエリ全体を教師モデルに通したベクトル」がずれる。学習用クエリを用意し、各クエリについて両者の cosine が 1 に近づくよう、単語ベクトル e と重み w を勾配法で調整する。

```
L = Σ_t (1 - cos(q_t, y_t)) + μ/2 Σ_i ||e_i - e_i⁰||² + λ/2 Σ_i (w_i - w_i⁰)²
q_t = Σ_{i∈t} w_i e_i      (y_t は教師モデルのクエリベクトル)
```

第 2、第 3 項は、学習用クエリにあまり出てこない語が初期値から離れすぎないようにする正則化。最適化は Adagrad で、検証用クエリでの cosine が 2 エポック続けて良くならなければ止める。

#### 学習用クエリ

教師モデルさえあれば正解ラベルは要らない。クエリのテキストだけを用意すればよい。

- 合成 (`s4_queries_synth.py`): ページのタイトル、インデントなしの見出し、その 2 つをつないだもの。6,870 件。本文の語そのものなので言い換えに弱い
- LLM (`s4_queries_llm.py`): OpenRouter 経由で DeepSeek V4.1 Flash にページを読ませ、そのページを探す人が打ちそうなクエリを、本文にない語での言い換えを含めて書かせる。チャンク数に応じて 1 ページ 2〜4 件、1,361 ページで 3,029 件。API キーは環境変数 `OPENROUTER_API_KEY` から読む。結果は `queries/llm.jsonl` としてコミットしてあるので、API キーがなくても以降の段階を再現できる

LLM のクエリのうち、文字列のハッシュで決めた約 10% (299 件) は検証用として学習から除く。どのページを読んで書かれたクエリかが分かっているので、検索の正解としても使える。

#### 結果

合成のクエリだけで学習した表と、LLM のクエリも加えた表を比べた。

| 学習に使ったクエリ | 件数 | 学習で更新された語 | 検証用クエリでの cosine |
| --- | ---: | ---: | --- |
| 合成のみ | 6,763 | 4,089 (26%) | 0.911 → 0.946 (3 エポック) |
| 合成 + LLM | 9,491 | 5,349 (34%) | 0.911 → 0.954 (4 エポック) |

検証用クエリで、そのクエリを書かせたページが何位に来るかを比べた (`s4_compare_tables.py`)。

| クエリベクトル | Hit@1 | Hit@5 | Hit@10 | MRR |
| --- | ---: | ---: | ---: | ---: |
| 教師モデル (上限) | 68.6% | 88.0% | 91.6% | 0.774 |
| 単語表 (学習前) | 35.8% | 51.2% | 55.9% | 0.435 |
| 単語表 (合成のみ) | 51.2% | 72.9% | 80.6% | 0.614 |
| 単語表 (合成 + LLM) | 55.5% | 77.6% | 81.9% | 0.657 |

学習で cosine は 0.04 しか上がらないが、検索の成績は大きく変わる。段階 3 で見たとおり、文書同士の cosine が狭い範囲に集まっているので、クエリベクトルの小さなずれが順位に効く。LLM のクエリを加えると、合成のみより Hit@5 で 4.7 ポイント上がった。検証用クエリが LLM の書いたものなので、同じ書き方のクエリで学習した分だけ有利な点は割り引いて見る。以降の段階では合成 + LLM の表を使う。段階 3 の 8 件のクエリ (学習には使っていない) でも、教師モデルとの cosine の平均は 0.916 から 0.959 に上がった。

## 実行

Scrapbox のエクスポートを `data/export.json` に置く。

```
uv run python scripts/s0_count_by_year.py data/export.json
uv run python scripts/s1_chunk.py data/export.json data/chunks.jsonl
uv run python scripts/s2_embed_docs.py data/chunks.jsonl data/chunk_vecs.npy
uv run python scripts/s2_teacher_search.py "相手を賢く見せる言葉"
uv run python scripts/s3_vocab.py
uv run python scripts/s3_compare.py
uv run python scripts/s4_queries_synth.py
OPENROUTER_API_KEY=... uv run python scripts/s4_queries_llm.py
uv run python scripts/s4_train.py --sources synth --name synth
uv run python scripts/s4_train.py --sources synth,llm --name synth_llm
uv run python scripts/s4_compare_tables.py init:word_vecs0:word_idf synth:word_vecs_synth:word_weights_synth synth_llm:word_vecs_synth_llm:word_weights_synth_llm
uv run python scripts/s3_compare.py data/word_vecs_synth_llm.npy data/word_weights_synth_llm.npy
```

単語分割に Node (`Intl.Segmenter` を使う。Node 26 で確かめた) が要る。

初回の実行で、ruri-v3-310m (約 1.3 GB) が Hugging Face のキャッシュにダウンロードされる。
