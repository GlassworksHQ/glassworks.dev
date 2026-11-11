"use client";

import { useState } from "react";
import { Mark } from "./Mark";
import styles from "./GlassTile.module.css";

type Tone = "ready" | "working";

/**
 * The Glass Tile: a 2:1 night card in the S1 boot screen's anatomy.
 * Label top-left, status top-right, lockup bottom-left. Light sweeps across it once on load.
 */
export function GlassTile({
  label,
  status,
  tone = "ready",
  footLeft,
  footRight,
  replay = false,
}: {
  label: string;
  status: string;
  tone?: Tone;
  footLeft?: string;
  footRight?: string;
  replay?: boolean;
}) {
  const [run, setRun] = useState(0);

  return (
    <div className={styles.stack}>
      <div className={styles.tile}>
        {/* keyed so Replay remounts both and restarts their animations */}
        <span key={`glow-${run}`} className={styles.glow} aria-hidden="true" />
        <span key={`sweep-${run}`} className={styles.sweep} aria-hidden="true" />
        <div className={styles.top}>
          <span className={styles.label}>{label}</span>
          <span className={styles.label + " " + styles.status}>
            <span className={`${styles.dot} ${styles[tone]}`} />
            {status}
          </span>
        </div>
        <div className={styles.lockup}>
          <Mark className={styles.mark} title="Glassworks" />
          <span className={styles.word} aria-hidden="true">
            Glassworks
          </span>
        </div>
        {(footLeft || footRight) && (
          <div className={styles.foot}>
            <span>{footLeft}</span>
            <span>{footRight}</span>
          </div>
        )}
      </div>
      {replay && (
        <button type="button" className={styles.replay} onClick={() => setRun((n) => n + 1)}>
          Replay
        </button>
      )}
    </div>
  );
}
