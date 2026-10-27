// canvas の CSS サイズを監視し、描画バッファをデバイスピクセルに合わせる。
// resizeBuffer: false なら canvas.width/height は触らない (three.js に任せる場合)
export function observeSize(canvas, onResize, { resizeBuffer = true } = {}) {
  new ResizeObserver(([entry]) => {
    const css = entry.contentBoxSize[0];
    if (resizeBuffer) {
      const device = entry.devicePixelContentBoxSize?.[0];
      canvas.width = device
        ? device.inlineSize
        : Math.round(css.inlineSize * devicePixelRatio);
      canvas.height = device
        ? device.blockSize
        : Math.round(css.blockSize * devicePixelRatio);
    }
    onResize(css.inlineSize, css.blockSize);
  }).observe(canvas, { box: "device-pixel-content-box" });
}

// paint イベントを毎フレーム発火させるループ。requestAnimationFrame の代わりに使う。
// onFrame(event, dtSeconds) には paint イベントの changedElements も届く。
export function paintLoop(canvas, onFrame) {
  let running = false;
  let last = 0;
  canvas.addEventListener("paint", (event) => {
    if (!running) return;
    const now = performance.now();
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    onFrame(event, dt);
    canvas.requestPaint();
  });
  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      canvas.requestPaint();
    },
    stop() {
      running = false;
    },
  };
}

// 要素を、バインド中の TEXTURE_2D に焼き付ける。
// Chrome 157 以降は大きさを取って確保してから texElementSubImage2D で書き込む。
// Chrome 156 以前 (フラグで有効化) には getElementImageDefaultSize がなく、
// texElementImage2D(target, internalformat, element) が確保と書き込みを一度に行う。
export function uploadElementTexture(gl, canvas, el) {
  if (!canvas.getElementImageDefaultSize) {
    gl.texElementImage2D(gl.TEXTURE_2D, gl.RGBA8, el);
    return true;
  }
  const { width, height } = canvas.getElementImageDefaultSize(el);
  if (!width || !height) return false;
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.texElementSubImage2D(gl.TEXTURE_2D, 0, 0, 0, el);
  return true;
}
