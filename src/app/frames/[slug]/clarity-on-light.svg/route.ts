import { frameById, frames } from "@/lib/frames";

/* The frame's Clarity badge for a README, on light: the letter is worked out here, never stored there. */
export function generateStaticParams() {
  return frames.map((f) => ({ slug: f.id }));
}

export async function GET(_req: Request, { params }: RouteContext<"/frames/[slug]/clarity-on-light.svg">) {
  const { slug } = await params;
  if (!frameById(slug)) return new Response("Not found", { status: 404 });
  // loaded here, not at the top: an unknown id answers 404 without reading the badge's fonts
  const { clarityBadgeSvg, svgResponse } = await import("@/lib/clarityBadge");
  return svgResponse(clarityBadgeSvg(slug, "light"));
}
