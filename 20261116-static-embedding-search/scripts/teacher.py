"""教師モデルの呼び出し。段階 2 以降で共有する。

環境変数 TEACHER で教師モデルを選ぶ。教師モデルによって変わるファイル (文書ベクトル、単語表など) は data_path() で
置き場所を分ける。語彙やチャンクなど、教師モデルによらないファイルは data/ にそのまま置く。

- ruri (既定): cl-nagoya/ruri-v3-310m をローカルで動かす。ファイルは data/ に置く
- gemini: google/gemini-embedding-2 を OpenRouter 経由で呼ぶ。ファイルは data/gemini/ に置く。
  API キーは環境変数 OPENROUTER_API_KEY から読む

どちらも、クエリと文書で入力の先頭に付ける文字列 (prefix) を変えて用途を切り替える。Modern Web Guidance の
gemini-embedding-001 では task type (RETRIEVAL_QUERY / RETRIEVAL_DOCUMENT) というパラメータで指定するが、
OpenRouter はこのパラメータを Google に渡さない (付けても出力が変わらない)。gemini-embedding-2 は Google の仕様でも
task type のパラメータを持たず、本文の先頭に task を書く形なので、OpenRouter 経由でも指定どおりに使える。

出力は L2 正規化した 768 次元の float32 なので、内積がそのまま cosine になる。gemini-embedding-2 は 3072 次元だが、
MRL (Matryoshka Representation Learning) で学習してあり、先頭を切り詰めて正規化し直しても使える。
API の dimensions で 768 次元を受け取り、ruri と同じ次元で比べる。
"""

import json
import os
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np

NAME = os.environ.get("TEACHER", "ruri")
DIMS = 768


def data_path(filename: str) -> str:
    """教師モデルによって変わるファイルの置き場所。"""
    if NAME == "ruri":
        return f"data/{filename}"
    Path(f"data/{NAME}").mkdir(exist_ok=True)
    return f"data/{NAME}/{filename}"


# --- ruri-v3-310m -----------------------------------------------------------

RURI_MODEL = "cl-nagoya/ruri-v3-310m"
RURI_QUERY_PREFIX = "検索クエリ: "
RURI_DOC_PREFIX = "検索文書: "

_model = None


def _ruri_encode(texts: list[str], batch_size: int) -> np.ndarray:
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(RURI_MODEL, device="mps")
        # チャンクは最大 2,600 字程度。長い入力ほど遅くなるので上限を決めておく
        _model.max_seq_length = 2048
    vecs = _model.encode(
        texts,
        batch_size=batch_size,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=len(texts) > batch_size,
    )
    return vecs.astype(np.float32)


# --- gemini-embedding-2 (OpenRouter) -----------------------------------------

GEMINI_MODEL = "google/gemini-embedding-2"
GEMINI_BATCH = 100  # 1 リクエストで送る入力の数
GEMINI_WORKERS = 4  # 同時に送るリクエストの数

_cost = 0.0  # これまでに使った費用 (USD)。OpenRouter の応答の usage.cost を足していく


def _gemini_request(texts: list[str]) -> np.ndarray:
    global _cost
    body = json.dumps(
        {"model": GEMINI_MODEL, "input": texts, "dimensions": DIMS}
    ).encode()
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/embeddings",
        data=body,
        headers={
            "Authorization": "Bearer " + os.environ["OPENROUTER_API_KEY"],
            "Content-Type": "application/json",
        },
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                r = json.load(res)
            data = sorted(r["data"], key=lambda d: d["index"])
            assert len(data) == len(texts)
            _cost += r.get("usage", {}).get("cost", 0)
            return np.array([d["embedding"] for d in data], dtype=np.float32)
        except (urllib.error.URLError, KeyError, AssertionError, TimeoutError) as e:
            if attempt == 4:
                raise
            print(f"  retry ({e})")
            time.sleep(2**attempt)
    raise RuntimeError("unreachable")


def _gemini_encode(texts: list[str]) -> np.ndarray:
    batches = [texts[i : i + GEMINI_BATCH] for i in range(0, len(texts), GEMINI_BATCH)]
    with ThreadPoolExecutor(GEMINI_WORKERS) as pool:
        parts = list(pool.map(_gemini_request, batches))
    vecs = np.concatenate(parts)
    if len(batches) > 1:
        print(f"  {len(texts)} texts, {len(batches)} requests, total cost ${_cost:.4f}")
    # dimensions を指定すると正規化し直して返るが、念のためここでも正規化する
    return vecs / np.linalg.norm(vecs, axis=1, keepdims=True)


def _gemini_document(text: str) -> str:
    # チャンクの 1 行目はページのタイトル (段階 1)。gemini-embedding-2 の文書の形式に合わせて分ける
    title, _, body = text.partition("\n")
    return f"title: {title} | text: {body}"


# --- 共通の入口 ---------------------------------------------------------------


def encode_documents(texts: list[str], batch_size: int = 16) -> np.ndarray:
    if NAME == "gemini":
        return _gemini_encode([_gemini_document(t) for t in texts])
    return _ruri_encode([RURI_DOC_PREFIX + t for t in texts], batch_size)


def encode_queries(texts: list[str], batch_size: int = 128) -> np.ndarray:
    if NAME == "gemini":
        return _gemini_encode([f"task: search result | query: {t}" for t in texts])
    return _ruri_encode([RURI_QUERY_PREFIX + t for t in texts], batch_size)
