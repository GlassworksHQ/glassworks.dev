/**
 * The Glassworks mark: a 2:1 frame (the panel's shape) holding three panes,
 * with the big one lit. Frame and clear panes use currentColor.
 *
 * Gradients come from <MarkDefs/>, rendered once in the root layout.
 * Below ~40px wide, use cut="small": heavier frame, clear panes merged.
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
  const lit = LIT_FILL[variant];
  const clear = variant === "mono" ? 0.35 : 0.26;
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };

  if (cut === "small") {
    return (
      <svg viewBox="0 0 32 16" className={className} width={width} {...a11y}>
        <rect x="1.5" y="1.5" width="29" height="13" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="5" y="5" width="13" height="6" rx="1.5" fill={lit} />
        <rect x="20" y="5" width="7" height="6" rx="1.5" fill="currentColor" fillOpacity={0.4} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 60" className={className} width={width} {...a11y}>
      <rect x="2" y="2" width="116" height="56" rx="14" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="10" y="10" width="54" height="40" rx="6" fill={lit} />
      <rect x="70" y="10" width="40" height="17" rx="6" fill="currentColor" fillOpacity={clear} />
      <rect x="70" y="33" width="40" height="17" rx="6" fill="currentColor" fillOpacity={clear} />
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
