"use client";

import { useEffect, useRef } from "react";
import { sideFaces, type Face, type ModelShape } from "./deviceGeometry";
import styles from "./DeviceModel.module.css";

/*
 * A 3D mockup of a panel. The front glass is one CSS-3D plane (real DOM, so the
 * example dashboard stays sharp). The slab's sides are real geometry from
 * deviceGeometry.ts: the outline extruded by its thickness, projected with the
 * same transform, drawn as shaded SVG polygons behind the glass. One plane plus
 * flat SVG renders the same in Gecko, WebKit and Blink; stacked layers didn't.
 *
 * Brand rule: light moves, glass doesn't. The pointer moves the reflection only.
 * Shapes follow each device's form factor; no vendor branding.
 */

export type { ModelShape };

const FACES: Record<ModelShape, Face[]> = {
  s1: sideFaces("s1"),
  square: sideFaces("square"),
  tablet: sideFaces("tablet"),
};

export function DeviceModel({
  shape,
  label,
  interactive = false,
}: {
  shape: ModelShape;
  label: string;
  interactive?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  // --u = 1% of the stage width, for the depth and perspective lengths
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const set = () => el.style.setProperty("--u", `${el.clientWidth / 100}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--sheen", `${50 + x * 70}%`);
    });
  }

  function onLeave() {
    const el = stage.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.removeProperty("--sheen");
  }

  return (
    <div
      ref={stage}
      className={`${styles.stage} ${interactive ? styles.live : ""}`}
      role="img"
      aria-label={label}
      onPointerMove={interactive ? onMove : undefined}
      onPointerLeave={interactive ? onLeave : undefined}
    >
      <div className={`${styles.model} ${styles[shape]}`}>
        <div className={styles.shadow} aria-hidden="true" />
        <svg
          className={styles.sides}
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {FACES[shape].map((f, k) => (
            <polygon
              key={k}
              points={f.points}
              fill={f.fill}
              stroke={f.fill}
              strokeWidth="0.12"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        <div className={styles.device} aria-hidden="true">
          <div className={styles.front}>
            <div className={styles.screen}>
              <Dashboard shape={shape} />
            </div>
            <div className={styles.glare} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* An example dashboard, in the Glass Tile anatomy. Illustrative values only. */
function Dashboard({ shape }: { shape: ModelShape }) {
  const tiles = [
    { name: "Living room", value: "3 lights on", lit: true },
    { name: "Hallway", value: "21.5°" },
    { name: "Front door", value: "Locked" },
    { name: "Kitchen", value: "Playing" },
  ];
  const shown = shape === "square" ? tiles.slice(0, 2) : tiles;
  return (
    <div className={styles.dash}>
      <div className={styles.clock}>
        <span className={styles.time}>21:42</span>
        <span className={styles.date}>Wednesday 11 November</span>
        {shape !== "square" && (
          <span className={styles.weather}>12° · Cloudy</span>
        )}
      </div>
      <div className={styles.tiles}>
        {shown.map((t) => (
          <div
            key={t.name}
            className={`${styles.tile} ${t.lit ? styles.tileLit : ""}`}
          >
            <span className={styles.tileName}>{t.name}</span>
            <span className={styles.tileValue}>{t.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
