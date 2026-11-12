/**
 * Renders the brand's raster images with headless Chrome:
 *
 *   pnpm brand:raster
 *
 *   src/app/apple-icon.png          180 × 180, full bleed (iOS rounds it)
 *   public/brand/github-avatar.png 1024 × 1024, full bleed (GitHub rounds it)
 *   src/app/opengraph-image.png    1200 × 630, the Glass Tile
 *   src/app/twitter-image.png      1200 × 630, the same
 *
 * The mark comes from src/lib/markGeometry.ts. Set CHROME to a Chrome or
 * Chromium binary if it isn't at the macOS default.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { markPlates } from "../../src/lib/markGeometry.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const font = (file, weight) =>
  `@font-face{font-family:Inter;font-weight:${weight};src:url(${pathToFileURL(require.resolve(`@fontsource/inter/files/${file}`))}) format("woff2")}`;
const FONTS = font("inter-latin-200-normal.woff2", 200) + font("inter-latin-400-normal.woff2", 400) + font("inter-latin-500-normal.woff2", 500);

function mark(size, cut = "full") {
  const plates = markPlates(cut)
    .map((p) =>
      p.lit
        ? `<path d="${p.d}" fill="url(#lit)"/>`
        : `<path d="${p.d}" fill="none" stroke="#f4f4f5" stroke-opacity="${p.opacity}" stroke-width="${p.strokeWidth}" stroke-linejoin="round"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}"><defs><linearGradient id="lit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>${plates}</svg>`;
}

const page = (w, h, body, css = "") => `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTS}
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:#0a0b0f}
body{font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
${css}</style></head><body>${body}</body></html>`;

/* a square icon: night with the brand's two glows, the mark centred */
const icon = (size) =>
  page(
    size,
    size,
    `<div class="i">${mark(Math.round(size * 0.62))}</div>`,
    `.i{width:${size}px;height:${size}px;display:grid;place-items:center;
      background:radial-gradient(70% 70% at 18% 12%,rgba(56,189,248,.22),transparent 70%),radial-gradient(70% 70% at 86% 90%,rgba(167,139,250,.2),transparent 70%),#0a0b0f}`,
  );

/* the Glass Tile, as the social preview */
const social = page(
  1200,
  630,
  `<div class="bg"></div><div class="tile"><div class="glow"></div>
    <div class="top"><span>Open core for wall panels</span><span>Open source · MPL-2.0</span></div>
    <div class="lock">${mark(150)}<span>Glassworks</span></div>
    <div class="foot"><span>Frames · Panes · Core · Kiln</span><span>glassworks.dev</span></div></div>`,
  `.bg{position:absolute;inset:0;background:radial-gradient(60% 70% at 0% 0%,rgba(56,189,248,.14),transparent 70%),radial-gradient(60% 70% at 100% 100%,rgba(167,139,250,.12),transparent 70%)}
   .tile{position:absolute;left:100px;top:65px;width:1000px;height:500px;box-sizing:border-box;border-radius:34px;overflow:hidden;
     background:#111217;border:1px solid rgba(255,255,255,.09);padding:64px 66px;display:flex;flex-direction:column;justify-content:space-between;color:#f4f4f5}
   .glow{position:absolute;inset:0;background:radial-gradient(55% 75% at 0% 0%,rgba(56,189,248,.28),transparent 70%),radial-gradient(50% 70% at 100% 100%,rgba(167,139,250,.24),transparent 70%)}
   .top,.foot,.lock{position:relative;display:flex;justify-content:space-between;align-items:center}
   .top{font:500 13px/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:#7d808b}
   .foot{font:400 15px/1 Inter;color:#a1a1aa}
   .lock{justify-content:flex-start;gap:30px;margin-top:40px}
   .lock span{font:200 118px/1 Inter;letter-spacing:-.03em}`,
);

const jobs = [
  ["src/app/apple-icon.png", 180, 180, icon(180)],
  ["public/brand/github-avatar.png", 1024, 1024, icon(1024)],
  ["src/app/opengraph-image.png", 1200, 630, social],
  ["src/app/twitter-image.png", 1200, 630, social],
];

/* one headless Chrome, driven over the DevTools protocol */
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "brand-"))}`, "--hide-scrollbars", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets = [];
for (let i = 0; i < 50 && !targets.length; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    pending.get(d.id)(d);
    pending.delete(d.id);
  }
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await send("Page.enable");
const tmp = mkdtempSync(join(tmpdir(), "brand-html-"));
for (const [out, w, h, html] of jobs) {
  const file = join(tmp, "page.html");
  writeFileSync(file, html);
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: pathToFileURL(file).href });
  await sleep(900);
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
  writeFileSync(join(root, out), Buffer.from(shot.result.data, "base64"));
  console.log(`  ${out}`);
}
ws.close();
chrome.kill();
