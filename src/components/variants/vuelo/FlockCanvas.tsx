"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Color, type ShaderMaterial } from "three";
import { LOGO_CENTER, LOGO_UNIT, buildFlock } from "./logoTargets";
import { fragmentShader, vertexShader } from "./shaders";
import { VUELO } from "./palette";

// Ciclo del vuelo, en segundos. Arranca con el logo formado (coincide con el fallback SVG),
// se dispersa, vuela, y vuelve a posarse.
const HOLD_A = 1.4;
const DISPERSE = 1.5;
const FLIGHT = 5.2;
const GATHER = 1.7;
const HOLD_B = 0.8;
const PERIOD = HOLD_A + DISPERSE + FLIGHT + GATHER + HOLD_B;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function mixAt(t: number) {
  const c = t % PERIOD;
  if (c < HOLD_A) return 1;
  if (c < HOLD_A + DISPERSE) return 1 - easeInOut((c - HOLD_A) / DISPERSE);
  if (c < HOLD_A + DISPERSE + FLIGHT) return 0;
  if (c < HOLD_A + DISPERSE + FLIGHT + GATHER) return easeInOut((c - HOLD_A - DISPERSE - FLIGHT) / GATHER);
  return 1;
}

type SlotProps = {
  /** Elemento HTML donde vive el logo estático: la bandada se posa sobre su rectángulo. */
  slot: RefObject<HTMLDivElement | null>;
  /** Se llama una vez, después del primer frame pintado. */
  onReady: () => void;
};

type FlockProps = SlotProps & { count: number; still: boolean };

function Flock({ count, still, slot, onReady }: FlockProps) {
  const announced = useRef(false);
  const material = useRef<ShaderMaterial>(null);
  const time = useRef(0);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const strength = useRef(0);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  const flock = useMemo(() => buildFlock(count), [count]);
  // Posición dummy: el vertex shader calcula todo a partir de aSeed/aTarget.
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMix: { value: 1 },
      uBounds: { value: [1, 1] as [number, number] },
      uLogo: { value: [0, 0, 1] as [number, number, number] },
      uMouse: { value: [0, 0, 0] as [number, number, number] },
      uSize: { value: 2.3 },
      uPixelRatio: { value: 1 },
      // El shader no pasa por la conversión de color de three: le damos los valores sRGB tal cual.
      uColor: { value: new Color(VUELO.text).convertLinearToSRGB() },
      uAccent: { value: new Color(VUELO.accent).convertLinearToSRGB() },
    }),
    [],
  );

  useEffect(() => {
    if (still) return;
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      pointer.current.active = inside;
      if (!inside) return;
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") onLeave();
    };
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, still]);

  // Con movimiento reducido el frameloop es "demand": pedimos un frame al montar y al redimensionar.
  const size = useThree((s) => s.size);
  useEffect(() => {
    invalidate();
  }, [invalidate, size]);

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;
    const u = mat.uniforms;
    const { width, height } = state.viewport;
    const halfW = width / 2;
    const halfH = height / 2;
    const wide = state.size.width >= 768 && state.size.width > state.size.height;

    // Rectángulo del slot → centro y escala del logo en unidades de mundo (plano z = 0).
    const canvasRect = state.gl.domElement.getBoundingClientRect();
    const slotRect = slot.current?.getBoundingClientRect();
    const toWorld = height / Math.max(1, canvasRect.height);
    let layout = { x: 0, y: 0, scale: height * 0.4 };
    if (slotRect && slotRect.width > 0) {
      // El centro óptico del isotipo (60, 55) y su unidad (84) en la retícula de 120.
      const cx = slotRect.left + slotRect.width / 2 - canvasRect.left;
      const cy = slotRect.top + (slotRect.height * LOGO_CENTER[1]) / 120 - canvasRect.top;
      layout = {
        x: (cx - canvasRect.width / 2) * toWorld,
        y: (canvasRect.height / 2 - cy) * toWorld,
        scale: ((slotRect.height * LOGO_UNIT) / 120) * toWorld,
      };
    }

    if (!still) time.current += Math.min(delta, 1 / 20);
    u.uTime.value = time.current;
    u.uMix.value = still ? 1 : mixAt(time.current);
    u.uBounds.value = [halfW, halfH];
    u.uLogo.value = [layout.x, layout.y, layout.scale];
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uSize.value = wide ? 2.4 : 2.1;

    const target = pointer.current.active && !still ? 1 : 0;
    strength.current += (target - strength.current) * Math.min(1, delta * 6);
    const [mx, my] = u.uMouse.value as [number, number, number];
    const px = pointer.current.x * halfW;
    const py = pointer.current.y * halfH;
    const k = Math.min(1, delta * 10);
    u.uMouse.value = [mx + (px - mx) * k, my + (py - my) * k, strength.current];

    if (!announced.current) {
      announced.current = true;
      // Esperamos a que el frame llegue a pantalla antes de apagar el SVG.
      requestAnimationFrame(onReady);
    }
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[flock.seeds, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[flock.targets, 3]} />
        <bufferAttribute attach="attributes-aMeta" args={[flock.meta, 4]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export default function FlockCanvas({ slot, onReady }: SlotProps) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mobile = useMediaQuery("(max-width: 767px)");
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Pausamos el render cuando el hero sale de pantalla.
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const count = mobile ? 3600 : 9000;

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 40, near: 0.1, far: 50 }}
        frameloop={reduced || !visible ? "demand" : "always"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Flock key={count} count={count} still={reduced} slot={slot} onReady={onReady} />
      </Canvas>
    </div>
  );
}
