# Clarity samples

Clarity summaries (`glassworks.perf-summary/3`, Clarity v2, protocol 2) for working on the site's
Clarity panel, catalog line and README badge on frames that don't have their own
`frames/<id>/clarity/clarity.json` yet. `node tests/clarity/regenerate.mjs` rebuilds them from the
S1's real summary in the pinned submodule (s1rtc10, measured 2026-11-15). Only the S1's copy is a
measurement; the others are its numbers with one or two values changed, and say which.

| File | What | Shows |
|---|---|---|
| `sample/aqara-s1-plus.json` | The S1's real summary, unchanged | D (the real one in the submodule wins) |
| `sample/generic-android.json` | The S1's, with typical without a camera blocked for 413 ms | C |
| `edge/generic-android.json` | The S1's, with a run missing, heavy's live updates not measured, cameras over adb, and typical without a camera blocked for 600.4 ms (poor: it must not read as 600) | D, provisional, the transport caveat |
| `edge/lululemon-mirror.json` | The S1's Clarity v1 summary (s1rtc9, `glassworks.perf-summary/2`), kept as it was | Re-measure: "measured with Clarity v1; these rules are Clarity v2's" |

```sh
CLARITY_FIXTURES=tests/clarity/sample pnpm dev   # Generic Android C, the Mirror has none
CLARITY_FIXTURES=tests/clarity/edge pnpm dev     # Generic Android provisional with the caveat, the Mirror re-measure
```

A frame's real `clarity.json` always wins over a sample, and the samples are ignored on Vercel.
