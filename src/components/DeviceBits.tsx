import type { DeviceStatus, RatingKey, Ratings, Support } from "@/lib/devices";
import {
  cardTags,
  ratingFields,
  ratingText,
  severity,
  supportText,
} from "@/lib/devices";
import type { PaneId } from "@/lib/site";
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
  MicGlyph,
  MusicGlyph,
  RadioGlyph,
  RefreshGlyph,
  RulerGlyph,
  ScrewdriverGlyph,
  SensorGlyph,
  SpeakerGlyph,
  TimerGlyph,
  UndoGlyph,
} from "./Glyphs";
import styles from "./DeviceBits.module.css";

export const paneIcon: Record<PaneId, typeof MicGlyph> = {
  assist: MicGlyph,
  timers: TimerGlyph,
  sendspin: MusicGlyph,
  radio: RadioGlyph,
  sensors: SensorGlyph,
  base: BaseGlyph,
};

/* one glyph per install field; difficulty draws a meter instead */
const ratingIcon: Record<Exclude<RatingKey, "difficulty">, typeof MicGlyph> = {
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
const specIcon: Record<string, typeof MicGlyph> = {
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

const statusText: Record<DeviceStatus, string> = {
  works: "Works today",
  planned: "Planned",
};

export function StatusPill({ status }: { status: DeviceStatus }) {
  return (
    <span className={`${styles.pill} ${styles[status]}`}>
      {statusText[status]}
    </span>
  );
}

/** Difficulty, reversibility and whether Android is modified, as card tags. */
export function RatingTags({
  ratings,
  expected,
}: {
  ratings: Ratings;
  expected?: boolean;
}) {
  return (
    <ul
      className={styles.tags}
      aria-label={expected ? "Install, expected" : "Install"}
    >
      {cardTags(ratings).map((t) => (
        <li
          key={t.text}
          className={t.severity ? styles[t.severity] : undefined}
        >
          <RatingIcon
            field={t.key}
            value={t.value}
            className={styles.tagIcon}
          />
          {t.text}
        </li>
      ))}
    </ul>
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

/** Pane support on a device. Only "works" gets colour; the rest are plain text. */
export function SupportTag({ support }: { support: Support }) {
  return (
    <span className={`${styles.support} ${styles[`s_${support}`]}`}>
      {supportText[support]}
    </span>
  );
}
