"use client";

import { useState } from "react";
import styles from "./Switch.module.css";

/** On is lit: a pane that's on is a lit pane. */
export function Switch({ label, defaultOn = false, disabled = false }: { label: string; defaultOn?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={styles.switch}
      onClick={() => setOn((v) => !v)}
    />
  );
}
