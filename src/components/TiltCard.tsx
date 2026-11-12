"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/*
 * A card that leans its 3D scene a few degrees toward the pointer, by setting
 * --tilt-x and --tilt-z (read by PaneLift). One style write per frame at most,
 * and nothing at all on touch or with reduced motion. data-lift on the card is
 * what lifts the pane on hover and focus. With href, the card is a link.
 */
export function TiltCard({
  className,
  href,
  label,
  children,
}: {
  className?: string;
  href?: string;
  /** accessible name when the card is a link */
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  const set = (x: number, z: number) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      ref.current?.style.setProperty("--tilt-x", `${x}deg`);
      ref.current?.style.setProperty("--tilt-z", `${z}deg`);
    });
  };

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    set(dy * -10, dx * 14);
  };

  const props = { className, "data-lift": "", onPointerMove: onMove, onPointerLeave: () => set(0, 0) };
  return href ? (
    <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} aria-label={label} {...props}>
      {children}
    </Link>
  ) : (
    <div ref={ref as React.Ref<HTMLDivElement>} {...props}>
      {children}
    </div>
  );
}
