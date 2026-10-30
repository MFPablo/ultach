import { LogoMark } from "@/components/shared/Logo";
import { NODO } from "./graph";

// Fallback estático mientras carga el grafo 3D: mismo tamaño que el canvas, sin layout shift.
export function GraphFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="absolute h-[88%] w-[88%]" aria-hidden="true">
        <ellipse cx="200" cy="200" rx="120" ry="44" fill="none" stroke={NODO.ink} strokeOpacity="0.12" />
        <ellipse cx="200" cy="200" rx="180" ry="70" fill="none" stroke={NODO.ink} strokeOpacity="0.12" strokeDasharray="4 4" />
      </svg>
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#2F5BFF]">
        <LogoMark size={48} colors={[NODO.surface, NODO.surface, NODO.surface]} />
      </span>
    </div>
  );
}
