"""検証用クエリでの検索の成績を測る。段階 4 以降で共有する。

検証用クエリ (LLM のクエリから取り分けた約 10%、s4_train.py の load_queries) は、どのページを読んで
書かれたかが分かっている。そのページが何位に来るかを数え、Hit@K と MRR にする。
"""

import json
from dataclasses import dataclass

import numpy as np

import static
from s2_teacher_search import load_chunks
from s4_train import load_queries, teacher_vectors


@dataclass
class EvalSet:
    queries: list[str]
    tokens: list[list[str]]  # 単語分割の結果
    target: np.ndarray  # 正解のページ番号
    teacher: np.ndarray  # 教師モデルのクエリベクトル
    index: dict[str, int]  # 語 -> 単語表の行
    page_starts: (
        np.ndarray
    )  # 各ページの最初のチャンクの番号 (チャンクはページ順に並んでいる)


def load_eval_set() -> EvalSet:
    chunks = load_chunks()
    page_no: dict[str, int] = {}
    starts = []
    for i, c in enumerate(chunks):
        if c["page_id"] not in page_no:
            page_no[c["page_id"]] = len(page_no)
            starts.append(i)
    assert len(starts) == len({c["page_id"] for c in chunks}), (
        "チャンクがページ順に並んでいない"
    )

    with open("data/vocab.json", encoding="utf-8") as f:
        index = {w: i for i, w in enumerate(json.load(f))}
    with open("queries/llm.jsonl", encoding="utf-8") as f:
        source = {
            q: r["page_id"]
            for line in f
            for r in [json.loads(line)]
            for q in r["queries"]
        }

    # 表にある語を 1 つも含まないクエリは単語表でベクトルを作れないので除く (s4_train.py と同じ)
    _, val = load_queries()
    pairs = [
        (q, t) for q, t in zip(val, static.tokenize(val)) if any(x in index for x in t)
    ]
    queries = [q for q, _ in pairs]
    return EvalSet(
        queries=queries,
        tokens=[t for _, t in pairs],
        target=np.array([page_no[source[q]] for q in queries]),
        teacher=teacher_vectors(queries),
        index=index,
        page_starts=np.array(starts),
    )


def to_page_scores(chunk_scores: np.ndarray, ev: EvalSet) -> np.ndarray:
    """(クエリ, チャンク) のスコアを (クエリ, ページ) にする。ページのスコアはチャンクのスコアの最大値。"""
    return np.maximum.reduceat(chunk_scores, ev.page_starts, axis=1)


def target_ranks(page_scores: np.ndarray, ev: EvalSet) -> np.ndarray:
    """各クエリについて、正解のページが何位か (0 始まり) を返す。

    同点のページは正解より上にあるとみなす (BM25 で正解のスコアが 0 のとき、見つからなかった扱いにするため)。
    """
    correct = page_scores[np.arange(len(page_scores)), ev.target][:, None]
    return (page_scores > correct).sum(1) + (page_scores == correct).sum(1) - 1


def page_ranks(query_vecs: np.ndarray, doc_vecs: np.ndarray, ev: EvalSet) -> np.ndarray:
    """ベクトル検索で、正解のページが何位かを返す。"""
    return target_ranks(to_page_scores(query_vecs @ doc_vecs.T, ev), ev)


def summary(ranks: np.ndarray) -> str:
    return (
        f"Hit@1 {np.mean(ranks < 1):6.1%}  Hit@5 {np.mean(ranks < 5):6.1%}"
        f"  Hit@10 {np.mean(ranks < 10):6.1%}  MRR {np.mean(1 / (ranks + 1)):.3f}"
    )
