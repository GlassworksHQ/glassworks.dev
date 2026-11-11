import type { DeviceStatus, Support } from "@/lib/devices";
import { supportText } from "@/lib/devices";
import type { PaneId } from "@/lib/site";
import {
  BaseGlyph,
  MicGlyph,
  MusicGlyph,
  RadioGlyph,
  SensorGlyph,
  TimerGlyph,
} from "./Glyphs";
import { Mark } from "./Mark";
import styles from "./DeviceBits.module.css";

export const paneIcon: Record<PaneId, typeof MicGlyph> = {
  assist: MicGlyph,
  timers: TimerGlyph,
  sendspin: MusicGlyph,
  radio: RadioGlyph,
  sensors: SensorGlyph,
  base: BaseGlyph,
};

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

/** Pane support on a device. Only "works" gets colour; the rest are plain text. */
export function SupportTag({ support }: { support: Support }) {
  return (
    <span className={`${styles.support} ${styles[`s_${support}`]}`}>
      {supportText[support]}
    </span>
  );
}

/**
 * The device's screen, drawn as a night glass tile in its real shape.
 * Square panels sit centred in the same 2:1 slot so cards line up.
 */
export function DeviceScreen({
  shape,
  size = "card",
}: {
  shape: "wide" | "square";
  size?: "card" | "hero";
}) {
  return (
    <span className={`${styles.slot} ${styles[size]}`} aria-hidden="true">
      <span
        className={`${styles.screen} ${shape === "square" ? styles.square : ""}`}
      >
        <Mark className={styles.mark} />
      </span>
    </span>
  );
}
