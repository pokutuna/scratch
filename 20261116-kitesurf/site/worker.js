// Kitesurf の core wasm を Web Worker 上で動かす。
// HTML を DomHandle に読み込ませ、Stylo + Blitz で layout し、scene を SceneRasterizer で RGBA にする。
// エンジン本体 (Cloudflare Workers の CDP サーバ) は使わない
import init, * as core from "./vendor/kitesurf_core.js";

const FONT_DIR = "./vendor/fonts/";
const MAX_HEIGHT = 4000;
const CJK_SCAN = /[぀-ヿ㐀-䶿一-鿿가-힯豈-﫿＀-￯]/;

const fontCache = new Map();
const fetchFont = (path) => {
  const name = path.replace(/^\/fonts\//, "");
  if (!fontCache.has(name)) {
    fontCache.set(
      name,
      fetch(FONT_DIR + name).then((r) => {
        if (!r.ok) throw new Error(`font ${name}: ${r.status}`);
        return r.arrayBuffer().then((b) => new Uint8Array(b));
      }),
    );
  }
  return fontCache.get(name);
};

let cjkRegistered = false;

// 画像や CSS などのサブリソースは、wasm から __setBridgeFetchResource の関数に依頼が来る。
// 依頼を溜めておき、render() の中で fetch して DomHandle に渡す。init より前に登録する
const requests = [];
core.__setBridgeFetchResource((id, url, kind) =>
  requests.push({ id, url, kind }),
);

// 同じ URL を何度も取りにいかない (入力ごとに描き直すため)
const resourceCache = new Map();
const fetchResource = (url) => {
  if (!resourceCache.has(url)) {
    resourceCache.set(
      url,
      fetch(url)
        .then(async (r) =>
          r.ok ? new Uint8Array(await r.arrayBuffer()) : null,
        )
        .catch(() => null),
    );
  }
  return resourceCache.get(url);
};
const MAX_FETCH_ROUNDS = 6;

// 依頼がなくなるまで、取得して渡し、layout し直す。CSS の中の画像やフォントで依頼が増えることがある
const loadResources = async (dom, width, height) => {
  let count = 0;
  let failed = 0;
  for (let round = 0; round < MAX_FETCH_ROUNDS; round++) {
    dom.prepareForPaint(width, height);
    dom.discoverPendingImages();
    const batch = requests.splice(0);
    if (batch.length === 0) break;
    count += batch.length;
    const results = await Promise.all(batch.map((r) => fetchResource(r.url)));
    batch.forEach((r, i) => {
      if (results[i]) dom.deliverResource(r.id, results[i]);
      else {
        dom.deliverResourceError(r.id);
        failed++;
      }
    });
    dom.pumpResourceMessages();
  }
  return { count, failed };
};

const ready = (async () => {
  const t0 = performance.now();
  await init({
    module_or_path: new URL("./vendor/kitesurf_core_bg.wasm", import.meta.url),
  });
  core.start();
  const [sans, italic, serif, mono] = await Promise.all(
    [
      "NotoSans.ttf",
      "NotoSans-Italic.ttf",
      "NotoSerif.ttf",
      "NotoSansMono.ttf",
    ].map(fetchFont),
  );
  core.register_ua_fonts(sans, italic, serif, mono);
  return Math.round(performance.now() - t0);
})();

// 文書全体の高さ。html 要素の box の高さ (はみ出しがあれば scrollHeight) を使う
const documentHeight = (dom, fallback) => {
  const id = dom.querySelector("html");
  const info = id >= 0 ? dom.nodeScrollInfo(id) : null;
  if (!info) return fallback;
  return Math.ceil(Math.max(info.clientHeight, info.scrollHeight)) || fallback;
};

// rasterize(..., "rgba") は先頭 8 バイトに幅と高さ (u32 LE) を置き、その後に RGBA が続く
const RGBA_HEADER_BYTES = 8;

const render = async ({ html, baseUrl, width, minHeight, fullPage }) => {
  const timings = {};
  let t = performance.now();
  const lap = (k) => {
    const n = performance.now();
    timings[k] = Math.round(n - t);
    t = n;
  };

  if (!cjkRegistered && CJK_SCAN.test(html)) {
    core.register_cjk_font(await fetchFont("NotoSansCJKsc-Regular.woff2"));
    cjkRegistered = true;
    lap("cjkFont");
  }

  requests.length = 0;
  const dom = new core.DomHandle(html, baseUrl || "https://example.invalid/");
  try {
    dom.setViewport(width, minHeight);
    let resources = { count: 0, failed: 0 };
    if (baseUrl) {
      resources = await loadResources(dom, width, minHeight);
      lap("fetch");
    }
    dom.prepareForPaint(width, minHeight);
    let height = minHeight;
    if (fullPage) {
      height = Math.min(
        MAX_HEIGHT,
        Math.max(minHeight, documentHeight(dom, minHeight)),
      );
      if (height !== minHeight) {
        dom.setViewport(width, height);
        dom.prepareForPaint(width, height);
      }
    }
    lap("layout");

    const scene = dom.renderScene(0, 0, 0, 0, false, false);
    lap("scene");

    const raster = new core.SceneRasterizer();
    try {
      raster.putResources(
        dom.renderSceneInlineResources(
          scene,
          new Uint8Array(0),
          new Uint8Array(0),
        ),
      );
      for (const { path } of JSON.parse(raster.pendingFontAssets())) {
        raster.putFontAsset(
          path,
          await fetchFont(path).catch(() => new Uint8Array(0)),
        );
      }
      const out = raster.rasterize(scene, "rgba", 0, false);
      lap("raster");
      if (out.length !== RGBA_HEADER_BYTES + width * height * 4) {
        throw new Error(`rasterize failed: ${raster.lastRasterizeInfo()}`);
      }
      keepDom(dom, baseUrl);
      return {
        rgba: out.slice(RGBA_HEADER_BYTES),
        width,
        height,
        nodes: dom.nodeCount(),
        title: dom.title(),
        resources,
        sceneBytes: scene.length,
        timings,
      };
    } finally {
      raster.free();
    }
  } catch (e) {
    dom.free();
    throw e;
  }
};

// 最後に描いた DOM を残しておき、コンソールとクリックの判定に使う
let lastDom = null;
let lastBase = null;
const keepDom = (dom, baseUrl) => {
  if (lastDom && lastDom !== dom) lastDom.free();
  lastDom = dom;
  lastBase = baseUrl;
};

// 画面上の座標にある要素を、エンジンの hit test (elementFromPoint) で求める。
// リンクの中なら、移動先の URL を返す。ページ内リンク (#id) なら、移動先の y 座標を返す
const hitTest = ({ x, y }) => {
  if (!lastDom) return null;
  const dom = lastDom;
  const id = dom.elementFromPoint(x, y);
  if (id < 0) return null;
  const el = new El(dom, id).toJSON();
  const linkId = dom.closestInTree(id, "a[href]");
  if (linkId < 0) return { el };
  const raw = new El(dom, linkId).attr("href");
  if (raw.startsWith("#")) {
    const name = decodeURIComponent(raw.slice(1)).replace(/["\\]/g, "\\$&");
    const target = dom.querySelector(`[id="${name}"], a[name="${name}"]`);
    const rect = target >= 0 ? dom.getBoundingClientRect(target) : null;
    return { el, href: raw, anchorY: rect ? rect.y : null };
  }
  let href;
  try {
    // ブラウザと同じく、<base href> があればそれを基準にする
    const baseId = dom.querySelector("base[href]");
    const docBase =
      baseId >= 0
        ? new URL(new El(dom, baseId).attr("href"), lastBase || undefined).href
        : lastBase;
    href = new URL(raw, docBase || undefined).href;
  } catch {
    return { el, href: raw, invalid: true };
  }
  return { el, href };
};

// DevTools の $ と $$ に似た道具を、DomHandle の API で作る。
// コンソールのコードは Boa ではなく、この Worker (ブラウザの JS) で実行する。
// Boa からは DomHandle を呼べないため (エンジンでは dom-shim が Boa に DOM を渡している)
class El {
  constructor(dom, id) {
    this.id = id;
    const info = dom.nodeInfo(id);
    this.tag = (info?.localName || info?.nodeName || "").toLowerCase();
    this.attrs = {};
    const a = info?.attributes ?? [];
    for (let i = 0; i < a.length; i += 2) this.attrs[a[i]] = a[i + 1];
    Object.defineProperty(this, "dom", { value: dom });
  }
  get text() {
    return this.dom.textContent(this.id);
  }
  get innerText() {
    return this.dom.innerTextRendered(this.id) ?? this.text;
  }
  get html() {
    return this.dom.outerHTML(this.id);
  }
  attr(name) {
    return this.attrs[name] ?? null;
  }
  style(prop) {
    return this.dom.computedStyleValue(this.id, prop) ?? null;
  }
  $$(sel) {
    return [...this.dom.querySelectorAllInSubtree(this.id, sel)].map(
      (id) => new El(this.dom, id),
    );
  }
  // 結果を表示するときの形。DevTools の要素の表示に寄せる
  toJSON() {
    const id = this.attrs.id ? `#${this.attrs.id}` : "";
    const cls = this.attrs.class
      ? "." + this.attrs.class.trim().split(/\s+/).join(".")
      : "";
    const text = this.text.replace(/\s+/g, " ").trim();
    const short = text.length > 60 ? text.slice(0, 60) + "…" : text;
    return `<${this.tag}${id}${cls}>${short ? " " + short : ""}`;
  }
}

const runConsole = ({ src }) => {
  if (!lastDom) throw new Error("まだ何も描いていません");
  const dom = lastDom;
  const $$ = (sel) =>
    [...dom.querySelectorAll(sel)].map((id) => new El(dom, id));
  const $ = (sel) => {
    const id = dom.querySelector(sel);
    return id >= 0 ? new El(dom, id) : null;
  };
  const t0 = performance.now();
  // 式として評価できなければ文として実行する
  let fn;
  try {
    fn = new Function("$", "$$", "title", `return (${src}\n)`);
  } catch {
    fn = new Function("$", "$$", "title", src);
  }
  const value = fn($, $$, dom.title());
  // 文字列はそのまま、ほかは JSON で見せる
  const result =
    value === undefined
      ? "undefined"
      : typeof value === "string"
        ? value
        : JSON.stringify(value, null, 2);
  return { result, ms: Math.round(performance.now() - t0) };
};

const evalJs = ({ src }) => {
  const t0 = performance.now();
  const result = core.ks_eval_sync(src);
  return { result, ms: Math.round(performance.now() - t0) };
};

self.onmessage = async ({ data: { id, type, payload } }) => {
  try {
    const initMs = await ready;
    if (type === "init") {
      self.postMessage({ id, ok: true, value: { initMs } });
    } else if (type === "render") {
      const value = await render(payload);
      self.postMessage({ id, ok: true, value }, [value.rgba.buffer]);
    } else if (type === "eval") {
      self.postMessage({ id, ok: true, value: evalJs(payload) });
    } else if (type === "console") {
      self.postMessage({ id, ok: true, value: runConsole(payload) });
    } else if (type === "hit") {
      self.postMessage({ id, ok: true, value: hitTest(payload) });
    }
  } catch (e) {
    self.postMessage({ id, ok: false, error: String(e?.stack ?? e) });
  }
};
