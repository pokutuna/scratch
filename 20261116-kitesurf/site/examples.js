// 描画の例。どれも外部のリソースを参照しない
export const EXAMPLES = [
  {
    name: "Flexbox のカード",
    html: `<!doctype html>
<html><head><style>
body { font-family: sans-serif; margin: 24px; background: #f6f3ea; color: #222; }
h1 { color: #e25c1e; border-bottom: 3px solid currentColor; padding-bottom: 4px; }
.cards { display: flex; gap: 12px; }
.card { flex: 1; padding: 16px; border-radius: 10px; background: white; box-shadow: 0 2px 8px #0002; }
.card h2 { margin: 0 0 4px; font-size: 18px; }
.card p { margin: 0; color: #666; }
code { font-family: monospace; background: #eee; padding: 1px 4px; border-radius: 4px; }
</style></head><body>
<h1>Hello Kitesurf</h1>
<p>この絵は <b>Stylo</b> と <i>Blitz</i> が layout し、<code>vello_cpu</code> が描いています。</p>
<div class="cards">
  <div class="card"><h2>Stylo</h2><p>Firefox の CSS エンジン</p></div>
  <div class="card"><h2>Taffy</h2><p>Flexbox と Grid</p></div>
  <div class="card"><h2>Parley</h2><p>テキストの組版</p></div>
</div>
</body></html>
`,
  },
  {
    name: "CSS Grid",
    html: `<!doctype html>
<html><head><style>
body { margin: 0; font-family: sans-serif; }
.grid {
  display: grid; gap: 8px; padding: 16px;
  grid-template-columns: repeat(4, 1fr); grid-auto-rows: 80px;
}
.grid div {
  display: flex; align-items: center; justify-content: center;
  color: white; font-weight: bold; border-radius: 6px;
}
.a { grid-column: span 2; grid-row: span 2; background: #3b6ea8; }
.b { background: #c8553d; }
.c { background: #588b8b; }
.d { grid-column: span 2; background: #f28f3b; }
.e { grid-row: span 2; background: #6c4a7d; }
.f { grid-column: span 3; background: #2d3047; }
</style></head><body>
<div class="grid">
  <div class="a">a</div><div class="b">b</div><div class="c">c</div>
  <div class="d">d</div><div class="e">e</div><div class="f">f</div>
</div>
</body></html>
`,
  },
  {
    name: "グラデーションと transform",
    html: `<!doctype html>
<html><head><style>
body {
  margin: 0; height: 600px; display: flex; align-items: center; justify-content: center; gap: 40px;
  background: linear-gradient(135deg, #1e3c72, #2a5298 50%, #7f53ac);
  font-family: serif; color: white;
}
.box {
  width: 140px; height: 140px; border-radius: 24px;
  background: radial-gradient(circle at 30% 30%, #ffd86f, #fc6262);
  box-shadow: 0 12px 30px #0006;
}
.r1 { transform: rotate(-12deg); }
.r2 { transform: rotate(8deg) scale(1.15); border-radius: 50%; }
.r3 { transform: skewX(-14deg); opacity: 0.8; }
p { position: absolute; bottom: 24px; font-size: 22px; font-style: italic; }
</style></head><body>
<div class="box r1"></div><div class="box r2"></div><div class="box r3"></div>
<p>linear / radial gradient, transform, opacity</p>
</body></html>
`,
  },
  {
    name: "表と長い文章",
    html: `<!doctype html>
<html><head><style>
body { font-family: serif; max-width: 640px; margin: 32px auto; line-height: 1.7; color: #333; }
h1 { font-family: sans-serif; }
table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 14px; }
th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
th { background: #f0ede4; }
tr:nth-child(even) td { background: #fafaf7; }
blockquote { margin: 16px 0; padding: 8px 16px; border-left: 4px solid #d4561c; background: #fdf3ee; }
</style></head><body>
<h1>Kitesurf の構成</h1>
<p>Kitesurf は Cloudflare Workers の上で動くブラウザエンジンです。HTML を解析し、CSS を適用し、ページの JavaScript を実行し、Chrome を使わずにスクリーンショットを描きます。</p>
<blockquote>このページでは、そのうち layout と描画の部分だけを取り出しています。</blockquote>
<table>
  <tr><th>部品</th><th>役割</th><th>言語</th></tr>
  <tr><td>Stylo</td><td>CSS のカスケードと計算値</td><td>Rust</td></tr>
  <tr><td>Blitz</td><td>DOM、layout、描画</td><td>Rust</td></tr>
  <tr><td>Boa</td><td>ページの JavaScript</td><td>Rust</td></tr>
  <tr><td>vello_cpu</td><td>ラスタライズ</td><td>Rust</td></tr>
  <tr><td>page-script</td><td>DOM API、ナビゲーション</td><td>TypeScript</td></tr>
</table>
<p>The quick brown fox jumps over the lazy dog. <em>Italic</em>, <strong>bold</strong>, <code>monospace</code>, and <a href="#">a link</a>.</p>
</body></html>
`,
  },
  {
    name: "インライン SVG",
    html: `<!doctype html>
<html><head><style>
body { margin: 24px; font-family: sans-serif; }
svg { display: block; }
</style></head><body>
<h2>Inline SVG (usvg で描く)</h2>
<svg width="480" height="240" viewBox="0 0 480 240">
  <rect width="480" height="240" rx="16" fill="#fff4e6" />
  <circle cx="90" cy="120" r="60" fill="#ff922b" />
  <path d="M200 180 L260 60 L320 180 Z" fill="#4dabf7" stroke="#1c7ed6" stroke-width="4" />
  <polyline points="340,180 370,100 400,150 430,70" fill="none" stroke="#2f9e44" stroke-width="6" stroke-linecap="round" />
  <text x="240" y="225" text-anchor="middle" font-size="18" fill="#495057">circle, path, polyline</text>
</svg>
</body></html>
`,
  },
];
