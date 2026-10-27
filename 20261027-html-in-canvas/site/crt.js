// CRT ターミナル: HTML のターミナルを texElementSubImage2D でテクスチャにし、ブラウン管風のシェーダで描く。
import { observeSize, paintLoop, uploadElementTexture } from "./util.js";

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
uniform float uCurve;
uniform float uGlitch;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// 樽型歪み。画面の外に出た座標は枠として描く
vec2 barrel(vec2 uv) {
  vec2 c = uv * 2.0 - 1.0;
  c *= 1.0 + uCurve * dot(c, c) * 0.18;
  c *= 1.0 - uCurve * 0.04;
  return c * 0.5 + 0.5;
}

vec3 sampleRGB(vec2 uv, vec2 dir) {
  float r = texture(uTex, uv + dir).r;
  float g = texture(uTex, uv).g;
  float b = texture(uTex, uv - dir).b;
  return vec3(r, g, b);
}

void main() {
  vec2 uv = barrel(vUv);

  // 角の丸い画面の外側は筐体
  vec2 q = abs(uv - 0.5) - (0.5 - 0.03);
  float outside = length(max(q, 0.0)) - 0.03;
  if (outside > 0.0) {
    float edge = exp(-outside * 90.0);
    outColor = vec4(vec3(0.03, 0.05, 0.04) + vec3(0.05, 0.12, 0.08) * edge, 1.0);
    return;
  }

  // グリッチ: 行ごとに横へずらす
  float t = floor(uTime * 14.0);
  float band = floor(uv.y * 60.0);
  float hit = step(1.0 - uGlitch * 0.35, hash(vec2(band, t)));
  uv.x += (hash(vec2(t, band)) - 0.5) * 0.12 * hit * uGlitch;
  uv.x += sin(uv.y * 300.0 + uTime * 40.0) * 0.0006 * (1.0 + uGlitch * 6.0);

  vec2 dir = (uv - 0.5) * (0.0025 + uGlitch * 0.02);
  vec3 col = sampleRGB(uv, dir);

  // にじみ (簡易ブルーム)
  vec2 px = 1.5 / uRes;
  vec3 glow = texture(uTex, uv + vec2(px.x, 0)).rgb + texture(uTex, uv - vec2(px.x, 0)).rgb
            + texture(uTex, uv + vec2(0, px.y)).rgb + texture(uTex, uv - vec2(0, px.y)).rgb;
  col += glow * 0.07;

  // 走査線とシャドウマスク
  col *= 0.78 + 0.22 * sin(uv.y * uRes.y * 1.4);
  vec3 mask = vec3(0.8);
  int m = int(mod(gl_FragCoord.x, 3.0));
  mask[m] = 1.15;
  col *= mask;

  // 流れる明るい帯、ちらつき、ノイズ、周辺減光
  float bar = fract(uv.y * 0.6 - uTime * 0.15);
  col += vec3(0.03, 0.06, 0.04) * exp(-pow((bar - 0.5) * 18.0, 2.0));
  col *= 0.96 + 0.04 * sin(uTime * 120.0);
  col += (hash(uv * uRes + fract(uTime) * 100.0) - 0.5) * (0.07 + uGlitch * 0.2);
  float vig = pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.22);
  col *= vig;

  outColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}

export function setup() {
  const canvas = document.getElementById("crt-canvas");
  const term = document.getElementById("term");
  const gl = canvas.getContext("webgl2");

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const u = Object.fromEntries(
    ["uTex", "uRes", "uTime", "uCurve", "uGlitch"].map((n) => [
      n,
      gl.getUniformLocation(prog, n),
    ]),
  );

  const curve = document.getElementById("crt-curve");
  const glitch = document.getElementById("crt-glitch");
  let glitchBoost = 0;
  let needsUpload = true;

  // ターミナル要素をキャンバスと同じ大きさにし、ヒットテスト上もキャンバス全面に重ねる
  observeSize(canvas, (w, h) => {
    term.style.width = `${w}px`;
    term.style.height = `${h}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
    needsUpload = true;
  });

  function upload() {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (!uploadElementTexture(gl, canvas, term)) return;
    canvas.updateElementGeometry(term, { canvasTransform: new DOMMatrix() });
    needsUpload = false;
  }

  const shell = createShell({
    onGlitch: () => (glitchBoost = 1.5),
  });

  const loop = paintLoop(canvas, (event, dt) => {
    if (needsUpload || event.changedElements.includes(term)) upload();
    glitchBoost = Math.max(0, glitchBoost - dt);
    gl.uniform1i(u.uTex, 0);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTime, performance.now() / 1000);
    gl.uniform1f(u.uCurve, curve.value / 100);
    gl.uniform1f(u.uGlitch, Math.min(1, glitch.value / 100 + glitchBoost));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });

  return {
    start() {
      loop.start();
      shell.focus();
    },
    stop: loop.stop,
  };
}

// ---- ターミナルの中身 (普通の DOM 操作) ----

const FILES = {
  "readme.txt": `この画面は普通の HTML です。
<canvas content="drawable"> の子要素として置いた <div> を
WebGL のテクスチャに焼き付けて、シェーダで歪ませています。
input も本物なので、日本語入力もコピー&ペーストもできます。`,
  "cat.txt": `   /\\_/\\
  ( o.o )   にゃーん
   > ^ <`,
  "canvas.exe": "MZ\u00ff\u00fe ...バイナリなので読めません",
};

const COLORS = {
  green: "#6dff9c",
  amber: "#ffb347",
  blue: "#7fd4ff",
  pink: "#ff7ac8",
  white: "#e8f0ff",
};

function createShell({ onGlitch }) {
  const term = document.getElementById("term");
  const out = document.getElementById("term-out");
  const form = document.getElementById("term-form");
  const input = document.getElementById("term-in");
  const history = [];
  let historyPos = 0;

  const print = (text, cls) => {
    const line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = text;
    out.append(line);
    out.scrollTop = out.scrollHeight;
  };

  const commands = {
    help: () =>
      print(`使えるコマンド:
  help ls cat <file> echo <text> date whoami
  color <${Object.keys(COLORS).join("|")}> glitch neofetch sudo clear`),
    ls: () => print(Object.keys(FILES).join("  ")),
    cat: (arg) =>
      print(FILES[arg] ?? `cat: ${arg || ""}: そんなファイルはない`),
    echo: (arg) => print(arg),
    date: () => print(new Date().toString()),
    whoami: () => print("guest (canvas の中の人)"),
    clear: () => out.replaceChildren(),
    sudo: () =>
      print(
        "guest は sudoers に入っていません。この出来事は canvas に描画されます。",
      ),
    glitch: () => {
      print("ｶﾞｶﾞｶﾞｯ……", "em");
      onGlitch();
    },
    color: (arg) => {
      if (!COLORS[arg])
        return print(`color: ${Object.keys(COLORS).join(" / ")} から選ぶ`);
      term.style.setProperty("--fg", COLORS[arg]);
    },
    neofetch: () =>
      print(` ▄▄▄▄▄▄▄   guest@canvas
 █ ▄▄▄ █   ------------
 █ ███ █   OS: HTML-in-Canvas
 █▄▄▄▄▄█   Renderer: WebGL2 + texElementSubImage2D
           DPR: ${devicePixelRatio}
           Screen: ${innerWidth}x${innerHeight}`),
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const line = input.value;
    input.value = "";
    print(`guest@canvas:~$ ${line}`);
    const [cmd, ...rest] = line.trim().split(/\s+/);
    if (!cmd) return;
    history.push(line);
    historyPos = history.length;
    (commands[cmd] ?? (() => print(`${cmd}: command not found (help で一覧)`)))(
      rest.join(" "),
    );
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && historyPos > 0)
      input.value = history[--historyPos];
    else if (e.key === "ArrowDown" && historyPos < history.length)
      input.value = history[++historyPos] ?? "";
    else return;
    e.preventDefault();
  });

  // 歪みのせいで見た目とクリック位置が少しずれるので、どこを押しても入力欄にフォーカスする
  term.addEventListener("click", () => {
    if (!getSelection().toString()) input.focus({ preventScroll: true });
  });

  const boot = [
    "CANVAS BIOS v1.57  (C) 2026",
    "Checking DOM ........ OK",
    "Loading texElementSubImage2D ........ OK",
    "",
    "help と打つとコマンド一覧が出ます。",
  ];
  boot.forEach((line, i) => setTimeout(() => print(line), 180 * i));

  return { focus: () => input.focus({ preventScroll: true }) };
}
