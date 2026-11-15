// Rebuilds the Clarity samples from the S1's real summary in the pinned submodule (read-only there;
// writes tests/clarity/{sample,edge}/*.json). Run from the repo root: node tests/clarity/regenerate.mjs
// The re-measure case (edge/lululemon-mirror.json, the S1's Clarity v1 run s1rtc9) is kept as it is.
import fs from "node:fs";

const real = JSON.parse(fs.readFileSync("vendor/s1-unleashed/frames/aqara-s1-plus/clarity/clarity.json", "utf8"));
const copy = () => structuredClone(real);
const as = (s, id, name) => ({ ...s, frame: { id, name }, report: null, notes: null });
const write = (file, s) => fs.writeFileSync(`tests/clarity/${file}`, JSON.stringify(s, null, 1) + "\n");

// The S1 as measured (s1rtc10): D. A frame's real clarity.json wins over this copy.
write("sample/aqara-s1-plus.json", real);

// Generic Android, made up: the S1's numbers with typical without a camera blocked for 413 ms
// (needs-improvement, which fluid accepts): C.
const c = as(copy(), "generic-android", "Generic Android");
c.pages["typical-nocam"].blocking_ms = 412.7;
write("sample/generic-android.json", c);

// Generic Android, made up, provisional: a run missing, heavy's live updates not measured, the
// cameras over adb (the transport caveat), and typical without a camera blocked for 600.4 ms, which
// is poor (above 600 ms) and must read as 600.4, not 600.
const e = as(copy(), "generic-android", "Generic Android");
e.runs = { attempted: 3, graded: 2 };
e.gaps = ["1 of 3 graded runs failed or are missing"];
e.complete = false;
e.pages.heavy.updates = { ...e.pages.heavy.updates, latency_p95_ms: null, latency_median_ms: null, runs: [] };
e.pages["typical-nocam"].blocking_ms = 600.4;
e.webrtc_transport = { transport: "adb", chosen_by: "auto", reason: "the panel couldn't reach this computer over the LAN", possibly_limited: true };
write("edge/generic-android.json", e);
