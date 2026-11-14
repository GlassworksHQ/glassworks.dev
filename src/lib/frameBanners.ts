import fs from "node:fs";
import path from "node:path";
import { THEMES } from "../../scripts/brand/draw.mjs";
import { frameBanner } from "../../scripts/brand/frame.mjs";
import { frames } from "./frames";

/*
 * Each frame's README banner, banner-frame-<id>-on-*.svg in public/brand/: `pnpm brand` draws it from
 * the frame's frame.json in the pinned submodule (scripts/brand/frame.mjs). A frame without a tagline
 * has none. Checked here at build time: a pin moved, or a frame.json changed, without `pnpm brand`
 * fails the build, naming the file, so a README never shows an old banner. So does a frame banner
 * whose frame is gone or has no tagline any more.
 */
const drawn = new Set(frames.filter((f) => f.tagline).flatMap((f) => ["dark", "light"].map((t) => `banner-frame-${f.id}-on-${t}.svg`)));
for (const file of fs.readdirSync(path.join(process.cwd(), "public/brand"))) {
  if (/^banner-frame-.+-on-(dark|light)\.svg$/.test(file) && !drawn.has(file)) {
    throw new Error(`public/brand/${file} has no frame with a tagline to draw it: run \`pnpm brand\`, which removes it`);
  }
}

export const frameBanners = frames
  .filter((f) => f.tagline)
  .map((f) => {
    for (const theme of ["dark", "light"] as const) {
      const file = path.join(process.cwd(), "public/brand", `banner-frame-${f.id}-on-${theme}.svg`);
      if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== frameBanner(THEMES[theme], f)) {
        throw new Error(`public/brand/${path.basename(file)} isn't what frames/${f.id}/design/frame.json draws: run \`pnpm brand\` and commit public/brand/`);
      }
    }
    return { id: f.id, name: f.name };
  });
