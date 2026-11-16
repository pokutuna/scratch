// URL のページを取得し、サブリソース (CSS、画像、フォント) を fetch で渡して描く
// usage: node probe-url.mjs <url> out.png
import { readFileSync, writeFileSync } from "node:fs";
import * as core from "../vendor/kitesurf/packages/core/pkg/kitesurf_core.js";

const P = "../vendor/kitesurf/packages";
const font = (p) => new Uint8Array(readFileSync(`${P}/engine/public/fonts/${p}`));
const [url, outPath = "../out/url.png"] = process.argv.slice(2);
const W = 1000, H = 800;

const requests = [];
core.__setBridgeFetchResource((id, u, kind, cors) => requests.push({ id, url: u, kind, cors }));
core.initSync({ module: readFileSync(`${P}/core/pkg/kitesurf_core_bg.wasm`) });
core.start();
core.register_ua_fonts(font("NotoSans.ttf"), font("NotoSans-Italic.ttf"), font("NotoSerif.ttf"), font("NotoSansMono.ttf"));

const res = await fetch(url);
const html = await res.text();
const dom = new core.DomHandle(html, res.url);
dom.setViewport(W, H);

for (let round = 0; round < 6; round++) {
  dom.prepareForPaint(W, H);
  dom.discoverPendingImages();
  const batch = requests.splice(0);
  if (batch.length === 0) break;
  console.log(`round ${round}: ${batch.length} requests`);
  await Promise.all(batch.map(async (r) => {
    try {
      const rr = await fetch(r.url);
      const bytes = new Uint8Array(await rr.arrayBuffer());
      console.log(" ", r.kind, rr.status, bytes.length, r.url.slice(0, 90));
      if (!rr.ok) dom.deliverResourceError(r.id); else dom.deliverResource(r.id, bytes);
    } catch (e) {
      console.log("  ERR", r.url, String(e));
      dom.deliverResourceError(r.id);
    }
  }));
  dom.pumpResourceMessages();
}
dom.prepareForPaint(W, H);
console.log("title:", dom.title(), "pending images:", dom.pendingImagesCount());
const scene = dom.renderScene(0, 0, 0, 0, false, false);
const r = new core.SceneRasterizer();
r.putResources(dom.renderSceneInlineResources(scene, new Uint8Array(0), new Uint8Array(0)));
for (const { path } of JSON.parse(r.pendingFontAssets())) r.putFontAsset(path, font(path.replace("/fonts/", "")));
const png = r.rasterize(scene, "png", 90, false);
console.log(r.lastRasterizeInfo());
writeFileSync(outPath, png);
