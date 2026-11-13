import { clarityBadge } from "../../scripts/brand/clarity.mjs";
import { THEMES } from "../../scripts/brand/draw.mjs";
import { CLARITY, clarityFor } from "./clarity";

/** A frame's Clarity README badge (scripts/brand/clarity.mjs), worked out from its measurements. */
export function clarityBadgeSvg(frameId: string, theme: "dark" | "light"): string {
  const c = clarityFor(frameId);
  const label = CLARITY.toUpperCase();
  if (c.state === "graded") return clarityBadge(THEMES[theme], { label, letter: c.grade.grade, provisional: !!c.grade.provisional });
  const note = c.state === "none" ? "NOT MEASURED" : c.state === "re-measure" ? "RE-MEASURE" : "NOT COMPARABLE";
  return clarityBadge(THEMES[theme], { label, note });
}

export const svgResponse = (body: string) =>
  new Response(body, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
