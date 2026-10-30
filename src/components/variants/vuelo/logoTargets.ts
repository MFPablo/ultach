import { LOGO_BEAK_PATH, LOGO_EYES, LOGO_HEAD_PATH } from "@/components/shared/legacyMark";

// Muestreo de puntos del isotipo U-Búho (retícula 120×120) para la bandada.
// Parseamos los paths canónicos de Logo.tsx (M, L, H, V, A absolutos) a polilíneas
// y repartimos puntos a lo largo del trazo con su grosor real.

type Pt = [number, number];

/** PRNG determinístico: mismas posiciones en cada montaje, sin Math.random en render. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Convierte un arco SVG (endpoint) a puntos, según SVG 1.1 F.6.5. */
function flattenArc(
  from: Pt,
  rxIn: number,
  ryIn: number,
  rotDeg: number,
  largeArc: boolean,
  sweep: boolean,
  to: Pt,
  steps = 48,
): Pt[] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const phi = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  let coef = Math.sqrt(Math.max(0, num / den));
  if (largeArc === sweep) coef = -coef;
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    return a;
  };
  const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dTheta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && dTheta > 0) dTheta -= 2 * Math.PI;
  if (sweep && dTheta < 0) dTheta += 2 * Math.PI;
  const pts: Pt[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = theta1 + (dTheta * i) / steps;
    const ex = rx * Math.cos(t);
    const ey = ry * Math.sin(t);
    pts.push([cos * ex - sin * ey + cx, sin * ex + cos * ey + cy]);
  }
  return pts;
}

/** Parser mínimo para los comandos absolutos que usa el isotipo. */
export function pathToPolylines(d: string): Pt[][] {
  const tokens = d.match(/[MLHVAZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const lines: Pt[][] = [];
  let current: Pt[] = [];
  let pos: Pt = [0, 0];
  let i = 0;
  let cmd = "";
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    if (/^[A-Z]$/i.test(tokens[i])) cmd = tokens[i++].toUpperCase();
    switch (cmd) {
      case "M":
        if (current.length > 1) lines.push(current);
        pos = [num(), num()];
        current = [pos];
        cmd = "L";
        break;
      case "L":
        pos = [num(), num()];
        current.push(pos);
        break;
      case "H":
        pos = [num(), pos[1]];
        current.push(pos);
        break;
      case "V":
        pos = [pos[0], num()];
        current.push(pos);
        break;
      case "A": {
        const rx = num();
        const ry = num();
        const rot = num();
        const large = num() === 1;
        const sw = num() === 1;
        const to: Pt = [num(), num()];
        current.push(...flattenArc(pos, rx, ry, rot, large, sw, to));
        pos = to;
        break;
      }
      case "Z":
        if (current.length) current.push(current[0]);
        break;
      default:
        i++;
    }
  }
  if (current.length > 1) lines.push(current);
  return lines;
}

/** Puntos sobre una polilínea con grosor (trazo con caps redondeados). */
function sampleStroke(lines: Pt[][], count: number, width: number, rand: () => number): Pt[] {
  const segs: { a: Pt; b: Pt; len: number; acc: number }[] = [];
  let total = 0;
  for (const line of lines) {
    for (let k = 0; k < line.length - 1; k++) {
      const a = line[k];
      const b = line[k + 1];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len === 0) continue;
      total += len;
      segs.push({ a, b, len, acc: total });
    }
  }
  const out: Pt[] = [];
  const half = width / 2;
  for (let n = 0; n < count; n++) {
    const target = rand() * total;
    let lo = 0;
    let hi = segs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (segs[mid].acc < target) lo = mid + 1;
      else hi = mid;
    }
    const s = segs[lo];
    const t = 1 - (s.acc - target) / s.len;
    const x = s.a[0] + (s.b[0] - s.a[0]) * t;
    const y = s.a[1] + (s.b[1] - s.a[1]) * t;
    // Desvío dentro de un disco del radio del trazo: cubre también las uniones y las puntas.
    const r = half * Math.sqrt(rand());
    const ang = rand() * Math.PI * 2;
    out.push([x + Math.cos(ang) * r, y + Math.sin(ang) * r]);
  }
  return out;
}

function sampleDisc(cx: number, cy: number, r: number, count: number, rand: () => number): Pt[] {
  const out: Pt[] = [];
  for (let n = 0; n < count; n++) {
    const rr = r * Math.sqrt(rand());
    const a = rand() * Math.PI * 2;
    out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return out;
}

// Centro óptico del isotipo en la retícula y escala a "unidades de logo" (alto ≈ 1).
export const LOGO_CENTER: Pt = [60, 55];
export const LOGO_UNIT = 84;

export type FlockData = {
  count: number;
  /** Semilla del vuelo, en [-1, 1]^3. */
  seeds: Float32Array;
  /** Destino en unidades de logo (x, y) + z pequeño. */
  targets: Float32Array;
  /** x: tipo (0 libre, 1 cabeza/ojos, 2 pico), y: retardo [0,1], z: velocidad, w: tamaño. */
  meta: Float32Array;
};

export function buildFlock(count: number, seed = 7): FlockData {
  const rand = mulberry32(seed);
  const free = Math.round(count * 0.12);
  const beak = Math.round(count * 0.07);
  const eyes = Math.round(count * 0.16);
  const head = count - free - beak - eyes;

  const headPts = sampleStroke(pathToPolylines(LOGO_HEAD_PATH), head, 7, rand);
  const beakPts = sampleStroke(pathToPolylines(LOGO_BEAK_PATH), beak, 5, rand);
  const eyePts: Pt[] = [];
  LOGO_EYES.forEach((e, idx) => {
    const n = idx === 0 ? Math.floor(eyes / 2) : eyes - Math.floor(eyes / 2);
    eyePts.push(...sampleDisc(e.cx, e.cy, e.r, n, rand));
  });

  const seeds = new Float32Array(count * 3);
  const targets = new Float32Array(count * 3);
  const meta = new Float32Array(count * 4);

  // Gaussiana aproximada para que la bandada se agrupe en una franja, como una murmuración.
  const gauss = () => (rand() + rand() + rand() + rand() - 2) / 2;

  let i = 0;
  const push = (p: Pt | null, kind: number) => {
    seeds[i * 3] = rand() * 2 - 1;
    seeds[i * 3 + 1] = Math.max(-1, Math.min(1, gauss() * 0.9));
    seeds[i * 3 + 2] = gauss();
    if (p) {
      targets[i * 3] = (p[0] - LOGO_CENTER[0]) / LOGO_UNIT;
      targets[i * 3 + 1] = -(p[1] - LOGO_CENTER[1]) / LOGO_UNIT;
      targets[i * 3 + 2] = (rand() - 0.5) * 0.04;
    }
    meta[i * 4] = kind;
    meta[i * 4 + 1] = rand();
    meta[i * 4 + 2] = 0.55 + rand() * 0.6;
    meta[i * 4 + 3] = 0.7 + rand() * 0.6;
    i++;
  };

  headPts.forEach((p) => push(p, 1));
  eyePts.forEach((p) => push(p, 1));
  beakPts.forEach((p) => push(p, 2));
  for (let n = 0; n < free; n++) push(null, 0);

  return { count, seeds, targets, meta };
}
