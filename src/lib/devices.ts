import type { PaneId } from "./site";

/*
 * The device catalog. One entry per frame, current or planned.
 * Only state what's known: S1 facts come from S1 Unleashed; NSPanel Pro facts come
 * from public writeups and are marked unverified until checked on hardware.
 */

export type DeviceStatus = "works" | "planned";
export type Support = "works" | "planned" | "depends" | "unknown" | "no";

export type Device = {
  slug: string;
  name: string;
  aka?: string;
  status: DeviceStatus;
  shape: "wide" | "square";
  summary: string;
  project?: { name: string; href: string };
  specs: { label: string; value: string }[];
  panes: Record<PaneId, { support: Support; note?: string }>;
  install: { how: string; href?: string; cta?: string };
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
    shape: "wide",
    summary: "The reference frame. Every pane runs on it, including the Zigbee/Thread radio and the wall base.",
    project: { name: "S1 Unleashed", href: "https://github.com/aguilaair/aqara-s1-unleashed" },
    specs: [
      { label: "SoC", value: "Allwinner A133" },
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
      radio: { support: "works", note: "Zigbee coordinator or router, and Thread." },
      sensors: { support: "works", note: "Presence from the time-of-flight sensor." },
      base: { support: "works" },
    },
    install: {
      how: "From the browser over USB. The installer roots the panel, backs it up and flashes it.",
      href: "https://s1.edm.sh",
      cta: "Install S1 Unleashed",
    },
  },
  {
    slug: "nspanel-pro",
    name: "Sonoff NSPanel Pro",
    aka: "Also sold as the Zemismart, Avatto and Tuya T6E",
    status: "planned",
    shape: "square",
    summary: "The likely second frame. Same radio chip as the S1, and root without boot patching.",
    specs: [
      { label: "Android", value: "8.1, arm64" },
      { label: "Screen", value: "Square" },
      { label: "Radio", value: "EFR32MG21 on a UART, EZSP firmware" },
      { label: "Presence", value: "Proximity and light sensors" },
      { label: "Audio", value: "Not checked" },
      { label: "Root", value: "adb root (userdebug build)" },
    ],
    panes: {
      assist: { support: "unknown", note: "Needs a microphone." },
      timers: { support: "unknown", note: "Needs Assist." },
      sendspin: { support: "unknown", note: "Needs a speaker." },
      radio: { support: "planned", note: "Zigbee first. Thread needs RCP firmware, later." },
      sensors: { support: "planned" },
      base: { support: "no", note: "S1 only." },
    },
    install: {
      how: "Not installable yet. Needs an arm64 build and a Kiln recipe.",
    },
    unverified: true,
  },
  {
    slug: "generic-android",
    name: "Generic Android",
    aka: "Tablets, old phones, other Android panels",
    status: "planned",
    shape: "wide",
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
      sensors: { support: "depends", note: "Needs a proximity or light sensor." },
      base: { support: "no", note: "S1 only." },
    },
    install: {
      how: "Not installable yet. Will install as a normal app.",
    },
  },
];

export const deviceBySlug = (slug: string) => devices.find((d) => d.slug === slug);
