"use client";

import dynamic from "next/dynamic";
import { LogoMark } from "@/components/shared/Logo";

// Fallback mientras carga el 3D. Con animación queda negro: la entrada arma el emblema desde cero y
// un logo estático antes se ve como un parpadeo. Con reduced motion va el logo tenue, en el mismo
// lugar que emblemFrame (centrado arriba en mobile, a la derecha en desktop).
function Fallback() {
  return (
    <div className="pointer-events-none absolute inset-0 motion-safe:hidden" aria-hidden="true">
      <LogoMark
        size={520}
        className="absolute left-1/2 top-[8.6svh] h-auto w-[min(48.9svh,88.9vw)] -translate-x-1/2 opacity-15 lg:left-[75%] lg:top-1/2 lg:w-[min(57.8svh,48.9vw)] lg:-translate-y-1/2"
      />
    </div>
  );
}

export const NocheHeroCanvas = dynamic(() => import("./hero/Ficha"), { ssr: false, loading: () => <Fallback /> });
