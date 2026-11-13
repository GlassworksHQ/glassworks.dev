"use client";

import type { ReactNode } from "react";

/** A link to the Clarity panel that also opens it. Without JavaScript it still scrolls there. */
export function ClarityChipLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      href="#clarity"
      className={className}
      onClick={() => {
        const panel = document.getElementById("clarity-panel");
        if (panel instanceof HTMLDetailsElement) panel.open = true;
      }}
    >
      {children}
    </a>
  );
}
