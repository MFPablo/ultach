import type { CSSProperties } from "react";
import "./anim.css";

// Entrada del texto del hero, sincronizada con el 3D (ver anim.css y HeroPlay).
// CSS global con prefijo hb-: la regla de turbopack de next.config trata todo *.css como global.
export const css = { root: "hb-root", rise: "hb-rise", fade: "hb-fade", nav: "hb-nav" } as const;

/** Cuándo entra cada parte del hero, en segundos desde el primer frame del canvas. */
export const HERO_TIMING = { words: 3.35, wordStep: 0.07, p: 4.0, cta: 4.3, nav: 4.7 } as const;

/** Inicio y duración de una animación, como variables CSS. */
export const at = (s: number, dur?: number) => ({ "--at": `${s}s`, ...(dur ? { "--dur": `${dur}s` } : {}) }) as CSSProperties;
