// Kalite kontrol kareleri. Kullanım: node tools/qa.mjs <kompozisyon> <çıktı_klasörü> [timings.json]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { existsSync } from "node:fs";

const id = process.argv[2] ?? "EspressoDebug";
const outDir = process.argv[3] ?? "out/qa";
mkdirSync(outDir, { recursive: true });
const DEFAULT_BROWSER = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = process.env.BROWSER || (existsSync(DEFAULT_BROWSER) ? DEFAULT_BROWSER : undefined); // yoksa Remotion indirir
const timings = JSON.parse(readFileSync(process.argv[4] ?? "src/timings.json", "utf8"));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id, browserExecutable });
for (const sc of timings.scenes) {
  for (const [tag, f] of [["a", 0.3], ["b", 0.55], ["c", 0.85]]) {
    const frame = Math.min(comp.durationInFrames - 1, Math.round((sc.start + sc.dur * f) * timings.fps));
    await renderStill({ composition: comp, serveUrl, output: `${outDir}/${sc.id}_${tag}.png`, frame, browserExecutable, imageFormat: "png" });
  }
  console.log("ok", sc.id);
}
