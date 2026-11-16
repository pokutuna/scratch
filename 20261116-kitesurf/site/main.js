import { EXAMPLES } from "./examples.js";
import { BOA_SNIPPETS, DOM_SNIPPETS } from "./snippets.js";

const $ = (id) => document.getElementById(id);
const src = $("src");
const canvas = $("canvas");
const status = $("status");

// worker とのやりとりを Promise にする
const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});
let seq = 0;
const pending = new Map();
worker.onmessage = ({ data: { id, ok, value, error } }) => {
  const p = pending.get(id);
  pending.delete(id);
  if (ok) p.resolve(value);
  else p.reject(new Error(error));
};
const call = (type, payload) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, type, payload });
  });

const PRESETS = [
  {
    name: "pokutuna.github.io/scratch",
    url: "https://pokutuna.github.io/scratch/",
  },
  {
    name: "Wikipedia: Kitesurfing",
    url: "https://en.wikipedia.org/wiki/Kitesurfing",
  },
  {
    name: "Wikipedia: WebAssembly (ja)",
    url: "https://ja.wikipedia.org/wiki/WebAssembly",
  },
];

// 開いた URL。サブリソースの解決と取得に使う。例のタブでは null
let baseUrl = null;

// 記事ページは CORS を許可していないので、同じ記事の HTML を返す REST API に置き換える
const toFetchableUrl = (input) => {
  const u = new URL(input);
  const m = u.pathname.match(/^\/wiki\/(.+)$/);
  if (u.hostname.endsWith(".wikipedia.org") && m) {
    u.pathname = `/api/rest_v1/page/html/${m[1]}`;
  }
  return u.href;
};

// URL 欄には、REST API の URL ではなく記事の URL を見せる
const toDisplayUrl = (url) => {
  const u = new URL(url);
  // /api/rest_v1/page/html/<記事名> は /w/rest.php/v1/page/<記事名>/html にリダイレクトされる
  const m =
    u.pathname.match(/^\/api\/rest_v1\/page\/html\/(.+)$/) ??
    u.pathname.match(/^\/w\/rest\.php\/v1\/page\/(.+)\/html$/);
  if (u.hostname.endsWith(".wikipedia.org") && m) {
    return `${u.origin}/wiki/${m[1]}`;
  }
  return u.href;
};

// 開いたページの履歴。戻る、進むに使う
const history = [];
let historyIndex = -1;
const updateNav = () => {
  $("back").disabled = historyIndex <= 0;
  $("forward").disabled = historyIndex >= history.length - 1;
};

const openUrl = async (input, { push = true } = {}) => {
  let url;
  try {
    url = toFetchableUrl(input);
  } catch {
    setStatus(`URL として読めません: ${input}`, { error: true });
    return;
  }
  selectTab(URL_TAB, { focus: false });
  setStatus(`${url} を取得中…`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    src.value = await res.text();
    baseUrl = res.url;
    $("url").value = toDisplayUrl(res.url);
    if (push) {
      history.splice(historyIndex + 1);
      history.push(res.url);
      historyIndex = history.length - 1;
    }
    updateNav();
    $("frame").scrollTo(0, 0);
    render();
  } catch (e) {
    setStatus(
      `取得できません: ${e.message} (CORS を許可していないサイトは開けません)`,
      { error: true },
    );
  }
};
$("back").addEventListener("click", () => {
  if (historyIndex <= 0) return;
  historyIndex--;
  openUrl(history[historyIndex], { push: false });
});
$("forward").addEventListener("click", () => {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  openUrl(history[historyIndex], { push: false });
});

// タブ: 例ごとに 1 つと、URL を開くタブ
const tabs = [...EXAMPLES.map((ex) => ex.name), "URL を開く"];
const URL_TAB = tabs.length - 1;
function selectTab(i, { focus = true } = {}) {
  for (const [j, b] of [
    ...$("tabs").querySelectorAll("[role=tab]"),
  ].entries()) {
    b.setAttribute("aria-selected", String(i === j));
  }
  $("urlbar").hidden = i !== URL_TAB;
  if (i === URL_TAB) {
    if (focus) $("url").focus();
    return;
  }
  baseUrl = null;
  src.value = EXAMPLES[i].html;
  render();
}

// canvas 上のマウスの位置を、ページの座標 (CSS px) にする。表示は縮小されていることがある
const toPagePoint = (e) => {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) * canvas.width) / r.width,
    y: ((e.clientY - r.top) * canvas.height) / r.height,
  };
};

// マウスの下の要素をエンジンに問い合わせ、リンクならカーソルと URL を出す。
// 問い合わせ中に動いたら、終わってから最新の位置で 1 回だけ問い合わせる
let hoverPoint = null;
let hovering = false;
const showHover = (hit) => {
  canvas.style.cursor = hit?.href ? "pointer" : "";
  $("peek").hidden = !hit?.href;
  $("peek").textContent = hit?.href ? displayHref(hit.href) : "";
};
const displayHref = (href) => {
  try {
    return href.startsWith("#") ? href : toDisplayUrl(href);
  } catch {
    return href;
  }
};
const pumpHover = async () => {
  hovering = true;
  while (hoverPoint) {
    const p = hoverPoint;
    hoverPoint = null;
    showHover(await call("hit", p).catch(() => null));
  }
  hovering = false;
};
canvas.addEventListener("mousemove", (e) => {
  hoverPoint = toPagePoint(e);
  if (!hovering) pumpHover();
});
canvas.addEventListener("mouseleave", () => {
  hoverPoint = null;
  showHover(null);
});

// クリックした位置のリンクを開く。判定はエンジン、移動はこのページが受け持つ
canvas.addEventListener("click", async (e) => {
  const hit = await call("hit", toPagePoint(e)).catch(() => null);
  if (!hit?.href) return;
  if (hit.href.startsWith("#")) {
    if (hit.anchorY != null) {
      const scale = canvas.getBoundingClientRect().height / canvas.height;
      $("frame").scrollTo({ top: hit.anchorY * scale, behavior: "smooth" });
    }
    return;
  }
  if (hit.invalid || !/^https?:/.test(hit.href)) {
    setStatus(`開けないリンクです: ${hit.href}`, { error: true });
    return;
  }
  openUrl(hit.href);
});

for (const [i, name] of tabs.entries()) {
  const b = document.createElement("button");
  b.type = "button";
  b.role = "tab";
  b.textContent = name;
  b.addEventListener("click", () => selectTab(i));
  if (i === URL_TAB) {
    const sep = document.createElement("span");
    sep.className = "sep";
    $("tabs").append(sep);
  }
  $("tabs").append(b);
}
for (const p of PRESETS) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = p.name;
  b.addEventListener("click", () => {
    openUrl(p.url);
  });
  $("presets").append(b);
}
$("urlbar").addEventListener("submit", (e) => {
  e.preventDefault();
  openUrl($("url").value);
});
$("tabs").querySelector("[role=tab]").setAttribute("aria-selected", "true");
src.value = EXAMPLES[0].html;

// 状態表示。文字列はそのまま、配列は 1 つずつ chip にする
const setStatus = (items, { title = "", error = false } = {}) => {
  status.classList.toggle("error", error);
  if (!Array.isArray(items)) {
    status.textContent = items;
    return;
  }
  status.replaceChildren();
  if (title) {
    const t = document.createElement("span");
    t.className = "title";
    t.textContent = title;
    status.append(t);
  }
  for (const text of items) {
    const c = document.createElement("span");
    c.className = "chip";
    c.textContent = text;
    status.append(c);
  }
};

// 描画中に入力が来たら、終わってから最新の内容で 1 回だけ描き直す
let busy = false;
let again = false;
const render = async () => {
  if (busy) {
    again = true;
    return;
  }
  busy = true;
  $("frame").classList.add("busy");
  try {
    const width = Math.max(
      200,
      Math.min(2000, Number($("width").value) || 800),
    );
    const { rgba, height, nodes, sceneBytes, timings, title, resources } =
      await call("render", {
        html: src.value,
        baseUrl,
        width,
        minHeight: 600,
        fullPage: $("full").checked,
      });
    canvas.width = width;
    canvas.height = height;
    canvas
      .getContext("2d")
      .putImageData(
        new ImageData(new Uint8ClampedArray(rgba.buffer), width, height),
        0,
        0,
      );
    const items = [`${width}×${height}`, `${nodes} nodes`];
    if (baseUrl) {
      items.push(
        `リソース ${resources.count} 件${resources.failed ? ` (失敗 ${resources.failed})` : ""}`,
      );
    }
    items.push(`scene ${(sceneBytes / 1024).toFixed(1)} KB`);
    for (const [k, v] of Object.entries(timings)) items.push(`${k} ${v}ms`);
    setStatus(items, { title: baseUrl ? title : "" });
    // DOM コンソールは、描き直したページに対して実行し直す
    runDomConsole();
  } catch (e) {
    setStatus(`エラー: ${e.message.split("\n")[0]}`, { error: true });
    console.error(e);
  } finally {
    busy = false;
    $("frame").classList.remove("busy");
    if (again) {
      again = false;
      render();
    }
  }
};

let timer = 0;
src.addEventListener("input", () => {
  if (!$("live").checked) return;
  clearTimeout(timer);
  timer = setTimeout(render, 150);
});
$("width").addEventListener("change", render);
$("full").addEventListener("change", render);
$("render").addEventListener("click", render);
$("actual").addEventListener("change", (e) => {
  $("frame").classList.toggle("actual", e.target.checked);
});

// コンソール 2 つ (DOM と Boa)。定型コードのボタンで入力欄を埋めて実行する
const setupConsole = ({ type, input, button, output, snippets, list }) => {
  const run = async () => {
    try {
      const { result, ms } = await call(type, { src: $(input).value });
      $(output).textContent = `${result}\n// ${ms}ms`;
    } catch (e) {
      $(output).textContent = e.message.split("\n")[0];
    }
  };
  $(button).addEventListener("click", run);
  $(input).addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run();
  });
  for (const s of snippets) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = s.name;
    b.addEventListener("click", () => {
      for (const o of $(list).children) o.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-pressed", "true");
      $(input).value = s.src;
      run();
    });
    $(list).append(b);
  }
  $(input).value = snippets[0].src;
  return run;
};
const runDomConsole = setupConsole({
  type: "console",
  input: "domjs",
  button: "domrun",
  output: "domout",
  snippets: DOM_SNIPPETS,
  list: "domSnippets",
});
setupConsole({
  type: "eval",
  input: "js",
  button: "eval",
  output: "jsout",
  snippets: BOA_SNIPPETS,
  list: "boaSnippets",
});

call("init")
  .then(({ initMs }) => {
    setStatus(`初期化 ${initMs}ms`);
    return render();
  })
  .catch((e) => {
    setStatus(`初期化に失敗: ${e.message.split("\n")[0]}`, { error: true });
  });
