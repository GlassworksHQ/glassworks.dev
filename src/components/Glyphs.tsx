/** 24-grid glyphs at 1.6px stroke, built from the mark's geometry. */
import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const FrameGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="2" y="6" width="20" height="12" rx="3.5" />
  </svg>
);

export const PaneGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="2" y="6" width="20" height="12" rx="3.5" strokeOpacity={0.35} />
    <rect
      x="5.5"
      y="9.5"
      width="8"
      height="5"
      rx="1.2"
      fill="url(#gw-lit)"
      stroke="none"
    />
  </svg>
);

export const KilnGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="M4 20V11a8 8 0 0 1 16 0v9z" />
    <path
      d="M9 20v-4.5a3 3 0 0 1 6 0V20z"
      fill="url(#gw-ember)"
      stroke="none"
    />
    <path d="M2.5 20h19" />
  </svg>
);

/* pane icons */
export const MicGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);

export const MusicGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </svg>
);

export const TimerGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 13.5V9.5M9.5 2.5h5" />
  </svg>
);

export const RadioGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="2" />
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" />
  </svg>
);

export const SensorGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
  </svg>
);

export const BaseGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="4" y="6" width="16" height="12" rx="3" />
    <path d="M8 18v2M16 18v2M9 12h6" />
  </svg>
);

export const GitHubGlyph = (props: GlyphProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
);

/* install ratings */
export const UndoGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);

export const EditGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </svg>
);

export const KeyGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <circle cx="8" cy="16" r="4" />
    <path d="m11 13 9-9M16.5 7.5l2.5 2.5M14.5 9.5l2 2" />
  </svg>
);

export const ScrewdriverGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="m15 3.5 5.5 5.5-3.5 3.5-5.5-5.5z" />
    <path d="m12 10-7 7M5 17l-1.5 3.5L7 19" />
  </svg>
);

export const AppsGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.8" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" />
  </svg>
);

export const EraserGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="M10 20h10" />
    <path d="M4.6 14.6 13.8 5.4a2 2 0 0 1 2.8 0l3 3a2 2 0 0 1 0 2.8L11 19.8H9L4.6 15.4a.6.6 0 0 1 0-.8z" />
    <path d="m9 10 6 6" />
  </svg>
);

export const BackupGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
    <path d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5" />
    <path d="M12 11.5v5.5M9.5 14.5 12 17l2.5-2.5" />
  </svg>
);

export const RefreshGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="M19.5 11A7.5 7.5 0 0 0 6 6.6L4 8.5" />
    <path d="M4 4v4.5h4.5" />
    <path d="M4.5 13A7.5 7.5 0 0 0 18 17.4l2-1.9" />
    <path d="M20 20v-4.5h-4.5" />
  </svg>
);

export const CheckGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12.2 2.4 2.4 4.6-5" />
  </svg>
);

/* hardware */
export const ChipGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
    <rect x="10" y="10" width="4" height="4" rx=".8" />
    <path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" />
  </svg>
);

export const SpeakerGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </svg>
);

export const DeviceGlyph = (props: GlyphProps) => (
  <svg {...base} {...props}>
    <rect x="6" y="3" width="12" height="18" rx="2.5" />
    <path d="M10.5 18h3" />
  </svg>
);

/** Difficulty as a meter: bars fill to the level (1 easy, 2 medium, 3 hard). */
export const DifficultyGlyph = ({
  level,
  ...props
}: GlyphProps & { level: 0 | 1 | 2 | 3 }) => (
  <svg {...base} {...props}>
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={4.5 + i * 6}
        y={16 - i * 4.5}
        width="3.5"
        height={4.5 + i * 4.5}
        rx="1.2"
        fill={i < level ? "currentColor" : "none"}
      />
    ))}
  </svg>
);
