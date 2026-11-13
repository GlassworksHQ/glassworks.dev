/**
 * The Clarity badge, for a frame's README: CLARITY and the seal (the lens ring in the room's light,
 * the grade inside it), on the same field as the info badges. Without a grade: a dashed seal and why
 * (NOT MEASURED, RE-MEASURE). A provisional grade says PROVISIONAL in the status amber.
 *
 * The site serves one per frame, worked out from the frame's clarity.json at build time
 * (src/app/frames/[slug]/clarity-on-*.svg), so a README links the badge and never stores the letter.
 */
import { measure, text } from "./text.mjs";
import { field, svg } from "./draw.mjs";

const CAPS = { font: "medium", size: 9.5, ls: 1.5 };
const CAPS_B = { font: "semibold", size: 9.5, ls: 1.5 };
const WORKING = { dark: "#fbbf24", light: "#b45309" };

/** The seal at (cx, 15), radius r: ring, glint and letter; dashed and empty without a letter */
function seal(t, cx, r, letter) {
  if (!letter) {
    return `<circle cx="${cx}" cy="15" r="${r}" fill="none" stroke="${t.mu}" stroke-opacity=".7" stroke-width="1.1" stroke-dasharray="1.6 1.6"/>`;
  }
  const gr = r * 0.74;
  const g = (a) => [cx + gr * Math.cos(a), 15 + gr * Math.sin(a)].map((v) => v.toFixed(2)).join(" ");
  const size = letter.length > 1 ? 9 : 10.5;
  return (
    `<circle cx="${cx}" cy="15" r="${r}" fill="url(#litHaze)"/>` +
    `<circle cx="${cx}" cy="15" r="${r}" fill="none" stroke="url(#lit)" stroke-width="1.8"/>` +
    `<path d="M${g(Math.PI * 1.13)} A ${gr.toFixed(2)} ${gr.toFixed(2)} 0 0 1 ${g(Math.PI * 1.37)}" fill="none" stroke="url(#lit)" stroke-width="1.2" stroke-linecap="round"/>` +
    text(letter, { font: "semibold", size, x: cx + (letter.length > 1 ? 0.4 : 0.2), y: 15 + size * 0.36, fill: t.fg, anchor: "middle" })
  );
}

/**
 * @param t a theme from draw.mjs
 * @param {{ letter?: string | null, note?: string | null, provisional?: boolean, label?: string }} o
 *   letter: the grade, or null; note: why there's no letter (NOT MEASURED, RE-MEASURE)
 */
export function clarityBadge(t, { letter = null, note = null, provisional = false, label = "CLARITY" } = {}) {
  const x = 12;
  const r = 10;
  const cx = x + measure(label, CAPS) + 9 + r;
  let w = cx + r + 6;
  let inner = text(label, { ...CAPS, x, y: 19, fill: t.mu }) + seal(t, cx, r, letter);
  const after = !letter ? note : provisional ? "PROVISIONAL" : null;
  if (after) {
    inner += text(after, { ...CAPS_B, x: w + 3, y: 19, fill: letter ? WORKING[t.name] : t.mu });
    w += 3 + measure(after, CAPS_B) + 13;
  } else {
    w += 4;
  }
  const title = letter ? `${label.toLowerCase()}: ${letter}${provisional ? " (provisional)" : ""}` : `${label.toLowerCase()}: ${(note ?? "").toLowerCase()}`;
  return svg(w, 30, title, field(w, 30, t, 15, inner), t);
}
