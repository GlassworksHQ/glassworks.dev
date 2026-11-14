/**
 * What every part banner and badge shares: the mark (markBody, markIcon), each part's light (PART),
 * and the part banner itself (partBanner, 640 × 180): the drawing in a cell on the left, the words on
 * a sweep of the part's light. generate.mjs draws the core, pane, Kiln, library and principles
 * banners with it, and frame.mjs each frame's.
 */
import { kilnPlates, markPlates } from "../../src/lib/markGeometry.ts";
import { measure, text } from "./text.mjs";
import { C, backCorner, guide, svg } from "./draw.mjs";

export const markIcon = (t, x, y, size, lit = "url(#lit)", kiln = false) =>
  `<g transform="translate(${x} ${y}) scale(${(size / 120).toFixed(4)})">${markBody({ ink: t.fg, lit, cut: kiln ? "full" : "small", kiln })}</g>`;

export const PART = {
  core: {
    name: "Core",
    sweep: ["#e2e8f0", "#7dd3fc"],
    strength: 0.55, // core is glass before the light comes on: a fainter sweep
    rim: { dark: ["#e2e8f0", "#bae6fd"], light: ["#94a3b8", "#0ea5e9"] },
  },
  pane: {
    name: "Pane",
    sweep: ["#38bdf8", "#a78bfa"],
    strength: 1,
    rim: { dark: ["#7dd3fc", "#c4b5fd"], light: ["#0ea5e9", "#8b5cf6"] },
  },
  kiln: {
    name: "Kiln",
    sweep: ["#fdba74", "#f43f5e"],
    strength: 1,
    rim: { dark: ["#fed7aa", "#fda4af"], light: ["#fb923c", "#e11d48"] },
    lit: "url(#ember)",
  },
  // libraries are pieces of the core: its pale glass, under their own name
  library: {
    name: "Library",
    sweep: ["#e2e8f0", "#7dd3fc"],
    strength: 0.55,
    rim: { dark: ["#e2e8f0", "#bae6fd"], light: ["#94a3b8", "#0ea5e9"] },
  },
};

export function markBody({ ink = "#f4f4f5", inkClass, lit = "url(#lit)", cut = "full", kiln = false } = {}) {
  const inkAttr = (k) => (inkClass ? `class="${inkClass}" ${k}-opacity` : `${k}="${ink}" ${k}-opacity`);
  // kiln: the bottom plate is the fired one (fill it with an ember gradient)
  return (kiln ? kilnPlates(cut) : markPlates(cut))
    .map((p) =>
      p.lit
        ? `<path d="${p.d}" fill="${lit}"/>`
        : `<path d="${p.d}" fill="none" ${inkAttr("stroke")}="${p.opacity}" stroke-width="${p.strokeWidth}" stroke-linejoin="round"/>`,
    )
    .join("");
}

/* ---------- banners ---------- */

/*
 * README banners, 640 × 180. Glassworks' own banner is finished: the stack and
 * the lockup, no construction. The part banners (core, pane, Kiln, libraries)
 * put the drawing in a cell on the left, its guides kept inside it, and the
 * words on a sweep of the part's light, with the edge catching it, like the
 * part badges.
 */
export const BW = 640;
export const BH = 180;
export const CELL = 300;
export const TX = CELL + 26;

export const BANNER_LIGHT = {
  core: PART.core,
  pane: PART.pane,
  kiln: PART.kiln,
  library: PART.library,
  principles: PART.core, // the rules: the stack drawn before the light comes on
  // a frame is hardware, the bottom plate: neutral glass with no hue of its own (frame.mjs)
  frame: { sweep: ["#e2e8f0", "#cbd5e1"], strength: 0.6, rim: { dark: ["#e2e8f0", "#f4f4f5"], light: ["#94a3b8", "#475569"] } },
};

export function cellGuides(t, ox, s, ys, color) {
  const xs = [ox - backCorner(s), ox, ox + C * 200 * s];
  const o = { w: 0.8, dash: "5 4", color };
  const f = (n) => n.toFixed(2);
  return (
    guide(ys.map((v) => `M0 ${f(v)}H${CELL}`).join(""), t, { ...o, op: 0.28 }) +
    guide(xs.map((v) => `M${f(v)} 0V${BH}`).join(""), t, { ...o, op: 0.22 }) +
    guide(`M${f(ox - 200)} ${f(ys[0] - 115)}L${f(ox + 400)} ${f(ys[0] + 231)}M${f(ox - 200)} ${f(ys.at(-1) + 115)}L${f(ox + 400)} ${f(ys.at(-1) - 231)}`, t, { ...o, op: 0.2 })
  );
}

export function partBanner(t, id, label, drawing, { kicker, nameA, nameB, code, desc, haze }) {
  const p = BANNER_LIGHT[id];
  const light = t.name === "light";
  const [a, b] = p.sweep;
  const [ra, rb] = p.rim[t.name];
  const k = p.strength;
  const tw = BW - CELL;
  const defs =
    `<linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="${CELL}" y1="0" x2="${BW}" y2="0"><stop offset="0" stop-color="${a}" stop-opacity="${0.05 * k}"/><stop offset=".55" stop-color="${a}" stop-opacity="${0.14 * k}"/><stop offset="1" stop-color="${b}" stop-opacity="${(light ? 0.3 : 0.38) * k}"/></linearGradient>` +
    `<linearGradient id="rim" gradientUnits="userSpaceOnUse" x1="${CELL}" y1="0" x2="${BW}" y2="0"><stop offset="0" stop-color="${ra}"/><stop offset="1" stop-color="${rb}"/></linearGradient>` +
    `<linearGradient id="ramp" gradientUnits="userSpaceOnUse" x1="${CELL}" y1="0" x2="${BW - 6}" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
    `<mask id="lit-edge" maskUnits="userSpaceOnUse" x="${CELL}" y="0" width="${tw}" height="${BH}"><rect x="${CELL}" width="${tw}" height="${BH}" fill="url(#ramp)"/></mask>`;
  const box = `x=".5" y=".5" width="${BW - 1}" height="${BH - 1}" rx="16"`;
  let size = 34;
  const titleW = () =>
    measure(nameA, { font: nameB ? "light" : "semibold", size, ls: -0.6 }) + (nameB ? 9 + measure(nameB, { font: "semibold", size, ls: -0.6 }) : 0);
  while (titleW() > BW - TX - 24 && size > 20) size -= 1;
  const wa = measure(nameA, { font: "light", size, ls: -0.6 });
  const title = nameB
    ? text(nameA, { font: "light", size, ls: -0.6, x: TX, y: 92, fill: t.mu }) +
      text(nameB, { font: "semibold", size, ls: -0.6, x: TX + wa + 9, y: 92, fill: t.fg })
    : text(nameA, { font: "semibold", size, ls: -0.6, x: TX, y: 92, fill: t.fg });
  const words =
    markIcon(t, TX, 40, 16, id === "kiln" ? "url(#ember)" : "url(#lit)", id === "kiln") +
    text(kicker, { font: "medium", size: 9, ls: 2, x: TX + 22, y: 52, fill: t.fa }) +
    title +
    text(code, { font: "mono", size: 12, x: TX + 1, y: 118, fill: t.mu }) +
    text(desc, { size: 11.5, x: TX + 1, y: 138, fill: t.fa });
  const body =
    `<defs>${defs}</defs><clipPath id="clip"><rect x="1" y="1" width="${BW - 2}" height="${BH - 2}" rx="15.5"/></clipPath>` +
    `<rect ${box} fill="${t.bg}"/>` +
    `<g clip-path="url(#clip)"><rect width="${CELL}" height="${BH}" fill="url(#dotL)"/>${haze ? `<rect width="${CELL}" height="${BH}" fill="url(#${haze})"/>` : ""}${drawing}<rect x="${CELL}" width="${tw}" height="${BH}" fill="url(#sweep)"/></g>` +
    guide(`M${CELL} 0V${BH}`, t, { op: 0.55, w: 0.7, dash: "4 3" }) +
    `<rect ${box} fill="none" stroke="${light ? "#c9ccd4" : "#3a3d46"}"/><rect ${box} fill="none" stroke="url(#rim)" mask="url(#lit-edge)"/>` +
    words;
  return svg(BW, BH, label, body, t);
}
