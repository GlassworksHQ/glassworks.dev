export const links = {
  org: "https://github.com/GlassworksHQ",
  s1: "https://github.com/aguilaair/aqara-s1-unleashed",
  s1Install: "https://s1.edm.sh",
} as const;

export type PaneId = "assist" | "timers" | "sendspin" | "radio" | "sensors" | "base";

export const panes: { id: PaneId; name: string; does: string; requires: string }[] = [
  { id: "assist", name: "Assist", does: "Wake word and voice overlay.", requires: "Microphone" },
  { id: "timers", name: "Timers", does: "Voice timers on screen.", requires: "Assist" },
  { id: "sendspin", name: "Sendspin", does: "Synced Music Assistant player.", requires: "Any panel" },
  {
    id: "radio",
    name: "Zigbee / Thread radio",
    does: "Zigbee coordinator or router, Thread border router.",
    requires: "Silicon Labs radio",
  },
  { id: "sensors", name: "Android sensors", does: "Presence and light as HA sensors.", requires: "Proximity or light sensor" },
  { id: "base", name: "Wall base", does: "The S1's wired wall base.", requires: "S1 wall base" },
];
