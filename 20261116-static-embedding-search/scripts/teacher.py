"""教師モデル (ruri-v3-310m) の呼び出し。段階 2 以降で共有する。

ruri-v3 は入力の先頭に付ける prefix で用途を切り替える。検索ではクエリと文書で prefix を変える。
これが Modern Web Guidance の gemini-embedding-001 での task type (RETRIEVAL_QUERY / RETRIEVAL_DOCUMENT) に当たる。
出力は L2 正規化した 768 次元の float32 なので、内積がそのまま cosine になる。
"""

import numpy as np

MODEL = "cl-nagoya/ruri-v3-310m"
QUERY_PREFIX = "検索クエリ: "
DOC_PREFIX = "検索文書: "
DIMS = 768

_model = None


def model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(MODEL, device="mps")
        # チャンクは最大 2,600 字程度。長い入力ほど遅くなるので上限を決めておく
        _model.max_seq_length = 2048
    return _model


def _encode(texts: list[str], prefix: str, batch_size: int) -> np.ndarray:
    vecs = model().encode(
        [prefix + t for t in texts],
        batch_size=batch_size,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=len(texts) > batch_size,
    )
    return vecs.astype(np.float32)


def encode_documents(texts: list[str], batch_size: int = 16) -> np.ndarray:
    return _encode(texts, DOC_PREFIX, batch_size)


def encode_queries(texts: list[str], batch_size: int = 128) -> np.ndarray:
    return _encode(texts, QUERY_PREFIX, batch_size)
