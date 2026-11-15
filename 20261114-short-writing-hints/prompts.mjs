// experiment.json から各試行のプロンプトを組み立て、runs/prompts.jsonl に書き出す。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const exp = JSON.parse(readFileSync(join(root, "experiment.json"), "utf8"));

const lines = [];
for (const model of exp.models) {
  for (const concept of exp.concepts) {
    for (const cond of exp.conditions) {
      for (let n = 1; n <= exp.runs; n++) {
        let prompt = exp.prompt.replace("{concept}", concept.name);
        if (cond.instruction) prompt += "\n\n" + cond.instruction;
        lines.push({
          model: model.id,
          concept: concept.id,
          condition: cond.id,
          n,
          prompt,
          output: `runs/${model.id}/${concept.id}/${cond.id}-${n}.md`,
        });
      }
    }
  }
}

mkdirSync(join(root, "runs"), { recursive: true });
writeFileSync(
  join(root, "runs/prompts.jsonl"),
  lines.map((l) => JSON.stringify(l)).join("\n") + "\n",
);
console.log(`${lines.length} prompts`);
