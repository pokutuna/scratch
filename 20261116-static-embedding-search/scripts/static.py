"""単語表に関する共通処理。段階 3 以降で共有する。

- tokenize: site/tokenize.mjs を Node で実行して分割する (ブラウザと同じ分割にするため)
- embed_query: 単語表を引いて、クエリのベクトルを作る。ブラウザで行う計算と同じ
"""

import json
import subprocess
from pathlib import Path

import numpy as np

CLI = Path(__file__).parent / "tokenize_cli.mjs"


def tokenize(texts: list[str]) -> list[list[str]]:
    stdin = "".join(json.dumps(t, ensure_ascii=False) + "\n" for t in texts)
    out = subprocess.run(
        ["node", CLI], input=stdin, capture_output=True, text=True, check=True
    ).stdout
    return [json.loads(line) for line in out.splitlines()]


def embed_query(
    tokens: list[str], index: dict[str, int], vecs: np.ndarray, weights: np.ndarray
) -> np.ndarray | None:
    """q = Σ w_i e_i / ||Σ w_i e_i||。表にない語は無視する。1 語も表になければ None。"""
    ids = [index[t] for t in tokens if t in index]
    if not ids:
        return None
    q = (weights[ids, None] * vecs[ids]).sum(0)
    return q / np.linalg.norm(q)
