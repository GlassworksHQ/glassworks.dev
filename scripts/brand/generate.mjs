/**
 * Generates the part badges and README banners into public/brand/.
 *
 *   pnpm brand
 *
 * Badges (30 px, for a row of shields): core, pane, kiln.
 * Banners (640 × 180, for the top of a README): glassworks (the whole stack,
 * for the org profile and the main README), core, kiln, and one per library in
 * src/lib/libraries.json. Each in -on-dark and -on-light.
 *
 * Info badges (30 px, in place of shields.io): licence (MPL-2.0 for the core,
 * MIT for libraries), status (under development, α alpha, β beta, stable) and
 * roadmap, from src/lib/info-badges.json.
 *
 * Part icons (34 × 33, transparent, for tables and lists): frame, core, pane,
 * kiln. A tiny stack whose solid plate says where the part sits.
 *
 * The mark and everything built from it: mark-on-*, mark-mono, kiln-on-dark,
 * lockup-on-*, lockup-kiln-on-dark, app-icon, favicon (also src/app/icon.svg),
 * and the frame badge, "Built on Glassworks" (badge-on-*). The mark's shape
 * comes from src/lib/markGeometry.ts, the same file <Mark> draws from.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { measure, text } from "./text.mjs";
import { markPlates } from "../../src/lib/markGeometry.ts";
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
const readJson = (file) => JSON.parse(readFileSync(join(root, file), "utf8"));
const libraries = readJson("src/lib/libraries.json");
const infoBadges = readJson("src/lib/info-badges.json");

const EMBER = "#f43f5e";

/* ---------- badges ---------- */

const CAPS = { font: "medium", size: 9.5, ls: 1.5 };
const CAPS_B = { font: "semibold", size: 9.5, ls: 1.5 };

const SZ = 12.7; // the badges' type size
const SPACE = () => measure(" ", { size: SZ }) + 0.6;
const markIcon = (t, x, y, size, lit = "url(#lit)") =>
  `<g transform="translate(${x} ${y}) scale(${(size / 120).toFixed(4)})">${markBody({ ink: t.fg, lit, cut: "small" })}</g>`;

/*
 * Built on Glassworks: the finished-product badge. A plain pill in sentence
 * case, the mark and the words, and no construction: it marks a finished
 * product, not a part being built.
 */
function builtOnBadge(t) {
  const x0 = 39;
  const gap = 48.7 - measure("Built on", { size: SZ });
  const w = x0 + measure("Built on", { size: SZ }) + gap + measure("Glassworks", { font: "semibold", size: SZ }) + 12.4;
  const body =
    `<rect x=".5" y=".5" width="${w - 1}" height="29" rx="14.5" fill="${t.bg}" stroke="${t.edge}"/>` +
    markIcon(t, 10, 5, 20) +
    text("Built on", { size: SZ, x: x0, y: 19.73, fill: t.mu }) +
    text("Glassworks", { font: "semibold", size: SZ, x: x0 + measure("Built on", { size: SZ }) + gap, y: 19.73, fill: t.fg });
  return svg(w, 30, "Built on Glassworks", body, t);
}

/*
 * The part badges: a drawing cell for the mark (dot grid, diagonals), then
 * "Glassworks <Part>" on a sweep of the part's light. One 1 px edge runs all
 * the way round, neutral along the cell, catching the part's colour across the
 * text and brightening toward the end, like glass lit from inside.
 */
const PART = {
  core: {
    name: "Core",
    sweep: ["#e2e8f0", "#7dd3fc"],
    strength: 0.55, // core is glass before the light comes on: a fainter sweep
    rim: { dark: ["#e2e8f0", "#bae6fd"], light: ["#94a3b8", "#0ea5e9"] },
    ink: { dark: null, light: null },
  },
  pane: {
    name: "Pane",
    sweep: ["#38bdf8", "#a78bfa"],
    strength: 1,
    rim: { dark: ["#7dd3fc", "#c4b5fd"], light: ["#0ea5e9", "#8b5cf6"] },
    ink: { dark: null, light: null },
  },
  kiln: {
    name: "Kiln",
    sweep: ["#fdba74", "#f43f5e"],
    strength: 1,
    rim: { dark: ["#fed7aa", "#fda4af"], light: ["#fb923c", "#e11d48"] },
    // contrast: deep ember on light (about 5.4:1 on the sweep), peach on dark
    ink: { dark: "#fdba74", light: "#7c2d12" },
    lit: "url(#ember)",
  },
};

function partBadge(t, id) {
  const p = PART[id];
  const light = t.name === "light";
  const cell = 44;
  const wa = measure("Glassworks", { size: SZ });
  const tw = 12 + wa + SPACE() + measure(p.name, { font: "semibold", size: SZ }) + 14;
  const w = cell + tw;
  const k = p.strength;
  const end = light ? 0.4 : 0.5;
  const [a, b] = p.sweep;
  const [ra, rb] = p.rim[t.name];
  const defs =
    `<linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="${cell}" y1="0" x2="${w}" y2="0"><stop offset="0" stop-color="${a}" stop-opacity="${0.08 * k}"/><stop offset=".55" stop-color="${a}" stop-opacity="${0.22 * k}"/><stop offset="1" stop-color="${b}" stop-opacity="${end * k}"/></linearGradient>` +
    `<linearGradient id="rim" gradientUnits="userSpaceOnUse" x1="${cell}" y1="0" x2="${w}" y2="0"><stop offset="0" stop-color="${ra}"/><stop offset="1" stop-color="${rb}"/></linearGradient>` +
    `<linearGradient id="ramp" gradientUnits="userSpaceOnUse" x1="${cell}" y1="0" x2="${w - 4}" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
    `<mask id="lit-edge" maskUnits="userSpaceOnUse" x="${cell}" y="0" width="${tw}" height="30"><rect x="${cell}" width="${tw}" height="30" fill="url(#ramp)"/></mask>`;
  const pill = `x=".5" y=".5" width="${w - 1}" height="29" rx="14.5"`;
  const body =
    `<defs>${defs}</defs><clipPath id="clip"><rect x="1" y="1" width="${w - 2}" height="28" rx="14"/></clipPath>` +
    `<rect ${pill} fill="${t.bg}"/>` +
    `<g clip-path="url(#clip)"><rect width="${cell}" height="30" fill="url(#dot)"/>${guide(`M0 0L${cell} 30M0 30L${cell} 0M${cell / 2} 0V30M0 15H${cell}`, t, { op: 0.32 })}<rect x="${cell}" width="${tw}" height="30" fill="url(#sweep)"/></g>` +
    guide(`M${cell} 0V30`, t, { op: 0.6, w: 0.6, dash: "2 1.4" }) +
    `<rect ${pill} fill="none" stroke="${light ? "#c9ccd4" : "#3a3d46"}"/>` +
    `<rect ${pill} fill="none" stroke="url(#rim)" mask="url(#lit-edge)"/>` +
    markIcon(t, cell / 2 - 10, 5, 20, p.lit) +
    text("Glassworks", { size: SZ, x: cell + 12, y: 19.73, fill: t.mu }) +
    text(p.name, { font: "semibold", size: SZ, x: cell + 12 + wa + SPACE(), y: 19.73, fill: p.ink[t.name] ?? t.fg });
  return svg(w, 30, `Glassworks ${p.name}`, body, t);
}

/* ---------- the mark ---------- */

const LIT_STOPS = ["#38bdf8", "#a78bfa"];
const EMBER_STOPS = ["#fdba74", "#f43f5e"];
const grad = (id, [a, b]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

/** The mark's plates on its 120 × 120 canvas. ink: a colour, or a class name for themed files. */
function markBody({ ink = "#f4f4f5", inkClass, lit = "url(#lit)", cut = "full" } = {}) {
  const inkAttr = (k) => (inkClass ? `class="${inkClass}" ${k}-opacity` : `${k}="${ink}" ${k}-opacity`);
  return markPlates(cut)
    .map((p) =>
      p.lit
        ? `<path d="${p.d}" fill="${lit}"/>`
        : `<path d="${p.d}" fill="none" ${inkAttr("stroke")}="${p.opacity}" stroke-width="${p.strokeWidth}" stroke-linejoin="round"/>`,
    )
    .join("");
}

const plainSvg = (w, h, label, defs, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" width="${Math.round(w)}" height="${Math.round(h)}"><title>${label}</title>${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>\n`;

/* the wordmark is kept exactly as drawn: read its outline from wordmark.svg */
const WORDMARK = (() => {
  const src = readFileSync(join(out, "wordmark.svg"), "utf8");
  const d = src.match(/ d="([^"]+)"/)[1];
  const [, w, h] = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const [, tx, ty] = src.match(/translate\(([\d.]+) ([\d.]+)\)/);
  return { d, w: +w, h: +h, tx: +tx, ty: +ty };
})();
// the wordmark's size in Inter Light, found from its width, so "Kiln" can match it
const WORD_SIZE = (() => {
  let size = 30;
  while (measure("Glassworks", { font: "light", size, ls: -0.025 * size }) < WORDMARK.w - 2 * WORDMARK.tx) size += 0.1;
  return size;
})();

function lockup(ink, { kiln = false } = {}) {
  // the stack is lighter than a solid shape, so the mark runs taller than the
  // wordmark; the wordmark sits centred on it
  const H = 52;
  const M = 52; // mark size
  const x = M + 12;
  const wy = (H - WORDMARK.h) / 2 + WORDMARK.ty;
  let body = `<g transform="scale(${(M / 120).toFixed(4)})">${markBody({ ink, lit: "url(#lit)" })}</g>`;
  body += `<path transform="translate(${x + WORDMARK.tx} ${wy.toFixed(2)})" d="${WORDMARK.d}" fill="${ink}"/>`;
  let w = x + WORDMARK.w;
  if (kiln) {
    const kx = w + measure(" ", { font: "light", size: WORD_SIZE });
    body += text("Kiln", { font: "medium", size: WORD_SIZE, ls: -0.01 * WORD_SIZE, x: kx, y: wy, fill: ink });
    w = kx + measure("Kiln", { font: "medium", size: WORD_SIZE, ls: -0.01 * WORD_SIZE }) + 2;
  }
  return plainSvg(w, H, kiln ? "Glassworks Kiln" : "Glassworks", grad("lit", kiln ? EMBER_STOPS : LIT_STOPS), body);
}

function appIcon() {
  const defs =
    grad("lit", LIT_STOPS) +
    `<radialGradient id="sky" cx=".18" cy=".12" r=".7"><stop offset="0" stop-color="#38bdf8" stop-opacity=".22"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="vio" cx=".86" cy=".9" r=".7"><stop offset="0" stop-color="#a78bfa" stop-opacity=".2"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>`;
  const body =
    `<rect width="512" height="512" rx="112" fill="#0a0b0f"/><rect width="512" height="512" rx="112" fill="url(#sky)"/><rect width="512" height="512" rx="112" fill="url(#vio)"/>` +
    `<rect x=".5" y=".5" width="511" height="511" rx="111.5" fill="none" stroke="#fff" stroke-opacity=".08"/>` +
    `<g transform="translate(96 96) scale(2.6667)">${markBody()}</g>`;
  return plainSvg(512, 512, "Glassworks", defs, body);
}

/* the favicon follows the OS theme: ink is set by a style block */
function favicon() {
  const style = `<style>.i{stroke:#0c0e13}@media (prefers-color-scheme:dark){.i{stroke:#f4f4f5}}</style>`;
  return plainSvg(120, 120, "Glassworks", grad("lit", LIT_STOPS), style + markBody({ inkClass: "i", cut: "small" }));
}

/* ---------- info badges ---------- */

/*
 * Status colours only ever mean status (see /brand#colour). The marker matures
 * with the project: a dashed grey ring, an amber α, an amber β, a green dot.
 */
const STATUS_INK = {
  dark: { ready: "#34d399", working: "#fbbf24" },
  light: { ready: "#047857", working: "#b45309" },
};
const GREEK = { alpha: "α", beta: "β" };
const GREEK_SIZE = 12.5;

/** The stage marker at x: its SVG and how much room it takes before the value. */
function statusMarker(t, stage, x) {
  const ink = STATUS_INK[t.name];
  const at = `cx="${(x + 3).toFixed(2)}" cy="15.5"`;
  if (stage === "development")
    return { svg: `<circle ${at} r="2.6" fill="none" stroke="${t.mu}" stroke-width="1.1" stroke-dasharray="1.4 1.2"/>`, w: 11 };
  if (stage === "stable") return { svg: `<circle ${at} r="3" fill="${ink.ready}"/>`, w: 11 };
  const ch = GREEK[stage];
  if (!ch) throw new Error(`unknown status stage: ${stage}`);
  return {
    svg: text(ch, { font: "greek", size: GREEK_SIZE, x, y: 19.6, fill: ink.working }),
    w: measure(ch, { font: "greek", size: GREEK_SIZE }) + 6,
  };
}

/** LABEL VALUE on the same field as the part badges, with a stage marker for status. */
function infoBadge(t, { label, value, status }) {
  const x = 12;
  let vx = x + measure(label, CAPS) + 10;
  let marker = "";
  if (status) {
    const m = statusMarker(t, status, vx);
    marker = m.svg;
    vx += m.w;
  }
  const w = vx + measure(value, CAPS_B) + 13;
  const inner =
    text(label, { ...CAPS, x, y: 19, fill: t.mu }) + marker + text(value, { ...CAPS_B, x: vx, y: 19, fill: t.fg });
  return svg(w, 30, `${label.toLowerCase()}: ${value}`, field(w, 30, t, 15, inner), t);
}

/* ---------- part icons ---------- */

const IS = 0.1; // plate scale in an icon
const IGAP = 5;
const ICON = {
  frame: { label: "Glassworks frame", draw: (t, ox, y) => plate(t, ox, y(2), IS, "core") + plate(t, ox, y(1), IS, "ghost", { op: 0.35 }) + plate(t, ox, y(0), IS, "ghost", { op: 0.35 }) },
  core: { label: "Glassworks core", draw: (t, ox, y) => plate(t, ox, y(2), IS, "ghost") + plate(t, ox, y(1), IS, "core") + plate(t, ox, y(0), IS, "ghost") },
  pane: { label: "Glassworks pane", draw: (t, ox, y) => plate(t, ox, y(2), IS, "ghost") + plate(t, ox, y(1), IS, "ghost", { op: 0.35 }) + plate(t, ox, y(0), IS, "lit", { lit: [0, 4] }) },
  kiln: {
    label: "Glassworks Kiln",
    draw: (t, ox, y) =>
      plate(t, ox, y(2), IS, "ember", { thick: 24, topStroke: EMBER, topOp: 0.8 }) +
      plate(t, ox, y(1), IS, "ghost", { op: 0.4 }) +
      plate(t, ox, y(0), IS, "ghost", { op: 0.3 }),
  },
};

function partIcon(t, { label, draw }) {
  const w = C * 320 * IS + 2;
  const h = 1 + IGAP * 2 + plateHeight(IS) + 24 * IS + 1;
  return svg(w, h, label, draw(t, 1 + backCorner(IS), (i) => 1 + IGAP * i), t);
}

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
function bannerText(t, { kicker, nameA, nameB, bFill, code, desc, strong }) {
  let size = 34;
  const fontA = strong ? "semibold" : "light";
  const width = () =>
    measure(nameA, { font: fontA, size, ls: -0.6 }) +
    (nameB ? 9 + measure(nameB, { font: "semibold", size, ls: -0.6 }) : 0);
  while (width() > TITLE_MAX && size > 20) size -= 1;
  const wa = measure(nameA, { font: fontA, size, ls: -0.6 });
  return (
    text(kicker, { font: "medium", size: 9, ls: 2, x: TX, y: 52, fill: t.fa }) +
    text(nameA, { font: fontA, size, ls: -0.6, x: TX, y: 92, fill: strong ? t.fg : t.mu }) +
    (nameB ? text(nameB, { font: "semibold", size, ls: -0.6, x: TX + wa + 9, y: 92, fill: bFill ?? t.fg }) : "") +
    text(code, { font: "mono", size: 12, x: TX + 1, y: 118, fill: t.mu }) +
    text(desc, { font: "regular", size: 11.5, x: TX + 1, y: 138, fill: t.fa })
  );
}

const banner = (t, label, drawing, words, haze = "haze") =>
  svg(BW, BH, label, field(BW, BH, t, 16, drawing, { dots: "dotL", haze }) + bannerText(t, words), t);

/** The whole stack, lit at the top and fired from below: the org's banner. */
function glassworksBanner(t) {
  const s = 0.5;
  const ox = 56 + backCorner(s);
  const y = 4;
  const gap = 16;
  const at = (i) => y + gap * i; // 0 = panes (top) … 5 = Kiln (bottom)
  const [gx, gy] = project(ox, at(5), s)(100, 60);
  return banner(
    t,
    "Glassworks: the open core for Home Assistant wall panels",
    bannerGuides(t, ox, s, [at(0), at(5), at(5) + plateHeight(s)]) +
      `<ellipse cx="${gx.toFixed(2)}" cy="${(gy + 8).toFixed(2)}" rx="70" ry="26" fill="${EMBER}" opacity=".35" filter="url(#softL)"/>` +
      plate(t, ox, at(5), s, "ember", { thick: 20, topStroke: EMBER, topOp: 0.8 }) +
      plate(t, ox, at(4), s, "chips", { thick: 16 }) +
      plate(t, ox, at(3), s, "core", { thick: 16 }) +
      plate(t, ox, at(2), s, "core", { thick: 16 }) +
      plate(t, ox, at(1), s, "sockets", { thick: 10 }) +
      plate(t, ox, at(0), s, "lit", { lit: [0, 2, 3, 5], thick: 16 }),
    {
      kicker: "OPEN SOURCE · MPL-2.0",
      nameA: "Glassworks",
      strong: true,
      code: "glassworks.dev",
      desc: "The open core for Home Assistant wall panels.",
    },
  );
}

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
  write(`badge-${on}.svg`, builtOnBadge(t));
  for (const id of Object.keys(PART)) write(`badge-${id}-${on}.svg`, partBadge(t, id));
  for (const b of infoBadges) write(`badge-${b.id}-${on}.svg`, infoBadge(t, b));
  for (const [id, spec] of Object.entries(ICON)) write(`icon-${id}-${on}.svg`, partIcon(t, spec));
  write(`banner-glassworks-${on}.svg`, glassworksBanner(t));
  write(`banner-core-${on}.svg`, coreBanner(t));
  write(`banner-kiln-${on}.svg`, kilnBanner(t));
  for (const lib of libraries) write(`banner-library-${lib.name}-${on}.svg`, libraryBanner(t, lib));
}

// the mark's own files
const ink = { dark: "#f4f4f5", light: "#0c0e13" };
write("mark-on-dark.svg", plainSvg(120, 120, "Glassworks", grad("lit", LIT_STOPS), markBody({ ink: ink.dark })));
write("mark-on-light.svg", plainSvg(120, 120, "Glassworks", grad("lit", LIT_STOPS), markBody({ ink: ink.light })));
write("mark-mono.svg", plainSvg(120, 120, "Glassworks", "", markBody({ ink: "currentColor", lit: "currentColor" })));
write("kiln-on-dark.svg", plainSvg(120, 120, "Glassworks Kiln", grad("lit", EMBER_STOPS), markBody({ ink: ink.dark })));
write("lockup-on-dark.svg", lockup(ink.dark));
write("lockup-on-light.svg", lockup(ink.light));
write("lockup-kiln-on-dark.svg", lockup(ink.dark, { kiln: true }));
write("app-icon.svg", appIcon());
write("favicon.svg", favicon());
writeFileSync(join(root, "src/app/icon.svg"), favicon());
written.push("../../src/app/icon.svg");

console.log(`Wrote ${written.length} files to public/brand/:\n  ${written.join("\n  ")}`);
