import fs from "node:fs";
import path from "node:path";
import { gradeSummary, type Grade, type Rubric, type Summary } from "../../vendor/s1-unleashed/tools/perf/grade";
import rubricJson from "../../vendor/s1-unleashed/tools/perf/page/rubric.json";

/*
 * Clarity, the Glassworks wall-panel performance grade (docs/perf.md in the main repo).
 *
 * A frame stores measurements only: frames/<id>/design/clarity.json, a copy of Clarity's summary
 * (glassworks.perf-summary/2). The letter is never stored. The site works it out at build time with
 * the main repo's own grade function (tools/perf/grade.ts) and rules (tools/perf/page/rubric.json),
 * both from the pinned submodule, so a rule change there re-grades every frame here, and a summary
 * from another measuring protocol shows "Re-measure" instead of a letter.
 */
export const rubric = rubricJson as unknown as Rubric & { name?: string; one_frame_ms: number };
/** The test's name, from rubric.json once it carries one (main repo #158) */
export const CLARITY = rubric.name ?? "Clarity";

type FrameRun = { p95_ms?: number | null; jank_pct?: number | null; frozen_pct?: number | null; fps?: number | null; n?: number | null };
export type Page = {
  inp_ms?: number | null;
  open_ms?: number | null;
  scroll?: { fps?: number | null; p95_ms?: number | null; runs?: FrameRun[] };
  updates?: { latency_p95_ms?: number | null; runs?: { latency_p95_ms?: number | null; frames?: FrameRun | null }[] };
};
/** The summary's fields the site shows, as docs/perf.md "The summary" lists them. */
export type ClaritySummary = Summary & {
  schema?: string;
  measured_on?: string | null;
  app_version?: string | null;
  runs?: { attempted?: number; graded?: number };
  pages?: Record<string, Page>;
  report?: string | null;
  /** not graded; null when not measured (added within /2 by main repo #158) */
  ram?: { idle_app_pss_kb?: number | null; peak_app_pss_kb?: number | null } | null;
  /** not graded; one entry per APK (added within /2 by main repo #158) */
  apk?: { file?: string; abis?: string[]; bytes?: number }[] | null;
};

export type Graded = { state: "graded"; summary: ClaritySummary; grade: Grade };
export type Clarity =
  | { state: "none" }
  | Graded
  | { state: "re-measure" | "not-comparable"; summary: ClaritySummary; grade: Grade };

const FRAMES = path.join(process.cwd(), "vendor/s1-unleashed/frames");

/*
 * Sample summaries for working on the site before any frame has one: CLARITY_FIXTURES=<dir> reads
 * <dir>/<frame id>.json for frames without a clarity.json. Never on Vercel, so a sample can't ship.
 */
const FIXTURES = process.env.VERCEL ? undefined : process.env.CLARITY_FIXTURES;

function read(id: string): ClaritySummary | null {
  const real = path.join(FRAMES, id, "design", "clarity.json");
  const file = fs.existsSync(real) ? real : FIXTURES ? path.join(process.cwd(), FIXTURES, `${id}.json`) : null;
  if (!file || !fs.existsSync(file)) return null;
  const s = JSON.parse(fs.readFileSync(file, "utf8")) as ClaritySummary;
  if (!String(s.schema ?? "").startsWith("glassworks.perf-summary/")) {
    throw new Error(`${file}: not a Clarity summary (schema ${JSON.stringify(s.schema)})`);
  }
  return s;
}

const cache = new Map<string, Clarity>();

/** A frame's Clarity: its summary and the grade worked out from it, or "none" without a summary. */
export function clarityFor(id: string): Clarity {
  if (!cache.has(id)) {
    const summary = read(id);
    if (!summary) cache.set(id, { state: "none" });
    else {
      const grade = gradeSummary(summary, rubric);
      cache.set(id, grade.status === "graded" ? { state: "graded", summary, grade } : { state: grade.status, summary, grade });
    }
  }
  return cache.get(id)!;
}

/* ---------- words ---------- */

export const PAGES = rubric.grade.pages; // light, typical, heavy
export const PAGE_NAME: Record<string, string> = { light: "Light", typical: "Typical", heavy: "Heavy" };
export const TASKS = Object.keys(rubric.grade.tasks); // tap, scroll, updates, load
export const TASK_NAME: Record<string, string> = { tap: "Tap", scroll: "Scroll", updates: "Live updates", load: "Open the view" };
const LEVEL_NAME: Record<string, string> = { premium: "Premium", good: "Good", fluid: "Fluid", "needs-improvement": "Needs improvement", poor: "Poor" };
export const levelName = (v: string | null) => (v ? (v === rubric.grade.below ? "Below fluid" : LEVEL_NAME[v] ?? v) : "Not measured");

/** A level or band as a status: ok (premium, good), mid (fluid, needs improvement), bad, or none */
export function tone(v: string | null | undefined): "ok" | "mid" | "bad" | "none" {
  if (!v) return "none";
  if (v === "premium" || v === "good") return "ok";
  if (v === "fluid" || v === "needs-improvement") return "mid";
  return "bad";
}

/** A page's level; a page measured in full but below every level is `below` (rubric's "slow") */
export function pageLevel(g: Grade, page: string): string | null {
  const lv = g.levels?.[page] ?? null;
  if (lv) return lv;
  const bands = Object.values(g.bands?.[page] ?? {});
  return bands.length && bands.every((b) => b !== null) ? rubric.grade.below : null;
}

export const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
export const ms = (v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);

/** A task's measured value on a page, for the table */
export function measured(page: Page | undefined, task: string): string | null {
  if (!page) return null;
  if (task === "tap") return page.inp_ms == null ? null : ms(page.inp_ms);
  if (task === "load") return page.open_ms == null ? null : ms(page.open_ms);
  if (task === "scroll") return page.scroll?.fps == null ? null : `${page.scroll.fps} fps`;
  return page.updates?.latency_p95_ms == null ? null : ms(page.updates.latency_p95_ms);
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};

/**
 * What a task that holds the grade back has to do, in plain words, and where it is now. From
 * rubric.json: the task's lowest accepted value at the page level the next letter needs, and that
 * value's thresholds. Only the condition that fails is named.
 */
export function goal(task: string, need: string, page: Page | undefined): { want: string; now: string } | null {
  const R = rubric.grade;
  const M = rubric.metrics;
  const accepts = R.levels.find((l) => l.level === need)?.accepts[task];
  if (!accepts?.length || !page) return null;
  const min = accepts[accepts.length - 1];
  const fps60 = Math.round(1000 / rubric.one_frame_ms);
  const steady = `a steady ${fps60} fps, every frame within ${Math.round(M.frame_p95_ms.good_max)} ms`;
  const oneIn20 = (v: number) => `1 in 20 frames takes ${Math.round(v)} ms or more`;

  if (task === "tap") return { want: `taps answered within ${ms(M.inp_ms.good_max)}`, now: page.inp_ms == null ? "not measured" : ms(page.inp_ms) };
  if (task === "load") {
    const limit = min === "good" ? M.load_ms.good_max : (M.load_ms.poor_above ?? M.load_ms.good_max);
    return { want: `opens within ${ms(limit)}`, now: page.open_ms == null ? "not measured" : ms(page.open_ms) };
  }
  if (task === "scroll") {
    const sc = page.scroll ?? {};
    const lv = R.scroll_levels.find((l) => l.level === min);
    if (!lv) return null;
    if (sc.fps == null || sc.p95_ms == null) return { want: lv.frames_band ? steady : `${lv.fps_min} fps or more`, now: "not measured" };
    if (lv.frames_band) return { want: steady, now: oneIn20(sc.p95_ms) };
    const want: string[] = [];
    const now: string[] = [];
    if (sc.fps < (lv.fps_min ?? 0)) { want.push(`${lv.fps_min} fps or more`); now.push(`${Math.round(sc.fps)} fps`); }
    if (sc.p95_ms > (lv.p95_max_ms ?? Infinity)) { want.push(`frames within ${Math.round(lv.p95_max_ms!)} ms`); now.push(oneIn20(sc.p95_ms)); }
    return want.length ? { want: want.join(", "), now: now.join(", ") } : null;
  }
  const up = page.updates ?? {};
  const lv = R.update_levels.find((l) => l.level === min);
  if (!lv) return null;
  if (up.latency_p95_ms == null) return { want: `changes on screen within ${ms(lv.latency_p95_max_ms)}`, now: "not measured" };
  if (up.latency_p95_ms > lv.latency_p95_max_ms) {
    return { want: `changes on screen within ${ms(lv.latency_p95_max_ms)}${lv.frames_band ? `, at ${steady}` : ""}`, now: `95% within ${ms(up.latency_p95_ms)}` };
  }
  const frames = median((up.runs ?? []).map((r) => r.frames?.p95_ms).filter((v): v is number => v != null));
  return lv.frames_band ? { want: `changes drawn at ${steady}`, now: frames == null ? "not measured" : oneIn20(frames) } : null;
}

/** The letter one up from this one, for "For A+: …" */
export function nextLetter(letter: string | null): string | undefined {
  const letters = rubric.grade.letters.map((l) => l.letter);
  if (!letter) return undefined;
  const i = letters.indexOf(letter);
  return i > 0 ? letters[i - 1] : i === -1 ? letters[letters.length - 1] : undefined;
}
