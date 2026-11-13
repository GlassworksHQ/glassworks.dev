import fs from "node:fs";
import path from "node:path";
import type { FrameDesign, Stage } from "@glassworks/frame-card";

/*
 * The frame catalog: every `frames/<id>/design/frame.json` in the main repo, read at build time from
 * the pinned submodule (vendor/s1-unleashed). Kiln reads the same files, and the card that draws them
 * is the same package, so the site, Kiln and the data can't drift. A new frame there appears here
 * when the submodule's pin moves; nothing is written by hand in this repo.
 */
const FRAMES = path.join(process.cwd(), "vendor/s1-unleashed/frames");

/** Kiln's site: a frame's `kiln` route is relative to it. */
export const KILN = "https://kiln.glassworks.dev";

/* shipping stages first, then the planned ones; by name within a stage */
const ORDER: Record<Stage, number> = { stable: 0, beta: 1, alpha: 2, development: 3, planned: 4 };

function read(id: string): FrameDesign {
  const file = path.join(FRAMES, id, "design", "frame.json");
  const f = JSON.parse(fs.readFileSync(file, "utf8")) as FrameDesign;
  if (f.id !== id) throw new Error(`${file}: id "${f.id}" isn't its folder's name "${id}"`);
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
 * Where to install it, and whether that is Kiln: `install.href` while it installs from somewhere
 * else (the S1's is s1.edm.sh for now), else Kiln's page for the frame, once it installs from Kiln.
 */
export function installLink(f: FrameDesign): { href: string; kiln: boolean } | undefined {
  if (f.install.href) return { href: f.install.href, kiln: false };
  return f.kiln ? { href: KILN + f.kiln, kiln: true } : undefined;
}
