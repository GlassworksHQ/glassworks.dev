import fs from "node:fs";
import path from "node:path";
import { gradeSummary, type Grade, type Rubric, type Summary } from "../../vendor/s1-unleashed/tools/perf/grade";
import rubricJson from "../../vendor/s1-unleashed/tools/perf/page/rubric.json";

/*
 * Clarity, the Glassworks wall-panel performance grade (docs/perf.md in the main repo).
 *
 * A frame stores measurements only: frames/<id>/clarity/clarity.json, Clarity's summary
 * (glassworks.perf-summary/3), published with its report. The letter is never stored. The site works
 * it out at build time with the main repo's own grade function (tools/perf/grade.ts) and rules
 * (tools/perf/page/rubric.json), both from the pinned submodule, so a rule change there re-grades
 * every frame here, and a summary from another Clarity version or measuring protocol shows
 * "Re-measure" instead of a letter.
 */
export const rubric = rubricJson as unknown as Rubric & { name?: string; one_frame_ms: number };
/** The test's name, from rubric.json once it carries one (main repo #158) */
export const CLARITY = rubric.name ?? "Clarity";

type FrameRun = { p95_ms?: number | null; jank_pct?: number | null; frozen_pct?: number | null; fps?: number | null; n?: number | null };
type CameraRun = { timed_out?: boolean; first_frame_ms?: number | null; shown_pct?: number | null; max_gap_ms?: number | null; stall_total_ms?: number | null };
/** A page's medians. Since /3 the graded ones (inp_ms, open_ms, blocking_ms) are unrounded: never round before banding. */
export type Page = {
  inp_ms?: number | null;
  /** navigation to the first screen drawn (rubric 2) */
  open_ms?: number | null;
  /** the main thread's blocking from the first screen drawn to usable (rubric 2) */
  blocking_ms?: number | null;
  camera?: { runs?: CameraRun[] };
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
  /** the report's plain-words notes; they judge by the rubric version they name (main repo #201) */
  notes?: { text?: string; rubric?: number } | null;
};

export type Graded = { state: "graded"; summary: ClaritySummary; grade: Grade };
export type Clarity =
  | { state: "none" }
  | Graded
  | { state: "re-measure" | "not-comparable"; summary: ClaritySummary; grade: Grade };

const FRAMES = path.join(process.cwd(), "vendor/s1-unleashed/frames");
/** The summary format this site reads. An older one (/2) is from before Clarity v2: re-measure. */
const SCHEMA = "glassworks.perf-summary/3";

/*
 * Sample summaries for working on the site before any frame has one: CLARITY_FIXTURES=<dir> reads
 * <dir>/<frame id>.json for frames without a clarity.json. Never on Vercel, so a sample can't ship.
 */
const FIXTURES = process.env.VERCEL ? undefined : process.env.CLARITY_FIXTURES;

function read(id: string): ClaritySummary | null {
  const real = path.join(FRAMES, id, "clarity", "clarity.json");
  const file = fs.existsSync(real) ? real : FIXTURES ? path.resolve(process.cwd(), FIXTURES, `${id}.json`) : null;
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
      let grade = gradeSummary(summary, rubric);
      if (grade.status === "graded" && summary.schema !== SCHEMA) {
        grade = { status: "re-measure", grade: null, meaning: null, why: `an older summary (${summary.schema}), from before Clarity v${rubric.clarity}: re-measure` };
      }
      cache.set(id, grade.status === "graded" ? { state: "graded", summary, grade } : { state: grade.status, summary, grade });
    }
  }
  return cache.get(id)!;
}

/* ---------- words ---------- */

export const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const PAGES = rubric.grade.pages; // light, typical-nocam, typical, heavy: lightest first
/** As the notes name them (main repo tools/perf/notes.py): typical-nocam is typical without a camera */
export const PAGE_NAME: Record<string, string> = {
  light: "Light",
  "typical-nocam": "Typical without a camera",
  typical: "Typical with a camera",
  heavy: "Heavy",
};
export const pageName = (p: string) => PAGE_NAME[p] ?? cap(p.replace(/-/g, " "));
export const TASKS = Object.keys(rubric.grade.tasks); // tap, scroll, updates, load, camera, blocking
export const TASK_NAME: Record<string, string> = {
  tap: "Tap",
  scroll: "Scroll",
  updates: "Live updates",
  load: "Open the view",
  blocking: "Blocking after it",
  camera: "Cameras",
};
/**
 * The table's rows: one per task, except that the blocking shares the open's row, so the two read as
 * two numbers, "drawn in 1.2 s, then blocked for 2.9 s". Each keeps its own band and note.
 */
export const ROWS: string[][] = TASKS.filter((t) => t !== "blocking").map((t) =>
  t === "load" && TASKS.includes("blocking") ? ["load", "blocking"] : [t],
);
const words = (key: string) => cap(key.replace(/-/g, " "));
export const levelName = (v: string | null) =>
  v ? (v === rubric.grade.below ? "Below fluid" : v === "none" ? "No camera" : words(v)) : "Not measured";

/*
 * A level or band as a status, ranked from rubric.json rather than by name: the levels in
 * grade.levels order (premium, good, fluid today), the last one only just passing; then `below`.
 * Bands are grade.ts's fixed good / needs-improvement / poor.
 */
const LEVELS = rubric.grade.levels.map((l) => l.level);
export function tone(v: string | null | undefined): "ok" | "mid" | "bad" | "none" {
  if (!v) return "none";
  if (v === "good") return "ok";
  if (v === "needs-improvement") return "mid";
  if (v === "poor" || v === rubric.grade.below) return "bad";
  const i = LEVELS.indexOf(v);
  return i === -1 ? "none" : i === LEVELS.length - 1 ? "mid" : "ok";
}

/** A page's level; a page measured in full but below every level is `below` (rubric's "slow") */
export function pageLevel(g: Grade, page: string): string | null {
  const lv = g.levels?.[page] ?? null;
  if (lv) return lv;
  const bands = Object.values(g.bands?.[page] ?? {});
  return bands.length && bands.every((b) => b !== null) ? rubric.grade.below : null;
}

const fps = (v: number) => `${+v.toFixed(1)} fps`;
const pct = (v: number) => `${+v.toFixed(1)}%`;
export const ms = (v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);

/**
 * A median against a band's limits, unrounded where it counts: when the short form would read as a
 * limit it isn't (a 600.4 ms blocking is poor, "600 ms" would look within it), say more digits.
 * grade.ts bands the unrounded value; this only keeps the words true to that.
 */
export function msAt(v: number, limits: (number | undefined)[]): string {
  const near = limits.filter((l): l is number => l != null && l !== v);
  let text = ms(v);
  // one more digit until it no longer reads as a limit (600.04 ms, not 600 ms); the value differs, so it ends
  for (let d = 1; d <= 6 && near.some((l) => ms(l) === text || `${l} ms` === text || `${l / 1000} s` === text); d++) {
    text = v >= 1000 ? `${+(v / 1000).toFixed(d + 2)} s` : `${+v.toFixed(d)} ms`;
  }
  return text;
}
const edges = (r: { good_max: number; poor_above?: number; poor_at?: number }) => [r.good_max, r.poor_above, r.poor_at];
/** The bars a live change's p95 and a camera's first frame are held to, per level (rubric.json) */
const UPDATE_EDGES = rubric.grade.update_levels.map((l) => l.latency_p95_max_ms);
const FIRST_FRAME_EDGES = rubric.grade.camera_levels.map((l) => l.first_frame_max_ms);
/** The restart, against its bands */
export const restartText = (v: number) => msAt(v, edges(rubric.metrics.start_ms));

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};

const medianOf = (xs: (number | null | undefined)[]) => median(xs.filter((v): v is number => v != null));

/**
 * The cameras' middle run, by first frame, a run that showed no frame or didn't finish counting as the
 * slowest (grade.ts judges each run, then takes the middle level, the worse one for an even count):
 * its first frame and share of frames shown, in words. Null when no camera run was recorded.
 */
function cameraNow(page: Page): string | null {
  const runs = [...(page.camera?.runs ?? [])].sort((a, b) => (a.first_frame_ms ?? Infinity) - (b.first_frame_ms ?? Infinity));
  if (!runs.length) return null;
  const r = runs[Math.floor(runs.length / 2)];
  if (r.timed_out) return "didn't finish";
  if (r.first_frame_ms == null) return "no frame shown";
  return `first frame in ${msAt(r.first_frame_ms, FIRST_FRAME_EDGES)}${r.shown_pct == null ? "" : `, ${pct(r.shown_pct)} shown`}`;
}

/** A task's measured value on a page, for the table. The open and the blocking read as one sentence. */
export function measured(page: Page | undefined, task: string): string | null {
  if (!page) return null;
  const M = rubric.metrics;
  if (task === "tap") return page.inp_ms == null ? null : msAt(page.inp_ms, edges(M.inp_ms));
  if (task === "load") return page.open_ms == null ? null : `drawn in ${msAt(page.open_ms, edges(M.load_ms))}`;
  if (task === "blocking") return page.blocking_ms == null ? null : `then blocked for ${msAt(page.blocking_ms, edges(M.blocking_ms))}`;
  if (task === "scroll") return page.scroll?.fps == null ? null : fps(page.scroll.fps);
  if (task === "camera") {
    return cameraNow(page);
  }
  return page.updates?.latency_p95_ms == null ? null : msAt(page.updates.latency_p95_ms, UPDATE_EDGES);
}

/**
 * The 60 fps rule (a "frames band" of good) in plain words, and which of its three measures fails
 * now: p95 frame time, late (jank) frames, frozen frames. `runs` are per-run frame stats; the
 * medians stand for the page, as each run is judged and the page takes the middle one.
 */
function steadyGoal(runs: FrameRun[]): { want: string; now: string } {
  const M = rubric.metrics;
  const steady = `a steady ${Math.round(1000 / rubric.one_frame_ms)} fps`;
  const within = `every frame within ${Math.round(M.frame_p95_ms.good_max)} ms`;
  const p95 = medianOf(runs.map((r) => r.p95_ms));
  const jank = medianOf(runs.map((r) => r.jank_pct));
  const frozen = medianOf(runs.map((r) => r.frozen_pct));
  if (p95 == null && jank == null && frozen == null) return { want: `${steady}, ${within}`, now: "not measured" };
  const want: string[] = [];
  const now: string[] = [];
  if (p95 != null && p95 > M.frame_p95_ms.good_max) { want.push(within); now.push(`1 in 20 frames takes ${Math.round(p95)} ms or more`); }
  if (jank != null && jank > M.frame_jank_pct.good_max) { want.push(`no more than ${pct(M.frame_jank_pct.good_max)} of frames late`); now.push(`${pct(jank)} late`); }
  if (frozen != null && frozen > M.frame_frozen_pct.good_max) {
    want.push(M.frame_frozen_pct.good_max === 0 ? "no frozen frames" : `no more than ${pct(M.frame_frozen_pct.good_max)} frozen`);
    now.push(`${pct(frozen)} frozen`);
  }
  return want.length ? { want: `${steady}: ${want.join(", ")}`, now: now.join(", ") } : { want: `${steady}, ${within}, in most runs`, now: "not in every run" };
}

/**
 * What a task that holds the grade back has to do, in plain words, and where it is now. From
 * rubric.json: the task's lowest accepted value at the page level the next letter needs, and that
 * value's thresholds. Values are the median of the runs, as grade.ts judges each run and takes the
 * middle level; only the condition that fails is named.
 */
export function goal(task: string, need: string, page: Page | undefined): { want: string; now: string } | null {
  const R = rubric.grade;
  const M = rubric.metrics;
  // "none" (a page without cameras) is accepted, never a goal: the lowest real value is
  const accepts = R.levels.find((l) => l.level === need)?.accepts[task]?.filter((a) => a !== "none");
  if (!accepts?.length || !page) return null;
  const min = accepts[accepts.length - 1];

  if (task === "tap") return { want: `taps answered within ${ms(M.inp_ms.good_max)}`, now: page.inp_ms == null ? "not measured" : msAt(page.inp_ms, edges(M.inp_ms)) };
  if (task === "load") {
    const limit = min === "good" ? M.load_ms.good_max : (M.load_ms.poor_above ?? M.load_ms.good_max);
    return { want: `drawn within ${ms(limit)}`, now: page.open_ms == null ? "not measured" : msAt(page.open_ms, edges(M.load_ms)) };
  }
  if (task === "blocking") {
    const limit = min === "good" ? M.blocking_ms.good_max : (M.blocking_ms.poor_above ?? M.blocking_ms.good_max);
    return {
      want: `blocked for at most ${ms(limit)} after it is drawn`,
      now: page.blocking_ms == null ? "not measured" : msAt(page.blocking_ms, edges(M.blocking_ms)),
    };
  }
  if (task === "camera") {
    const lv = R.camera_levels.find((l) => l.level === min);
    if (!lv) return null;
    const want = [`a camera's first frame within ${ms(lv.first_frame_max_ms)}`, `${lv.shown_min_pct}% of its frames shown`];
    if (lv.max_gap_max_ms != null) want.push(`no gap over ${ms(lv.max_gap_max_ms)}`);
    if (lv.stall_total_max_ms != null) want.push(`stalls under ${ms(lv.stall_total_max_ms)} in all`);
    return { want: want.join(", "), now: cameraNow(page) ?? "not measured" };
  }
  if (task === "scroll") {
    const lv = R.scroll_levels.find((l) => l.level === min);
    if (!lv) return null;
    const runs = page.scroll?.runs ?? [];
    if (lv.frames_band) return steadyGoal(runs);
    const f = runs.length ? medianOf(runs.map((r) => r.fps)) : (page.scroll?.fps ?? null);
    const p95 = runs.length ? medianOf(runs.map((r) => r.p95_ms)) : (page.scroll?.p95_ms ?? null);
    const fpsWant = `${lv.fps_min} fps or more`;
    const p95Want = `frames within ${Math.round(lv.p95_max_ms!)} ms`;
    if (f == null || p95 == null) return { want: fpsWant, now: "not measured" };
    const want: string[] = [];
    const now: string[] = [];
    if (f < (lv.fps_min ?? 0)) { want.push(fpsWant); now.push(fps(f)); }
    if (p95 > (lv.p95_max_ms ?? Infinity)) { want.push(p95Want); now.push(`1 in 20 frames takes ${Math.round(p95)} ms or more`); }
    // the middle run can pass while the middle level doesn't (runs either side of a line): say both
    return want.length ? { want: want.join(", "), now: now.join(", ") } : { want: `${fpsWant}, ${p95Want}, in most runs`, now: `${fps(f)}, ${Math.round(p95)} ms` };
  }
  if (task !== "updates") return null;
  const lv = R.update_levels.find((l) => l.level === min);
  if (!lv) return null;
  const runs = page.updates?.runs ?? [];
  const late = runs.length ? medianOf(runs.map((r) => r.latency_p95_ms)) : (page.updates?.latency_p95_ms ?? null);
  const onScreen = `changes on screen within ${ms(lv.latency_p95_max_ms)}`;
  if (late == null) return { want: onScreen, now: "not measured" };
  if (late > lv.latency_p95_max_ms) return { want: onScreen, now: `95% within ${msAt(late, UPDATE_EDGES)}` };
  if (lv.frames_band) {
    const s = steadyGoal(runs.map((r) => r.frames).filter((x): x is FrameRun => !!x));
    return { want: `changes drawn at ${s.want}`, now: s.now };
  }
  return { want: `${onScreen}, in most runs`, now: `95% within ${msAt(late, UPDATE_EDGES)}` };
}

/** The letter one up from this one, for "For A+: …" */
export function nextLetter(letter: string | null): string | undefined {
  const letters = rubric.grade.letters.map((l) => l.letter);
  if (!letter) return undefined;
  const i = letters.indexOf(letter);
  return i > 0 ? letters[i - 1] : i === -1 ? letters[letters.length - 1] : undefined;
}

/**
 * The report's notes, in plain words, only when they judge by these rules: notes.rubric is this
 * rubric's version and the summary is this Clarity's (docs/perf.md, "The summary"). Else none.
 */
export function notesFor(sum: ClaritySummary): string | null {
  const n = sum.notes;
  if (!n?.text || n.rubric !== rubric.version || sum.clarity !== rubric.clarity) return null;
  return n.text;
}

/** How the cameras' video reached the panel (grade.ts's transport): letters over different paths aren't comparable */
export const TRANSPORT_NAME: Record<string, string> = {
  "lan-udp": "camera video over the LAN (UDP)",
  "lan-turn": "camera video over the LAN, relayed (TURN)",
  adb: "camera video over adb",
};
