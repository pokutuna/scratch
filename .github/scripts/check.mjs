// エントリが README.md の置き方に沿っているかを検査する
// エラー: ディレクトリ名、README.md の有無、site/ 内の絶対パス参照、50 MB を超えるファイル
// 警告: Vite のビルド忘れ
// usage: node .github/scripts/check.mjs
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ENTRY_PATTERN, listFiles, topLevelDirs, walk } from "./lib.mjs";

const root = process.cwd();
const errors = [];
const warnings = [];

const ABSOLUTE_PATH_PATTERNS = {
  ".html": /\b(?:src|href|srcset|poster|action)\s*=\s*["']\/(?!\/)/,
  ".css": /url\(\s*["']?\/(?!\/)/,
};
const VITE_CONFIGS = ["vite.config.js", "vite.config.mjs", "vite.config.ts"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

for (const file of listFiles(root)) {
  const path = join(root, file);
  if (existsSync(path) && statSync(path).size > MAX_FILE_SIZE) {
    errors.push(`${file}: 50 MB を超えている (.gitignore に加え、取得するコマンドを Makefile に書く)`);
  }
}

const entries = [];
// 数字で始まるディレクトリをエントリとみなす。scripts/ や docs/ などはエントリではないので検査しない
for (const name of topLevelDirs(root).filter((name) => /^\d/.test(name))) {
  if (!ENTRY_PATTERN.test(name)) {
    errors.push(`${name}/: ディレクトリ名が yyyymmdd-slug ではない`);
    continue;
  }
  entries.push(name);
}

for (const name of entries) {
  const dir = join(root, name);
  if (!existsSync(join(dir, "README.md"))) errors.push(`${name}/: README.md がない`);

  const site = join(dir, "site");
  if (existsSync(site)) {
    for (const file of walk(site)) {
      const pattern = ABSOLUTE_PATH_PATTERNS[file.slice(file.lastIndexOf("."))];
      if (!pattern) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (pattern.test(line)) errors.push(`${relative(root, file)}:${i + 1}: アセットを絶対パスで参照している`);
        });
    }
  }

  if (VITE_CONFIGS.some((c) => existsSync(join(dir, c))) && !existsSync(join(site, "index.html"))) {
    warnings.push(`${name}/: Vite の設定があるが site/index.html がない (npx vite build を忘れている?)`);
  }
}

for (const w of warnings) console.warn(`warning: ${w}`);
for (const e of errors) console.error(`error: ${e}`);
if (errors.length > 0) process.exit(1);
