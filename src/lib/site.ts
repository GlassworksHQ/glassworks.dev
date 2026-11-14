import { PANES, capabilityText } from "@glassworks/frame-card";

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
  s1: "https://github.com/GlassworksHQ/glassworks",
  /** the project's public email (maintainer, 2026-11-13) */
  contact: "mailto:hi@glassworks.dev",
} as const;

/** A pane's id: the app's (the main repo's pane.json files). */
export type PaneId = string;

/**
 * Panes, from the main repo's pane catalog (@glassworks/frame-card `PANES`: each pane's pane.json and
 * icon.svg, issue 231), so a new pane appears here when the submodule's pin moves. `frame` marks a frame
 * pane: one that belongs to a single device, like the S1's wall base. The rest run anywhere their
 * hardware is. `requires` is said in words; `icon` is the pane's SVG.
 */
export type Pane = { id: PaneId; name: string; does: string; requires: string; frame?: string; icon: string };

const sentence = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const panes: Pane[] = PANES.map((p) => ({
  id: p.id,
  name: p.name,
  does: p.does,
  requires: p.requires.length ? sentence(capabilityText(p.requires)) : "Nothing special",
  frame: p.frame,
  icon: p.icon,
}));

export const generalPanes = panes.filter((p) => !p.frame);
export const framePanes = panes.filter((p) => p.frame);
