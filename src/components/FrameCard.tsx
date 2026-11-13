"use client";

import Link from "next/link";
import { DeviceModel, FrameCardBody, frameCardClass, useTilt, type FrameDesign } from "@glassworks/frame-card";
import s from "./FrameCard.module.css";

/**
 * A frame in the catalog, drawn by @glassworks/frame-card: the same card as Kiln's picker. The card's
 * outer element is the caller's; here it is a link to the frame's page. The home page and /frames
 * both use it.
 */
export function FrameCard({ f }: { f: FrameDesign }) {
  const tilt = useTilt<HTMLAnchorElement>();
  return (
    <Link {...tilt} href={`/frames/${f.id}`} className={`glass ${frameCardClass} ${s.link}`}>
      <FrameCardBody f={f} />
    </Link>
  );
}

/**
 * The frame's model on its own page. The reflection follows the pointer (the package's --sheen):
 * light moves, glass doesn't.
 */
export function HeroModel({ f }: { f: FrameDesign }) {
  const sheen = (e: React.PointerEvent<HTMLDivElement>) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--sheen", `${50 + ((e.clientX - r.left) / r.width - 0.5) * 70}%`);
  };
  return (
    <div onPointerMove={sheen} onPointerLeave={(e) => e.currentTarget.style.removeProperty("--sheen")}>
      <DeviceModel id={`${f.id}-hero`} model={f.model} label={`${f.name} running Glassworks, an illustration`} />
    </div>
  );
}
