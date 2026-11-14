import { paneById, paneSupport, type FrameDesign, type Support } from "@glassworks/frame-card";
import { frameById } from "./frames";
import type { PaneId } from "./site";

/**
 * How a frame runs a pane: its own rating in frame.json, or one worked out from the pane's `requires`
 * and the frame's `provides` (frame-card `paneSupport`), whose reason stands in for the note. A frame
 * pane's reason names its frame ("Only on the Aqara S1 Plus."). Server only: it reads the frames.
 */
export function support(d: FrameDesign, id: PaneId): { support: Support; note?: string; derived: boolean } {
  const pane = paneById(id);
  if (!pane) throw new Error(`no pane "${id}" in the pane catalog`);
  const s = paneSupport(d, pane, (frame) => frameById(frame)?.name);
  return { support: s.support, note: s.note ?? s.reason, derived: s.derived };
}
