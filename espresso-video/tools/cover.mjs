import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { existsSync } from "node:fs";
const id = process.argv[2] ?? "Cover";
const out = process.argv[3] ?? "teslim/kapak.png";
const DEFAULT_BROWSER = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = process.env.BROWSER || (existsSync(DEFAULT_BROWSER) ? DEFAULT_BROWSER : undefined); // yoksa Remotion indirir
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
await renderStill({ composition, serveUrl, output: out, browserExecutable, imageFormat: "png" });
console.log("ok", out);
