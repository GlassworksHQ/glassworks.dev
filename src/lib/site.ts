export const links = {
  org: "https://github.com/GlassworksHQ",
  s1: "https://github.com/aguilaair/aqara-s1-unleashed",
  s1Install: "https://s1.edm.sh",
} as const;

export type Status = "works" | "planned" | "experimental";

export const frames: {
  name: string;
  project: string;
  detail: string;
  status: Status;
  ratio: "wide" | "square";
}[] = [
  {
    name: "Aqara S1 Plus",
    project: "S1 Unleashed",
    detail: "The reference frame. Root over FEL, Zigbee and Thread radio, wall base.",
    status: "works",
    ratio: "wide",
  },
  {
    name: "Sonoff NSPanel Pro",
    project: "and its T6E rebadges",
    detail: "Same EFR32MG21 radio on a UART. ADB root, no boot patching.",
    status: "planned",
    ratio: "square",
  },
  {
    name: "Generic Android",
    project: "tablets, old phones",
    detail: "Core, Assist, Sendspin and the Android sensors. No root needed.",
    status: "experimental",
    ratio: "wide",
  },
];

export type PaneId = "assist" | "timers" | "sendspin" | "radio" | "sensors" | "base";

export const panes: { id: PaneId; name: string; does: string; requires: string }[] = [
  { id: "assist", name: "Assist", does: "Wake word, the Assist pipeline and a voice overlay.", requires: "A microphone" },
  { id: "timers", name: "Timers", does: "Voice timers on the dashboard.", requires: "Assist" },
  { id: "sendspin", name: "Sendspin", does: "A synced Music Assistant player.", requires: "Nothing" },
  {
    id: "radio",
    name: "Zigbee / Thread radio",
    does: "Coordinator, router or Thread border router for ZHA, Z2M and OTBR.",
    requires: "A Silicon Labs radio",
  },
  { id: "sensors", name: "Android sensors", does: "Presence and ambient light as HA sensors.", requires: "Proximity or light sensor" },
  { id: "base", name: "Wall base", does: "Controls the S1's wired wall base over UART.", requires: "The S1 wall base" },
];
