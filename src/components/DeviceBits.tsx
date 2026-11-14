import type { RatingKey, Support } from "@/lib/frameText";
import { ratingFields, ratingText, severity, supportText } from "@/lib/frameText";
import type { ComponentType, SVGProps } from "react";
import { panes, type PaneId } from "@/lib/site";
import {
  AppsGlyph,
  BackupGlyph,
  BaseGlyph,
  CheckGlyph,
  ChipGlyph,
  DeviceGlyph,
  DifficultyGlyph,
  EditGlyph,
  EraserGlyph,
  FrameGlyph,
  GaugeGlyph,
  KeyGlyph,
  RadioGlyph,
  RefreshGlyph,
  RulerGlyph,
  ScrewdriverGlyph,
  SensorGlyph,
  SpeakerGlyph,
  UndoGlyph,
} from "./Glyphs";
import styles from "./DeviceBits.module.css";

/**
 * Each pane's icon, from its icon.svg in the main repo (the pane catalog): 24 × 24, stroked with
 * currentColor, no fills or colours, so it draws like the site's glyphs. Its PaneCatalogTest keeps the
 * markup to those shapes (no script, no external references), so it can go in as markup.
 */
const svgInner = (svg: string) => svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const catalogIcon = (svg: string) => {
  const inner = { __html: svgInner(svg) };
  const Icon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} dangerouslySetInnerHTML={inner} />
  );
  return Icon;
};
export const paneIcon: Record<PaneId, ComponentType<SVGProps<SVGSVGElement>>> = Object.fromEntries(
  panes.map((p) => [p.id, catalogIcon(p.icon)]),
);

/* one glyph per install field; difficulty draws a meter instead */
const ratingIcon: Record<Exclude<RatingKey, "difficulty">, typeof UndoGlyph> = {
  reversible: UndoGlyph,
  modifiesAndroid: EditGlyph,
  root: KeyGlyph,
  opensDevice: ScrewdriverGlyph,
  vendorApps: AppsGlyph,
  wipes: EraserGlyph,
  backup: BackupGlyph,
  updates: RefreshGlyph,
};

const difficultyLevel = {
  preinstalled: 0,
  easy: 1,
  medium: 2,
  hard: 3,
} as const;

function RatingIcon({
  field,
  value,
  className,
}: {
  field: RatingKey;
  value?: string;
  className?: string;
}) {
  if (field === "difficulty") {
    if (value === "preinstalled") return <CheckGlyph className={className} />;
    const level = difficultyLevel[value as keyof typeof difficultyLevel] ?? 0;
    return (
      <DifficultyGlyph level={level as 0 | 1 | 2 | 3} className={className} />
    );
  }
  // "Android untouched" gets a check, not the pencil
  if (field === "modifiesAndroid" && value === "no")
    return <CheckGlyph className={className} />;
  const Icon = ratingIcon[field];
  return <Icon className={className} />;
}

/** A field's name with its glyph, for table rows and device pages. */
export function RatingLabel({ field }: { field: RatingKey }) {
  return (
    <span className={styles.label}>
      {field === "difficulty" ? (
        <GaugeGlyph className={styles.labelIcon} />
      ) : (
        <RatingIcon field={field} className={styles.labelIcon} />
      )}
      {ratingFields[field].label}
    </span>
  );
}

/* hardware spec labels */
const specIcon: Record<string, typeof UndoGlyph> = {
  SoC: ChipGlyph,
  Android: DeviceGlyph,
  Size: RulerGlyph,
  Screen: FrameGlyph,
  Radio: RadioGlyph,
  Presence: SensorGlyph,
  Audio: SpeakerGlyph,
  Extras: BaseGlyph,
  Mount: BaseGlyph,
  Root: KeyGlyph,
};

export function SpecLabel({ label }: { label: string }) {
  const Icon = specIcon[label];
  return (
    <span className={styles.label}>
      {Icon && <Icon className={styles.labelIcon} />}
      {label}
    </span>
  );
}

/** One rated answer, e.g. "Medium", with its detail underneath. */
export function RatingValue({
  field,
  rating,
}: {
  field: RatingKey;
  rating: { value: string; detail?: string };
}) {
  const value = rating.value;
  const sev = severity(field, value);
  const meter = field === "difficulty" && value !== "unknown";
  return (
    <span className={styles.rating}>
      <span
        className={`${styles.ratingValue} ${sev ? styles[sev] : ""} ${value === "unknown" ? styles.unknownValue : ""} ${meter ? styles.withMeter : ""}`}
      >
        {meter && (
          <RatingIcon
            field="difficulty"
            value={value}
            className={styles.meter}
          />
        )}
        {ratingText(field, value)}
      </span>
      {rating.detail && (
        <span className={styles.ratingDetail}>{rating.detail}</span>
      )}
    </span>
  );
}

/*
 * The stage marker, the same as the status badges: a dashed ring for under
 * development, an amber α or β for alpha and beta, a green dot for stable, a
 * hollow ring for planned. Depends, not checked and no keep their own marks.
 */
export function StageMark({ stage }: { stage: Support }) {
  return <span className={`${styles.mark} ${styles[`m_${stage}`]}`} aria-hidden="true" />;
}

/** Pane support on a device: its marker and its label. */
export function SupportTag({ support }: { support: Support }) {
  return (
    <span className={`${styles.support} ${styles[`s_${support}`]}`}>
      <StageMark stage={support} />
      {supportText[support]}
    </span>
  );
}
