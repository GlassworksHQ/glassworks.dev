/**
 * A frame's README banner, banner-frame-<id>-on-dark.svg and -on-light.svg: the part banner with the
 * frame's own device in the cell, drawn from its frame.json (vendor/s1-unleashed/frames/<id>/design):
 *
 *   model    the device, standing, at the stack's angle: body size and radius, the screen (the given
 *            box, or the face less the bezel), a faint sheen for a mirror finish. The screen shows the
 *            stack's six cells, two of them lit: 3 × 2 in landscape, 2 × 3 in portrait.
 *   name     the title; `brand`, the maker's part at its start, is set light and the rest bold.
 *   id       frames/<id>, in mono.
 *   tagline  the line under it, at most 50 characters.
 *
 * The light is neutral glass: a frame is hardware, the bottom plate of the stack. Sky to violet only
 * on the two lit cells (the panes); no ember (Kiln's), no status colour.
 *
 * generate.mjs writes one per frame with a tagline into public/brand/, and the site's build checks
 * the committed files still match (src/lib/frameBanners.ts), so moving the submodule pin without
 * running `pnpm brand` fails the build. A name or tagline that doesn't fit fails too.
 */
import { BW, CELL, TX, partBanner } from "./banner.mjs";
import { C, S, guide } from "./draw.mjs";
import { measure } from "./text.mjs";

const BH = 180;
const NS = 'vector-effect="non-scaling-stroke"';
const RIGHT = BW - 24; // nothing on the right may pass this x
const fix = (n, d) => {
  const s = n.toFixed(d);
  return /^-0\.0+$/.test(s) ? s.slice(1) : s;
};
const f2 = (n) => fix(n, 2);
const f6 = (n) => fix(n, 6);

/** [light part, bold part] of the title: `brand` and the rest of `name`. Without `brand`, all bold. */
export function splitName(f) {
  if (!f.brand) return [f.name, undefined];
  if (!f.name.startsWith(`${f.brand} `)) throw new Error(`${f.id}: brand "${f.brand}" must start name "${f.name}", followed by a space`);
  return [f.brand, f.name.slice(f.brand.length + 1)];
}

/** The screen in body mm: the given box when it is smaller than the face, else the face less the bezel. */
export function screenBox(m) {
  const W = m.body.width;
  const H = m.body.height;
  if (m.screen.width && m.screen.width < W && m.screen.height < H) return { x: (W - m.screen.width) / 2, y: m.screen.top, w: m.screen.width, h: m.screen.height, r: m.screen.radius };
  return { x: m.bezel, y: m.bezel, w: W - 2 * m.bezel, h: H - 2 * m.bezel, r: m.screen.radius };
}

/** The stack's six cells on the screen, two lit. */
export function dashboard(t, sc, lit = [0, 4]) {
  const [cols, rows] = sc.w > sc.h ? [3, 2] : [2, 3];
  const pad = Math.min(sc.w, sc.h) * 0.07;
  const cw = (sc.w - pad * (cols + 1)) / cols;
  const ch = (sc.h - pad * (rows + 1)) / rows;
  const r = Math.min(cw, ch) * 0.1;
  let out = "";
  for (let i = 0; i < cols * rows; i++) {
    const box = `x="${f2(sc.x + pad + (i % cols) * (cw + pad))}" y="${f2(sc.y + pad + Math.floor(i / cols) * (ch + pad))}" width="${f2(cw)}" height="${f2(ch)}" rx="${f2(r)}"`;
    out += lit.includes(i)
      ? `<rect ${box} fill="url(#lit)" fill-opacity=".9"/>`
      : `<rect ${box} fill="${t.fg}" fill-opacity=".08" stroke="${t.fg}" stroke-opacity=".3" stroke-width=".5" ${NS}/>`;
  }
  return out;
}

/** The device standing: its face on the plane facing down-left, its depth stepped back up-right,
 *  fitted in the cell, with guides through the face's corners. */
function device(t, m) {
  const W = m.body.width;
  const H = m.body.height;
  const R = m.body.radius;
  const D = Math.max(m.body.depth, 4);
  const s = Math.min(210 / (C * (W + D)), 128 / (S * W + H + S * D));
  const dw = C * (W + D) * s;
  const dh = (S * W + H + S * D) * s;
  const ox = (CELL - dw) / 2 + C * D * s; // the face's top-left corner
  const oy = (BH - dh) / 2 + S * D * s;
  const face = (dx, dy) => `matrix(${f6(C * s)} ${f6(S * s)} 0 ${f6(s)} ${f2(ox + dx)} ${f2(oy + dy)})`;
  const body = `width="${W}" height="${H}" rx="${R}"`;
  const steps = Math.ceil(D * s * 2);
  let slab = "";
  for (let i = steps; i >= 1; i--) {
    const k = (i / steps) * D * s;
    slab += `<g transform="${face(C * k, -S * k)}"><rect ${body} fill="${t.bg}" stroke="${t.fg}" stroke-opacity="${i === steps ? 0.5 : 0}" stroke-width=".6" ${NS}/></g>`;
  }
  slab += `<g transform="${face(C * D * s, -S * D * s)}"><rect ${body} fill="${t.fg}" fill-opacity=".1"/></g>`;
  const mirror = m.finish === "mirror";
  const sc = screenBox(m);
  const front =
    `<g transform="${face(0, 0)}">` +
    `<rect ${body} fill="${t.bg}" stroke="${t.fg}" stroke-opacity=".75" stroke-width=".8" ${NS}/>` +
    (mirror ? `<rect ${body} fill="${t.fg}" fill-opacity=".05"/>` : "") +
    `<rect x="${f2(sc.x)}" y="${f2(sc.y)}" width="${f2(sc.w)}" height="${f2(sc.h)}" rx="${sc.r}" fill="${t.fg}" fill-opacity="${mirror ? 0.04 : 0.07}" stroke="${t.fg}" stroke-opacity=".4" stroke-width=".5" ${NS}/>` +
    dashboard(t, sc) +
    `</g>`;
  const lx = ox;
  const rx = ox + C * W * s;
  const by = oy + H * s;
  const bry = oy + S * W * s + H * s;
  const o = { w: 0.8, dash: "5 4" };
  const g =
    guide(`M0 ${f2(oy)}H${CELL}M0 ${f2(bry)}H${CELL}`, t, { ...o, op: 0.26 }) +
    guide(`M${f2(lx)} 0V${BH}M${f2(rx)} 0V${BH}`, t, { ...o, op: 0.22 }) +
    guide(
      `M${f2(lx - 200 * C)} ${f2(oy - 200 * S)}L${f2(lx + 400 * C)} ${f2(oy + 400 * S)}M${f2(lx - 200 * C)} ${f2(by - 200 * S)}L${f2(lx + 400 * C)} ${f2(by + 400 * S)}`,
      t,
      { ...o, op: 0.2 },
    );
  return g + slab + front;
}

/** Throws unless the frame's words fit the banner: partBanner shrinks the title to 20 px, no further. */
function checkFit(f, [nameA, nameB], code) {
  const title = (size) =>
    nameB
      ? measure(nameA, { font: "light", size, ls: -0.6 }) + 9 + measure(nameB, { font: "semibold", size, ls: -0.6 })
      : measure(nameA, { font: "semibold", size, ls: -0.6 });
  if (title(20) > RIGHT - TX) throw new Error(`${f.id}: the name "${f.name}" doesn't fit the banner even at 20 px`);
  for (const [what, w] of [
    ["tagline", measure(f.tagline, { size: 11.5 })],
    ["frames/<id> line", measure(code, { font: "mono", size: 12 })],
  ]) {
    if (TX + 1 + w > RIGHT) throw new Error(`${f.id}: the ${what} runs ${(TX + 1 + w - RIGHT).toFixed(1)} px past the banner's edge; shorten it`);
  }
}

/** The banner for frame `f` (its frame.json) in theme `t` (draw.mjs THEMES). */
export function frameBanner(t, f) {
  if (!f.tagline) throw new Error(`${f.id}: no "tagline" in frame.json`);
  const name = splitName(f);
  const code = `frames/${f.id}`;
  checkFit(f, name, code);
  return partBanner(t, "frame", `${f.name}, a Glassworks frame`, device(t, f.model), {
    kicker: "GLASSWORKS · FRAME",
    nameA: name[0],
    nameB: name[1],
    code,
    desc: f.tagline,
  });
}
