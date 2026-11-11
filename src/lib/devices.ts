import type { ModelShape } from "@/components/DeviceModel";
import type { PaneId } from "./site";

/*
 * The device catalog. One entry per frame, current or planned.
 * Only state what's known: S1 facts come from S1 Unleashed. Planned devices say
 * "Not checked" for anything nobody has confirmed on real hardware.
 */

export type DeviceStatus = "works" | "planned";
export type Support = "works" | "planned" | "depends" | "unknown" | "no";

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

export type RatingKey = keyof typeof ratingFields;
export const ratingKeys = Object.keys(ratingFields) as RatingKey[];

export type Rating<K extends RatingKey> = {
  value: keyof (typeof ratingFields)[K]["options"] | "unknown";
  detail?: string;
};
export type Ratings = { [K in RatingKey]: Rating<K> };

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
  return undefined;
}

export function ratingText(key: RatingKey, value: string) {
  if (value === "unknown") return "Not checked";
  return (ratingFields[key].options as Record<string, string>)[value];
}

/** The three answers people ask first, phrased to stand alone on a card. */
export function cardTags(r: Ratings) {
  const tags: {
    key: RatingKey;
    value: string;
    text: string;
    severity: Severity;
  }[] = [];
  const d = r.difficulty.value;
  if (d !== "unknown")
    tags.push({
      key: "difficulty",
      value: d,
      text:
        d === "preinstalled"
          ? "Pre-installed"
          : `${ratingText("difficulty", d)} install`,
      severity: severity("difficulty", d),
    });
  const rev = r.reversible.value;
  if (rev !== "unknown")
    tags.push({
      key: "reversible",
      value: rev,
      text:
        rev === "yes"
          ? "Reversible"
          : rev === "partly"
            ? "Partly reversible"
            : "Not reversible",
      severity: severity("reversible", rev),
    });
  const m = r.modifiesAndroid.value;
  if (m !== "unknown")
    tags.push({
      key: "modifiesAndroid",
      value: m,
      text: m === "yes" ? "Modifies Android" : "Android untouched",
      severity: undefined,
    });
  return tags;
}

export type Device = {
  slug: string;
  name: string;
  aka?: string;
  status: DeviceStatus;
  /** Form factor for the 3D mockup. */
  shape: ModelShape;
  summary: string;
  project?: { name: string; href: string };
  specs: { label: string; value: string }[];
  panes: Record<PaneId, { support: Support; note?: string }>;
  install: { how: string; href?: string };
  ratings: Ratings;
  ratingsNote?: string;
  unverified?: boolean;
};

export const supportText: Record<Support, string> = {
  works: "Works",
  planned: "Planned",
  depends: "Depends",
  unknown: "Not checked",
  no: "No",
};

export const devices: Device[] = [
  {
    slug: "aqara-s1",
    name: "Aqara S1 Plus",
    status: "works",
    shape: "s1",
    summary:
      "The reference frame. Every pane runs on it, including the Zigbee/Thread radio and the wall base.",
    project: {
      name: "S1 Unleashed",
      href: "https://github.com/aguilaair/aqara-s1-unleashed",
    },
    specs: [
      { label: "SoC", value: "Allwinner A133" },
      { label: "Size", value: "172 × 86 mm; 42 mm deep with the in-wall box" },
      { label: "Screen", value: "1440 × 720" },
      { label: "Radio", value: "EFR32MG21 on SPI, RCP firmware" },
      { label: "Presence", value: "VI5300 time-of-flight sensor" },
      { label: "Audio", value: "Microphone and speaker" },
      { label: "Extras", value: "Wired wall base on a UART" },
      { label: "Root", value: "FEL, then a patched boot image" },
    ],
    panes: {
      assist: { support: "works" },
      timers: { support: "works" },
      sendspin: { support: "works" },
      radio: {
        support: "works",
        note: "Zigbee coordinator or router, and Thread.",
      },
      sensors: {
        support: "works",
        note: "Presence from the time-of-flight sensor.",
      },
      base: { support: "works" },
    },
    install: {
      how: "In the browser, over USB. It backs the panel up first, then roots and flashes it.",
      href: "https://s1.edm.sh",
    },
    ratings: {
      difficulty: {
        value: "medium",
        detail: "Browser install, but the back cover comes off",
      },
      reversible: {
        value: "yes",
        detail: "Restores the original software from the backup",
      },
      modifiesAndroid: {
        value: "yes",
        detail: "Boot image patched, verified boot off",
      },
      root: { value: "required", detail: "Magisk and a root helper" },
      opensDevice: { value: "yes", detail: "To reach the FEL button" },
      vendorApps: { value: "disabled", detail: "Aqara's apps stay installed" },
      wipes: { value: "no" },
      backup: { value: "automatic", detail: "Before anything is written" },
      updates: { value: "ha" },
    },
    ratingsNote:
      "Without root, the app can install over adb on its own, but you lose the radio modes.",
  },
  {
    slug: "smart-mirror",
    name: "Smart mirror",
    aka: "Android fitness and smart mirrors on a floor stand",
    status: "planned",
    shape: "mirror",
    summary:
      "A portrait screen behind a two-way mirror. The dashboard shows through a full-length mirror.",
    specs: [
      { label: "Screen", value: "Portrait, behind a two-way mirror" },
      { label: "Android", value: "Not checked" },
      { label: "Presence", value: "Not checked" },
      { label: "Audio", value: "Not checked" },
      { label: "Root", value: "Not checked" },
    ],
    panes: {
      assist: { support: "unknown", note: "Needs a microphone." },
      timers: { support: "unknown", note: "Needs Assist." },
      sendspin: { support: "unknown", note: "Needs a speaker." },
      radio: { support: "unknown", note: "Needs a supported radio." },
      sensors: { support: "unknown" },
      base: { support: "no", note: "S1 only." },
    },
    install: {
      how: "Not installable yet. Which mirrors, and how they install, isn't settled.",
    },
    ratings: {
      difficulty: { value: "unknown" },
      reversible: { value: "unknown" },
      modifiesAndroid: { value: "unknown" },
      root: { value: "unknown" },
      opensDevice: { value: "unknown" },
      vendorApps: { value: "unknown" },
      wipes: { value: "unknown" },
      backup: { value: "planned" },
      updates: { value: "planned" },
    },
    unverified: true,
  },
  {
    slug: "generic-android",
    name: "Generic Android",
    aka: "Tablets, old phones, other Android panels",
    status: "planned",
    shape: "tablet",
    summary: "Core plus the panes that need no special hardware. No root.",
    specs: [
      { label: "Radio", value: "None" },
      { label: "Presence", value: "Whatever sensors the device has" },
      { label: "Audio", value: "Whatever the device has" },
      { label: "Root", value: "Not needed" },
    ],
    panes: {
      assist: { support: "depends", note: "Needs a microphone." },
      timers: { support: "depends", note: "Needs Assist." },
      sendspin: { support: "planned" },
      radio: { support: "no", note: "No supported radio." },
      sensors: {
        support: "depends",
        note: "Needs a proximity or light sensor.",
      },
      base: { support: "no", note: "S1 only." },
    },
    install: {
      how: "Not installable yet. Will install as a normal app.",
    },
    ratings: {
      difficulty: { value: "easy", detail: "Install an app" },
      reversible: { value: "yes", detail: "Uninstall the app" },
      modifiesAndroid: { value: "no" },
      root: { value: "none" },
      opensDevice: { value: "no" },
      vendorApps: { value: "kept" },
      wipes: { value: "no" },
      backup: { value: "none" },
      updates: { value: "planned" },
    },
  },
];

export const deviceBySlug = (slug: string) =>
  devices.find((d) => d.slug === slug);
