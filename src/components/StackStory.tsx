"use client";

import { useEffect, useRef, useState } from "react";
import { ENTRIES, KILN_STEPS, LAYERS, type Layer } from "./Stack";
import { links } from "@/lib/site";
import s from "./StackStory.module.css";

/*
 * The hero and "How it's built" as one scroll. The stack starts assembled,
 * like a finished panel. Scrolling explodes it, then walks down the layers one
 * at a time, top to bottom, ending on Kiln and the wires out to the house.
 *
 * Everything is driven by one number, p (0 → 1 through the section), eased
 * toward the scroll position each frame.
 */

/* plate geometry, same as the home page stack */
const C = 0.8660254;
const S = 0.5;
const W = 200;
const D = 120;
const COL_X = [10, 73, 136];
const ROW_Y = [10, 56];
const CW = 54;
const CH = 40;
const PLATE_H = S * (W + D); // 160: a plate's drawn height
const plane = (y: number) => `matrix(${C} ${S} ${-C} ${S} 0 ${y})`;
const at = (x: number, y: number, top: number) => [C * (x - y), S * (x + y) + top] as const;
const COLUMNS: [number, number][] = [
  [COL_X[0] + CW / 2, ROW_Y[0] + CH / 2],
  [COL_X[2] + CW / 2, ROW_Y[0] + CH / 2],
  [COL_X[0] + CW / 2, ROW_Y[1] + CH / 2],
];

/* the drawing's frame, in plate units */
/*
 * The drawing's frame, in plate units. It hugs the stack until the house cards
 * arrive, then widens to make room for them, so the stack fills the column for
 * the whole story and only shrinks for the last step.
 */
const VB_H = 500;
const VB_TIGHT_W = 390; // the stack alone
const VB_WIDE = { x: -110, w: 528 }; // the stack and the house cards, snug

/* scroll phases */
const EXPLODE: [number, number] = [0.06, 0.3];
const STEPS: [number, number] = [0.34, 0.92];
const STEP_COUNT = ENTRIES.length; // panes … kiln

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function stepOf(p: number): number | null {
  if (p < STEPS[0] || p >= STEPS[1]) return null;
  return Math.min(STEP_COUNT - 1, Math.floor(((p - STEPS[0]) / (STEPS[1] - STEPS[0])) * STEP_COUNT));
}

function Cells({ layer }: { layer: Layer }) {
  return (
    <>
      {layer.cells.map((cell, i) => {
        const x = COL_X[i % 3];
        const y = ROW_Y[Math.floor(i / 3)];
        const lit = layer.lit?.includes(i);
        const cls = layer.sockets
          ? s.socket
          : layer.chips
            ? s.chip
            : lit
              ? s.lit
              : layer.dashed?.includes(i)
                ? s.own
                : s.cell;
        return (
          <g key={i}>
            <rect x={x} y={y} width={CW} height={CH} rx="5" className={cls} fill={lit ? "url(#gw-lit)" : undefined} />
            {cell && (
              <text x={x + CW / 2} y={y + CH / 2 + 2.4} textAnchor="middle" className={lit ? s.cellTextLit : s.cellText}>
                {cell}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function KilnCells() {
  const sw = 42.5;
  const gap = (W - 20 - sw * KILN_STEPS.length) / (KILN_STEPS.length - 1);
  return (
    <>
      {KILN_STEPS.map((step, i) => {
        const x = 10 + i * (sw + gap);
        return (
          <g key={step}>
            <rect x={x} y={10} width={sw} height={86} rx="5" fill="url(#gw-ember)" opacity={0.32 + i * 0.16} />
            <text x={x + sw / 2} y={56} textAnchor="middle" className={s.kilnStep}>
              {step}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function StackStory() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cur = 0;
    let raf = 0;
    const target = () => {
      const el = ref.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    };
    // ease toward the scroll position, then stop: no frames while nothing moves
    const tick = () => {
      const t = target();
      cur = reduce ? t : cur + (t - cur) * 0.14;
      const settled = Math.abs(t - cur) < 0.0005;
      if (settled) cur = t;
      setP(cur);
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  /* jump to a layer's step */
  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const mid = STEPS[0] + ((i + 0.5) / STEP_COUNT) * (STEPS[1] - STEPS[0]);
    window.scrollTo({ top: el.offsetTop + span * mid, behavior: "smooth" });
  };

  const e = ease(EXPLODE[0], EXPLODE[1], p); // 0 assembled → 1 exploded
  const gap = lerp(16, 60, e);
  const scale = lerp(1.32, 1, e);
  const heroO = 1 - ease(0.04, 0.16, p);
  const storyO = ease(0.2, 0.3, p);
  const lightO = ease(0.24, 0.34, p);
  const housesO = ease(0.9, 0.97, p);
  const active = stepOf(p);
  const done = p >= STEPS[1];

  // six layers, top (panes) to bottom (Kiln), centred in the frame
  const stackH = gap * 5 + PLATE_H + 12;
  const top0 = (VB_H - stackH) / 2;
  const tops = Array.from({ length: 6 }, (_, i) => top0 + i * gap);
  const cx = C * (W - D) / 2; // horizontal centre of a plate
  const cy = top0 + stackH / 2;
  // the frame keeps room on the right for the house cards; until they arrive,
  // shift the stack into the middle of the frame
  const groupT = `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`;
  // frame: centred on the stack, widening as the house cards come in
  const vbW = lerp(VB_TIGHT_W, VB_WIDE.w, housesO);
  const vbX = lerp(cx - VB_TIGHT_W / 2, VB_WIDE.x, housesO);

  const dim = (i: number) => (active === null ? 1 : active === i ? 1 : 0.3);
  const lift = (i: number) => (active === i ? -10 : 0);

  const layerG = (layer: Layer, i: number) => (
    <g
      key={layer.id}
      className={s.layer}
      style={{ opacity: dim(i), transform: `translateY(${lift(i)}px)` }}
    >
      <g transform={plane(tops[i] + layer.thick)}>
        <rect width={W} height={D} rx="9" className={s.edge} />
      </g>
      <g transform={plane(tops[i])}>
        <rect width={W} height={D} rx="9" className={s.top} />
        <Cells layer={layer} />
        <text x="10" y="110" className={s.plateLabel}>
          {layer.label}
        </text>
      </g>
    </g>
  );

  // wires out to the house: each card sits level with where its wire starts,
  // nudged apart so they never overlap, and the wire ends on the card's edge
  const ex = 210;
  const CARD_W = 206;
  const CARD_H = 56;
  const sources = [
    { title: "ZHA · Z2M · OTBR", sub: "Radio over TCP, firewalled", from: at(COL_X[2] + CW, ROW_Y[0] + CH / 2, tops[0]) },
    { title: "Music Assistant", sub: "Synced audio over Sendspin", from: at(COL_X[2] + CW, ROW_Y[1] + CH / 2, tops[0]) },
    { title: "Home Assistant", sub: "ESPHome device · dashboard · updates", from: at(W, D / 2, tops[2]) },
  ];
  let floor = -Infinity;
  const houses = sources.map((h) => {
    const mid = Math.max(h.from[1], floor + CARD_H + 12);
    floor = mid;
    return { ...h, mid };
  });

  return (
    <section ref={ref} className={s.story} aria-label="Glassworks, and how it's built">
      <div className={s.sticky}>
        <div className={s.text}>
          <div className={s.hero} style={{ opacity: heroO, transform: `translateY(${-24 * (1 - heroO)}px)` }} aria-hidden={heroO < 0.5}>
            <span className="label">Open source · MPL-2.0</span>
            <h1 className={s.h1}>The open core for Home Assistant wall panels.</h1>
            <p className={s.lede}>
              Dashboard, ESPHome device, setup and updates for any wall panel. Everything else is a pane: voice, music,
              Zigbee/Thread, or one you write.
            </p>
            <div className={s.ctas}>
              <a className={s.primary} href={links.org}>
                Follow on GitHub
              </a>
              <a className={s.secondary} href={links.s1}>
                See S1 Unleashed
              </a>
            </div>
            <span className={s.scrollHint} aria-hidden="true">
              Scroll to take it apart
            </span>
          </div>

          <div className={s.steps} style={{ opacity: storyO }} aria-hidden={storyO < 0.5}>
            <span className="label">How it&rsquo;s built</span>
            <h2 className={s.h2}>A frame holds panes, and Kiln installs it.</h2>
            <ol className={s.list}>
              {ENTRIES.map((l, i) => {
                const open = active === i;
                return (
                  <li key={l.id} className={`${s.item} ${open ? s.open : ""} ${active !== null && !open ? s.itemDim : ""}`}>
                    <button type="button" className={s.itemBtn} onClick={() => goTo(i)} aria-current={open}>
                      <span className={`${s.itemName} ${l.id === "kiln" ? s.ember : ""}`}>{l.name}</span>
                      <code className={s.itemCode}>{l.code}</code>
                    </button>
                    <div className={s.itemBody}>
                      <div className={s.itemInner}>
                        <p className={s.itemDesc}>{l.desc}</p>
                        <ul className={s.chips}>
                          {l.items.map((it) => (
                            <li key={it}>{it}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className={s.coda} style={{ opacity: done ? 1 : 0 }}>
              Supporting a new panel means writing a new frame. S1 Unleashed is the Aqara S1 Plus frame, with the radio
              and wall-base panes.
            </p>
          </div>
        </div>

        <div className={s.stage}>
          <div className={s.float} style={{ animationPlayState: p > 0.02 ? "paused" : "running" }}>
          <svg
            viewBox={`${vbX} 0 ${vbW} ${VB_H}`}
            role="img"
            aria-label="An exploded view of a Glassworks panel: panes, pane API, core, frame and hardware, on Kiln"
            className={s.svg}
          >
            <defs>
              <radialGradient id="story-sky">
                <stop offset="0" className={s.skyStop} />
                <stop offset="1" className={s.skyStop} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="story-ember">
                <stop offset="0" className={s.emberStop} />
                <stop offset="1" className={s.emberStop} stopOpacity="0" />
              </radialGradient>
            </defs>
            <g>
              <g transform={groupT}>
                {/* light under the lit panes, heat under Kiln */}
                <ellipse cx={cx} cy={tops[0] + 70} rx="240" ry="120" fill="url(#story-sky)" className={s.skyGlow} />
                <ellipse cx={cx} cy={tops[5] + 90} rx="220" ry="96" fill="url(#story-ember)" className={s.emberGlow} />

                {/* Kiln, then its heat rising into the hardware */}
                <g className={s.layer} style={{ opacity: dim(5), transform: `translateY(${lift(5)}px)` }}>
                  <g transform={plane(tops[5] + 6)}>
                    <rect width={W} height={D} rx="9" className={s.kilnEdge} />
                  </g>
                  <g transform={plane(tops[5])}>
                    <rect width={W} height={D} rx="9" className={s.kilnTop} />
                    <KilnCells />
                    <text x="10" y="110" className={s.kilnLabel}>
                      KILN · INSTALLS OVER USB, FROM THE BROWSER
                    </text>
                  </g>
                </g>
                <g style={{ opacity: lightO }}>
                  {COLUMNS.map(([x, y], c) => {
                    const [bx, by] = at(x, y, tops[5]);
                    const [, ty] = at(x, y, tops[4] + LAYERS[4].thick);
                    return (
                      <g key={c}>
                        <line x1={bx} y1={by} x2={bx} y2={ty} className={s.heatRail} />
                        <line x1={bx} y1={by} x2={bx} y2={ty} className={s.heat} style={{ animationDelay: `${c * 0.4}s` }} />
                      </g>
                    );
                  })}
                </g>

                {/* hardware → frame → core → pane API, light rising through them */}
                {[4, 3, 2, 1].map((i) => layerG(LAYERS[i], i))}
                <g style={{ opacity: lightO }}>
                  {COLUMNS.map(([x, y], c) => {
                    const [bx, by] = at(x, y, tops[4]);
                    const [, ty] = at(x, y, tops[0] + LAYERS[0].thick);
                    return (
                      <g key={c}>
                        <line x1={bx} y1={by} x2={bx} y2={ty} className={s.beamRail} />
                        <line x1={bx} y1={by} x2={bx} y2={ty} className={s.beam} style={{ animationDelay: `${c * 0.6}s` }} />
                      </g>
                    );
                  })}
                </g>
                {layerG(LAYERS[0], 0)}

                {/* out to the house */}
                <g style={{ opacity: housesO }}>
                  {houses.map((h, k) => {
                    const [fx, fy] = h.from;
                    const bend = (ex - fx) * 0.5;
                    const y = h.mid - CARD_H / 2;
                    return (
                      <g key={h.title}>
                        <path d={`M${fx} ${fy} C ${fx + bend} ${fy}, ${ex - bend} ${h.mid}, ${ex} ${h.mid}`} className={s.wireRail} />
                        <path
                          d={`M${fx} ${fy} C ${fx + bend} ${fy}, ${ex - bend} ${h.mid}, ${ex} ${h.mid}`}
                          className={s.wire}
                          style={{ animationDelay: `${k * 0.5}s` }}
                        />
                        <circle cx={fx} cy={fy} r="2.2" className={s.wireEnd} />
                        <rect x={ex} y={y} width={CARD_W} height={CARD_H} rx="10" className={s.extBox} />
                        <circle cx={ex + 16} cy={y + 21} r="3.5" className={s.extDot} />
                        <text x={ex + 27} y={y + 25} className={s.extTitle}>
                          {h.title}
                        </text>
                        <text x={ex + 16} y={y + 42} className={s.extSub}>
                          {h.sub}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            </g>
          </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
