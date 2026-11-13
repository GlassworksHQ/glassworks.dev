/**
 * Text as outlined paths, so the SVGs look the same everywhere (an <img> on
 * GitHub can't load web fonts).
 *
 * Glyphs are placed one by one with kerning. opentype.js's shaper chokes on
 * Inter's contextual tables, and these labels don't need ligatures anyway.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as ot from "opentype.js";

// Node loads opentype.js's CommonJS build (a default export); a bundler, such as the site's build for
// the Clarity badges (scripts/brand/clarity.mjs), its ES module (named exports). Either works.
const opentype = ot.default ?? ot;

// The repo root's node_modules: from the working directory (`pnpm brand`, `next build`, where a
// bundler can't resolve modules at run time), or else from the script node was given
// (`node scripts/brand/generate.mjs` from anywhere).
const ROOTS = [process.cwd(), join(dirname(process.argv[1] ?? ""), "../..")];
function load(pkg, file) {
  const at = ROOTS.map((r) => join(r, "node_modules", pkg, "files", file)).find((f) => existsSync(f));
  if (!at) throw new Error(`${pkg}/files/${file} not found under ${ROOTS.join(" or ")}: run pnpm install`);
  const buf = readFileSync(at);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
}

export const FONTS = {
  light: load("@fontsource/inter", "inter-latin-300-normal.woff"),
  regular: load("@fontsource/inter", "inter-latin-400-normal.woff"),
  medium: load("@fontsource/inter", "inter-latin-500-normal.woff"),
  semibold: load("@fontsource/inter", "inter-latin-600-normal.woff"),
  mono: load("@fontsource/jetbrains-mono", "jetbrains-mono-latin-500-normal.woff"),
  // Inter's Latin files have no Greek; α and β come from its Greek subset
  greek: load("@fontsource/inter", "inter-greek-600-normal.woff"),
};

function layout(str, font, size, ls) {
  const scale = size / font.unitsPerEm;
  const glyphs = [];
  let x = 0;
  let prev = null;
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    if (prev) x += font.getKerningValue(prev, g) * scale;
    glyphs.push({ g, x });
    x += g.advanceWidth * scale + ls;
    prev = g;
  }
  // letter-spacing sits between letters, not after the last one
  return { glyphs, width: Math.max(0, x - (glyphs.length ? ls : 0)) };
}

/**
 * A glyph's outline as path data, from its raw font-unit commands (y up).
 * Glyph.getPath() isn't used: in opentype.js 2.0 it sometimes returns NaN
 * coordinates depending on which glyphs were drawn before it.
 */
function outline(g, x, y, scale) {
  const X = (v) => (x + v * scale).toFixed(2);
  const Y = (v) => (y - v * scale).toFixed(2);
  return g.path.commands
    .map((c) => {
      switch (c.type) {
        case "M":
        case "L":
          return `${c.type}${X(c.x)} ${Y(c.y)}`;
        case "Q":
          return `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
        case "C":
          return `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
        default:
          return "Z";
      }
    })
    .join("");
}

/** Width of a run, in px. */
export function measure(str, { font = "regular", size = 11.5, ls = 0 } = {}) {
  return layout(str, FONTS[font], size, ls).width;
}

/** One <path> for a run of text. `anchor` is start | middle | end. */
export function text(str, { x, y, font = "regular", size = 11.5, ls = 0, fill, opacity, anchor = "start" }) {
  const f = FONTS[font];
  const { glyphs, width } = layout(str, f, size, ls);
  const x0 = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  const scale = size / f.unitsPerEm;
  const d = glyphs.map(({ g, x: gx }) => outline(g, x0 + gx, y, scale)).join("");
  return `<path d="${d}" fill="${fill}"${opacity != null ? ` fill-opacity="${opacity}"` : ""}/>`;
}
