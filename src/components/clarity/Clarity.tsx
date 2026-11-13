import type { CSSProperties } from "react";
import {
  CLARITY,
  PAGES,
  PAGE_NAME,
  TASKS,
  TASK_NAME,
  cap,
  clarityFor,
  goal,
  levelName,
  measured,
  ms,
  nextLetter,
  pageLevel,
  rubric,
  tone,
  type Clarity,
  type Graded,
} from "@/lib/clarity";
import { CopySnippet } from "@/components/CopySnippet";
import { SITE, readmeImage } from "@/lib/site";
import { ClarityChipLink } from "./ClarityChipLink";
import s from "./Clarity.module.css";

/*
 * A frame's Clarity grade, worked out from its measurements (src/lib/clarity.ts). The seal is
 * Clarity's mark and the grade in one: the lens ring in the room's light, the letter in the page's
 * ink. Levels and bands are status, so they use the status colours.
 */

/** The Clarity seal. With `live`, the ring draws in, the glint lands and the letter comes into focus, once. */
export function Seal({ letter, size, live = false, id }: { letter: string | null; size: number; live?: boolean; id: string }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`${s.seal} ${live ? s.live : ""} ${letter ? "" : s.sealOff}`}
      role="img"
      aria-label={letter ? `${CLARITY} ${letter}` : `${CLARITY}, no grade`}
    >
      <defs>
        <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--sky)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
        <radialGradient id={`${id}-glass`} cx="30%" cy="25%" r="85%">
          <stop offset="0" stopColor="var(--sky)" stopOpacity=".16" />
          <stop offset=".55" stopColor="var(--violet)" stopOpacity=".06" />
          <stop offset="1" stopColor="var(--violet)" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="50" cy="50" r={r - 4} />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r={r} fill={`url(#${id}-glass)`} />
      <circle
        cx="50"
        cy="50"
        r={r}
        className={s.ring}
        stroke={letter ? `url(#${id}-lit)` : undefined}
        strokeDasharray={letter ? c : "3 5"}
        style={{ "--c": c } as CSSProperties}
        transform="rotate(-90 50 50)"
      />
      {letter && <path d="M26 38 A 26 26 0 0 1 44 23" className={s.glint} stroke={`url(#${id}-lit)`} />}
      {live && (
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="-30" y="0" width="16" height="100" className={s.sweep} />
        </g>
      )}
      <text x="50" y="52" textAnchor="middle" dominantBaseline="central" className={`${s.letter} ${(letter ?? "").length > 1 ? s.letterLong : ""}`}>
        {letter ?? "?"}
      </text>
    </svg>
  );
}

/** grade.ts's "heavy.updates" as "heavy live updates" */
const missingName = (m: string) => {
  const [page, task] = m.split(".");
  return task ? `${page} ${TASK_NAME[task]?.toLowerCase() ?? task}` : m === "start" ? "restart" : m;
};

/** Why there's no letter, in a few words */
function noGrade(c: Clarity): string {
  if (c.state === "none") return "Not measured yet";
  if (c.state === "re-measure") return "Re-measure";
  return "Not comparable";
}

/** Near the top of a frame's page: the small seal; it opens the Clarity panel below. */
export function ClarityChip({ frameId }: { frameId: string }) {
  const c = clarityFor(frameId);
  const letter = c.state === "graded" ? c.grade.grade : null;
  return (
    <ClarityChipLink className={s.chip}>
      <Seal letter={letter} size={30} id="chip" />
      <span className={s.word}>{CLARITY}</span>
      {!letter && <span className={s.chipDim}>{noGrade(c).toLowerCase()}</span>}
    </ClarityChipLink>
  );
}

/** Under a catalog card: the small seal and the meaning */
export function ClarityCardLine({ frameId }: { frameId: string }) {
  const c = clarityFor(frameId);
  const graded = c.state === "graded";
  return (
    <span className={s.card}>
      <Seal letter={graded ? c.grade.grade : null} size={40} id={`card-${frameId}`} />
      <span className={s.cardText}>
        <span className={s.word}>{CLARITY}</span>
        <span className={s.cardSub}>
          {graded ? `${cap(c.grade.meaning ?? "")}${c.grade.provisional ? " (provisional)" : ""}` : noGrade(c)}
        </span>
      </span>
    </span>
  );
}

function Levels({ c }: { c: Graded }) {
  return (
    <span className={s.levels}>
      {PAGES.map((p) => {
        const lv = pageLevel(c.grade, p);
        return (
          <span key={p} className={`${s.level} ${s[tone(lv)]}`}>
            <span className={s.levelName}>{PAGE_NAME[p]}</span>
            <span className={s.levelValue}>{levelName(lv)}</span>
          </span>
        );
      })}
    </span>
  );
}

/** The details: every task on every page, with what holds the grade back said in plain words */
function Detail({ c }: { c: Graded }) {
  const g = c.grade;
  const up = nextLetter(g.grade);
  const held = new Map((g.limits ?? []).flatMap((l) => l.tasks.map((t) => [`${l.page}.${t}`, l.needs] as const)));
  const cell = (p: string, t: string) => {
    const page = c.summary.pages?.[p];
    const band = g.bands?.[p]?.[t] ?? null;
    const need = held.get(`${p}.${t}`);
    const gl = need && up ? goal(t, need, page) : null;
    return {
      value: (
        <>
          <span className={`${s.dot} ${s[tone(band)]}`} aria-hidden="true" />
          {measured(page, t) ?? "Not measured"}
          <span className="visually-hidden">, {levelName(band)}</span>
        </>
      ),
      held: !!need,
      note: gl && (
        <span className={s.note}>
          <b>For {up}:</b> {gl.want}
          {gl.now !== "not measured" && <span className={s.now}> · now {gl.now}</span>}
        </span>
      ),
    };
  };
  return (
    <>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">
              <span className="visually-hidden">Task</span>
            </th>
            {PAGES.map((p) => (
              <th key={p} scope="col">
                {PAGE_NAME[p]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TASKS.map((t) => (
            <tr key={t}>
              <th scope="row">{TASK_NAME[t]}</th>
              {PAGES.map((p) => {
                const x = cell(p, t);
                return (
                  <td key={p} className={x.held ? s.held : undefined}>
                    {x.value}
                    {x.note}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className={s.list}>
        {PAGES.map((p) => (
          <dl key={p} className={s.listPage}>
            <dt className={s.listHead}>{PAGE_NAME[p]} dashboard</dt>
            {TASKS.map((t) => {
              const x = cell(p, t);
              return (
                <dd key={t} className={`${s.listRow} ${x.held ? s.held : ""}`}>
                  <span className={s.listTask}>{TASK_NAME[t]}</span>
                  <span>{x.value}</span>
                  {x.note}
                </dd>
              );
            })}
          </dl>
        ))}
      </div>
    </>
  );
}

function Facts({ c }: { c: Graded }) {
  const { summary: sum, grade: g } = c;
  const peak = sum.ram?.peak_app_pss_kb;
  const idle = sum.ram?.idle_app_pss_kb;
  const apks = (sum.apk ?? []).filter((a) => a.bytes != null);
  const mb = (kb: number) => `${Math.round(kb / 1024)} MB`;
  return (
    <dl className={s.facts}>
      <div>
        <dt>Restart</dt>
        <dd>
          {sum.restart_ms == null ? "Not measured" : ms(sum.restart_ms)}
          {g.capped_by_start && <span className={s.sub}> caps the grade at {rubric.grade.start_cap.letter}</span>}
        </dd>
      </div>
      {peak != null && (
        <div>
          <dt>RAM, peak</dt>
          <dd>
            {mb(peak)}
            {idle != null && <span className={s.sub}> {mb(idle)} idle</span>}
          </dd>
        </div>
      )}
      {apks.map((a) => (
        <div key={a.file ?? a.abis?.join()}>
          <dt>App size</dt>
          <dd>
            {`${Math.round(a.bytes! / 1048576)} MB`}
            {a.abis?.length ? <span className={s.sub}> {a.abis.join(", ")}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Meta({ c }: { c: Graded }) {
  const sum = c.summary;
  const report = sum.report && /^https?:\/\//.test(sum.report) ? sum.report : null;
  const bits = [
    sum.measured_on && `Measured ${sum.measured_on}`,
    sum.app_version && `app ${sum.app_version}`,
    sum.runs?.attempted != null && `${sum.runs.graded ?? 0} of ${sum.runs.attempted} runs`,
    `protocol ${sum.protocol_version}, rules v${rubric.version}`,
  ].filter(Boolean);
  return (
    <div className={s.meta}>
      {c.grade.provisional && (
        <p className={s.provNote}>
          <span className={s.prov}>Provisional</span>
          {[
            ...(sum.gaps ?? []),
            ...((c.grade.missing ?? []).length ? [`not measured: ${c.grade.missing!.map(missingName).join(", ")}`] : []),
          ].join("; ")}
        </p>
      )}
      <p>
        {bits.join(" · ")}
        {report && (
          <>
            {" · "}
            <a href={report}>Full report</a>
          </>
        )}
      </p>
    </div>
  );
}

/** The README badge for the frame's repo folder: the site works the letter out, the README only links it */
function BadgeSnippet({ frameId }: { frameId: string }) {
  const base = `${SITE}/frames/${frameId}`;
  const code = readmeImage({ href: `${base}#clarity`, src: `${base}/clarity`, alt: `${CLARITY} grade`, size: 'height="30"' });
  return (
    <div className={s.badge}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the badge itself, as a README shows it */}
      <img src={`/frames/${frameId}/clarity-on-light.svg`} alt="" height={30} className={s.badgeLight} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/frames/${frameId}/clarity-on-dark.svg`} alt="" height={30} className={s.badgeDark} />
      <CopySnippet code={code} label="README badge" />
    </div>
  );
}

/** The frame page's Clarity panel: the seal and the levels, and the details when opened */
export function ClarityPanel({ frameId }: { frameId: string }) {
  const c = clarityFor(frameId);
  if (c.state !== "graded") {
    const why =
      c.state === "none"
        ? "Not measured yet"
        : c.state === "re-measure"
          ? `Re-measure: ${c.grade.why ?? "measured with another protocol"}`
          : (c.grade.why ?? "Not comparable");
    return (
      <section className={s.section} aria-labelledby="clarity">
        <details id="clarity-panel" className={`glass ${s.panel}`}>
          <summary className={s.summary}>
            <span className={s.head}>
              <Seal letter={null} size={72} id="panel" />
              <span className={s.headText}>
                <span id="clarity" className={s.word}>
                  {CLARITY}
                </span>
                <span className={s.emptyText}>{why}</span>
              </span>
            </span>
            <More />
          </summary>
          <div className={s.body}>
            <p className={s.about}>
              {CLARITY} grades a frame as a wall panel, from A+ to E: how fast taps answer, how smoothly it scrolls, how quickly
              changes reach the screen and how long a view takes to open, on a light, a typical and a heavy dashboard.
            </p>
            <BadgeSnippet frameId={frameId} />
          </div>
        </details>
      </section>
    );
  }
  const g = c.grade;
  return (
    <section className={s.section} aria-labelledby="clarity">
      <details id="clarity-panel" className={`glass ${s.panel}`}>
        <summary className={s.summary}>
          <span className={s.head}>
            <Seal letter={g.grade} size={120} live id="panel" />
            <span className={s.headText}>
              <span id="clarity" className={s.word}>
                {CLARITY}
              </span>
              <span className={s.meaning}>
                {cap(g.meaning ?? "")}
                {g.provisional && <span className={s.prov}>Provisional</span>}
              </span>
              <Levels c={c} />
            </span>
          </span>
          <More />
        </summary>
        <div className={s.body}>
          <Detail c={c} />
          <Facts c={c} />
          <Meta c={c} />
          <BadgeSnippet frameId={frameId} />
        </div>
      </details>
    </section>
  );
}

function More() {
  return (
    <span className={s.more} aria-hidden="true">
      <span className={s.open}>Details</span>
      <span className={s.close}>Hide</span>
      <svg viewBox="0 0 24 24" className={s.chev}>
        <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
