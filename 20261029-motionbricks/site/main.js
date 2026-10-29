import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

const $ = (id) => document.getElementById(id);
const css = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// シーン
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
$("view").appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 100);
camera.position.set(2.6, 1.7, 3.6);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.9, 0);
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 2.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(3, 5, 2);
scene.add(sun);
const grid = new THREE.GridHelper(20, 40, 0x888888, 0x888888);
grid.material.transparent = true;
grid.material.opacity = 0.35;
scene.add(grid);

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// 骨格。骨を円柱、関節を球で描き、毎フレーム動かす
const UP = new THREE.Vector3(0, 1, 0);
const boneGeometry = new THREE.CylinderGeometry(1, 1, 1, 8);
const jointGeometry = new THREE.SphereGeometry(1, 10, 8);

class Skeleton {
  constructor(parents, { color, opacity = 1, radius = 0.012 }) {
    this.parents = parents;
    this.material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity === 1,
    });
    this.group = new THREE.Group();
    this.bones = parents.map((p) => {
      if (p < 0) return null;
      const mesh = new THREE.Mesh(boneGeometry, this.material);
      this.group.add(mesh);
      return mesh;
    });
    this.joints = parents.map(() => {
      const mesh = new THREE.Mesh(jointGeometry, this.material);
      mesh.scale.setScalar(radius * 1.3);
      this.group.add(mesh);
      return mesh;
    });
    this.radius = radius;
  }

  // points は mm の平らな配列、offset は先頭の関節の位置
  update(points, offset) {
    const at = (j, v) =>
      v
        .set(
          points[offset + j * 3],
          points[offset + j * 3 + 1],
          points[offset + j * 3 + 2],
        )
        .multiplyScalar(0.001);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    this.parents.forEach((p, j) => {
      at(j, a);
      this.joints[j].position.copy(a);
      if (p < 0) return;
      at(p, b);
      const bone = this.bones[j];
      const length = a.distanceTo(b);
      bone.position.addVectors(a, b).multiplyScalar(0.5);
      bone.quaternion.setFromUnitVectors(UP, b.sub(a).normalize());
      bone.scale.set(this.radius, length, this.radius);
    });
  }
}

// VRM モデル。motion.bones は人型ボーンごとの「T ポーズからのワールド回転」なので、
// 親との差を取れば、T ポーズを基準にした正規化ボーンのローカル回転になる
const VRM_PARENTS = {
  hips: null,
  spine: "hips",
  chest: "spine",
  upperChest: "chest",
  neck: "upperChest",
  head: "neck",
};
for (const side of ["left", "right"]) {
  Object.assign(VRM_PARENTS, {
    [`${side}Shoulder`]: "upperChest",
    [`${side}UpperArm`]: `${side}Shoulder`,
    [`${side}LowerArm`]: `${side}UpperArm`,
    [`${side}Hand`]: `${side}LowerArm`,
    [`${side}UpperLeg`]: "hips",
    [`${side}LowerLeg`]: `${side}UpperLeg`,
    [`${side}Foot`]: `${side}LowerLeg`,
    [`${side}Toes`]: `${side}Foot`,
  });
  for (const finger of ["Thumb", "Index", "Middle", "Ring", "Little"]) {
    Object.assign(VRM_PARENTS, {
      [`${side}${finger}Proximal`]: `${side}Hand`,
      [`${side}${finger}Intermediate`]: `${side}${finger}Proximal`,
      [`${side}${finger}Distal`]: `${side}${finger}Intermediate`,
    });
  }
}

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));
const models = {};
let vrm = null;

async function loadModel(name) {
  if (vrm) scene.remove(vrm.scene);
  vrm = null;
  if (name) {
    if (!models[name]) {
      const gltf = await loader.loadAsync(`./models/${name}.vrm`);
      const model = gltf.userData.vrm;
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.combineSkeletons(gltf.scene);
      // VRM 0.x は -Z 向きなので、+Z 向きに回す
      VRMUtils.rotateVRM0(model);
      model.scene.traverse((o) => (o.frustumCulled = false));
      model.restHipHeight =
        model.humanoid.getNormalizedBoneNode("hips").position.y;
      models[name] = model;
    }
    vrm = models[name];
    scene.add(vrm.scene);
  }
  if (motion) show();
}

function poseModel(f) {
  const humanoid = vrm.humanoid;
  // 正規化ボーンは VRM 0.x では -Z 向きの座標で持つので、X と Z を反転する
  const flip = vrm.meta.metaVersion === "0" ? -1 : 1;
  const world = (bone) => {
    const q = motion.bones[bone];
    const i = f * 4;
    return new THREE.Quaternion(q[i], q[i + 1], q[i + 2], q[i + 3]).normalize();
  };
  for (const bone of Object.keys(motion.bones)) {
    const node = humanoid.getNormalizedBoneNode(bone);
    if (!node) continue;
    // モデルにない親 (upperChest など) は飛ばす
    let parent = VRM_PARENTS[bone];
    while (parent && !humanoid.getNormalizedBoneNode(parent))
      parent = VRM_PARENTS[parent];
    const local = parent
      ? world(parent).invert().multiply(world(bone))
      : world(bone);
    node.quaternion.set(flip * local.x, local.y, flip * local.z, local.w);
  }
  const scale = vrm.restHipHeight / motion.hipHeight;
  const o = f * motion.joints * 3;
  const [x, y, z] = motion.positions
    .slice(o, o + 3)
    .map((v) => v * 0.001 * scale);
  humanoid.getNormalizedBoneNode("hips").position.set(flip * x, y, flip * z);
}

// 状態
let motion = null;
let body = null;
let ghost = null;
let trail = null;
let frame = 0;
let playing = true;
// ループの最後の姿勢で止まっている残り秒数
const LOOP_WAIT = 1;
let wait = 0;
let last = performance.now();

function stepOf(f) {
  // boundaries[0] までは文脈、それ以降は boundaries[i] から i 番目の区間
  const b = motion.boundaries;
  for (let i = b.length - 1; i >= 0; i--) if (f >= b[i]) return i;
  return -1;
}

async function load(name) {
  motion = await (await fetch(`./motions/${name}.json`)).json();
  for (const s of [body, ghost]) if (s) scene.remove(s.group);
  if (trail) scene.remove(trail);

  body = new Skeleton(motion.parents, { color: css("--generated") });
  ghost = new Skeleton(motion.parents, {
    color: css("--target"),
    opacity: 0.45,
    radius: 0.008,
  });
  scene.add(body.group, ghost.group);

  const hips = [];
  const stride = motion.joints * 3;
  for (let f = 0; f < motion.frames; f++) {
    const o = f * stride;
    hips.push(
      new THREE.Vector3(
        motion.positions[o],
        2,
        motion.positions[o + 2],
      ).multiplyScalar(0.001),
    );
  }
  trail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(hips),
    new THREE.LineBasicMaterial({ color: css("--target") }),
  );
  trail.visible = $("trail").checked;
  scene.add(trail);

  $("seek").max = motion.frames - 1;
  frame = 0;
  wait = 0;
  show();
}

function show() {
  const f = Math.floor(frame);
  const stride = motion.joints * 3;
  body.update(motion.positions, f * stride);

  const step = stepOf(f);
  const inStep = step >= 0 && step < motion.labels.length;
  body.material.color.set(css(inStep ? "--generated" : "--context"));
  body.group.visible = !vrm;
  if (vrm) poseModel(f);
  ghost.group.visible = inStep && $("ghost").checked;
  if (inStep) ghost.update(motion.targets, step * stride);

  if ($("follow").checked) {
    const hips = body.joints[0].position;
    const delta = new THREE.Vector3(
      hips.x - controls.target.x,
      0,
      hips.z - controls.target.z,
    );
    controls.target.add(delta);
    camera.position.add(delta);
  }

  $("seek").value = f;
  $("time").textContent = `${(f / motion.fps).toFixed(2)} s`;
  $("step").textContent = inStep
    ? `${step + 1}/${motion.labels.length} ${motion.labels[step]}`
    : "文脈";
}

function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (motion && playing) {
    if (wait > 0) {
      wait -= dt;
      if (wait <= 0) {
        frame = 0;
        show();
      }
    } else {
      frame += dt * motion.fps * Number($("speed").value);
      if (frame >= motion.frames) {
        frame = motion.frames - 1;
        wait = LOOP_WAIT;
      }
      show();
    }
  }
  // 揺れもの (spring bone) は止まっている間も動かす
  if (vrm) vrm.update(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function setPlaying(value) {
  playing = value;
  $("play").textContent = playing ? "⏸" : "▶";
  $("play").setAttribute("aria-label", playing ? "一時停止" : "再生");
}

// 操作
$("play").addEventListener("click", () => setPlaying(!playing));
$("seek").addEventListener("input", (e) => {
  setPlaying(false);
  frame = Number(e.target.value);
  wait = 0;
  show();
});
$("motion").addEventListener("change", (e) => load(e.target.value));
$("model").addEventListener("change", (e) => loadModel(e.target.value));
for (const id of ["ghost", "follow"])
  $(id).addEventListener("change", () => motion && show());
$("trail").addEventListener(
  "change",
  (e) => trail && (trail.visible = e.target.checked),
);
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target.tagName !== "SELECT") {
    e.preventDefault();
    setPlaying(!playing);
  }
});

const list = await (await fetch("./motions/index.json")).json();
for (const { name } of list) $("motion").add(new Option(name, name));
await load(list[0].name);
requestAnimationFrame(tick);
