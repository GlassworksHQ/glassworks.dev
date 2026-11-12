/**
 * Generates the part badges and README banners into public/brand/.
 *
 *   pnpm brand
 *
 * Badges (30 px, for a row of shields): core, pane, kiln.
 * Banners (640 × 180, for the top of a README): core, kiln, and one per
 * library in src/lib/libraries.json. Each in -on-dark and -on-light.
 *
 * "Built on Glassworks" (badge-on-*.svg) is the frame badge and isn't
 * generated here.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { measure, text } from "./text.mjs";
import {
  C,
  THEMES,
  backCorner,
  block,
  cellAt,
  drops,
  field,
  guide,
  plate,
  plateHeight,
  project,
  svg,
} from "./draw.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const out = join(root, "public/brand");
const libraries = JSON.parse(readFileSync(join(root, "src/lib/libraries.json"), "utf8"));

const EMBER = "#f43f5e";

/* ---------- badges ---------- */

const BS = 0.098; // plate scale inside a 30 px badge
const CAPS = { font: "medium", size: 9.5, ls: 1.5 };
const CAPS_B = { font: "semibold", size: 9.5, ls: 1.5 };
const CAPS_GAP = 6.5;

function badge(t, { label, icon, a, b, bFill, haze }) {
  const x = 10;
  const ox = x + backCorner(BS);
  const after = x + C * 320 * BS + 9;
  const wa = measure(a, CAPS);
  const w = after + wa + CAPS_GAP + measure(b, CAPS_B) + 13;
  const xs = [x, ox, ox + C * 200 * BS];
  const inner =
    guide(xs.map((v) => `M${v.toFixed(2)} 0V30`).join(""), t) +
    guide(`M0 15H${w.toFixed(2)}`, t) +
    icon(t, ox) +
    text(a, { ...CAPS, x: after, y: 19, fill: t.mu }) +
    text(b, { ...CAPS_B, x: after + wa + CAPS_GAP, y: 19, fill: bFill ?? t.fg });
  return svg(w, 30, label, field(w, 30, t, 15, inner, { haze }), t);
}

const BADGES = {
  core: {
    label: "Glassworks core",
    a: "GLASSWORKS",
    b: "CORE",
    icon: (t, ox) =>
      plate(t, ox, 11.6, BS, "ghost") + plate(t, ox, 7.4, BS, "core") + plate(t, ox, 3.2, BS, "ghost"),
  },
  pane: {
    label: "Glassworks pane",
    a: "GLASSWORKS",
    b: "PANE",
    icon: (t, ox) =>
      plate(t, ox, 11.6, BS, "ghost") +
      plate(t, ox, 7.4, BS, "ghost", { op: 0.35 }) +
      plate(t, ox, 3.2, BS, "lit", { lit: [0, 4] }),
  },
  kiln: {
    label: "Glassworks Kiln",
    a: "GLASSWORKS",
    b: "KILN",
    bFill: "url(#emberH)",
    haze: "emberHaze",
    icon: (t, ox) =>
      plate(t, ox, 11.6, BS, "ember", { thick: 24, topStroke: EMBER, topOp: 0.8 }) +
      plate(t, ox, 4.2, BS, "ghost", { op: 0.45 }),
  },
};

/* ---------- banners ---------- */

const BW = 640;
const BH = 180;
const TX = 322;
const TITLE_MAX = BW - TX - 24;

function bannerGuides(t, ox, s, ys, color) {
  const xs = [ox - backCorner(s), ox, ox + C * 200 * s];
  const f = (n) => n.toFixed(2);
  const o = { w: 0.8, dash: "5 4", color };
  return (
    guide(ys.map((v) => `M0 ${f(v)}H${BW}`).join(""), t, { ...o, op: 0.3 }) +
    guide(xs.map((v) => `M${f(v)} 0V${BH}`).join(""), t, { ...o, op: 0.24 }) +
    guide(
      `M${f(ox - 200)} ${f(ys[0] - 200 * 0.577)}L${f(ox + 400)} ${f(ys[0] + 400 * 0.577)}` +
        `M${f(ox - 200)} ${f(ys.at(-1) + 200 * 0.577)}L${f(ox + 400)} ${f(ys.at(-1) - 400 * 0.577)}`,
      t,
      { ...o, op: 0.22 },
    )
  );
}

/** Kicker, title (one or two words), code line and description. The title shrinks to fit. */
function bannerText(t, { kicker, nameA, nameB, bFill, code, desc }) {
  let size = 34;
  const width = () =>
    measure(nameA, { font: "light", size, ls: -0.6 }) +
    (nameB ? 9 + measure(nameB, { font: "semibold", size, ls: -0.6 }) : 0);
  while (width() > TITLE_MAX && size > 20) size -= 1;
  const wa = measure(nameA, { font: "light", size, ls: -0.6 });
  return (
    text(kicker, { font: "medium", size: 9, ls: 2, x: TX, y: 52, fill: t.fa }) +
    text(nameA, { font: "light", size, ls: -0.6, x: TX, y: 92, fill: t.mu }) +
    (nameB ? text(nameB, { font: "semibold", size, ls: -0.6, x: TX + wa + 9, y: 92, fill: bFill ?? t.fg }) : "") +
    text(code, { font: "mono", size: 12, x: TX + 1, y: 118, fill: t.mu }) +
    text(desc, { font: "regular", size: 11.5, x: TX + 1, y: 138, fill: t.fa })
  );
}

const banner = (t, label, drawing, words, haze = "haze") =>
  svg(BW, BH, label, field(BW, BH, t, 16, drawing, { dots: "dotL", haze }) + bannerText(t, words), t);

function coreBanner(t) {
  const s = 0.62;
  const ox = 58 + backCorner(s);
  const y = 30;
  const gap = 26;
  return banner(
    t,
    "Glassworks core",
    bannerGuides(t, ox, s, [y, y + gap, y + gap * 2, y + gap + plateHeight(s)]) +
      plate(t, ox, y + gap * 2, s, "ghost") +
      plate(t, ox, y + gap, s, "core") +
      plate(t, ox, y, s, "ghost"),
    {
      kicker: "GLASSWORKS · CORE",
      nameA: "Glassworks",
      nameB: "core",
      code: ":glassworks-core",
      desc: "What every panel needs. No device code.",
    },
  );
}

/** Every library gets the same drawing: one block lifted out of the core plate. */
function libraryBanner(t, lib) {
  const s = 0.6;
  const ox = 60 + backCorner(s);
  const oy = 74;
  const lift = 96;
  const hole = 2;
  const cell = cellAt(hole);
  const top = project(ox, oy, s)(cell[0], cell[1], lift)[1];
  return banner(
    t,
    `${lib.name}, a Glassworks library`,
    bannerGuides(t, ox, s, [top, oy, oy + plateHeight(s)]) +
      plate(t, ox, oy, s, "holed", { hole }) +
      guide(drops(ox, oy, s, cell, 0, lift - 14), t, { op: 0.55, w: 0.7, dash: "3 2.4" }) +
      block(t, ox, oy, s, cell, lift),
    {
      kicker: "GLASSWORKS · LIBRARY",
      nameA: lib.name,
      code: "Standalone · built for Glassworks",
      desc: lib.description,
    },
  );
}

function kilnBanner(t) {
  const s = 0.55;
  const ox = 66 + backCorner(s);
  const y = 12;
  const gap = 20;
  const [gx, gy] = project(ox, y + gap * 3, s)(100, 60);
  return banner(
    t,
    "Glassworks Kiln",
    bannerGuides(t, ox, s, [y, y + gap * 3, y + gap * 3 + plateHeight(s)], "#fb7185") +
      `<ellipse cx="${gx.toFixed(2)}" cy="${(gy + 10).toFixed(2)}" rx="90" ry="34" fill="${EMBER}" opacity=".4" filter="url(#softL)"/>` +
      plate(t, ox, y + gap * 3, s, "ember", { thick: 26, topStroke: EMBER, topOp: 0.8 }) +
      plate(t, ox, y + gap * 2, s, "ghost", { op: 0.45, cells: true }) +
      plate(t, ox, y + gap, s, "ghost", { op: 0.35 }) +
      plate(t, ox, y, s, "ghost", { op: 0.25 }),
    {
      kicker: "GLASSWORKS · INSTALLER",
      nameA: "Glassworks",
      nameB: "Kiln",
      bFill: "url(#emberH)",
      code: "kiln.glassworks.dev",
      desc: "Installs a frame over USB, from the browser.",
    },
    "emberHaze",
  );
}

/* ---------- write ---------- */

mkdirSync(out, { recursive: true });
const written = [];
const write = (file, body) => {
  if (body.includes("NaN")) throw new Error(`${file}: drawing produced NaN coordinates`);
  writeFileSync(join(out, file), body);
  written.push(file);
};

for (const t of Object.values(THEMES)) {
  const on = `on-${t.name}`;
  for (const [id, spec] of Object.entries(BADGES)) write(`badge-${id}-${on}.svg`, badge(t, spec));
  write(`banner-core-${on}.svg`, coreBanner(t));
  write(`banner-kiln-${on}.svg`, kilnBanner(t));
  for (const lib of libraries) write(`banner-library-${lib.name}-${on}.svg`, libraryBanner(t, lib));
}

console.log(`Wrote ${written.length} files to public/brand/:\n  ${written.join("\n  ")}`);
