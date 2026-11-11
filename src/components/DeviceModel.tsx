"use client";

import { useRef } from "react";
import styles from "./DeviceModel.module.css";

/*
 * A 3D mockup of a panel, in CSS 3D. The slab is a stack of thin rounded
 * layers, so its edges have real thickness from any angle. The screen is real
 * DOM (an example Glassworks dashboard), so text stays sharp.
 *
 * Brand rule: light moves, glass doesn't. The device tilts only a few degrees
 * towards the pointer, and the reflection follows it. Reduced motion turns both off.
 * Shapes follow each device's form factor; no vendor branding.
 */

export type ModelShape = "s1" | "square" | "tablet";

const LAYERS = 22;

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

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--ry", `${-22 + x * 10}deg`);
      el.style.setProperty("--rx", `${9 - y * 7}deg`);
      el.style.setProperty("--sheen", `${50 + x * 70}%`);
    });
  }

  function onLeave() {
    const el = stage.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.removeProperty("--ry");
    el.style.removeProperty("--rx");
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
      {/* Sizes are declared on .model, inside the .stage container, so every
          browser resolves their cqw against the stage. Declared on the stage
          itself, WebKit resolved them against the window. */}
      <div className={`${styles.model} ${styles[shape]}`}>
        <div className={styles.shadow} aria-hidden="true" />
        <div className={styles.device} aria-hidden="true">
          {Array.from({ length: LAYERS }, (_, i) => (
            <div
              key={i}
              className={styles.layer}
              style={{ ["--t" as string]: i / (LAYERS - 1) }}
            />
          ))}
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
