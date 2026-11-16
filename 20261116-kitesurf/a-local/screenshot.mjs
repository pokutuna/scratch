// ローカルの Kitesurf エンジン (make dev) に CDP で接続し、URL のスクリーンショットを撮る
// usage: node screenshot.mjs [url] [out.png]
import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "https://example.com/";
const out = process.argv[3] ?? "../out/screenshot.png";
const port = process.env.KITESURF_PORT ?? "8787";

const browser = await puppeteer.connect({
  browserWSEndpoint: `ws://127.0.0.1:${port}/devtools/browser`,
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  const t0 = performance.now();
  await page.goto(url);
  const title = await page.title();
  // page.evaluate はエンジン内の Boa で実行される
  const links = await page.evaluate(() => document.querySelectorAll("a").length);
  await page.screenshot({ path: out });
  console.log({ url, title, links, ms: Math.round(performance.now() - t0), out });
} finally {
  await browser.disconnect();
}
