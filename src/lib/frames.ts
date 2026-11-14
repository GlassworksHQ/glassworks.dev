import fs from "node:fs";
import path from "node:path";
import { PANE_IDS, RATING_KEYS, type FrameDesign, type Stage } from "@glassworks/frame-card";

/*
 * The frame catalog: every `frames/<id>/design/frame.json` in the main repo, read at build time from
 * the pinned submodule (vendor/s1-unleashed). Kiln reads the same files, and the card that draws them
 * is the same package, so the site, Kiln and the data can't drift. A new frame there appears here
 * when the submodule's pin moves; nothing is written by hand in this repo.
 */
export const FRAMES = path.join(process.cwd(), "vendor/s1-unleashed/frames");

/** Kiln's site: a frame's `kiln` route is relative to it. */
export const KILN = "https://kiln.glassworks.dev";

/* shipping stages first, then the planned ones; by name within a stage */
const ORDER: Record<Stage, number> = { stable: 0, beta: 1, alpha: 2, development: 3, planned: 4 };

/*
 * frame.json comes from another repo, so the fields every page relies on are checked when it is read:
 * a bad file fails the build here, naming the file, instead of crashing a page later.
 */
function check(file: string, f: FrameDesign, id: string) {
  const bad = (why: string) => {
    throw new Error(`${file}: ${why} (format: vendor/s1-unleashed/frames/README.md)`);
  };
  if (f.id !== id) bad(`id "${f.id}" isn't its folder's name "${id}"`);
  if (!(f.status in ORDER)) bad(`status "${f.status}" isn't one of ${Object.keys(ORDER).join(", ")}`);
  for (const p of PANE_IDS) if (!f.panes?.[p]?.support) bad(`panes.${p} is missing`);
  for (const r of RATING_KEYS) if (!f.ratings?.[r]?.value) bad(`ratings.${r} is missing`);
  // a route on Kiln: resolved against it, it must stay there ("//host/x" or "/\\host" would leave)
  if (f.kiln && (!f.kiln.startsWith("/") || new URL(f.kiln, KILN).origin !== new URL(KILN).origin)) {
    bad(`kiln "${f.kiln}" should be a route on ${KILN}, starting with a single /`);
  }
  if (f.install?.href && !/^https?:\/\//.test(f.install.href)) bad(`install.href "${f.install.href}" should be a full URL`);
  // the render is served from /frames/<id>/render.webp: a .webp next to frame.json, nothing else
  if (f.render && (!/^[\w-]+\.webp$/.test(f.render) || !fs.existsSync(path.join(path.dirname(file), f.render)))) {
    bad(`render "${f.render}" should be a .webp file next to frame.json`);
  }
}

function read(id: string): FrameDesign {
  const file = path.join(FRAMES, id, "design", "frame.json");
  const f = JSON.parse(fs.readFileSync(file, "utf8")) as FrameDesign;
  check(file, f, id);
  return f;
}

function load(): FrameDesign[] {
  if (!fs.existsSync(FRAMES)) {
    throw new Error("vendor/s1-unleashed is empty: run `git submodule update --init` first");
  }
  return fs
    .readdirSync(FRAMES, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(FRAMES, e.name, "design", "frame.json")))
    .map((e) => read(e.name))
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.name.localeCompare(b.name, "en"));
}

export const frames: FrameDesign[] = load();

export const frameById = (id: string) => frames.find((f) => f.id === id);

/**
 * Where to install it, and whether that is Kiln: Kiln's page for the frame whenever it installs from
 * Kiln, else `install.href`, the frame's own installer.
 */
export function installLink(f: FrameDesign): { href: string; kiln: boolean } | undefined {
  if (f.kiln) return { href: new URL(f.kiln, KILN).href, kiln: true };
  return f.install.href ? { href: f.install.href, kiln: false } : undefined;
}
