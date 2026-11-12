import type { ComponentType, SVGProps } from "react";
import s from "./PaneLift.module.css";

/*
 * A pane in its socket, drawn in CSS 3D at the stack's isometric angle.
 * The pane is a lit glass block (stacked slices for thickness) with its icon on
 * top. Hovering the card it sits in (any ancestor with data-lift) lifts it out:
 * the block rises, its shadow spreads, and the empty socket shows underneath.
 * Pure CSS, so the browser composites it without repainting.
 */
const SLICES = 6;

export function PaneLift({
  Icon,
  frame = false,
  lifted = false,
}: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** a frame pane: drawn in grey, since it isn't lit everywhere */
  frame?: boolean;
  /** rest out of the socket, as on a pane's own page */
  lifted?: boolean;
}) {
  return (
    <div className={`${s.scene} ${lifted ? s.lifted : ""}`} aria-hidden="true">
      <div className={s.iso}>
        <div className={s.plate}>
          <div className={s.socket} />
          <div className={s.shadow} />
        </div>
        <div className={`${s.pane} ${frame ? s.grey : ""}`}>
          {Array.from({ length: SLICES }, (_, i) => (
            <div key={i} className={s.slice} style={{ ["--k" as string]: i }} />
          ))}
          <div className={s.face}>
            <Icon className={s.icon} />
          </div>
        </div>
      </div>
    </div>
  );
}
