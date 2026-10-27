import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const ENTRY_PATTERN = /^\d{8}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

// コミット済みのファイルと、.gitignore で除外されていない未追跡のファイル
// 日本語などを含むファイル名がエスケープされないよう、NUL 区切りで受け取る
export function listFiles(root) {
  return execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
}

// . で始まるもの、.gitignore で除外されたもの (_site/ など) は含めない
export function topLevelDirs(root) {
  const files = listFiles(root);
  const dirs = new Set(files.filter((f) => f.includes("/")).map((f) => f.slice(0, f.indexOf("/"))));
  return [...dirs].filter((name) => !name.startsWith(".") && existsSync(join(root, name)));
}

export function listEntries(root) {
  return topLevelDirs(root)
    .filter((name) => ENTRY_PATTERN.test(name))
    .sort()
    .reverse()
    .map((name) => {
      const dir = join(root, name);
      return {
        name,
        date: `${name.slice(0, 4)}-${name.slice(4, 6)}-${name.slice(6, 8)}`,
        title: readmeTitle(dir),
        hasSite: existsSync(join(dir, "site", "index.html")),
      };
    });
}

function readmeTitle(dir) {
  const readme = join(dir, "README.md");
  if (!existsSync(readme)) return null;
  const heading = readFileSync(readme, "utf8").match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : null;
}

export function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name);
    return e.isDirectory() ? walk(path) : [path];
  });
}
