import { RATING_KEYS, ships as stageShips, type RatingKey, type Support } from "@glassworks/frame-card";

/*
 * The site's words for a frame's data. The data itself is each frame's `frame.json` in the main repo
 * (src/lib/frames.ts); its types, the card's tags and the stage names come from
 * @glassworks/frame-card. What's here is how the site's tables and frame pages say it: the nine
 * install ratings, pane support, and the difficulty legend. "unknown" always reads "Not checked".
 */

export type { RatingKey, Support };

/** Installable, or runs, now: a frame's stage or a pane's support that is alpha, beta or stable. */
export const ships = (s: Support) => s !== "depends" && s !== "unknown" && s !== "no" && stageShips(s);

/*
 * What installing does to a device, rated on fixed scales so devices compare at a
 * glance. Every device has every field; "unknown" shows as "Not checked".
 */
export const ratingFields = {
  difficulty: {
    label: "Difficulty",
    options: {
      preinstalled: "Pre-installed",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    },
  },
  reversible: {
    label: "Reversible",
    options: { yes: "Yes", partly: "Partly", no: "No" },
  },
  modifiesAndroid: {
    label: "Modifies Android",
    options: { yes: "Yes", no: "No" },
  },
  root: {
    label: "Root",
    options: {
      required: "Required",
      already: "Already there",
      none: "Not needed",
    },
  },
  opensDevice: { label: "Opens the device", options: { yes: "Yes", no: "No" } },
  vendorApps: {
    label: "Vendor apps",
    options: {
      kept: "Kept",
      disabled: "Disabled",
      partly: "Partly stopped",
      removed: "Removed",
    },
  },
  wipes: { label: "Wipes the device", options: { yes: "Yes", no: "No" } },
  backup: {
    label: "Backup",
    options: {
      automatic: "Automatic",
      manual: "Manual",
      none: "Not needed",
      unavailable: "Not possible",
      planned: "Planned",
    },
  },
  updates: {
    label: "Updates",
    options: {
      ha: "Through Home Assistant",
      manual: "Manual",
      planned: "Planned",
    },
  },
} as const;

export const ratingKeys = RATING_KEYS;

export const difficultyHelp: { name: string; means: string }[] = [
  { name: "Pre-installed", means: "The device ships with Glassworks." },
  {
    name: "Easy",
    means: "Install from the browser or as an app. The device stays closed.",
  },
  {
    name: "Medium",
    means: "You open the device, for a screw or a hidden button. No soldering.",
  },
  { name: "Hard", means: "Soldering, test pads or a UART adapter." },
];

/** Only answers worth a warning get colour: a harder install, or one you can't fully undo. */
export type Severity = "caution" | "warn" | undefined;

export function severity(key: RatingKey, value: string): Severity {
  if (key === "difficulty")
    return value === "hard"
      ? "warn"
      : value === "medium"
        ? "caution"
        : undefined;
  if (key === "reversible")
    return value === "no" ? "warn" : value === "partly" ? "caution" : undefined;
  if (key === "wipes") return value === "yes" ? "warn" : undefined;
  if (key === "backup") return value === "unavailable" ? "warn" : undefined;
  return undefined;
}

export function ratingText(key: RatingKey, value: string) {
  if (value === "unknown") return "Not checked";
  return (ratingFields[key].options as Record<string, string>)[value] ?? value;
}

export const supportText: Record<Support, string> = {
  development: "In development",
  alpha: "Alpha",
  beta: "Beta",
  stable: "Stable",
  planned: "Planned",
  depends: "Depends",
  unknown: "Not checked",
  no: "No",
};
