/**
 * Drawing primitives for the badges and banners: the exploded stack from the
 * home page (same 200 × 120 plates, same 3 × 2 cells, same projection), dashed
 * construction guides, and a dot-grid field.
 */

export const THEMES = {
  dark: { name: "dark", bg: "#111319", edge: "#2a2c33", fg: "#f4f4f5", mu: "#a1a1aa", fa: "#63636b" },
  light: { name: "light", bg: "#ffffff", edge: "#d6d9e0", fg: "#0c0e13", mu: "#4f525c", fa: "#8d919b" },
};

const SKY = "#38bdf8";
const VIOLET = "#a78bfa";
const GLOW = "#fdba74";
const EMBER = "#f43f5e";

/** Gradients, patterns and filters every file shares. Ids only need to be unique per file. */
export function defs(t) {
  const dot = t.name === "dark" ? 'fill="#ffffff" fill-opacity=".14"' : 'fill="#0c0e13" fill-opacity=".16"';
  const dotL = t.name === "dark" ? 'fill="#ffffff" fill-opacity=".09"' : 'fill="#0c0e13" fill-opacity=".1"';
  const haze = t.name === "dark" ? ["#ffffff", ".06"] : ["#ffffff", ".8"];
  return `<defs>
<linearGradient id="lit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${SKY}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient>
<linearGradient id="litH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${SKY}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient>
<linearGradient id="ember" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${GLOW}"/><stop offset="1" stop-color="${EMBER}"/></linearGradient>
<linearGradient id="emberH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${GLOW}"/><stop offset="1" stop-color="${EMBER}"/></linearGradient>
<pattern id="dot" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".38" ${dot}/></pattern>
<pattern id="dotL" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r=".9" ${dotL}/></pattern>
<radialGradient id="haze" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="${haze[0]}" stop-opacity="${haze[1]}"/><stop offset="1" stop-color="${haze[0]}" stop-opacity="0"/></radialGradient>
<radialGradient id="litHaze" cx=".1" cy=".5" r=".7"><stop offset="0" stop-color="${SKY}" stop-opacity=".22"/><stop offset=".6" stop-color="${VIOLET}" stop-opacity=".06"/><stop offset="1" stop-color="${VIOLET}" stop-opacity="0"/></radialGradient>
<radialGradient id="emberHaze" cx=".05" cy="1" r=".8"><stop offset="0" stop-color="${EMBER}" stop-opacity=".2"/><stop offset=".6" stop-color="${GLOW}" stop-opacity=".05"/><stop offset="1" stop-color="${GLOW}" stop-opacity="0"/></radialGradient>
<filter id="softL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
</defs>`;
}

export function svg(w, h, label, body, t) {
  const r = (n) => +n.toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" viewBox="0 0 ${r(w)} ${r(h)}" width="${Math.round(w)}" height="${Math.round(h)}"><title>${label}</title>${defs(t)}${body}</svg>\n`;
}

/** A dashed construction guide. */
export const guide = (d, t, { op = 0.4, w = 0.5, dash = "2 1.6", color } = {}) =>
  `<path d="${d}" stroke="${color ?? t.fg}" stroke-opacity="${op}" stroke-width="${w}" stroke-dasharray="${dash}" fill="none"/>`;

/** A rounded field with a dot grid, clipped so guides can run edge to edge. */
export function field(w, h, t, rx, inner, { dots = "dot", haze, stroke } = {}) {
  return `<clipPath id="clip"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${rx - 0.5}"/></clipPath>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="${t.bg}"/>
<g clip-path="url(#clip)"><rect width="${w}" height="${h}" fill="url(#${dots})"/>${haze ? `<rect width="${w}" height="${h}" fill="url(#${haze})"/>` : ""}${inner}</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="none" stroke="${stroke ?? t.edge}"/>`;
}

/* ---------- isometric stack ---------- */

export const C = 0.8660254;
export const S = 0.5;
const NS = 'vector-effect="non-scaling-stroke"';

/** Project plate units to the page, for a plate whose back corner sits at (ox, oy), scaled by s. */
export const project = (ox, oy, s) => (x, y, z = 0) => [ox + C * (x - y) * s, oy + S * (x + y) * s - z * s];
const plane = (ox, oy, s, z = 0) => `matrix(${C * s} ${S * s} ${-C * s} ${S * s} ${ox} ${oy - z * s})`;

export const PLATE_W = 200;
export const PLATE_D = 120;
const COL_X = [10, 73, 136];
const ROW_Y = [10, 56];
export const cellAt = (i) => [COL_X[i % 3], ROW_Y[Math.floor(i / 3)]];
const CELLS = [0, 1, 2, 3, 4, 5].map(cellAt);

/** Page width of a plate's drawing, and the x of its back corner from its left edge. */
export const plateWidth = (s) => C * (PLATE_W + PLATE_D) * s;
export const plateHeight = (s) => S * (PLATE_W + PLATE_D) * s;
export const backCorner = (s) => C * PLATE_D * s;

const rect = (x, y, w, h, rx, attrs) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${attrs} ${NS}/>`;

/**
 * One plate. Kinds:
 *  ghost   dashed outline (a layer that isn't the subject)
 *  core    grey cells
 *  lit     grey cells, some lit (o.lit: cell indexes)
 *  ember   one ember inset (Kiln)
 *  holed   grey cells with one empty socket (o.hole)
 *  chips   darker grey cells (hardware)
 *  sockets dashed sky outlines (the pane API)
 */
export function plate(t, ox, oy, s, kind, o = {}) {
  if (kind === "ghost") {
    const cells = o.cells
      ? CELLS.map(([x, y]) => rect(x, y, 54, 40, 5, `fill="none" stroke="${t.fg}" stroke-opacity=".22" stroke-width=".5" stroke-dasharray="1.6 1.4"`)).join("")
      : "";
    return `<g transform="${plane(ox, oy, s)}">${rect(0, 0, PLATE_W, PLATE_D, 9, `fill="none" stroke="${t.fg}" stroke-opacity="${o.op ?? 0.5}" stroke-width=".7" stroke-dasharray="1.8 1.4"`)}${cells}</g>`;
  }
  const slab = `<g transform="${plane(ox, oy, s, -(o.thick ?? 22))}">${rect(0, 0, PLATE_W, PLATE_D, 9, `fill="${t.fg}" fill-opacity=".1" stroke="${t.fg}" stroke-opacity=".25" stroke-width=".5"`)}</g>`;
  const top = rect(0, 0, PLATE_W, PLATE_D, 9, `fill="${t.bg}" stroke="${o.topStroke ?? t.fg}" stroke-opacity="${o.topOp ?? 0.6}" stroke-width=".7"`);
  const grey = (x, y) => rect(x, y, 54, 40, 5, `fill="${t.fg}" fill-opacity=".1" stroke="${t.fg}" stroke-opacity=".35" stroke-width=".5"`);
  let cells = "";
  if (kind === "core") cells = CELLS.map(([x, y]) => grey(x, y)).join("");
  if (kind === "chips")
    cells = CELLS.map(([x, y]) => rect(x, y, 54, 40, 5, `fill="${t.fg}" fill-opacity=".18" stroke="${t.fg}" stroke-opacity=".3" stroke-width=".5"`)).join("");
  if (kind === "sockets")
    cells = CELLS.map(([x, y]) => rect(x, y, 54, 40, 5, `fill="none" stroke="${t.name === "dark" ? "#7dd3fc" : "#0369a1"}" stroke-opacity=".7" stroke-width=".6" stroke-dasharray="1.6 1.2"`)).join("");
  if (kind === "lit")
    cells = CELLS.map(([x, y], i) =>
      o.lit.includes(i)
        ? rect(x, y, 54, 40, 5, `fill="url(#lit)" fill-opacity=".95"`)
        : rect(x, y, 54, 40, 5, `fill="${t.fg}" fill-opacity=".08" stroke="${t.fg}" stroke-opacity=".3" stroke-width=".5"`),
    ).join("");
  if (kind === "holed")
    cells = CELLS.map(([x, y], i) =>
      i === o.hole
        ? rect(x, y, 54, 40, 5, `fill="${t.fg}" fill-opacity=".03" stroke="${t.fg}" stroke-opacity=".55" stroke-width=".6" stroke-dasharray="1.8 1.4"`)
        : grey(x, y),
    ).join("");
  if (kind === "ember") cells = rect(10, 10, 180, 100, 6, `fill="url(#ember)"`);
  return `${slab}<g transform="${plane(ox, oy, s)}">${top}${cells}</g>`;
}

/** A single cell raised to height z, with its own edge. */
export function block(t, ox, oy, s, [x, y], z, thick = 14) {
  const at = (zz, attrs) => `<g transform="${plane(ox, oy, s, zz)}">${rect(x, y, 54, 40, 5, attrs)}</g>`;
  return (
    at(z - thick, `fill="${t.fg}" fill-opacity=".18" stroke="${t.fg}" stroke-opacity=".35" stroke-width=".5"`) +
    at(z, `fill="${t.bg}" stroke="${t.fg}" stroke-opacity=".9" stroke-width=".9"`) +
    at(z, `fill="${t.fg}" fill-opacity=".16"`)
  );
}

/** Dashed lines from a cell's four corners, between two heights. */
export function drops(ox, oy, s, [x, y], z0, z1) {
  const p = project(ox, oy, s);
  return [
    [x, y],
    [x + 54, y],
    [x + 54, y + 40],
    [x, y + 40],
  ]
    .map(([a, b]) => {
      const [x0, y0] = p(a, b, z0);
      const [x1, y1] = p(a, b, z1);
      return `M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`;
    })
    .join("");
}
