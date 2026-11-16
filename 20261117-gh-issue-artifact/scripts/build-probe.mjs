// probe/probe.html から site/index.html を作る。
// テンプレートの {{SAMPLE_PNG}} を、ここで生成した PNG の data URI に置き換える。
// 同じ PNG を site/images/sample.png にも書き、相対パス参照の検証に使う。
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32, deflateSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// 64x64 の RGB グラデーションに市松模様を重ねた PNG
function samplePng(size = 64) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1);
    raw[row] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const checker = ((x >> 3) + (y >> 3)) % 2 === 0 ? 1 : 0.75;
      const i = row + 1 + x * 3;
      raw[i] = Math.round((x / (size - 1)) * 255 * checker);
      raw[i + 1] = Math.round((y / (size - 1)) * 200 * checker);
      raw[i + 2] = Math.round(220 * checker);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const png = samplePng();
const template = readFileSync(join(root, "probe/probe.html"), "utf8");
const html = template.replaceAll(
  "{{SAMPLE_PNG}}",
  `data:image/png;base64,${png.toString("base64")}`,
);

mkdirSync(join(root, "site/images"), { recursive: true });
writeFileSync(join(root, "site/images/sample.png"), png);
writeFileSync(join(root, "site/index.html"), html);
console.log("wrote site/index.html, site/images/sample.png");
