import { Wllama } from "@wllama/wllama";
import wasmUrl from "@wllama/wllama/esm/wasm/wllama.wasm?url";
import { COMMON, LANGUAGES } from "./languages.js";

const $ = (id) => document.getElementById(id);
const log = (msg) => {
  $("log").textContent += `${msg}\n`;
  console.log(msg);
};

// 翻訳先: よく使う言語を先に、残りを言語コード順に並べる
const names = new Map(LANGUAGES);
const others = LANGUAGES.map(([code]) => code).filter(
  (code) => !COMMON.includes(code),
);
function fillLanguages(select) {
  for (const [label, codes] of [
    ["よく使う", COMMON],
    ["その他", others],
  ]) {
    const group = document.createElement("optgroup");
    group.label = label;
    for (const code of codes)
      group.append(new Option(`${names.get(code)} (${code})`, code));
    select.append(group);
  }
}

// 翻訳の段。多段翻訳がオフのときは先頭の段だけを使う
const steps = () => [...$("chain").querySelectorAll(".step")];
const activeSteps = () => ($("multi").checked ? steps() : steps().slice(0, 1));

function addStep(lang) {
  const step = $("step-tpl").content.firstElementChild.cloneNode(true);
  const select = step.querySelector(".lang");
  fillLanguages(select);
  select.value = lang;
  step.querySelector(".remove").onclick = () => step.remove();
  $("chain").append(step);
}
// 追加する段の翻訳先。直前の段が日本語なら英語、それ以外なら日本語にする
const nextLang = () =>
  steps().at(-1).querySelector(".lang").value === "ja" ? "en" : "ja";

addStep("ja");
$("add-step").onclick = () => addStep(nextLang());
// ひらがなかカタカナがあれば日本語とみなす。漢字だけでは中国語と区別できない
const isJapanese = (text) => /[぀-ヿ]/.test(text);

// 多段翻訳をオンにしたとき、段が 1 つだけなら原文に合わせて往復する 2 段にする。
// 日本語なら 英語 → 日本語、それ以外なら 日本語 → 原文の言語 (指定がなければ英語)。
// 2 段目以降があるときは、選び直した言語を上書きしない
$("multi").onchange = () => {
  document.body.classList.toggle("multi", $("multi").checked);
  if (!$("multi").checked || steps().length > 1) return;
  const [first, second] = isJapanese($("input").value)
    ? ["en", "ja"]
    : ["ja", $("source-lang").value || "en"];
  steps()[0].querySelector(".lang").value = first;
  addStep(second);
};

const wllama = new Wllama(
  { default: wasmUrl },
  {
    logger: {
      debug: () => {},
      log: (...a) => log(a.join(" ")),
      warn: (...a) => log(`[warn] ${a.join(" ")}`),
      error: (...a) => log(`[error] ${a.join(" ")}`),
    },
  },
);

// 翻訳オプション
fillLanguages($("source-lang"));

// 用語集を [原文の語, 訳語] の組にする。1 行に 1 組で、最初の = : タブ (全角の ＝ ： も) で区切る
const parseGlossary = () =>
  $("glossary")
    .value.split("\n")
    .map((line) => line.split(/[=:\t＝：](.*)/s, 2).map((s) => s.trim()))
    .filter((pair) => pair.length === 2 && pair[0] && pair[1]);

const readOptions = () => ({
  context: $("context").value.trim() ? $("context").value : "",
  glossary: parseGlossary(),
  sourceLang: $("source-lang").value,
  form: $("form").value,
});

// 閉じていても、どのオプションが効いているか分かるよう summary に出す
function showOptionsSummary() {
  const { context, glossary, sourceLang, form } = readOptions();
  const on = [];
  if (context) on.push("コンテキスト");
  if (glossary.length) on.push(`用語集 ${glossary.length} 件`);
  if (sourceLang) on.push(`原文 ${sourceLang}`);
  if (form) on.push(form === "plain" ? "常体" : "敬体");
  $("options-summary").textContent = on.length ? `: ${on.join(", ")}` : "";
}
for (const id of ["context", "glossary", "source-lang", "form"])
  $(id).addEventListener("input", showOptionsSummary);

// PFML3 プロンプト。順序はチャットテンプレートに合わせて dataset → context → glossary → input → output。
// form は翻訳先が ja のときだけ付けられる。BOS は llama.cpp が付ける
function buildPrompt(text, { lang, sourceLang, context, glossary, form }) {
  let p = "<|plamo:tag|>dataset<|plamo:msg|>translation";
  if (context) p += `<|plamo:tag|>context<|plamo:msg|>${context}`;
  if (glossary.length) {
    p += "<|plamo:tag|>glossary";
    for (const [src, tgt] of glossary)
      p += `<|plamo:index|>${src}<|plamo:item|>${tgt}`;
  }
  p += "<|plamo:tag|>input";
  if (sourceLang) p += `<|plamo:key|>lang<|plamo:val|>${sourceLang}`;
  p += `<|plamo:msg|>${text}<|plamo:tag|>output<|plamo:key|>lang<|plamo:val|>${lang}`;
  if (form && lang === "ja") p += `<|plamo:key|>form<|plamo:val|>${form}`;
  return `${p}<|plamo:msg|>`;
}

// GGUF を取得する。OPFS (Origin Private File System) に保存し、2 回目以降はダウンロードしない。
// ダウンロードはディスクへ直接書き込むので、メモリにファイル全体を持たない
async function fetchGguf(url, name, onProgress) {
  const root = await navigator.storage.getDirectory();
  try {
    const file = await (await root.getFileHandle(name)).getFile();
    log(`cache hit: ${name} (${file.size} bytes)`);
    return file;
  } catch {
    // キャッシュにない
  }
  navigator.storage.persist?.();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const total = Number(res.headers.get("content-length"));
  let loaded = 0;
  const progress = new TransformStream({
    transform(chunk, controller) {
      loaded += chunk.length;
      onProgress(loaded, total);
      controller.enqueue(chunk);
    },
  });
  // 書き込み途中で中断しても壊れたファイルを使わないよう、.part に書いてから名前を変える
  const part = await root.getFileHandle(`${name}.part`, { create: true });
  await res.body.pipeThrough(progress).pipeTo(await part.createWritable());
  await part.move(name);
  return (await root.getFileHandle(name)).getFile();
}

async function showCacheUsage() {
  const root = await navigator.storage.getDirectory();
  const names = [];
  for await (const [name, handle] of root.entries()) {
    if (handle.kind === "file") names.push(name);
  }
  const { usage } = await navigator.storage.estimate();
  $("cache").textContent =
    `キャッシュ: ${names.length} ファイル, ${(usage / 2 ** 20).toFixed(0)} MB`;
}

$("clear").onclick = async () => {
  const root = await navigator.storage.getDirectory();
  for await (const name of root.keys()) await root.removeEntry(name);
  await showCacheUsage();
};
showCacheUsage();

function selectedModel() {
  const [repo, revision, file] = $("model").value.split("|");
  return {
    file,
    url: `https://huggingface.co/${repo}/resolve/${revision}/${file}`,
    cacheName: `${revision.slice(0, 7)}-${file}`,
  };
}

// 選択中のモデルと WebGPU の組。読み込み済みの組と比べて、読み込み直しが要るかを判断する
const selection = () => `${$("model").value}|${$("gpu").checked}`;
let loadedSelection = null;
let loadedStatus = "";
let loading = false;

// 次に押すボタンが分かるよう、読み込むまでは読み込みボタンを、読み込んだ後は翻訳ボタンを強調する
function refreshLoadUI() {
  const ready = loadedSelection !== null;
  const current = selection() === loadedSelection;
  $("load").textContent = current ? "読み込み済み" : "モデルを読み込む";
  $("load").disabled = loading || current;
  $("load").classList.toggle("primary", !ready);
  $("translate").classList.toggle("primary", ready);
  const hint = ready
    ? ""
    : loading
      ? "モデルを読み込み中"
      : "モデルを読み込んでください";
  $("translate-hint").textContent = hint;
  $("translate").title = hint;
  if (ready) {
    $("status").textContent = current
      ? loadedStatus
      : "変更を反映するには「モデルを読み込む」を押してください。";
  }
}
$("model").onchange = refreshLoadUI;
$("gpu").onchange = refreshLoadUI;
refreshLoadUI();

// wllama 3.8.1 が同梱する llama.cpp は plamo3 トークナイザ (ggml-org/llama.cpp#30045) より前の版で、
// tokenizer.ggml.model = "plamo3" を読めない。同じ長さの "plamo2" に書き換えてヘッダのオフセットを保つ。
// #30045 以前の llama.cpp と同じく、PLaMo 2 のトークナイザで分割される
async function patchTokenizer(blob) {
  const head = new Uint8Array(await blob.slice(0, 16 << 20).arrayBuffer());
  const enc = new TextEncoder();
  const key = enc.encode("tokenizer.ggml.model");
  // key の後ろに value type (u32 = 8: string)、長さ (u64 = 6)、"plamo3" が続く
  for (let i = 0; i < head.length - key.length - 18; i++) {
    if (!key.every((b, j) => head[i + j] === b)) continue;
    const v = i + key.length + 4 + 8;
    const val = new TextDecoder().decode(head.subarray(v, v + 6));
    if (val !== "plamo3") return blob;
    head[v + 5] = "2".charCodeAt(0);
    log("patched tokenizer.ggml.model: plamo3 -> plamo2");
    return new Blob([head, blob.slice(head.length)]);
  }
  return blob;
}

$("load").onclick = async () => {
  loading = true;
  loadedSelection = null;
  $("translate").disabled = true;
  refreshLoadUI();
  const selected = selection();
  const { file, url, cacheName } = selectedModel();
  log(
    `navigator.gpu: ${"gpu" in navigator}, crossOriginIsolated: ${self.crossOriginIsolated}`,
  );
  const t0 = performance.now();
  try {
    if (wllama.isModelLoaded()) await wllama.exit();
    const blob = await fetchGguf(url, cacheName, (loaded, total) => {
      $("status").textContent =
        `ダウンロード中 ${Math.round((loaded / total) * 100)}%`;
    });
    const t1 = performance.now();
    $("status").textContent = "読み込み中";
    await wllama.loadModel([await patchTokenizer(blob)], {
      n_ctx: 4096,
      n_gpu_layers: $("gpu").checked ? 999 : 0,
    });
    // ロードに失敗しても例外にならないことがあるので確かめる
    if (!wllama.isModelLoaded()) throw new Error("model not loaded");
    const dl = ((t1 - t0) / 1000).toFixed(1);
    const ld = ((performance.now() - t1) / 1000).toFixed(1);
    loadedStatus = `読み込み完了 (取得 ${dl}s + 読み込み ${ld}s, threads=${wllama.getNumThreads()})`;
    loadedSelection = selected;
    log(
      `loaded ${file}: fetch ${dl}s, load ${ld}s, multithread=${wllama.isMultithread()}`,
    );
    $("translate").disabled = false;
    showCacheUsage();
  } catch (e) {
    $("status").textContent = `読み込みに失敗しました: ${e.message}`;
    log(`[error] ${e.stack ?? e}`);
  } finally {
    loading = false;
    refreshLoadUI();
  }
};

// 1 段分を翻訳し、訳文を返す
async function translateStep(text, step, options) {
  const output = step.querySelector(".output");
  const speed = step.querySelector(".speed");
  const prompt = buildPrompt(text, {
    ...options,
    lang: step.querySelector(".lang").value,
  });
  log(`prompt: ${prompt}`);
  const t0 = performance.now();
  const stream = await wllama.createCompletion({
    prompt,
    max_tokens: 1024,
    temperature: 0,
    stop: ["<|plamo:tag|>", "<|plamo:bos|>"],
    stream: true,
  });
  let timings;
  for await (const chunk of stream) {
    output.textContent += chunk.choices[0]?.text ?? "";
    if (chunk.timings) timings = chunk.timings;
  }
  const total = ((performance.now() - t0) / 1000).toFixed(2);
  speed.textContent = timings
    ? `prompt ${timings.prompt_per_second?.toFixed(1)} tok/s, 生成 ${timings.predicted_per_second?.toFixed(1)} tok/s, 計 ${total}s`
    : `計 ${total}s`;
  if (timings) log(`timings: ${JSON.stringify(timings)}`);
  return output.textContent.trim();
}

$("translate").onclick = async () => {
  const targets = activeSteps();
  for (const id of ["translate", "multi", "add-step"]) $(id).disabled = true;
  for (const step of targets) {
    step.querySelector(".output").textContent = "";
    step.querySelector(".speed").textContent = "";
  }
  try {
    // 前の段の訳文を次の段の原文にする
    let text = $("input").value;
    const options = readOptions();
    for (const step of targets) {
      text = await translateStep(text, step, options);
      // 次の段の原文の言語は、この段の翻訳先
      options.sourceLang = step.querySelector(".lang").value;
      if (!text) break;
    }
  } catch (e) {
    log(`[error] ${e.stack ?? e}`);
  } finally {
    for (const id of ["multi", "add-step"]) $(id).disabled = false;
    $("translate").disabled = loadedSelection === null;
  }
};

$("input").addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    (e.ctrlKey || e.metaKey) &&
    !$("translate").disabled
  ) {
    e.preventDefault();
    $("translate").click();
  }
});
