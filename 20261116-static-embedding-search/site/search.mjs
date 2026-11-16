// 検索の本体。ブラウザ (index.html) と Node (scripts/s7_check.mjs) の両方から使う。
// 計算は Python の段階 5、6 (scripts/s5_quantize.py、scripts/s6_hybrid.py) と同じ。
//
// 1. クエリを tokenize.mjs で語に分ける
// 2. ベクトル検索: 単語表の行 (int8) に語ごとの倍率を掛けて足し、クエリベクトルにする。
//    各チャンクとの int8 の内積に、チャンクの倍率を掛けたものがスコア
// 3. BM25: 転置インデックスを引いてチャンクのスコアを足し上げる
// 4. どちらもページのスコアはチャンクのスコアの最大値。2 つの順位を RRF で合成する

import { tokenize } from "./tokenize.mjs";

export const RRF_K = 10;
export const BM25_WEIGHT = 0.5;
const K1 = 1.2;
const B = 0.75;

const FILES = ["meta.json", "vocab.json", "pages.json", "chunks.json", "bm25.json",
  "words.i8", "word_scale.f32", "docs.i8", "doc_scale.f32"];

/** readBytes(ファイル名) で data/ のファイルを ArrayBuffer として読み、検索器を作る。 */
export async function load(readBytes) {
  const buffers = Object.fromEntries(
    await Promise.all(FILES.map(async (name) => [name, await readBytes(name)])),
  );
  const json = (name) => JSON.parse(new TextDecoder().decode(buffers[name]));
  return createSearcher({
    dims: json("meta.json").dims,
    vocab: json("vocab.json"),
    pages: json("pages.json"),
    chunks: json("chunks.json"),
    bm25: json("bm25.json"),
    words: new Int8Array(buffers["words.i8"]),
    wordScale: new Float32Array(buffers["word_scale.f32"]),
    docs: new Int8Array(buffers["docs.i8"]),
    docScale: new Float32Array(buffers["doc_scale.f32"]),
  });
}

export function createSearcher(data) {
  const { dims, vocab, pages, chunks, bm25, words, wordScale, docs, docScale } = data;
  const index = new Map(vocab.map((w, i) => [w, i]));
  const nChunks = chunks.length;

  // BM25 の文書の長さによる補正は、チャンクごとに固定なので先に計算しておく
  const avgLength = bm25.lengths.reduce((a, b) => a + b, 0) / nChunks;
  const norm = bm25.lengths.map((len) => K1 * (1 - B + (B * len) / avgLength));

  /** 単語表を引いてクエリベクトルを作る。表にある語が 1 つもなければ null。正規化はしない (順位に関係しない)。 */
  function embedQuery(tokens) {
    const q = new Float64Array(dims);
    let found = false;
    for (const t of tokens) {
      const i = index.get(t);
      if (i === undefined) continue;
      found = true;
      const s = wordScale[i];
      for (let k = 0, off = i * dims; k < dims; k++) q[k] += s * words[off + k];
    }
    return found ? q : null;
  }

  function vectorScores(q) {
    const scores = new Float64Array(nChunks);
    for (let c = 0; c < nChunks; c++) {
      let dot = 0;
      for (let k = 0, off = c * dims; k < dims; k++) dot += q[k] * docs[off + k];
      scores[c] = dot * docScale[c];
    }
    return scores;
  }

  function bm25Scores(tokens) {
    const scores = new Float64Array(nChunks);
    for (const term of new Set(tokens)) {
      const p = bm25.postings[term];
      if (!p) continue;
      const df = p.length / 2;
      const idf = Math.log((nChunks - df + 0.5) / (df + 0.5) + 1);
      for (let j = 0; j < p.length; j += 2) {
        const c = p[j], tf = p[j + 1];
        scores[c] += (idf * tf * (K1 + 1)) / (tf + norm[c]);
      }
    }
    return scores;
  }

  /** チャンクのスコアからページのスコア (最大値) と、そのチャンクの番号を求める。 */
  function toPages(chunkScores) {
    const score = new Float64Array(pages.length).fill(-Infinity);
    const best = new Int32Array(pages.length);
    for (let c = 0; c < nChunks; c++) {
      const p = chunks[c].page;
      if (chunkScores[c] > score[p]) {
        score[p] = chunkScores[c];
        best[p] = c;
      }
    }
    return { score, best };
  }

  /** スコアの高い順のページ番号。keep で残すページを絞る。同点はページ番号の順。 */
  function order(score, keep = () => true) {
    return [...score.keys()].filter(keep).sort((a, b) => score[b] - score[a] || a - b);
  }

  /**
   * mode: "hybrid" | "vector" | "bm25"。limit 件のページを返す (Infinity で全件)。
   * 結果には、それぞれの検索での順位 (1 始まり、見つからなければ null) も付ける。
   */
  function search(query, { mode = "hybrid", limit = 10 } = {}) {
    const tokens = tokenize(query);
    const q = embedQuery(tokens);
    const vec = q && toPages(vectorScores(q));
    const lex = toPages(bm25Scores(tokens));

    const vectorRank = new Map(vec ? order(vec.score).map((p, i) => [p, i + 1]) : []);
    const bm25Rank = new Map(order(lex.score, (p) => lex.score[p] > 0).map((p, i) => [p, i + 1]));

    let ranked;
    if (mode === "vector") ranked = vec ? order(vec.score) : [];
    else if (mode === "bm25") ranked = [...bm25Rank.keys()];
    else {
      const rrf = new Float64Array(pages.length);
      for (const [p, r] of vectorRank) rrf[p] += 1 / (RRF_K + r);
      for (const [p, r] of bm25Rank) rrf[p] += BM25_WEIGHT / (RRF_K + r);
      ranked = order(rrf, (p) => rrf[p] > 0);
    }

    const results = ranked.slice(0, limit).map((p) => {
      const chunk = (vec && vectorRank.has(p) ? vec : lex).best[p];
      return {
        page: p,
        ...pages[p],
        snippet: chunks[chunk].snippet,
        vectorRank: vectorRank.get(p) ?? null,
        bm25Rank: bm25Rank.get(p) ?? null,
      };
    });
    return { tokens, known: tokens.filter((t) => index.has(t)), results };
  }

  return { search, pageCount: pages.length, chunkCount: nChunks, vocabSize: vocab.length };
}
