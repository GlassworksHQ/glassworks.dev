import { markPlates } from "@/lib/markGeometry";

/**
 * The Glassworks mark: three plates of the stack at its isometric angle, the top
 * one lit. Lower plates use currentColor.
 *
 * Gradients come from <MarkDefs/>, rendered once in the root layout.
 * Below ~40px wide, use cut="small": two plates and a heavier line.
 */
type MarkProps = {
  variant?: "lit" | "ember" | "mono";
  cut?: "full" | "small";
  className?: string;
  /** Accessible name. Omit when the mark sits next to the word "Glassworks". */
  title?: string;
  width?: number;
};

const LIT_FILL = { lit: "url(#gw-lit)", ember: "url(#gw-ember)", mono: "currentColor" } as const;

export function Mark({ variant = "lit", cut = "full", className, title, width }: MarkProps) {
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  return (
    <svg viewBox="0 0 120 120" className={className} width={width} {...a11y}>
      {markPlates(cut).map((p, i) =>
        p.lit ? (
          <path key={i} d={p.d} fill={LIT_FILL[variant]} />
        ) : (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke="currentColor"
            strokeOpacity={p.opacity}
            strokeWidth={p.strokeWidth}
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
}

/** Shared gradients for the mark and glyphs. Render once, in the root layout. */
export function MarkDefs() {
  return (
    <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <linearGradient id="gw-lit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="gw-ember" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
