"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { css } from "./anim";

// Reloj de la entrada del hero. La raíz recibe [data-play] cuando el canvas llama a start() en su
// primer frame, así el texto y el 3D quedan sincronizados. Si el canvas no arranca (sin WebGL),
// arranca igual a los 2.5 s.
// Sin JS, el <noscript> muestra el hero armado.

const PlayContext = createContext<() => void>(() => {});
export const usePlayStart = () => useContext(PlayContext);

const noscript = `.${css.root} .${css.rise}, .${css.root} .${css.fade}, .${css.root} .${css.nav} > header { opacity: 1 !important; animation: none !important; }`;

export function HeroPlay({ className = "", children }: { className?: string; children: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const start = useCallback(() => setPlaying(true), []);

  useEffect(() => {
    const fallback = window.setTimeout(start, 2500);
    return () => window.clearTimeout(fallback);
  }, [start]);

  return (
    <PlayContext.Provider value={start}>
      <noscript>
        <style>{noscript}</style>
      </noscript>
      <div className={`${css.root} ${className}`} data-play={playing ? "" : undefined}>
        {children}
      </div>
    </PlayContext.Provider>
  );
}
