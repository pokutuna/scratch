// 崩れる設定画面: 各部品を Matter.js の剛体にして、その位置と角度で drawElementImage する。
import { observeSize, paintLoop } from "./util.js";

const { Engine, Bodies, Body, Composite, Constraint } = globalThis.Matter;

const STEP = 1000 / 60;
const WALL = 200;

export function setup() {
  const canvas = document.getElementById("gravity-canvas");
  const ctx = canvas.getContext("2d");
  const pieces = [...canvas.querySelectorAll(".piece")];
  const engine = Engine.create();
  const bodies = new Map(); // piece -> body
  let walls = [];
  let size = { w: 0, h: 0 };
  let dropped = false;
  let acc = 0;

  // 崩す前の並び: 中央寄せで左から詰めて折り返す
  function layout() {
    const maxRow = Math.min(size.w - 40, 620);
    const rows = [];
    let row = { items: [], w: 0, h: 0 };
    for (const el of pieces) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const breakRow =
        row.items.length > 0 &&
        (row.w + 12 + w > maxRow ||
          el.classList.contains("title") ||
          row.items[0].el.classList.contains("title"));
      if (breakRow) {
        rows.push(row);
        row = { items: [], w: 0, h: 0 };
      }
      row.w += (row.items.length ? 12 : 0) + w;
      row.h = Math.max(row.h, h);
      row.items.push({ el, w, h });
    }
    rows.push(row);

    const totalH = rows.reduce((s, r) => s + r.h, 0) + 12 * (rows.length - 1);
    let y = Math.max(20, (size.h - totalH) / 2);
    const placed = [];
    for (const r of rows) {
      let x = (size.w - r.w) / 2;
      for (const it of r.items) {
        placed.push({ ...it, x: x + it.w / 2, y: y + r.h / 2 });
        x += it.w + 12;
      }
      y += r.h + 12;
    }
    return placed;
  }

  function reset() {
    for (const body of bodies.values()) Composite.remove(engine.world, body);
    bodies.clear();
    for (const { el, w, h, x, y } of layout()) {
      const body = Bodies.rectangle(x, y, w, h, {
        restitution: 0.35,
        friction: 0.4,
        chamfer: { radius: 8 },
      });
      bodies.set(el, body);
      Composite.add(engine.world, body);
    }
    engine.gravity.y = 1;
    dropped = false;
  }

  function drop() {
    if (dropped) return;
    dropped = true;
    // 崩すまではエンジンを進めないだけで、剛体は最初から動的
    for (const body of bodies.values()) {
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
    }
  }

  function shake() {
    drop();
    for (const body of bodies.values()) {
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 18,
        y: -Math.random() * 14 * Math.sign(engine.gravity.y || 1),
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
    }
  }

  function rebuildWalls() {
    Composite.remove(engine.world, walls);
    const { w, h } = size;
    const opts = { isStatic: true, friction: 0.6 };
    walls = [
      Bodies.rectangle(w / 2, h + WALL / 2, w + WALL * 2, WALL, opts),
      Bodies.rectangle(w / 2, -WALL / 2, w + WALL * 2, WALL, opts),
      Bodies.rectangle(-WALL / 2, h / 2, WALL, h + WALL * 2, opts),
      Bodies.rectangle(w + WALL / 2, h / 2, WALL, h + WALL * 2, opts),
    ];
    Composite.add(engine.world, walls);
  }

  observeSize(canvas, (w, h) => {
    const first = size.w === 0;
    size = { w, h };
    rebuildWalls();
    if (first || !dropped) reset();
  });

  // ---- ドラッグ: 部品の余白 (フォーム部品以外) をつかんだときだけ ----
  let drag = null;
  const toLocal = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (e.target.closest("input, select, button, textarea")) return;
    const piece = e.target.closest(".piece");
    if (!piece) return;
    e.preventDefault();
    drop();
    const body = bodies.get(piece);
    const p = toLocal(e);
    drag = Constraint.create({
      pointA: p,
      bodyB: body,
      pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
      stiffness: 0.15,
      damping: 0.1,
      length: 0,
    });
    Composite.add(engine.world, drag);
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
  });
  canvas.addEventListener("pointermove", (e) => {
    if (drag) drag.pointA = toLocal(e);
  });
  const release = () => {
    if (!drag) return;
    Composite.remove(engine.world, drag);
    drag = null;
    canvas.style.cursor = "";
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  // ---- 部品の中身の挙動 ----
  const volume = document.getElementById("g-volume");
  const volumeOut = document.getElementById("g-volume-out");
  volume.addEventListener("input", () => (volumeOut.value = volume.value));
  let saves = 0;
  document.getElementById("g-save").addEventListener("click", () => {
    document.getElementById("g-saved").textContent = `保存しました ×${++saves}`;
  });
  document.getElementById("g-flip").addEventListener("click", () => {
    drop();
    engine.gravity.y *= -1;
  });

  document.getElementById("gravity-drop").addEventListener("click", drop);
  document.getElementById("gravity-shake").addEventListener("click", shake);
  document.getElementById("gravity-reset").addEventListener("click", reset);

  // ---- 描画 ----
  return paintLoop(canvas, (_event, dt) => {
    if (dropped) {
      acc += dt * 1000;
      for (let i = 0; acc >= STEP && i < 4; i++, acc -= STEP)
        Engine.update(engine, STEP);
      acc %= STEP;
    }

    const scale = canvas.width / size.w;
    ctx.reset();
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    for (const [el, body] of bodies) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.drawElementImage(el, -w / 2, -h / 2, w, h);
    }
  });
}
