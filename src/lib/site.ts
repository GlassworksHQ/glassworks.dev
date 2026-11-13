import type { PANE_IDS } from "@glassworks/frame-card";

/** The site's own origin, for anything that leaves it: README snippets, metadata. */
export const SITE = "https://www.glassworks.dev";

/**
 * A README image that follows GitHub's theme: `src` is the image's URL without -on-dark.svg /
 * -on-light.svg, `href` where it links.
 */
export const readmeImage = ({ href, src, alt, size }: { href: string; src: string; alt: string; size: string }) => `<a href="${href}">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${src}-on-dark.svg">
    <img alt="${alt}" src="${src}-on-light.svg" ${size}>
  </picture>
</a>`;

export const links = {
  org: "https://github.com/GlassworksHQ",
  s1: "https://github.com/GlassworksHQ/aqara-s1-unleashed",
} as const;

/** The panes a frame.json rates, from the shared package, so a new pane can't be missed here. */
export type PaneId = (typeof PANE_IDS)[number];

/**
 * Panes. `frame` marks a frame pane: one that belongs to a single device (its
 * folder lives in that frame), like the S1's wall base. The rest run anywhere
 * their hardware is, and make up the pane catalog.
 */
export type Pane = { id: PaneId; name: string; does: string; requires: string; frame?: string };

export const panes: Pane[] = [
  { id: "assist", name: "Assist", does: "Wake word and voice overlay.", requires: "Microphone and speaker" },
  { id: "timers", name: "Timers", does: "Voice timers on screen.", requires: "Assist" },
  { id: "sendspin", name: "Sendspin", does: "Synced Music Assistant player.", requires: "Speaker" },
  {
    id: "radio",
    name: "Zigbee / Thread radio",
    does: "Zigbee coordinator or router, Thread border router.",
    requires: "Silicon Labs radio",
  },
  { id: "sensors", name: "Android sensors", does: "Presence and light as HA sensors.", requires: "Proximity or light sensor" },
  { id: "base", name: "Wall base", does: "The S1's wired wall base.", requires: "S1 wall base", frame: "aqara-s1-plus" },
];

export const generalPanes = panes.filter((p) => !p.frame);
export const framePanes = panes.filter((p) => p.frame);
