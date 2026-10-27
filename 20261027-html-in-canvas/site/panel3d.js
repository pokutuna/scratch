// 3D パネル: three.js のシーンに HTML の ToDo を貼り、遠近変換したままヒットテストさせる。
// three.js r186 の HTMLTexture は名前が変わる前の API (texElementImage2D) を使うので、
// テクスチャは自前で texElementSubImage2D し、ExternalTexture で three.js に渡す。
import * as THREE from "three";
import { observeSize, paintLoop, uploadElementTexture } from "./util.js";

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = `
uniform sampler2D map;
uniform float uTime;
uniform float uReflect;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(map, vUv);
  // 斜めに流れる光沢
  float band = abs(fract((vUv.x + vUv.y) * 0.5 - uTime * 0.12) - 0.5);
  c.rgb += 0.18 * smoothstep(0.035, 0.0, band) * c.a;
  // 映り込みは床に近い側 (板の下端 = vUv.y が小さい側) だけ残す
  if (uReflect > 0.0) c.a *= uReflect * (1.0 - smoothstep(0.0, 0.6, vUv.y));
  gl_FragColor = c;
}`;

export function setup() {
  const canvas = document.getElementById("panel3d-canvas");
  const todo = document.getElementById("todo");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(devicePixelRatio);
  const gl = renderer.getContext();

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0c16, 9, 26);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 1.1, 7);
  camera.lookAt(0, -0.7, 0);

  // ---- HTML のテクスチャ ----
  const glTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, glTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  renderer.resetState();
  const texture = new THREE.ExternalTexture(glTex);

  function upload() {
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const ok = uploadElementTexture(gl, canvas, todo);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    renderer.resetState();
    return ok;
  }

  // ---- パネルと床の映り込み ----
  const ew = todo.offsetWidth;
  const eh = todo.offsetHeight;
  const ph = 3.4;
  const pw = (ph * ew) / eh;
  const floorY = -ph / 2 - 0.35;
  const geometry = new THREE.PlaneGeometry(pw, ph);
  const makeMaterial = (reflect) =>
    new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        uTime: { value: 0 },
        uReflect: { value: reflect },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: THREE.DoubleSide,
    });
  const panel = new THREE.Mesh(geometry, makeMaterial(0));
  const reflection = new THREE.Mesh(geometry, makeMaterial(0.28));
  reflection.scale.y = -1;
  scene.add(panel, reflection);

  const grid = new THREE.GridHelper(40, 40, 0x46e3ff, 0x2a3050);
  grid.position.y = floorY - 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(7, 1),
    new THREE.MeshBasicMaterial({
      color: 0xff4f9a,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    }),
  );
  scene.add(ico);

  const starPos = new Float32Array(1500 * 3);
  for (let i = 0; i < starPos.length; i++)
    starPos[i] = (Math.random() - 0.5) * 40;
  const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(starPos, 3),
    ),
    new THREE.PointsMaterial({ color: 0x9fdfff, size: 0.05 }),
  );
  scene.add(stars);

  // ---- マウスで傾ける ----
  const tilt = { x: 0, y: 0 };
  let hover = false;
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    tilt.y = ((e.clientX - r.left) / r.width - 0.5) * 1.1;
    tilt.x = ((e.clientY - r.top) / r.height - 0.5) * 0.8;
    hover = true;
  });
  canvas.addEventListener("pointerleave", () => (hover = false));

  let size = { w: 0, h: 0 };
  observeSize(
    canvas,
    (w, h) => {
      size = { w, h };
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.9 ? 9.5 : 7;
      camera.updateProjectionMatrix();
    },
    { resizeBuffer: false },
  );

  // 要素の border box (px) → 板のローカル座標 → ワールド → クリップ → canvas の CSS px
  const elToPlane = new THREE.Matrix4().set(
    pw / ew,
    0,
    0,
    -pw / 2,
    0,
    -ph / eh,
    0,
    ph / 2,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  );
  const toCanvas = new THREE.Matrix4();
  const m = new THREE.Matrix4();
  function syncHitTest() {
    const { w, h } = size;
    toCanvas.set(
      w / 2,
      0,
      0,
      w / 2,
      0,
      -h / 2,
      0,
      h / 2,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    );
    m.copy(toCanvas)
      .multiply(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse)
      .multiply(panel.matrixWorld)
      .multiply(elToPlane);
    canvas.updateElementGeometry(todo, {
      canvasTransform: DOMMatrix.fromFloat64Array(
        Float64Array.from(m.elements),
      ),
    });
  }

  setupTodo();

  let uploaded = false;
  let t = 0;
  return paintLoop(canvas, (event, dt) => {
    if (!uploaded || event.changedElements.includes(todo)) uploaded = upload();
    t += dt;

    const ty = hover ? tilt.y : Math.sin(t * 0.6) * 0.35;
    const tx = hover ? tilt.x : Math.sin(t * 0.4) * 0.12;
    panel.rotation.y += (ty - panel.rotation.y) * 0.08;
    panel.rotation.x += (tx - panel.rotation.x) * 0.08;
    panel.position.y = Math.sin(t * 1.2) * 0.08;

    reflection.position.y = 2 * floorY - panel.position.y;
    reflection.rotation.set(-panel.rotation.x, panel.rotation.y, 0);

    ico.rotation.y += dt * 0.05;
    ico.rotation.x += dt * 0.02;
    stars.rotation.y -= dt * 0.01;
    panel.material.uniforms.uTime.value = t;
    reflection.material.uniforms.uTime.value = t;

    renderer.render(scene, camera);
    syncHitTest();
  });
}

function setupTodo() {
  const list = document.getElementById("todo-list");
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-in");
  const count = document.getElementById("todo-count");

  const updateCount = () => {
    const all = list.children.length;
    const done = list.querySelectorAll("li.done").length;
    count.textContent = `${done} / ${all} 完了`;
  };

  const add = (text, done = false) => {
    const li = document.createElement("li");
    li.classList.toggle("done", done);
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = done;
    check.addEventListener("change", () => {
      li.classList.toggle("done", check.checked);
      updateCount();
    });
    const span = document.createElement("span");
    span.textContent = text;
    const del = document.createElement("button");
    del.textContent = "削除";
    del.addEventListener("click", () => {
      li.remove();
      updateCount();
    });
    li.append(check, span, del);
    list.append(li);
    updateCount();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    add(input.value.trim());
    input.value = "";
  });

  add("HTML-in-Canvas を試す", true);
  add("three.js の板に HTML を貼る");
  add("傾いたままクリックしてみる");
  add("寝る");
}
