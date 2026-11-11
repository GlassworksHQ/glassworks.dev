"use client";

import { useEffect, useRef } from "react";
import {
  MODELS,
  geometry,
  type Geometry,
  type Layout,
  type ModelShape,
} from "./deviceGeometry";
import styles from "./DeviceModel.module.css";

/*
 * A 3D mockup of a device. The front glass is one CSS-3D plane (real DOM, so the
 * example dashboard stays sharp). The body's sides, any parts (stand legs) and a
 * floor shadow are real geometry from deviceGeometry.ts, projected with the same
 * transform and drawn as SVG behind the glass. This renders the same in Gecko,
 * WebKit and Blink.
 *
 * Brand rule: light moves, glass doesn't. The pointer moves the reflection only.
 * Shapes follow each device's real proportions; no vendor branding.
 */

export type { ModelShape };

/* card slots are 2:1 so cards line up; a portrait device's own page gets a taller slot */
function stageAspect(shape: ModelShape, size: "card" | "hero") {
  const { w, h } = MODELS[shape].body;
  return size === "hero" && w / h < 0.8 ? 0.8 : 2;
}

const cache = new Map<string, Geometry>();
function geo(shape: ModelShape, aspect: number) {
  const key = `${shape}:${aspect}`;
  if (!cache.has(key)) cache.set(key, geometry(shape, aspect));
  return cache.get(key)!;
}

export function DeviceModel({
  shape,
  label,
  interactive = false,
  size = "card",
}: {
  shape: ModelShape;
  label: string;
  interactive?: boolean;
  size?: "card" | "hero";
}) {
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const aspect = stageAspect(shape, size);
  const g = geo(shape, aspect);
  const blurId = `gw-floor-${shape}-${size}`;

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
    const x = (e.clientX - r.left) / r.width - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      el.style.setProperty("--sheen", `${50 + x * 70}%`),
    );
  }

  function onLeave() {
    cancelAnimationFrame(frame.current);
    stage.current?.style.removeProperty("--sheen");
  }

  return (
    <div
      ref={stage}
      className={styles.stage}
      style={{ aspectRatio: String(aspect) }}
      role="img"
      aria-label={label}
      onPointerMove={interactive ? onMove : undefined}
      onPointerLeave={interactive ? onLeave : undefined}
    >
      <div
        className={styles.model}
        data-layout={g.layout}
        data-finish={g.finish}
        data-mount={g.mount}
        style={{ transform: g.transform, ...g.vars }}
      >
        {g.mount === "wall" && (
          <div className={styles.shadow} aria-hidden="true" />
        )}
        <svg
          className={styles.sides}
          viewBox={`0 0 100 ${g.stageH}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {g.floorShadow && (
            <>
              <defs>
                <filter
                  id={blurId}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="1.6" />
                </filter>
              </defs>
              <polygon
                points={g.floorShadow}
                fill="rgba(0,0,0,0.5)"
                filter={`url(#${blurId})`}
              />
            </>
          )}
          {g.parts.map((p, i) => (
            <line
              key={`p${i}`}
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              stroke={p.color}
              strokeWidth={p.width}
              strokeLinecap="round"
            />
          ))}
          {g.faces.map((f, i) => (
            <polygon
              key={i}
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
              <Dashboard layout={g.layout} />
            </div>
            <div className={styles.glare} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* An example dashboard, in the Glass Tile anatomy. Illustrative values only. */
function Dashboard({ layout }: { layout: Layout }) {
  const tiles = [
    { name: "Living room", value: "3 lights on", lit: true },
    { name: "Hallway", value: "21.5°" },
    { name: "Front door", value: "Locked" },
    { name: "Kitchen", value: "Playing" },
  ];
  const shown = layout === "square" ? tiles.slice(0, 2) : tiles;
  return (
    <div className={styles.dash}>
      <div className={styles.clock}>
        <span className={styles.time}>21:42</span>
        <span className={styles.date}>Wednesday 11 November</span>
        {layout !== "square" && (
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
