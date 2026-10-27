// 各エントリの site/ を集め、トップページを生成して GitHub Pages 用のディレクトリを作る
// usage: node .github/scripts/build-pages.mjs [outDir]
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listEntries } from "./lib.mjs";

const root = process.cwd();
const outDir = process.argv[2] ?? "_site";
const repo = process.env.GITHUB_REPOSITORY ?? "pokutuna/scratch";
const branch = process.env.GITHUB_REF_NAME ?? "main";

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const entries = listEntries(root);
for (const e of entries.filter((e) => e.hasSite)) {
  cpSync(join(root, e.name, "site"), join(outDir, e.name), { recursive: true });
}

const escape = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const items = entries
  .map((e) => {
    const href = e.hasSite ? `./${e.name}/` : `https://github.com/${repo}/tree/${branch}/${e.name}`;
    const slug = e.name.slice(9);
    const title = e.title && e.title !== e.name && e.title !== slug ? `<span class="title">${escape(e.title)}</span>` : "";
    const kind = e.hasSite ? "page" : "code";
    return `<li><time>${e.date}</time><a href="${escape(href)}">${escape(slug)}</a>${title}<span class="kind ${kind}">${kind}</span></li>`;
  })
  .join("\n      ");

const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>scratch</title>
  <style>
    :root { color-scheme: light dark; --fg: #222; --muted: #777; --bg: #fff; --accent: #0969da; }
    @media (prefers-color-scheme: dark) { :root { --fg: #ddd; --muted: #999; --bg: #111; --accent: #4493f8; } }
    body { margin: 0 auto; padding: 2rem 16px; max-width: 48rem; font-family: system-ui, sans-serif; color: var(--fg); background: var(--bg); }
    h1 { font-size: 1.4rem; }
    ul { list-style: none; padding: 0; }
    li { display: flex; flex-wrap: wrap; gap: 0 .75rem; align-items: baseline; padding: .4rem 0; border-bottom: 1px solid color-mix(in srgb, var(--muted) 25%, transparent); }
    time, .kind { color: var(--muted); font-size: .85rem; font-variant-numeric: tabular-nums; }
    .kind { margin-left: auto; }
    .title { color: var(--muted); }
    a { color: var(--accent); }
  </style>
</head>
<body>
  <h1>scratch</h1>
  <p>見かけた技術やライブラリを雑に試す &amp; 置いておく (<a href="https://github.com/${repo}">GitHub</a>)</p>
  <ul>
      ${items}
  </ul>
</body>
</html>
`;

writeFileSync(join(outDir, "index.html"), html);
console.log(`${entries.length} entries, ${entries.filter((e) => e.hasSite).length} pages -> ${outDir}/`);
