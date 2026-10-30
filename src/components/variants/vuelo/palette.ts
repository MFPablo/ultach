// Paleta de la variante Vuelo. Contrastes (WCAG) sobre el fondo night:
// text 16.6:1, muted 7.7:1 (6.5:1 sobre surface), accent 6.6:1.
export const VUELO = {
  night: "#0F1A3A",
  surface: "#1A2752",
  text: "#F4F1EA",
  muted: "#A3AECB",
  accent: "#FF7A59",
  line: "rgba(244, 241, 234, 0.14)",
} as const;

/** Foco visible para teclado, igual en toda la variante. */
export const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A59]";
