// コンソールの定型コード。ボタンを押すと入力欄に入って実行される

// DOM コンソール: $ と $$ は描画した DOM の要素を返す
export const DOM_SNIPPETS = [
  { name: "タイトル", src: "title" },
  {
    name: "見出し",
    src: `$$("h1, h2, h3").map(e => e.tag + " " + e.text.trim())`,
  },
  {
    name: "リンク",
    src: `$$("a[href]").map(e => ({ text: e.text.trim(), href: e.attr("href") })).slice(0, 20)`,
  },
  { name: "本文のテキスト", src: `$("body").innerText.slice(0, 500)` },
  {
    name: "画像",
    src: `$$("img").map(e => ({ src: e.attr("src"), alt: e.attr("alt") }))`,
  },
  {
    name: "タグの数",
    src: `Object.fromEntries(
  Object.entries(
    $$("*").reduce((m, e) => ({ ...m, [e.tag]: (m[e.tag] ?? 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10)
)`,
  },
  {
    name: "計算済みスタイル",
    src: `$$("h1, h2, p").slice(0, 6).map(e => ({
  el: e,
  font: e.style("font-size") + " " + e.style("font-family"),
  color: e.style("color"),
}))`,
  },
  { name: "要素の HTML", src: `$("h1, h2")?.html` },
];

// Boa: DOM なしの JavaScript
export const BOA_SNIPPETS = [
  {
    name: "文字列と配列",
    src: `[..."kitesurf"].map((c, i) => c.charCodeAt(0) + i).join(" ")`,
  },
  {
    name: "ジェネレーター",
    src: `function* fib() { let [a, b] = [0, 1]; for (;;) { yield a; [a, b] = [b, a + b]; } }
const out = [];
for (const n of fib()) { if (n > 1000) break; out.push(n); }
out.join(", ")`,
  },
  { name: "BigInt", src: `(2n ** 128n).toString()` },
  {
    name: "クラス",
    src: `class Kite {
  #wind;
  constructor(wind) { this.#wind = wind; }
  get speed() { return Math.round(this.#wind * 0.8 * 10) / 10; }
}
[12, 18, 25].map(w => new Kite(w).speed)`,
  },
  {
    name: "Proxy",
    src: `const log = [];
const p = new Proxy({}, { get: (_, k) => (log.push(k), k.toUpperCase()) });
[p.foo, p.bar, log.join(",")].join(" / ")`,
  },
  {
    name: "オブジェクト",
    src: `({ engine: "Boa", parts: ["parser", "vm", "gc"], epoch: new Date(0).toISOString() })`,
  },
  {
    name: "正規表現",
    src: `"2026-11-16 kitesurf".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3/$2/$1")`,
  },
  { name: "環境", src: `typeof document + " / " + typeof globalThis` },
];
