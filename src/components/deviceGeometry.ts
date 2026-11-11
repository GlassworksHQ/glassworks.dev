/*
 * The 3D mockup's sides, computed rather than stacked.
 *
 * Each device is a rounded rectangle extruded by its thickness. We rotate and
 * project it with exactly the transform the CSS applies to the front glass
 * (rotateX, rotateY, then translateZ to the front, under a perspective), and
 * return the side faces that face the viewer as SVG polygons, shaded by how
 * they face a light from the top-left. Drawn behind the front plane, they read
 * as one solid edge in every engine.
 *
 * Units: the stage is 100 x 50 (its width is 100), so the SVG needs no
 * measuring. The CSS uses the same numbers via --u = 1% of the stage width.
 */

export type ModelShape = "s1" | "square" | "tablet";

export const VIEW = { rx: 9, ry: -22, perspective: 170 } as const;

type Spec = {
  w: number; // width, stage units
  ar: number; // width / height
  d: number; // depth
  r: number; // corner radius
  dark: string; // edge colour facing away from the light
  light: string; // edge colour facing the light
};

export const SPECS: Record<ModelShape, Spec> = {
  // Aqara S1 Plus: 172 x 86 x ~12 mm, near-square corners, white body
  s1: { w: 74, ar: 2, d: 5.2, r: 1.07, dark: "#8f949d", light: "#f4f5f7" },
  square: { w: 42, ar: 1, d: 4.6, r: 3.6, dark: "#0c0d10", light: "#3b3f49" },
  tablet: {
    w: 66,
    ar: 1.6,
    d: 1.8,
    r: 2.97,
    dark: "#0c0d10",
    light: "#3b3f49",
  },
};

type V3 = [number, number, number];

const rad = (deg: number) => (deg * Math.PI) / 180;

/* CSS rotateX then rotateY, applied as the spec does: p' = Rx(Ry(p)). y points down. */
function rotate([x, y, z]: V3): V3 {
  const a = rad(VIEW.ry);
  const x1 = Math.cos(a) * x + Math.sin(a) * z;
  const z1 = -Math.sin(a) * x + Math.cos(a) * z;
  const b = rad(VIEW.rx);
  const y2 = Math.cos(b) * y - Math.sin(b) * z1;
  const z2 = Math.sin(b) * y + Math.cos(b) * z1;
  return [x1, y2, z2];
}

/* perspective from the stage centre, then into stage coordinates */
function project([x, y, z]: V3): [number, number] {
  const s = VIEW.perspective / (VIEW.perspective - z);
  return [50 + x * s, 25 + y * s];
}

/* the rounded-rectangle outline, clockwise on screen, with outward normals */
function outline(spec: Spec, steps = 6) {
  const hw = spec.w / 2;
  const hh = spec.w / spec.ar / 2;
  const r = spec.r;
  const corners: [number, number, number][] = [
    [hw - r, -hh + r, -90], // top-right, sweeping from up to right
    [hw - r, hh - r, 0], // bottom-right
    [-hw + r, hh - r, 90], // bottom-left
    [-hw + r, -hh + r, 180], // top-left
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

export type Face = { points: string; fill: string };

/* Side faces that face the viewer, as SVG polygons in stage units. */
export function sideFaces(shape: ModelShape): Face[] {
  const spec = SPECS[shape];
  const pts = outline(spec);
  const zf = spec.d / 2; // front, relative to the device centre
  const zb = -spec.d / 2;
  const camera: V3 = [0, 0, VIEW.perspective];
  const faces: Face[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-6) continue;
    // outward normal of this strip, then rotated with the device
    const n = rotate([(a.nx + b.nx) / 2, (a.ny + b.ny) / 2, 0]);
    // CSS: rotateX rotateY translateZ(d/2) on the front plane, so before the
    // rotations the front is at z = +d/2 and the back at -d/2, about the centre
    const mid = rotate([(a.x + b.x) / 2, (a.y + b.y) / 2, 0]);
    const toCam: V3 = [
      camera[0] - mid[0],
      camera[1] - mid[1],
      camera[2] - mid[2],
    ];
    if (n[0] * toCam[0] + n[1] * toCam[1] + n[2] * toCam[2] <= 0) continue;
    const quad: V3[] = [
      [a.x, a.y, zf],
      [b.x, b.y, zf],
      [b.x, b.y, zb],
      [a.x, a.y, zb],
    ];
    const lit = Math.max(
      0,
      n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2],
    );
    faces.push({
      points: quad
        .map((p) => project(rotate(p)))
        .map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`)
        .join(" "),
      fill: mix(spec.dark, spec.light, 0.25 + 0.75 * lit),
    });
  }
  return faces;
}
