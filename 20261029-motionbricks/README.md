# MotionBricks を試す

[MotionBricks](https://nvlabs.github.io/motionbricks/) ([NVlabs/motionbricks](https://github.com/NVlabs/motionbricks)、SIGGRAPH 2026) を Colab の T4 で動かした。MotionBricks は、直近の 4 姿勢と目標の 1〜4 姿勢を受け取り、その間をつなぐ 0.6〜1.9 秒のモーションを生成するモデル。生成を連鎖させると、長いモーションになる。

SOMA (人体) モデルを使い、目標の姿勢を順に置いてつなぎ、BVH と骨格の動画を書き出す。目標には、同梱のサンプルクリップの姿勢と、自分の写真から [GEM-X](https://github.com/NVlabs/GEM-X) で推定した姿勢を使う。GEM-X は写真 1 枚から SOMA の姿勢を推定するモデルで、手元の CPU で動く。

生成したモーションは、[ビューアー](https://pokutuna.github.io/scratch/20261029-motionbricks/) で視点を変えながら見られる。骨格の代わりに VRM モデルを被せることもできる。

![待機からゾンビ歩き、スキップ、走り、しゃがみを経て待機に戻る](./images/tour.gif)

サンプルクリップの姿勢をつないだもの。緑は最初の文脈、青は生成したモーション、橙は向かっている目標の姿勢。

## 必要なもの

MotionBricks の実行環境は TensorRT を使うので、NVIDIA GPU が要る。Mac では動かないため、Colab の GPU ランタイムを [Colab CLI](https://pypi.org/project/google-colab-cli/) から使う。

```sh
uv tool install google-colab-cli
colab sessions  # 初回はブラウザで認証する
```

## 実行

```sh
make session   # T4 のセッションを作る。stop するまで使い回す
make run       # スクリプトとシナリオを置き、motionbricks.ipynb を実行する
make download  # out/ に <シナリオ名>.bvh、.npz、.mp4 を取ってくる
make stop      # セッションを止める
```

`make run` は `scenarios/` のシナリオをすべて実行し、セルの出力を `motionbricks_output.ipynb` に書く。初回はセットアップ (clone、Git LFS で ONNX 2.2 GB、`uv sync`) と TensorRT プランのビルドで数分かかる。同じセッションなら、2 回目からはすぐ終わる。

Colab の Web UI では、`generate.py`、`render.py`、`scenarios/` を `/content/work/` にアップロードしてから `motionbricks.ipynb` を実行する。

### 写真の姿勢を使う

`input/` に写真を置き、手元で姿勢を推定してから `make run` する。写真と推定結果はリポジトリに入れない (`.gitignore` 済み)。

```sh
make gem-x  # GEM-X を gem-x/ に入れ、重み (約 4 GB) とアセットを取ってくる
make poses  # 写真ごとに poses/<名前>.npz と確認用の .png を書く (1 枚 20 秒ほど)
make run    # poses/*.npz もアップロードする
```

推定した骨格が写真に合っているかは、`poses/<名前>.png` で確かめる。

### ビューアー

`make site` は、`out/*.npz` をビューアーが読む `site/motions/*.json` にする。SOMA の T ポーズを読むので、`make gem-x` で取ってくるアセットが要る。

```sh
make site
python3 -m http.server -d site  # http://localhost:8000/ で確かめる
```

VRM モデルの Froggy ([Polygonal Mind](https://www.polygonalmind.com/)) と Possum Enjoyer は、どちらも [Open Source Avatars](https://opensourceavatars.com/) ([ToxSam/osa-gallery](https://github.com/ToxSam/osa-gallery)) で配布されている CC0 のもの。

## ファイル

| ファイル | 内容 |
| --- | --- |
| `motionbricks.ipynb` | セットアップ、生成、描画、表示を行うノートブック |
| `generate.py` | シナリオから生成し、`out/<名前>.bvh` と `.npz` を書く。MotionBricks の venv で実行する |
| `render.py` | npz から骨格の動画 `out/<名前>.mp4` を描く |
| `scenarios/*.json` | どの姿勢を、どこに置くか |
| `overlay.py` | GEM-X の推定結果 (.pt) を写真に重ねた確認用の画像を描く。GEM-X の venv で実行する |
| `photo_pose.py` | GEM-X の推定結果を、`generate.py` が読む 77 関節のローカル回転 (.npz) にする。GEM-X の venv で実行する |
| `export_site.py` | npz を、ビューアーが読む JSON にする |
| `site/` | three.js と three-vrm で骨格か VRM モデルを描くビューアー。GitHub Pages に公開する |

## シナリオ

```json
{
  "start": {"clip": "locomotion/idle/idle_loop_001__A268", "time": 1.0},
  "steps": [
    {"clip": "variations/zombie_walk_180_R_003__A330", "time": 2.0, "forward": 2.0},
    {"clip": "locomotion/idle/crouch_idle_001__A529", "time": 1.0, "forward": 2.0, "turn": 90, "targets": 1},
    {"pose": "cross_legged", "pitch": -25, "tokens": [12, 16]}
  ]
}
```

- `start`: `clip` の `time` 秒で終わる 4 姿勢を、最初の文脈にする
- `steps`: 目標の姿勢を 1 つずつ置き、そこまでのモーションを生成する。前の生成の最後の 4 姿勢が、次の文脈になる
  - `clip`、`time`: `time` 秒から 30 Hz で `targets` 個 (1〜4、既定 4) の姿勢を取る。1 姿勢ならそこで止まり、4 姿勢ならその先の動き方まで指定する
  - `pose`: `clip` の代わりに、写真から作った `poses/<pose>.npz` の姿勢を目標にする。最も低い関節を地面に置き、同じ姿勢を `targets` 個並べる
  - `pitch`: 写真のカメラの傾きの補正 (度)。推定した姿勢はカメラを水平とみなした向きなので、見下ろして撮った写真では負の値で起こす
  - `forward`、`side`、`turn`: 直前の目標から見て、前方 `forward` m、左 `side` m に、向きを `turn` 度 (左回りが正) 変えて置く
  - `tokens`: 生成の長さ。1 トークンは 4 姿勢 (0.13 秒)。整数か `[最小, 最大]` で、6〜16 から選ぶ。省略すると 8〜14

クリップの名前は、MotionBricks の `assets/motions/soma/` からの相対パス (拡張子なし)。

## メモ

- T4 でも動く。初回の生成は、TensorRT プランのビルドを含めて 97 秒かかった
- 付属の GUI デモはウィンドウを開くので、Colab では使えない。ここでは `motionbricks` パッケージを直接呼ぶ
- 目標を 2〜3 m 先に置いた `tour.json` では、どの区間も既定の上限の 14 トークン (50 フレーム) になった
- BVH は、最初のクリップの BVH の階層を使う。生成した骨格にない Root は原点に固定する
- SOMA の関節の座標系は、サンプル BVH と同じ (骨が各関節のローカル X 軸に沿う)。そのため、GEM-X の姿勢を SOMA で順運動学にかけ、親に対する回転を取れば、そのまま BVH のローカル回転になる。骨の長さはサンプルクリップのものを使う
- SOMA の T ポーズは、VRM の正規化ボーンの T ポーズと同じ向き (Y up、+Z 向き、左手が +X)。そのため、関節ごとに T ポーズからのワールド回転を書き出し、ビューアーで親との差を取れば、VRM の正規化ボーンの回転になる。体型が違うので、腰の移動量は腰の高さの比で縮める。足が地面に沈んだり浮いたりすることはある
- GEM-X で体の姿勢を推定するには、メッシュ描画用とされている `correctives_model.pt` も要る
- モデルは NVIDIA Open Model Agreement、サンプルモーションは NVIDIA Sample Data Evaluation License。サンプルクリップや、その階層を使った BVH はリポジトリに置かない。ビューアーには、生成したモーションの関節の位置と回転だけを置く
