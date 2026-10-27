// 万華鏡メモ: 同じ要素を扇形にクリップして何度も描き、最後に中央へ操作できる 1 枚を描く。
import { observeSize, paintLoop } from "./util.js";

export function setup() {
  const canvas = document.getElementById("kaleido-canvas");
  const ctx = canvas.getContext("2d");
  const note = document.getElementById("note");
  const text = document.getElementById("note-text");
  const nInput = document.getElementById("kaleido-n");
  const nOut = document.getElementById("kaleido-n-out");
  const spin = document.getElementById("kaleido-spin");
  let size = { w: 0, h: 0 };
  let angle = 0;

  observeSize(canvas, (w, h) => (size = { w, h }));

  nInput.addEventListener("input", () => (nOut.value = nInput.value));
  document.getElementById("note-color").addEventListener("input", (e) => {
    note.style.background = e.target.value;
  });
  for (const btn of note.querySelectorAll("[data-emoji]")) {
    btn.addEventListener("click", () => {
      text.setRangeText(
        btn.dataset.emoji,
        text.selectionStart,
        text.selectionEnd,
        "end",
      );
      text.focus();
    });
  }

  // 鏡像のコピーはヒットテストに影響させない
  const copy = { preserveElementGeometry: true };

  return paintLoop(canvas, (_event, dt) => {
    if (spin.checked) angle += dt * 0.25;
    const n = Number(nInput.value);
    const wedge = (Math.PI * 2) / n;
    const { w, h } = size;
    const ew = note.offsetWidth;
    const eh = note.offsetHeight;
    const radius = Math.hypot(w, h) / 2;
    const scale = canvas.width / w;

    ctx.reset();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.translate(w / 2, h / 2);

    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.rotate(angle + i * wedge);
      if (i % 2) ctx.scale(1, -1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, -wedge / 2, wedge / 2);
      ctx.closePath();
      ctx.clip();

      // 内側の輪
      ctx.save();
      ctx.translate(Math.min(w, h) * 0.26, 0);
      ctx.rotate(angle * 1.7);
      ctx.drawElementImage(note, -ew / 2, -eh / 2, ew, eh, copy);
      ctx.restore();

      // 外側の大きな輪
      ctx.save();
      ctx.translate(Math.min(w, h) * 0.62, 0);
      ctx.rotate(-angle * 1.2 + 0.6);
      ctx.scale(1.5, 1.5);
      ctx.globalAlpha = 0.85;
      ctx.drawElementImage(note, -ew / 2, -eh / 2, ew, eh, copy);
      ctx.restore();

      ctx.restore();
    }

    // 中央の 1 枚だけが本物として操作できる (geometry を自動更新する)
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 30;
    ctx.drawElementImage(note, -ew / 2, -eh / 2, ew, eh);
  });
}
