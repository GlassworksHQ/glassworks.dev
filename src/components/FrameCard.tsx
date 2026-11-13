"use client";

import Link from "next/link";
import { useRef } from "react";
import { DeviceModel, FrameCardBody, frameCardClass, useTilt, type FrameDesign } from "@glassworks/frame-card";
import s from "./FrameCard.module.css";

/**
 * A frame in the catalog, drawn by @glassworks/frame-card: the same card as Kiln's picker, with the
 * site's own line under it (`children`: the Clarity grade). The card's
 * outer element is the caller's; here it is a link to the frame's page. The home page and /frames
 * both use it.
 */
export function FrameCard({ f, children }: { f: FrameDesign; children?: React.ReactNode }) {
  const tilt = useTilt<HTMLAnchorElement>();
  return (
    <Link {...tilt} href={`/frames/${f.id}`} className={`glass ${frameCardClass} ${s.link}`}>
      <FrameCardBody f={f} />
      {children}
    </Link>
  );
}

/**
 * The frame's model on its own page. The reflection follows the pointer (the package's --sheen):
 * light moves, glass doesn't.
 */
export function HeroModel({ f }: { f: FrameDesign }) {
  const frame = useRef(0);
  // a mouse only, and one style write per frame at most, like the card's tilt
  const sheen = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const x = e.clientX;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sheen", `${50 + ((x - r.left) / r.width - 0.5) * 70}%`);
    });
  };
  const leave = (e: React.PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frame.current);
    e.currentTarget.style.removeProperty("--sheen");
  };
  return (
    <div onPointerMove={sheen} onPointerLeave={leave}>
      <DeviceModel id={`${f.id}-hero`} model={f.model} label={`${f.name} running Glassworks, an illustration`} />
    </div>
  );
}
