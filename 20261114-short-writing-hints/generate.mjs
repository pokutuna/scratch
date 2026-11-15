// runs/prompts.jsonl の各試行を claude -p で生成し、本文を output に書き出す。
//
// 実行者の Claude Code の設定が本文に影響しないよう、次のようにして実行する。
// - 空の一時ディレクトリで実行し、プロジェクトの CLAUDE.md を読ませない
// - --setting-sources "" でユーザーとプロジェクトの設定 (CLAUDE.md、プラグイン、フック) を読まない
// - --strict-mcp-config で MCP サーバーを使わない
// - --disable-slash-commands と --tools "" でスキルとツールを使わない
// - --system-prompt "" で Claude Code の既定のシステムプロンプトを使わない
// --tools は後ろの引数も読み込むので、プロンプトは標準入力で渡す。
//
// 出力が既にある試行は飛ばす。使ったモデルや所要時間は {output}.json に残す。
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 6);
const EFFORT = "medium";

const prompts = readFileSync(join(root, "runs/prompts.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l));
const todo = prompts.filter((p) => !existsSync(join(root, p.output)));
console.log(`${todo.length} / ${prompts.length} to generate`);

function run(p) {
  const cwd = mkdtempSync(join(tmpdir(), "short-writing-hints-"));
  const args = [
    "-p",
    "--model", p.model,
    "--effort", EFFORT,
    "--output-format", "json",
    "--setting-sources", "",
    "--strict-mcp-config",
    "--disable-slash-commands",
    "--system-prompt", "",
    "--tools", "",
  ];
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, { cwd, stdio: ["pipe", "pipe", "inherit"] });
    // チャンクの境界で多バイト文字が分かれるので、Buffer のまま集めて最後に UTF-8 で読む
    const chunks = [];
    child.stdout.on("data", (d) => chunks.push(d));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`${p.output}: exit ${code}`));
      const out = Buffer.concat(chunks).toString("utf8");
      const result = JSON.parse(out).find((e) => e.type === "result");
      if (!result || result.is_error) return reject(new Error(`${p.output}: ${result?.result}`));
      const path = join(root, p.output);
      mkdirSync(dirname(path), { recursive: true });
      // 認証の期限やセッション ID も含まれるので、再現に使う項目だけ残す
      const meta = {
        models: Object.keys(result.modelUsage ?? {}),
        effort: EFFORT,
        stop_reason: result.stop_reason,
        num_turns: result.num_turns,
        duration_ms: result.duration_ms,
        usage: result.usage,
      };
      writeFileSync(path.replace(/\.md$/, ".json"), JSON.stringify(meta, null, 2) + "\n");
      writeFileSync(path, result.result.trim() + "\n");
      resolve(Object.keys(result.modelUsage ?? {}));
    });
    child.stdin.end(p.prompt);
  });
}

let failed = 0;
const queue = [...todo];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let p; (p = queue.shift()); ) {
      try {
        const models = await run(p);
        console.log(`ok ${p.output} (${models.join(", ")})`);
      } catch (e) {
        failed++;
        console.error(`NG ${e.message}`);
      }
    }
  }),
);
if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
