"use client";

import { useId } from "react";

// Isotipo "Atardecer". La geometría y el dibujo viven en emblem.ts (sin "use client"), que también usa
// la firma remota /firma.js: así el logo se dibuja en un solo lugar.

import { BRAND_GRADIENT } from "./brand";
import { EMBLEM, emblemInner } from "./emblem";

export { BRAND_GRADIENT, EMBLEM };

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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: emblemInner({ id, colors, flat, night }) }}
    />
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
