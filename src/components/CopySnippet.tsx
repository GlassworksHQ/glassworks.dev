"use client";

import { useRef, useState } from "react";
import styles from "./CopySnippet.module.css";

export function CopySnippet({ code, label }: { code: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "select">("idle");
  const pre = useRef<HTMLPreElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      // clipboard refused: select the text so Cmd/Ctrl+C works
      const range = document.createRange();
      if (pre.current) range.selectNodeContents(pre.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      setState("select");
    }
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <span className="label">{label}</span>
        <button type="button" className={styles.btn} onClick={copy}>
          {state === "copied"
            ? "Copied"
            : state === "select"
              ? "Press ⌘C"
              : "Copy"}
        </button>
      </div>
      <pre ref={pre} className={styles.pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
