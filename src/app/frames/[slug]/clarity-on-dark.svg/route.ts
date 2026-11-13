import { clarityBadgeSvg, svgResponse } from "@/lib/clarityBadge";
import { frameById, frames } from "@/lib/frames";

/* The frame's Clarity badge for a README, on dark: the letter is worked out here, never stored there. */
export function generateStaticParams() {
  return frames.map((f) => ({ slug: f.id }));
}

export async function GET(_req: Request, { params }: RouteContext<"/frames/[slug]/clarity-on-dark.svg">) {
  const { slug } = await params;
  if (!frameById(slug)) return new Response("Not found", { status: 404 });
  return svgResponse(clarityBadgeSvg(slug, "dark"));
}
