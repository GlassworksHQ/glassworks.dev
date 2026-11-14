/**
 * Generates the part badges and README banners into public/brand/.
 *
 *   pnpm brand
 *
 * Badges (30 px, for a row of shields): core, pane, kiln, library.
 * Banners (640 × 180, for the top of a README): glassworks (the whole stack,
 * for the org profile and the main README), principles (the page of rules every
 * part follows), core, pane, kiln, one per library in src/lib/libraries.json, and
 * one per frame with a tagline in vendor/s1-unleashed (frame.mjs). Each in -on-dark
 * and -on-light.
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
 * and Kiln's app-icon-kiln and favicon-kiln (the same, with the ember floor),
 * and the frame badge, "Built on Glassworks" (badge-on-*). The mark's shape
 * comes from src/lib/markGeometry.ts, the same file <Mark> draws from.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { measure, text } from "./text.mjs";
import { BH, BW, PART, cellGuides, markBody, markIcon, partBanner } from "./banner.mjs";
import { frameBanner } from "./frame.mjs";
import { existsSync, readdirSync } from "node:fs";
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
// every frame in the pinned main repo with a tagline gets a banner (frame.mjs)
const FRAMES = join(root, "vendor/s1-unleashed/frames");
if (!existsSync(FRAMES)) throw new Error("vendor/s1-unleashed is empty: run `git submodule update --init` first");
const frames = readdirSync(FRAMES, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(FRAMES, e.name, "design/frame.json")))
  .map((e) => JSON.parse(readFileSync(join(FRAMES, e.name, "design/frame.json"), "utf8")))
  .filter((f) => f.tagline)
  .sort((a, b) => a.id.localeCompare(b.id));
const infoBadges = readJson("src/lib/info-badges.json");

const EMBER = "#f43f5e";

/* ---------- badges ---------- */

const CAPS = { font: "medium", size: 9.5, ls: 1.5 };
const CAPS_B = { font: "semibold", size: 9.5, ls: 1.5 };

const SZ = 12.7; // the badges' type size
const SPACE = () => measure(" ", { size: SZ }) + 0.6;


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
    markIcon(t, cell / 2 - 10, 5, 20, p.lit, Boolean(p.lit)) +
    text("Glassworks", { size: SZ, x: cell + 12, y: 19.73, fill: t.mu }) +
    text(p.name, { font: "semibold", size: SZ, x: cell + 12 + wa + SPACE(), y: 19.73, fill: t.fg });
  return svg(w, 30, `Glassworks ${p.name}`, body, t);
}

/* ---------- the mark ---------- */

const LIT_STOPS = ["#38bdf8", "#a78bfa"];
const EMBER_STOPS = ["#fdba74", "#f43f5e"];
const grad = (id, [a, b]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

/** The mark's plates on its 120 × 120 canvas. ink: a colour, or a class name for themed files. */

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
  let body = `<g transform="scale(${(M / 120).toFixed(4)})">${markBody({ ink, lit: "url(#lit)", kiln })}</g>`;
  body += `<path transform="translate(${x + WORDMARK.tx} ${wy.toFixed(2)})" d="${WORDMARK.d}" fill="${ink}"/>`;
  let w = x + WORDMARK.w;
  if (kiln) {
    const kx = w + measure(" ", { font: "light", size: WORD_SIZE });
    body += text("Kiln", { font: "medium", size: WORD_SIZE, ls: -0.01 * WORD_SIZE, x: kx, y: wy, fill: ink });
    w = kx + measure("Kiln", { font: "medium", size: WORD_SIZE, ls: -0.01 * WORD_SIZE }) + 2;
  }
  return plainSvg(w, H, kiln ? "Glassworks Kiln" : "Glassworks", grad("lit", kiln ? EMBER_STOPS : LIT_STOPS), body);
}

/* kiln: Kiln's mark (the ember floor) on Kiln's room light, sky and ember, in place of sky and violet */
function appIcon({ kiln = false } = {}) {
  const [glow, glowOp] = kiln ? ["#f43f5e", ".18"] : ["#a78bfa", ".2"];
  const defs =
    grad("lit", kiln ? EMBER_STOPS : LIT_STOPS) +
    `<radialGradient id="sky" cx=".18" cy=".12" r=".7"><stop offset="0" stop-color="#38bdf8" stop-opacity=".22"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="vio" cx=".86" cy=".9" r=".7"><stop offset="0" stop-color="${glow}" stop-opacity="${glowOp}"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>`;
  const body =
    `<rect width="512" height="512" rx="112" fill="#0a0b0f"/><rect width="512" height="512" rx="112" fill="url(#sky)"/><rect width="512" height="512" rx="112" fill="url(#vio)"/>` +
    `<rect x=".5" y=".5" width="511" height="511" rx="111.5" fill="none" stroke="#fff" stroke-opacity=".08"/>` +
    `<g transform="translate(96 96) scale(2.6667)">${markBody({ kiln })}</g>`;
  return plainSvg(512, 512, kiln ? "Glassworks Kiln" : "Glassworks", defs, body);
}

/* the favicon follows the OS theme: ink is set by a style block. kiln: the small cut of Kiln's mark */
function favicon({ kiln = false } = {}) {
  const style = `<style>.i{stroke:#0c0e13}@media (prefers-color-scheme:dark){.i{stroke:#f4f4f5}}</style>`;
  return plainSvg(120, 120, kiln ? "Glassworks Kiln" : "Glassworks", grad("lit", kiln ? EMBER_STOPS : LIT_STOPS),
    style + markBody({ inkClass: "i", cut: "small", kiln }));
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

/*
 * For tables and lists at about 24 px: three panel plates in bold 1.4 px lines,
 * spread apart, with the part's own plate filled. Where the filled plate sits
 * (top, middle, bottom) says where the part sits in the stack.
 */
function isoPlatePath(cx, top, W, D, r) {
  const p = (x, y) => [cx + C * (x - y), top + 0.5 * (x + y)];
  const pts = [];
  const corner = (ox, oy, a0) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + (i * Math.PI) / 12;
      pts.push(p(ox + r * Math.cos(a), oy + r * Math.sin(a)));
    }
  };
  corner(W - r, r, -Math.PI / 2);
  corner(W - r, D - r, 0);
  corner(r, D - r, Math.PI / 2);
  corner(r, r, Math.PI);
  return "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";
}

const ICON = {
  frame: { label: "Glassworks Frame", level: 2 },
  core: { label: "Glassworks Core", level: 1 },
  pane: { label: "Glassworks Pane", level: 0 },
  kiln: { label: "Glassworks Kiln", level: 2 },
};

function partIcon(t, id) {
  const { label, level } = ICON[id];
  const W = 20, D = 12, r = 2.6, step = 7, top0 = 2, cx = 2 + C * D;
  const fill = { frame: t.fg, core: t.fg, pane: "url(#lit)", kiln: "url(#ember)" }[id];
  const paths = [];
  for (let lv = 2; lv >= 0; lv--) {
    const d = isoPlatePath(cx, top0 + lv * step, W, D, r);
    if (lv !== level) {
      paths.push(`<path d="${d}" fill="none" stroke="${t.fg}" stroke-opacity=".28" stroke-width="1.4" stroke-linejoin="round"/>`);
      continue;
    }
    if (id === "frame") paths.push(`<path d="${d}" fill="${fill}" fill-opacity=".85"/><path d="${d}" fill="none" stroke="${t.fg}" stroke-width="1.4" stroke-linejoin="round"/>`);
    else paths.push(`<path d="${d}" fill="${fill}" fill-opacity="${id === "core" ? 0.55 : 1}"/>`);
  }
  const w = cx + C * W + 2;
  const h = top0 + 2 * step + 0.5 * (W + D) + 2;
  return svg(w, h, label, paths.join(""), t);
}

/* ---------- banners (the part banner itself is in banner.mjs) ---------- */

/** Glassworks itself: finished, so no construction. The whole stack and the lockup. */
function glassworksBanner(t) {
  const light = t.name === "light";
  const s = 0.46;
  const ox = 74 + backCorner(s);
  const at = (i) => 14 + 14 * i; // 0 = panes (top) … 5 = Kiln (bottom)
  const [gx, gy] = project(ox, at(5), s)(100, 60);
  const [sx, sy] = project(ox, at(0), s)(100, 60);
  const box = `x=".5" y=".5" width="${BW - 1}" height="${BH - 1}" rx="16"`;
  const defs =
    `<radialGradient id="skyG"><stop offset="0" stop-color="#38bdf8" stop-opacity="${light ? 0.18 : 0.22}"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="emG"><stop offset="0" stop-color="${EMBER}" stop-opacity="${light ? 0.2 : 0.3}"/><stop offset="1" stop-color="${EMBER}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="vioG" cx=".9" cy=".1" r=".9"><stop offset="0" stop-color="#a78bfa" stop-opacity="${light ? 0.12 : 0.16}"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>`;
  const drawing =
    `<ellipse cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" rx="150" ry="80" fill="url(#skyG)"/><ellipse cx="${gx.toFixed(2)}" cy="${(gy + 8).toFixed(2)}" rx="120" ry="44" fill="url(#emG)"/>` +
    plate(t, ox, at(5), s, "ember", { thick: 20, topStroke: EMBER, topOp: 0.8 }) +
    plate(t, ox, at(4), s, "chips", { thick: 16 }) +
    plate(t, ox, at(3), s, "core", { thick: 16 }) +
    plate(t, ox, at(2), s, "core", { thick: 16 }) +
    plate(t, ox, at(1), s, "sockets", { thick: 10 }) +
    plate(t, ox, at(0), s, "lit", { lit: [0, 2, 3, 5], thick: 16 });
  const x = 322;
  const mk = 44;
  const words =
    `<g transform="translate(${x} 52) scale(${(mk / 120).toFixed(4)})">${markBody({ ink: t.fg })}</g>` +
    text("Glassworks", { font: "light", size: 38, ls: -0.9, x: x + mk + 12, y: 89, fill: t.fg }) +
    text("The open core for Home Assistant wall panels.", { size: 12, x: x + 1, y: 124, fill: t.mu }) +
    text("glassworks.dev", { font: "mono", size: 11.5, x: x + 1, y: 143, fill: t.fa });
  return svg(
    BW,
    BH,
    "Glassworks: the open core for Home Assistant wall panels",
    `<defs>${defs}</defs><clipPath id="clip"><rect x="1" y="1" width="${BW - 2}" height="${BH - 2}" rx="15.5"/></clipPath><rect ${box} fill="${t.bg}"/><g clip-path="url(#clip)"><rect width="${BW}" height="${BH}" fill="url(#vioG)"/>${drawing}</g><rect ${box} fill="none" stroke="${t.edge}"/>` +
      words,
    t,
  );
}

function coreBanner(t) {
  const s = 0.62;
  const ox = 50 + backCorner(s);
  const y = 30;
  const gap = 26;
  return partBanner(
    t,
    "core",
    "Glassworks Core",
    cellGuides(t, ox, s, [y, y + gap, y + gap * 2, y + gap + plateHeight(s)]) +
      plate(t, ox, y + gap * 2, s, "ghost") +
      plate(t, ox, y + gap, s, "core") +
      plate(t, ox, y, s, "ghost"),
    { kicker: "GLASSWORKS · CORE", nameA: "Glassworks", nameB: "Core", code: ":glassworks-core", desc: "What every panel needs. No device code." },
  );
}

/** A pane: the panes plate, with one lit pane lifted out of its socket. */
function paneBanner(t) {
  const s = 0.6;
  const ox = 52 + backCorner(s);
  const oy = 70;
  const lift = 70;
  const cell = cellAt(1);
  const top = project(ox, oy, s)(cell[0], cell[1], lift)[1];
  const sky = t.name === "dark" ? "#7dd3fc" : "#0369a1";
  const at = (z) => `matrix(${C * s} ${0.5 * s} ${-C * s} ${0.5 * s} ${ox} ${oy - z * s})`;
  const cellRect = (z, attrs) =>
    `<g transform="${at(z)}"><rect x="${cell[0]}" y="${cell[1]}" width="54" height="40" rx="5" ${attrs} vector-effect="non-scaling-stroke"/></g>`;
  return partBanner(
    t,
    "pane",
    "Glassworks Pane",
    cellGuides(t, ox, s, [top, oy, oy + plateHeight(s)]) +
      plate(t, ox, oy, s, "lit", { lit: [0, 3, 5] }) +
      cellRect(0.5, `fill="${t.bg}" stroke="${sky}" stroke-opacity=".8" stroke-width=".8" stroke-dasharray="3 2.4"`) +
      guide(drops(ox, oy, s, cell, 0, lift - 12), t, { op: 0.5, w: 0.7, dash: "3 2.4", color: sky }) +
      cellRect(lift - 12, `fill="#a78bfa" fill-opacity=".5"`) +
      cellRect(lift, `fill="url(#lit)"`),
    { kicker: "GLASSWORKS · PANE", nameA: "Glassworks", nameB: "Pane", code: "panes/<name>", desc: "A plugin. Declares the hardware it needs." },
  );
}

/** Every library gets the same drawing: one block lifted out of the core plate. */
function libraryBanner(t, lib) {
  const s = 0.6;
  const ox = 52 + backCorner(s);
  const oy = 74;
  const lift = 96;
  const cell = cellAt(2);
  const top = project(ox, oy, s)(cell[0], cell[1], lift)[1];
  return partBanner(
    t,
    "library",
    `${lib.name}, a Glassworks library`,
    cellGuides(t, ox, s, [top, oy, oy + plateHeight(s)]) +
      plate(t, ox, oy, s, "holed", { hole: 2 }) +
      guide(drops(ox, oy, s, cell, 0, lift - 14), t, { op: 0.55, w: 0.7, dash: "3 2.4" }) +
      block(t, ox, oy, s, cell, lift),
    { kicker: "GLASSWORKS · LIBRARY", nameA: lib.name, code: "Standalone · built for Glassworks", desc: lib.description },
  );
}

/**
 * The principles: the whole stack as a plan, with the pane sockets on top. The
 * shape every part has to fit, drawn before anything is lit. No ember: Kiln's
 * colour stays Kiln's.
 */
function principlesBanner(t) {
  const s = 0.5;
  const ox = 70 + backCorner(s);
  const y = 26;
  const gap = 22;
  return partBanner(
    t,
    "principles",
    "Glassworks Principles",
    cellGuides(t, ox, s, [y, y + gap * 3, y + gap * 3 + plateHeight(s)]) +
      plate(t, ox, y + gap * 3, s, "ghost", { op: 0.3 }) +
      plate(t, ox, y + gap * 2, s, "ghost", { op: 0.4, cells: true }) +
      plate(t, ox, y + gap, s, "core", { thick: 14 }) +
      plate(t, ox, y, s, "sockets", { thick: 10 }),
    {
      kicker: "GLASSWORKS · PRINCIPLES",
      nameA: "Glassworks",
      nameB: "Principles",
      code: "docs/principles.md",
      desc: "Home Assistant is the brain. The panel is the hardware.",
    },
  );
}

function kilnBanner(t) {
  const s = 0.55;
  const ox = 56 + backCorner(s);
  const y = 12;
  const gap = 20;
  const [gx, gy] = project(ox, y + gap * 3, s)(100, 60);
  return partBanner(
    t,
    "kiln",
    "Glassworks Kiln",
    cellGuides(t, ox, s, [y, y + gap * 3, y + gap * 3 + plateHeight(s)], "#fb7185") +
      `<ellipse cx="${gx.toFixed(2)}" cy="${(gy + 10).toFixed(2)}" rx="90" ry="34" fill="${EMBER}" opacity=".4" filter="url(#softL)"/>` +
      plate(t, ox, y + gap * 3, s, "ember", { thick: 26, topStroke: EMBER, topOp: 0.8 }) +
      plate(t, ox, y + gap * 2, s, "ghost", { op: 0.45, cells: true }) +
      plate(t, ox, y + gap, s, "ghost", { op: 0.35 }) +
      plate(t, ox, y, s, "ghost", { op: 0.25 }),
    { kicker: "GLASSWORKS · INSTALLER", nameA: "Glassworks", nameB: "Kiln", code: "kiln.glassworks.dev", desc: "Installs a frame over USB, from the browser.", haze: "emberHaze" },
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
  for (const id of Object.keys(ICON)) write(`icon-${id}-${on}.svg`, partIcon(t, id));
  write(`banner-glassworks-${on}.svg`, glassworksBanner(t));
  write(`banner-core-${on}.svg`, coreBanner(t));
  write(`banner-pane-${on}.svg`, paneBanner(t));
  write(`banner-kiln-${on}.svg`, kilnBanner(t));
  write(`banner-principles-${on}.svg`, principlesBanner(t));
  for (const lib of libraries) write(`banner-library-${lib.name}-${on}.svg`, libraryBanner(t, lib));
  for (const f of frames) write(`banner-frame-${f.id}-${on}.svg`, frameBanner(t, f));
}

// the mark's own files
const ink = { dark: "#f4f4f5", light: "#0c0e13" };
write("mark-on-dark.svg", plainSvg(120, 120, "Glassworks", grad("lit", LIT_STOPS), markBody({ ink: ink.dark })));
write("mark-on-light.svg", plainSvg(120, 120, "Glassworks", grad("lit", LIT_STOPS), markBody({ ink: ink.light })));
write("mark-mono.svg", plainSvg(120, 120, "Glassworks", "", markBody({ ink: "currentColor", lit: "currentColor" })));
write("kiln-on-dark.svg", plainSvg(120, 120, "Glassworks Kiln", grad("lit", EMBER_STOPS), markBody({ ink: ink.dark, kiln: true })));
write("lockup-on-dark.svg", lockup(ink.dark));
write("lockup-on-light.svg", lockup(ink.light));
write("lockup-kiln-on-dark.svg", lockup(ink.dark, { kiln: true }));
write("app-icon.svg", appIcon());
write("app-icon-kiln.svg", appIcon({ kiln: true }));
write("favicon.svg", favicon());
write("favicon-kiln.svg", favicon({ kiln: true }));
writeFileSync(join(root, "src/app/icon.svg"), favicon());
written.push("../../src/app/icon.svg");

console.log(`Wrote ${written.length} files to public/brand/:\n  ${written.join("\n  ")}`);
