"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// Base del hero 3D: canvas con DPR capado, pausa fuera de pantalla, prefers-reduced-motion,
// breakpoint mobile y puntero relativo al canvas.

export type Pointer = {
  /** -1..1 respecto del canvas (y hacia arriba). */
  x: number;
  y: number;
  /** performance.now() / 1000 del último movimiento. */
  last: number;
};

/**
 * `time`: segundos de escena. Avanza solo mientras hay frames y no vuelve a 0: el reloj de R3F se
 * reinicia cuando el canvas sale de pantalla (frameloop "never") y vuelve, y eso repetía la entrada.
 */
export type HeroEnv = { mobile: boolean; reduced: boolean; pointer: RefObject<Pointer>; time: RefObject<number> };

/** Avanza el reloj de escena. Va primero en el árbol, así corre antes que el resto en cada frame. */
function SceneClock({ onTick }: { onTick: (dt: number) => void }) {
  useFrame((_, delta) => onTick(Math.min(delta, 0.1)));
  return null;
}

/** Segundos sin mover el puntero para que la escena pase a modo automático. */
export const IDLE_AFTER = 3;
export const now = () => performance.now() / 1000;

/**
 * Dónde va el emblema (en las mismas unidades que w y h, origen abajo a la izquierda).
 * Desktop ancho: a la derecha, al lado del H1. Mobile y pantallas angostas: centrado arriba.
 * Tiene que coincidir con emblemR/emblemC del shader de Backdrop.
 */
export function emblemFrame(w: number, h: number, cssWidth: number) {
  const wide = cssWidth >= 1024 && w > h * 1.15;
  const R = wide ? Math.min(0.26 * h, 0.22 * w) : Math.min(0.22 * h, 0.4 * w);
  return wide ? { R, cx: 0.75 * w, cy: 0.5 * h, wide } : { R, cx: 0.5 * w, cy: 0.89 * h - R, wide };
}

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    get: () => window.matchMedia(query).matches,
    server: () => false,
  };
}
const reducedStore = mediaStore("(prefers-reduced-motion: reduce)");
const mobileStore = mediaStore("(max-width: 767px)");

type StageProps = {
  children: (env: HeroEnv) => ReactNode;
  camera?: { position: [number, number, number]; fov: number };
};

export function HeroStage({ children, camera = { position: [0, 0, 6], fov: 45 } }: StageProps) {
  const reduced = useSyncExternalStore(reducedStore.subscribe, reducedStore.get, reducedStore.server);
  const mobile = useSyncExternalStore(mobileStore.subscribe, mobileStore.get, mobileStore.server);
  const pointer = useRef<Pointer>({ x: 0, y: 0, last: -100 });
  const time = useRef(0);
  const tick = useCallback((dt: number) => {
    time.current += dt;
  }, []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const p = pointer.current;
      p.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      p.y = ((r.bottom - e.clientY) / r.height) * 2 - 1;
      p.last = now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        // Sin tone mapping: los colores de marca quedan como en el SVG.
        flat
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        camera={{ ...camera, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#0B0D10"]} />
        <SceneClock onTick={tick} />
        {children({ mobile, reduced, pointer, time })}
      </Canvas>
    </div>
  );
}
