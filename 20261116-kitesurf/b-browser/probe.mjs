// Worker を介さず、core の wasm (DomHandle) と renderer-core の wasm (SceneRasterizer) を
// 直接呼んで HTML を PNG にする。ブラウザ版の前に Node で経路を確かめる
// usage: node probe.mjs in.html out.png
import { readFileSync, writeFileSync } from "node:fs";
import * as core from "../vendor/kitesurf/packages/core/pkg/kitesurf_core.js";
import * as rc from "../vendor/kitesurf/packages/renderer-core/pkg/renderer_core.glue.js";

const pkg = "../vendor/kitesurf/packages";
const fonts = `${pkg}/engine/public`;
const font = (p) => new Uint8Array(readFileSync(`${fonts}${p}`));

const [inPath = "sample.html", outPath = "../out/probe.png"] = process.argv.slice(2);
const W = 800, H = 600;

let t = performance.now();
const lap = (label) => { const n = performance.now(); console.log(`${label}: ${Math.round(n - t)}ms`); t = n; };

core.initSync({ module: readFileSync(`${pkg}/core/pkg/kitesurf_core_bg.wasm`) });
core.start();
rc.initSync({ module: readFileSync(`${pkg}/renderer-core/pkg/renderer_core_bg.wasm`) });
lap("init");

core.register_ua_fonts(
  font("/fonts/NotoSans.ttf"), font("/fonts/NotoSans-Italic.ttf"),
  font("/fonts/NotoSerif.ttf"), font("/fonts/NotoSansMono.ttf"),
);
lap("fonts");

const dom = new core.DomHandle(readFileSync(inPath, "utf8"), "https://example.invalid/");
console.log("nodes", dom.node_count?.() ?? dom.nodeCount?.());
dom.prepareForPaint(W, H);
const scene = dom.renderScene(0, 0, 0, 0, false, false);
lap(`layout+scene (${scene.length} bytes)`);

const r = new rc.SceneRasterizer();
r.putResources(dom.renderSceneInlineResources(scene, new Uint8Array(0), new Uint8Array(0)));
for (const { path } of JSON.parse(r.pendingFontAssets())) {
  console.log("font asset", path);
  r.putFontAsset(path, font(path));
}
const png = r.rasterize(scene, "png", 90, false);
lap("raster");
console.log(r.lastRasterizeInfo());
writeFileSync(outPath, png);
