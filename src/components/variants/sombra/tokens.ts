// Paleta de la variante Sombra.
export const STONE = "#E6E3DC";
export const SURFACE = "#D2CEC4";
export const INK = "#161616";
export const MUTED = "#45423B"; // ~7.9:1 sobre STONE, ~6:1 sobre SURFACE
export const LIME = "#C8F031"; // solo como relleno detrás de texto oscuro o como gráfico

// Sombra larga a 45° (abajo a la derecha), la misma dirección de "sol" en toda la página.
export function longShadow(steps: number, color: string) {
  return Array.from({ length: steps }, (_, i) => `${i + 1}px ${i + 1}px 0 ${color}`).join(", ");
}
