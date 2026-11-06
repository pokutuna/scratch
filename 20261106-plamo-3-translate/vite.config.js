import { defineConfig } from "vite";

// マルチスレッド版 wasm を使うには cross-origin isolation が要る
const isolation = {
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
};

export default defineConfig({
  base: "./",
  build: { outDir: "site" },
  server: { headers: isolation },
  preview: { headers: isolation },
  optimizeDeps: { exclude: ["@wllama/wllama"] },
});
