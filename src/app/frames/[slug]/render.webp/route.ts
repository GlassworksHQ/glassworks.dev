import fs from "node:fs";
import path from "node:path";
import { FRAMES, frameById, frames } from "@/lib/frames";

/*
 * The frame's render for its card and page (frame.json `render`, made in the main repo by
 * tools/showcase/render.mjs): served from the pinned submodule at build time, never copied here.
 */
export function generateStaticParams() {
  return frames.filter((f) => f.render).map((f) => ({ slug: f.id }));
}

export async function GET(_req: Request, { params }: RouteContext<"/frames/[slug]/render.webp">) {
  const { slug } = await params;
  const f = frameById(slug);
  if (!f?.render) return new Response("Not found", { status: 404 });
  const body = new Uint8Array(fs.readFileSync(path.join(FRAMES, f.id, "design", f.render)));
  return new Response(body, { headers: { "content-type": "image/webp", "cache-control": "public, max-age=3600" } });
}
