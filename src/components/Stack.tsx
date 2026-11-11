"use client";

import { useState } from "react";
import { KilnGlyph } from "./Glyphs";
import styles from "./Stack.module.css";

/*
 * An exploded isometric view of a Glassworks panel, layer by layer.
 * Every plate uses the same 3 x 2 grid, so a column reads as one feature through
 * the stack: the radio chip, the frame's radio backend, the core's ESPHome device,
 * a pane socket and the radio pane all sit in the same place.
 * Plates never move; light does (dashes flowing up the columns and out to HA).
 */

type LayerId = "panes" | "api" | "core" | "frame" | "hardware";

type Layer = {
  id: LayerId;
  name: string;
  code: string;
  z: number;
  thick: number;
  label: string;
  cells: (string | null)[]; // 6 cells: row 0 then row 1, left to right
  lit?: number[]; // cells drawn as lit panes
  sockets?: boolean; // dashed outlines instead of blocks
  chips?: boolean; // solid hardware blocks
  dashed?: number[]; // frame-specific cells
  desc: string;
  items: string[];
  note?: string;
};

const LAYERS: Layer[] = [
  {
    id: "panes",
    name: "Panes",
    code: "panes/*",
    z: 280,
    thick: 5,
    label: "PANES",
    cells: ["Assist", "Timers", "Radio", "Sensors", "Device pane", "Sendspin"],
    lit: [0, 2, 3, 5],
    dashed: [4],
    desc: "Plugins. Each declares what hardware it needs.",
    items: [
      "Assist",
      "Timers",
      "Zigbee / Thread radio",
      "Android sensors",
      "Sendspin",
      "Frame-specific panes, like the S1 wall base",
    ],
  },
  {
    id: "api",
    name: "Pane API",
    code: ":glassworks-pane-api",
    z: 210,
    thick: 3,
    label: "PANE API",
    cells: [null, null, null, null, null, null],
    sockets: true,
    desc: "The stable contract between core and panes.",
    items: [
      "entities()",
      "settings()",
      "setupSteps()",
      "overlays()",
      "requires ↔ provides",
    ],
  },
  {
    id: "core",
    name: "Glassworks core",
    code: ":glassworks-core",
    z: 140,
    thick: 5,
    label: "GLASSWORKS CORE",
    cells: ["Shell", "Setup", "Device", "Screen", "Settings", "Update"],
    desc: "What every panel needs. No device code.",
    items: [
      "GeckoView dashboard shell",
      "Setup flow",
      "ESPHome device and entity registry",
      "Screen policy",
      "Settings menu",
      "Updates through HA",
    ],
    note: "Built on standalone libraries: esphome-api, improv, ha-auth, sendspin-protocol.",
  },
  {
    id: "frame",
    name: "Frame",
    code: "frames/<device>",
    z: 70,
    thick: 5,
    label: "FRAME · ONE PER DEVICE",
    cells: [
      "Board id",
      "Installer",
      "Radio backend",
      "Presence",
      "Device I/O",
      "Screen off",
    ],
    desc: "One per device. Everything hardware-specific lives here.",
    items: [
      "Board id",
      "Update installer",
      "Radio backend",
      "Presence and light sources",
      "Device extras, like relays",
      "Screen-off method",
    ],
  },
  {
    id: "hardware",
    name: "Hardware",
    code: "Any Android panel",
    z: 0,
    thick: 6,
    label: "HARDWARE · ANY ANDROID PANEL",
    cells: [
      "Microphone",
      "SoC",
      "Radio chip",
      "Presence",
      "Device I/O",
      "Speaker",
    ],
    chips: true,
    desc: "Any Android panel. Kiln installs over USB, from the browser.",
    items: [
      "An Android SoC",
      "Zigbee / Thread radio (optional)",
      "Presence and light sensors",
      "Microphone and speaker",
      "Relays, wall base and other extras",
    ],
  },
];

/* plate geometry, in plate units */
const W = 200;
const D = 120;
const COL_X = [10, 73, 136];
const ROW_Y = [10, 56];
const CW = 54;
const CH = 40;

/* isometric projection */
const C = 0.8660254;
const S = 0.5;
const iso = (x: number, y: number, z: number) =>
  [C * (x - y), S * (x + y) - z] as const;
const plane = (z: number) => `matrix(${C} ${S} ${-C} ${S} 0 ${-z})`;

/* light columns: [plate x, plate y] at a cell's centre */
const COLUMNS: [number, number][] = [
  [COL_X[0] + CW / 2, ROW_Y[0] + CH / 2], // mic → assist
  [COL_X[2] + CW / 2, ROW_Y[0] + CH / 2], // radio
  [COL_X[0] + CW / 2, ROW_Y[1] + CH / 2], // presence sensor → screen → sensors
];

function Plate({
  layer,
  dim,
  onEnter,
}: {
  layer: Layer;
  dim: boolean;
  onEnter: () => void;
}) {
  const { z, thick } = layer;
  return (
    <g
      className={`${styles.plate} ${dim ? styles.dim : ""}`}
      style={{ ["--i" as string]: LAYERS.length - LAYERS.indexOf(layer) }}
      onMouseEnter={onEnter}
    >
      {/* the slab's edge: the same plate drawn lower, showing below the top */}
      <g transform={plane(z - thick)}>
        <rect width={W} height={D} rx="9" className={styles.edge} />
      </g>
      <g transform={plane(z)}>
        <rect width={W} height={D} rx="9" className={styles.top} />
        {layer.cells.map((cell, i) => {
          const x = COL_X[i % 3];
          const y = ROW_Y[Math.floor(i / 3)];
          const lit = layer.lit?.includes(i);
          const cls = layer.sockets
            ? styles.socket
            : layer.chips
              ? styles.chip
              : lit
                ? styles.lit
                : layer.dashed?.includes(i)
                  ? styles.own
                  : styles.cell;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={CW}
                height={CH}
                rx="5"
                className={cls}
                fill={lit ? "url(#gw-lit)" : undefined}
              />
              {cell && (
                <text
                  x={x + CW / 2}
                  y={y + CH / 2 + 2.4}
                  textAnchor="middle"
                  className={lit ? styles.cellTextLit : styles.cellText}
                >
                  {cell}
                </text>
              )}
            </g>
          );
        })}
        <text x="10" y="110" className={styles.plateLabel}>
          {layer.label}
        </text>
      </g>
    </g>
  );
}

function Beam({
  x,
  y,
  z0,
  z1,
  delay,
}: {
  x: number;
  y: number;
  z0: number;
  z1: number;
  delay: number;
}) {
  const [ax, ay] = iso(x, y, z0);
  const [bx, by] = iso(x, y, z1);
  return (
    <g>
      <line x1={ax} y1={ay} x2={bx} y2={by} className={styles.beamRail} />
      <line
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        className={styles.beam}
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  );
}

function External({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone = "sky",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  tone?: "sky" | "ember";
}) {
  return (
    <g className={styles.ext}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        className={styles.extBox}
      />
      {tone === "ember" ? (
        <KilnGlyph
          x={x + 9}
          y={y + 8}
          width={15}
          height={15}
          className={styles.extIcon}
        />
      ) : (
        <circle cx={x + 14} cy={y + 17} r="3" className={styles.dotSky} />
      )}
      <text
        x={x + (tone === "ember" ? 29 : 24)}
        y={y + 20}
        className={styles.extTitle}
      >
        {title}
      </text>
      <text x={x + 14} y={y + 35} className={styles.extSub}>
        {sub}
      </text>
    </g>
  );
}

function Wire({
  d,
  tone = "sky",
  delay = 0,
}: {
  d: string;
  tone?: "sky" | "ember";
  delay?: number;
}) {
  return (
    <g>
      <path d={d} className={styles.wireRail} />
      <path
        d={d}
        className={tone === "ember" ? styles.wireEmber : styles.wire}
        style={{ animationDelay: `${delay}s` }}
      />
    </g>
  );
}

export function Stack() {
  const [hover, setHover] = useState<LayerId | null>(null);
  const [pinned, setPinned] = useState<LayerId | null>(null);
  const active = hover ?? pinned;

  // bottom to top, with the light columns drawn between each pair of plates
  const ordered = [...LAYERS].reverse();

  const [coreRx, coreRy] = iso(W, 0, 140);
  const [radioX, radioY] = iso(COL_X[2] + CW, ROW_Y[0] + CH / 2, 280);
  const [sendX, sendY] = iso(COL_X[2] + CW, ROW_Y[1] + CH / 2, 280);
  const [hwLx, hwLy] = iso(0, D, -6);

  return (
    <div className={styles.wrap}>
      <div className={styles.figure} onMouseLeave={() => setHover(null)}>
        <svg
          viewBox="-178 -305 610 480"
          role="img"
          aria-labelledby="stack-title stack-desc"
          className={styles.svg}
        >
          <title id="stack-title">How a Glassworks panel is built</title>
          <desc id="stack-desc">
            Five layers, bottom to top: the hardware, the frame, the Glassworks
            core, the pane API and the panes. The core talks to Home Assistant;
            the radio pane serves ZHA, Zigbee2MQTT and OTBR; Sendspin plays from
            Music Assistant. Kiln installs it all over USB.
          </desc>

          {ordered.map((layer, i) => {
            const next = ordered[i + 1];
            return (
              <g key={layer.id}>
                <Plate
                  layer={layer}
                  dim={active !== null && active !== layer.id}
                  onEnter={() => setHover(layer.id)}
                />
                {next &&
                  COLUMNS.map(([x, y], c) => (
                    <Beam
                      key={c}
                      x={x}
                      y={y}
                      z0={layer.z}
                      z1={next.z - next.thick}
                      delay={i * 0.35 + c * 0.6}
                    />
                  ))}
              </g>
            );
          })}

          {/* out to the rest of the house */}
          <Wire
            d={`M${radioX} ${radioY} C 222 ${radioY}, 214 -262, 252 -262`}
            delay={0.2}
          />
          <Wire
            d={`M${sendX} ${sendY} C 222 ${sendY}, 214 -186, 252 -186`}
            delay={0.9}
          />
          <Wire
            d={`M${coreRx} ${coreRy} C 222 ${coreRy}, 214 -66, 252 -66`}
            delay={0.5}
          />
          <External
            x={252}
            y={-290}
            w={172}
            h={50}
            title="ZHA · Z2M · OTBR"
            sub="Radio over TCP, firewalled"
          />
          <External
            x={252}
            y={-214}
            w={172}
            h={50}
            title="Music Assistant"
            sub="Synced audio over Sendspin"
          />
          <External
            x={252}
            y={-98}
            w={172}
            h={64}
            title="Home Assistant"
            sub="ESPHome device · dashboard · updates"
          />

          {/* Kiln, feeding the hardware from below */}
          <Wire d={`M${hwLx} 114 L ${hwLx} ${hwLy + 2}`} tone="ember" />
          <External
            x={-176}
            y={114}
            w={150}
            h={50}
            title="Kiln"
            sub="USB · root · flash · provision"
            tone="ember"
          />
        </svg>
      </div>

      <div className={styles.side}>
        <ol className={styles.legend} aria-label="Layers, top to bottom">
          {LAYERS.map((l) => {
            const open = active === l.id;
            return (
              <li
                key={l.id}
                className={`${styles.item} ${open ? styles.open : ""} ${active && !open ? styles.itemDim : ""}`}
              >
                <button
                  type="button"
                  className={styles.itemBtn}
                  aria-expanded={open}
                  onMouseEnter={() => setHover(l.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(l.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => setPinned((p) => (p === l.id ? null : l.id))}
                >
                  <span className={styles.itemName}>{l.name}</span>
                  <code className={styles.itemCode}>{l.code}</code>
                </button>
                <p className={styles.itemDesc}>{l.desc}</p>
              </li>
            );
          })}
        </ol>

        {/* Every version of this card sits in the same grid cell, so the card is
          always as tall as the longest one and hovering never moves the page. */}
        <div className={styles.detail} aria-live="polite">
          <div
            className={`${styles.panel} ${active === null ? styles.shown : ""}`}
            aria-hidden={active !== null}
          >
            <span className="label">Example</span>
            <p className={styles.panelLead}>
              S1 Unleashed is the Aqara S1 Plus frame, with the radio and
              wall-base panes.
            </p>
            <p className={styles.panelHint}>Hover a layer for details.</p>
          </div>
          {LAYERS.map((l) => (
            <div
              key={l.id}
              className={`${styles.panel} ${active === l.id ? styles.shown : ""}`}
              aria-hidden={active !== l.id}
            >
              <span className="label">{l.name}</span>
              <ul className={styles.chips}>
                {l.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              {l.note && <p className={styles.itemNote}>{l.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
