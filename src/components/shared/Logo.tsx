"use client";

import { useId } from "react";

// Isotipo "Atardecer". Retícula 120×120. Dos versiones:
// - con noche (night, principal): emblema circular de franjas con el búho recortado en negativo.
// - sin noche (secundaria, fondos claros): las franjas quedan dentro del búho y desaparece el círculo.
// Los huecos (cuerpo, ojos, pico) son transparentes vía <mask>, así funciona sobre cualquier fondo.

import { BRAND_GRADIENT } from "./brand";

export { BRAND_GRADIENT };

const NEG =
  "M33.5 44 C33.5 31 45.5 24 60.5 24 C75.5 24 87.2 31 87.2 44 L87.2 63 C86.6 72 83 79 77.6 85.6 C70 94.6 58 103.6 44 110 L37 114 L0 116 L0 86 L14.2 77.4 L33.5 66.4 Z";
// Silueta del búho = NEG ∩ círculo, cerrada sobre el arco del borde.
const OWL =
  "M33.5 44 C33.5 31 45.5 24 60.5 24 C75.5 24 87.2 31 87.2 44 L87.2 63 C86.6 72 83 79 77.6 85.6 C70 94.6 58 103.6 44 110 L42.25 111 A54 54 0 0 1 9.85 80.03 L14.2 77.4 L33.5 66.4 Z";
const FACE =
  "M61 42.6 C58.4 37.2 53.6 35.2 48.4 35.2 C43.2 35.2 40.2 37.8 40.2 42.6 C40.2 56.2 49 65.6 61 65.6 C73 65.6 81.8 56.2 81.8 42.6 C81.8 37.8 78.8 35.2 73.6 35.2 C68.4 35.2 63.6 37.2 61 42.6 Z";
const BEAK = "M57.8 50.8 H64.2 L61 54.4 Z";
const EYES = [
  { cx: 49.6, cy: 45.6 },
  { cx: 72.4, cy: 45.6 },
];
const WING =
  "M13.29 94.79 L46.70 69.30 L11.72 92.59 Z M19.80 101.44 L46.70 80.60 L18.24 99.24 Z M29.57 107.77 L46.70 93.90 L28.01 105.58 Z";
const WING_SOLID = "M13.29 94.79 L46.70 69.30 L11.72 92.59 Z M24.69 101.36 L46.70 84.00 L23.12 99.16 Z";
// [y, alto] de cada franja: engrosan hacia abajo.
const BANDS: [number, number][] = [
  [6, 4.2], [13.8, 5.15], [22.55, 6.1], [32.25, 7.05], [42.9, 8], [54.5, 8.95], [67.05, 9.9], [80.55, 10.85], [95, 11.8], [110.4, 12.75],
];

/** Geometría del emblema (retícula 120×120) para quien necesite dibujarlo fuera del SVG, p. ej. texturas 3D. */
export const EMBLEM = { NEG, OWL, FACE, BEAK, EYES, EYE_R: 2.6, WING, WING_SOLID, BANDS, CIRCLE: { cx: 60, cy: 60, r: 54 } } as const;

type MarkProps = {
  size?: number;
  /** Tres colores del degradé. Pasar el mismo tres veces para una versión plana. */
  colors?: readonly [string, string, string];
  /** Sin franjas. Por defecto se usa debajo de 40px, donde las franjas se empastan. */
  solid?: boolean;
  /** true (default): con noche, emblema circular. false: sin noche, franjas dentro del búho. */
  night?: boolean;
  className?: string;
  title?: string;
};

export function LogoMark({ size = 32, colors = BRAND_GRADIENT, solid, night = true, className, title }: MarkProps) {
  const id = useId().replace(/:/g, "");
  const flat = solid ?? size < 40;
  const g = `${id}-g`, body = `${id}-b`, face = `${id}-f`, clip = `${id}-c`;
  // Sin noche: la última franja dejaría una astilla en la punta inferior del búho.
  const bands = night ? BANDS : BANDS.filter(([y]) => y < 108);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={g} gradientUnits="userSpaceOnUse" x1="14" y1="10" x2="104" y2="112">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="0.5" stopColor={colors[1]} />
          <stop offset="1" stopColor={colors[2]} />
        </linearGradient>
        <clipPath id={clip}>
          <circle cx="60" cy="60" r="54" />
        </clipPath>
        <mask id={body} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          {night ? (
            <>
              <circle cx="60" cy="60" r="54" fill="#fff" />
              <path d={NEG} fill="#000" />
            </>
          ) : (
            <>
              <path d={OWL} fill="#fff" />
              {/* aire alrededor de la cara para separarla de las franjas */}
              <path d={FACE} fill="#000" stroke="#000" strokeWidth={5} strokeLinejoin="round" />
              {flat && <path d={WING_SOLID} fill="#000" />}
            </>
          )}
        </mask>
        <mask id={face} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <path d={FACE} fill="#fff" />
          {EYES.map((e) => (
            <circle key={e.cx} cx={e.cx} cy={e.cy} r={2.6} fill="#000" />
          ))}
          <path d={BEAK} fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${body})`} fill={`url(#${g})`}>
        {flat ? <rect width="120" height="120" /> : bands.map(([y, h]) => <rect key={y} x="0" y={y} width="120" height={h} />)}
      </g>
      {night && <path d={flat ? WING_SOLID : WING} fill={`url(#${g})`} clipPath={`url(#${clip})`} />}
      <rect width="120" height="120" fill={`url(#${g})`} mask={`url(#${face})`} />
    </svg>
  );
}

type LockupProps = MarkProps & { color?: string; textClassName?: string };

export function Logo({ size = 28, color = "currentColor", colors, solid, night, className = "", textClassName = "" }: LockupProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} colors={colors} solid={solid} night={night} />
      <span
        className={`font-sans font-bold leading-none ${textClassName}`}
        style={{ fontSize: size * 0.9, letterSpacing: "-0.06em", color }}
      >
        ultach
      </span>
    </span>
  );
}
