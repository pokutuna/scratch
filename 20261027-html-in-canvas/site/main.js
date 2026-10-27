// タブの切り替えと、各デモの開始・停止。
// 各デモのモジュールは { start(), stop() } を返す setup() を export する。

const supported =
  typeof CanvasRenderingContext2D !== "undefined" &&
  typeof CanvasRenderingContext2D.prototype.drawElementImage === "function" &&
  typeof HTMLCanvasElement.prototype.requestPaint === "function";

// CRT と 3D パネルは WebGL 用の API も使う。フラグで有効にした古い Chrome にはないことがある
const webglSupported =
  typeof WebGL2RenderingContext !== "undefined" &&
  typeof WebGL2RenderingContext.prototype.texElementSubImage2D === "function";
const needsWebGL = new Set(["crt", "panel3d"]);
const runnable = (name) =>
  supported && (webglSupported || !needsWebGL.has(name));

const support = document.getElementById("support");
const supportMsg = document.getElementById("support-msg");
const flagsGuide = document.getElementById("flags-guide");
if (supported && webglSupported) {
  support.classList.add("ok");
  supportMsg.textContent =
    "✅ このブラウザは HTML-in-Canvas に対応しています。";
} else if (supported) {
  support.classList.add("ng");
  supportMsg.innerHTML =
    "⚠️ 2D のデモは動きますが、このブラウザには WebGL 用の <code>texElementSubImage2D()</code> がないため、" +
    "CRT ターミナルと 3D パネルは動きません。Chrome 157 以降か Chrome Canary で開いてください。";
} else {
  support.classList.add("ng");
  supportMsg.textContent =
    "⚠️ このブラウザは HTML-in-Canvas に未対応です。Chrome 157 以降か Chrome Canary で開いてください。";
  flagsGuide.hidden = false;
}

let copiedTimer;
document.getElementById("copy-flag").addEventListener("click", async (e) => {
  await navigator.clipboard.writeText("chrome://flags/#canvas-draw-element");
  e.target.textContent = "コピーしました";
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (e.target.textContent = "コピー"), 1500);
});

const loaders = {
  gravity: () => import("./gravity.js"),
  crt: () => import("./crt.js"),
  kaleido: () => import("./kaleido.js"),
  panel3d: () => import("./panel3d.js"),
};
const demos = {};
let current = null;

async function show(name) {
  for (const tab of document.querySelectorAll(".tabs button")) {
    tab.setAttribute("aria-selected", String(tab.dataset.demo === name));
  }
  for (const section of document.querySelectorAll(".demo")) {
    section.hidden = section.id !== name;
  }
  demos[current]?.stop();
  current = name;
  if (!runnable(name)) return;
  demos[name] ??= (await loaders[name]()).setup();
  // import を待つ間に別のタブへ切り替わっていたら開始しない
  if (current === name) demos[name].start();
}

for (const tab of document.querySelectorAll(".tabs button")) {
  tab.addEventListener("click", () => {
    history.replaceState(null, "", `#${tab.dataset.demo}`);
    show(tab.dataset.demo);
  });
}

const initial = location.hash.slice(1);
show(initial in loaders ? initial : "gravity");
