# Clarity samples

Made-up Clarity summaries (`glassworks.perf-summary/2`, protocol 3), for working on the site's Clarity
panel, catalog line and README badge before a frame has its own `frames/<id>/design/clarity.json`.
They are not measurements. The numbers in `sample/` are modelled on the S1's s1v6 run in the main
repo's docs/perf.md.

```sh
CLARITY_FIXTURES=tests/clarity/sample pnpm dev   # the S1 grades A, Generic Android B, the Mirror has none
CLARITY_FIXTURES=tests/clarity/edge pnpm dev     # the S1 provisional (a run missing, heavy live updates not measured), Generic Android re-measure
```

A frame's real `clarity.json` always wins over a sample, and the samples are ignored on Vercel.
