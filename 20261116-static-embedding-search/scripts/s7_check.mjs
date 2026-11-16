// 段階 7 の確認: site/search.mjs を Node で動かし、検証用クエリでの成績が Python (s6_hybrid.py) と一致するか見る。
// 検証用クエリは scripts/s7_export_site.py が data/val_queries.json に書き出したもの。
//
//   node scripts/s7_check.mjs

import { readFile } from "node:fs/promises";
import { load } from "../site/search.mjs";

const searcher = await load(async (name) => {
  const buf = await readFile(new URL(`../site/data/${name}`, import.meta.url));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
});
const val = JSON.parse(await readFile(new URL("../data/val_queries.json", import.meta.url), "utf-8"));

for (const mode of ["bm25", "vector", "hybrid"]) {
  const start = performance.now();
  const ranks = val.map(({ query, page }) => {
    const i = searcher.search(query, { mode, limit: Infinity }).results.findIndex((r) => r.page === page);
    return i < 0 ? Infinity : i; // 0 始まり。見つからなければ Infinity
  });
  const ms = (performance.now() - start) / val.length;
  const hit = (k) => ((ranks.filter((r) => r < k).length / ranks.length) * 100).toFixed(1) + "%";
  const mrr = ranks.reduce((a, r) => a + 1 / (r + 1), 0) / ranks.length;
  console.log(
    `${mode.padEnd(7)} Hit@1 ${hit(1)}  Hit@5 ${hit(5)}  Hit@10 ${hit(10)}  MRR ${mrr.toFixed(3)}  (${ms.toFixed(1)} ms/query)`,
  );
}
