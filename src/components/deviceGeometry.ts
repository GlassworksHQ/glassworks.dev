/*
 * Geometry for the 3D device mockups.
 *
 * Every device is described in real millimetres (MODELS below): a rounded body
 * extruded by its depth, a bezel, colours, a front finish, how it's mounted, and
 * optional parts outside the body such as stand legs. This is the shape the
 * frame.json "model" section will carry (planning/decisions.md).
 *
 * geometry() fits the model into a stage, poses it for its mount, and returns:
 *   - the side faces that face the viewer, shaded by a top-left light, as SVG
 *   - parts (tubes) and a floor shadow, projected the same way
 *   - the CSS variables for the front glass, which CSS 3D draws as one plane
 *     with exactly the transform used here, so glass and sides line up
 *
 * Stage units: the stage is 100 wide and 100 / aspect tall. --u in CSS is 1% of
 * the stage width, so these numbers carry straight over.
 */

/** Add a form factor here and in MODELS below. */
export type ModelShape = "s1" | "square" | "tablet" | "mirror";

type V3 = [number, number, number];

export type ModelDef = {
  /** body in mm: width, height, depth, corner radius */
  body: { w: number; h: number; d: number; r: number };
  /** frame around the screen, mm */
  bezel: number;
  /** screen corner radius, mm */
  screenRadius: number;
  /** sides: colour facing away from the light, and facing it */
  sides: { dark: string; light: string };
  finish: "glass" | "mirror";
  mount: "wall" | "floor";
  /** parts outside the body, mm from the body's centre (x right, y down, z towards you) */
  parts?: { kind: "tube"; from: V3; to: V3; diameter: number; color: string }[];
};

const DARK_SIDES = { dark: "#0c0d10", light: "#3b3f49" };

export const MODELS: Record<ModelShape, ModelDef> = {
  // Aqara S1 Plus, from Aqara's drawing: 172 x 86 mm, ~12 mm slab (the 42 mm
  // quoted depth includes the in-wall box), near-square corners, white body
  s1: {
    body: { w: 172, h: 86, d: 12, r: 2.5 },
    bezel: 3.5,
    screenRadius: 1.4,
    sides: { dark: "#8f949d", light: "#f4f5f7" },
    finish: "glass",
    mount: "wall",
  },
  // a generic square wall panel
  square: {
    body: { w: 86, h: 86, d: 9.5, r: 7.4 },
    bezel: 6.9,
    screenRadius: 3.3,
    sides: DARK_SIDES,
    finish: "glass",
    mount: "wall",
  },
  // a generic tablet
  tablet: {
    body: { w: 250, h: 156, d: 7, r: 11 },
    bezel: 11,
    screenRadius: 5,
    sides: DARK_SIDES,
    finish: "glass",
    mount: "wall",
  },
  // a smart mirror on a floor stand. Illustrative sizes; not a specific product.
  mirror: {
    body: { w: 560, h: 1700, d: 30, r: 3 },
    bezel: 14,
    screenRadius: 2,
    sides: DARK_SIDES,
    finish: "mirror",
    mount: "floor",
    parts: (() => {
      const x = 560 / 2 - 24; // legs just inside the edges
      const top = 1700 / 2 - 160; // they start behind the body
      const floor = 1700 / 2 + 70; // the body stands 70 mm off the floor
      const z = -30 / 2 - 7; // just behind the back
      const c = "#4b4f58"; // mid-grey metal: reads on both light and dark pages
      const tube = (from: V3, to: V3) => ({
        kind: "tube" as const,
        from,
        to,
        diameter: 12,
        color: c,
      });
      return [
        tube([-x, top, z], [-x, floor, z]),
        tube([x, top, z], [x, floor, z]),
        tube([-x, floor, z], [x, floor, z]),
        tube([-x, floor, z], [-x, floor, z - 280]),
        tube([x, floor, z], [x, floor, z - 280]),
      ];
    })(),
  },
};

/* viewing angle per mount: wall panels from a little below eye level, floor
   mirrors nearly face-on from standing height */
const VIEWS = {
  wall: { rx: 9, ry: -22 },
  floor: { rx: 3, ry: -24 },
} as const;
const PERSPECTIVE = 170;

const rad = (deg: number) => (deg * Math.PI) / 180;

/* CSS rotateX then rotateY, as the spec applies them: p' = Rx(Ry(p)). y points down. */
function rotate([x, y, z]: V3, view: { rx: number; ry: number }): V3 {
  const a = rad(view.ry);
  const x1 = Math.cos(a) * x + Math.sin(a) * z;
  const z1 = -Math.sin(a) * x + Math.cos(a) * z;
  const b = rad(view.rx);
  return [
    x1,
    Math.cos(b) * y - Math.sin(b) * z1,
    Math.sin(b) * y + Math.cos(b) * z1,
  ];
}

/* the rounded-rectangle outline, clockwise on screen, with outward normals */
function outline(w: number, h: number, r: number, steps = 6) {
  const hw = w / 2;
  const hh = h / 2;
  const corners: [number, number, number][] = [
    [hw - r, -hh + r, -90],
    [hw - r, hh - r, 0],
    [-hw + r, hh - r, 90],
    [-hw + r, -hh + r, 180],
  ];
  const pts: { x: number; y: number; nx: number; ny: number }[] = [];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= steps; i++) {
      const t = rad(start + (90 * i) / steps);
      pts.push({
        x: cx + r * Math.cos(t),
        y: cy + r * Math.sin(t),
        nx: Math.cos(t),
        ny: Math.sin(t),
      });
    }
  }
  return pts;
}

const LIGHT: V3 = (() => {
  const v: V3 = [-0.45, -0.75, 0.5];
  const n = Math.hypot(...v);
  return [v[0] / n, v[1] / n, v[2] / n];
})();

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

const f3 = (n: number) => +n.toFixed(3);

export type Face = { points: string; fill: string };
export type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: string;
};
export type Layout = "landscape" | "square" | "portrait";

export type Geometry = {
  /** stage height in stage units (width is 100) */
  stageH: number;
  faces: Face[];
  parts: Line[];
  floorShadow?: string;
  /** CSS custom properties for the front glass */
  vars: Record<string, string>;
  /** 2D shift that centres what's drawn */
  transform: string;
  layout: Layout;
  finish: ModelDef["finish"];
  mount: ModelDef["mount"];
};

/** Fit, pose and project a model for a stage of the given aspect ratio (width / height). */
export function geometry(shape: ModelShape, stageAspect: number): Geometry {
  const m = MODELS[shape];
  const view = VIEWS[m.mount];
  const stageH = 100 / stageAspect;
  const cx = 50;
  const cy = stageH / 2;
  const project = ([x, y, z]: V3): [number, number] => {
    const s = PERSPECTIVE / (PERSPECTIVE - z);
    return [cx + x * s, cy + y * s];
  };

  // everything that's drawn, in mm, for measuring the fit
  const { w, h, d, r } = m.body;
  const ring = outline(w, h, r);
  const silhouette: V3[] = [
    ...ring.map((p): V3 => [p.x, p.y, d / 2]),
    ...ring.map((p): V3 => [p.x, p.y, -d / 2]),
    ...(m.parts ?? []).flatMap((p) => [p.from, p.to]),
  ];

  // scale mm to stage units so the drawing fills the stage with a margin.
  // Perspective makes this slightly non-linear, so refine a few times.
  const maxW = 72;
  const maxH = stageH * 0.86;
  let k = Math.min(maxW / w, maxH / h);
  let box = { x0: 0, x1: 0, y0: 0, y1: 0 };
  for (let i = 0; i < 4; i++) {
    const pts = silhouette.map((p) =>
      project(rotate([p[0] * k, p[1] * k, p[2] * k], view)),
    );
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    box = {
      x0: Math.min(...xs),
      x1: Math.max(...xs),
      y0: Math.min(...ys),
      y1: Math.max(...ys),
    };
    k *= Math.min(maxW / (box.x1 - box.x0), maxH / (box.y1 - box.y0));
  }
  // final box at the final scale, for centring
  {
    const pts = silhouette.map((p) =>
      project(rotate([p[0] * k, p[1] * k, p[2] * k], view)),
    );
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    box = {
      x0: Math.min(...xs),
      x1: Math.max(...xs),
      y0: Math.min(...ys),
      y1: Math.max(...ys),
    };
  }
  const P = (p: V3) => project(rotate([p[0] * k, p[1] * k, p[2] * k], view));

  // side faces that face the viewer
  const camera: V3 = [0, 0, PERSPECTIVE];
  const faces: Face[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-6) continue;
    const n = rotate([(a.nx + b.nx) / 2, (a.ny + b.ny) / 2, 0], view);
    const mid = rotate([((a.x + b.x) / 2) * k, ((a.y + b.y) / 2) * k, 0], view);
    const toCam: V3 = [
      camera[0] - mid[0],
      camera[1] - mid[1],
      camera[2] - mid[2],
    ];
    if (n[0] * toCam[0] + n[1] * toCam[1] + n[2] * toCam[2] <= 0) continue;
    const quad: V3[] = [
      [a.x, a.y, d / 2],
      [b.x, b.y, d / 2],
      [b.x, b.y, -d / 2],
      [a.x, a.y, -d / 2],
    ];
    const lit = Math.max(
      0,
      n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2],
    );
    faces.push({
      points: quad
        .map(P)
        .map(([x, y]) => `${f3(x)},${f3(y)}`)
        .join(" "),
      fill: mix(m.sides.dark, m.sides.light, 0.25 + 0.75 * lit),
    });
  }

  // parts as thick projected lines, drawn back to front
  const parts: Line[] = (m.parts ?? [])
    .map((p) => {
      const [x1, y1] = P(p.from);
      const [x2, y2] = P(p.to);
      const z = rotate([0, 0, ((p.from[2] + p.to[2]) / 2) * k], view)[2];
      return {
        line: {
          x1: f3(x1),
          y1: f3(y1),
          x2: f3(x2),
          y2: f3(y2),
          width: f3(p.diameter * k),
          color: p.color,
        },
        z,
      };
    })
    .sort((a, b) => a.z - b.z)
    .map((p) => p.line);

  // a soft shadow on the floor under a standing device
  let floorShadow: string | undefined;
  if (m.mount === "floor") {
    const floorY = Math.max(...silhouette.map((p) => p[1]));
    const rx = w * 0.62;
    const rz = 260;
    floorShadow = Array.from({ length: 28 }, (_, i): V3 => {
      const t = (i / 28) * Math.PI * 2;
      return [Math.cos(t) * rx, floorY, -d / 2 - 120 + Math.sin(t) * rz];
    })
      .map(P)
      .map(([x, y]) => `${f3(x)},${f3(y)}`)
      .join(" ");
  }

  const dx = cx - (box.x0 + box.x1) / 2;
  const dy = cy - (box.y0 + box.y1) / 2;
  const ar = w / h;
  const sw = w * k;
  const sh = h * k;
  const pct = (n: number) => `${f3(n)}%`;
  return {
    stageH,
    faces,
    parts,
    floorShadow,
    vars: {
      "--wp": pct(sw),
      "--ar": `${f3(ar)} / 1`,
      "--rad": `${pct(((r * k) / sw) * 100)} / ${pct(((r * k) / sh) * 100)}`,
      "--bez": pct((m.bezel / w) * 100),
      "--du": String(f3(d * k)),
      "--sr": String(f3(m.screenRadius * k)),
      "--rx": `${view.rx}deg`,
      "--ry": `${view.ry}deg`,
    },
    transform: `translate(${f3(dx)}%, ${f3((dy / stageH) * 100)}%)`,
    layout: ar >= 1.3 ? "landscape" : ar <= 0.8 ? "portrait" : "square",
    finish: m.finish,
    mount: m.mount,
  };
}
