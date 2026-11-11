/** 24-grid glyphs at 1.6px stroke, built from the mark's geometry. */
type GlyphProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const FrameGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <rect x="2" y="6" width="20" height="12" rx="3.5" />
  </svg>
);

export const PaneGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <rect x="2" y="6" width="20" height="12" rx="3.5" strokeOpacity={0.35} />
    <rect x="5.5" y="9.5" width="8" height="5" rx="1.2" fill="url(#gw-lit)" stroke="none" />
  </svg>
);

export const KilnGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <path d="M4 20V11a8 8 0 0 1 16 0v9z" />
    <path d="M9 20v-4.5a3 3 0 0 1 6 0V20z" fill="url(#gw-ember)" stroke="none" />
    <path d="M2.5 20h19" />
  </svg>
);

/* pane icons */
export const MicGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);

export const MusicGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </svg>
);

export const TimerGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 13.5V9.5M9.5 2.5h5" />
  </svg>
);

export const RadioGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
  </svg>
);

export const SensorGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
  </svg>
);

export const BaseGlyph = ({ className }: GlyphProps) => (
  <svg {...base} className={className}>
    <rect x="4" y="6" width="16" height="12" rx="3" />
    <path d="M8 18v2M16 18v2M9 12h6" />
  </svg>
);

export const GitHubGlyph = ({ className }: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
);
