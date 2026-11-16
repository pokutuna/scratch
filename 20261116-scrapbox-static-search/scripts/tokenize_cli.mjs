// lib/tokenize.mjs を Python から使うための CLI。
// 標準入力の各行を JSON 文字列として読み、分割した語の配列を JSON で 1 行ずつ書く。
//
//   echo '"相手を賢く見せる言葉"' | node scripts/tokenize_cli.mjs
//   => ["相手","賢","く","見せる","言葉"]

import readline from "node:readline";
import { tokenize } from "../lib/tokenize.mjs";

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of rl) {
  process.stdout.write(JSON.stringify(tokenize(JSON.parse(line))) + "\n");
}
