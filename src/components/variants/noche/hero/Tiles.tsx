"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { emblemFrame, type HeroEnv } from "./stage";
import { emblemTexture } from "./emblemTexture";

// Entrada del hero: el emblema hecho de miles de piezas 3D (una instancia por celda, todo animado
// en GPU). Arrancan dispersas en un vórtice, lejos en profundidad; vienen en espiral, incandescentes,
// y aterrizan en una ola que recorre el degradé de marca (ámbar → vino), con un destello al calzar.
// Al cerrar, un barrido de luz. Cada pieza lleva su recorte del logo en la cara frontal, así en
// reposo el emblema queda nítido. Después las tapan las láminas (Slats) y se ocultan.

const FLIGHT = 1.35; // duración del vuelo de cada pieza
export const DONE = 3.3; // cuándo aterriza la última pieza
// Barrido de luz: cruza solo el emblema, lineal y sin cola lenta, y termina en SWEEP_END.
// El emblema ocupa (gx + gy) entre 44 y 196 (círculo r 54 en 60,60); ±18 es el ancho del brillo.
const SWEEP_FROM = 26;
const SWEEP_TO = 214;
const SWEEP_START = DONE - 0.15;
export const SWEEP_END = DONE + 0.4;

const tileVertex = /* glsl */ `
  attribute vec2 aCell;   // centro de la celda en la retícula del logo (y hacia abajo)
  attribute vec4 aRand;   // semilla, demora, ángulo y radio de partida
  uniform float uTime;
  uniform float uPitch;
  varying vec2 vUv;
  varying vec2 vCuv;
  varying float vFront;
  varying vec3 vN;
  varying float vHeat;
  varying float vFlash;
  varying vec2 vG;

  vec3 rot(vec3 v, vec3 a, float ang) {
    float c = cos(ang), s = sin(ang);
    return v * c + cross(a, v) * s + a * dot(a, v) * (1.0 - c);
  }

  void main() {
    float seed = aRand.x;
    float delay = aRand.y;
    float k = clamp((uTime - delay) / ${FLIGHT.toFixed(2)}, 0.0, 1.0);
    float p = 1.0 - pow(1.0 - k, 4.0);
    vec2 local = vec2(aCell.x - 60.0, 60.0 - aCell.y);

    // Vuelo: desde el vórtice, en espiral, hasta su celda.
    vec3 start = vec3(cos(aRand.z) * aRand.w, sin(aRand.z) * aRand.w, -260.0 - seed * 340.0);
    vec3 pos = mix(start, vec3(local, 0.0), p);
    float sw = (1.0 - p) * 2.4;
    pos.xy = mat2(cos(sw), sin(sw), -sin(sw), cos(sw)) * pos.xy;

    // La pieza: chica en vuelo, junta en reposo (sin junta visible). Aparece al despegar.
    float s = uPitch * mix(0.55, 1.0, p) * smoothstep(-0.3, 0.0, uTime - delay);
    vec3 v = position * vec3(s, s, uPitch * 1.4);
    vec3 n = normal;
    vec3 axis = normalize(vec3(sin(seed * 91.0), cos(seed * 53.0), 0.5));
    float tumble = (1.0 - p) * (6.0 + seed * 6.0);
    v = rot(v, axis, tumble);
    n = rot(n, axis, tumble);
    pos += v;

    vN = n;
    vFront = normal.z;
    vUv = vec2((aCell.x + position.x * uPitch) / 120.0, 1.0 - (aCell.y - position.y * uPitch) / 120.0);
    vCuv = vec2(aCell.x / 120.0, 1.0 - aCell.y / 120.0);
    vHeat = 1.0 - smoothstep(0.5, 1.0, k);
    float land = delay + ${FLIGHT.toFixed(2)} * 0.6;
    vFlash = smoothstep(land - 0.12, land, uTime) * exp(-max(uTime - land, 0.0) * 4.0);
    vG = aCell;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const tileFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uSweep;
  varying vec2 vUv;
  varying vec2 vCuv;
  varying float vFront;
  varying vec3 vN;
  varying float vHeat;
  varying float vFlash;
  varying vec2 vG;

  void main() {
    bool front = vFront > 0.5;
    vec4 tex = texture2D(uMap, front ? vUv : vCuv);
    if (tex.a < (front ? 0.5 : 0.2)) discard;
    vec3 base = front ? tex.rgb : tex.rgb * 0.42;

    vec3 N = normalize(vN);
    vec3 L = normalize(vec3(-0.35, 0.55, 0.85));
    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 48.0);
    // En reposo (N = z) diff ≈ 0.85, así que la cara queda con el color exacto de la marca.
    vec3 c = base * (0.62 + 0.45 * diff) + vec3(1.0, 0.86, 0.62) * spec * 0.35;

    c += vec3(0.969, 0.753, 0.384) * vHeat * 0.9;         // incandescente en vuelo
    c += vec3(1.0, 0.9, 0.72) * vFlash * 0.45;            // destello al calzar
    float d = (vG.x + vG.y) - uSweep;
    c += vec3(1.0, 0.92, 0.75) * exp(-d * d / 90.0) * (front ? 0.32 : 0.12);  // barrido de luz
    gl_FragColor = vec4(c, 1.0);
  }
`;

function rand(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Una pieza por cada celda que toca el emblema; la demora sigue el degradé de marca.
function buildTiles(canvas: HTMLCanvasElement, pitch: number) {
  const size = canvas.width;
  const data = canvas.getContext("2d")!.getImageData(0, 0, size, size).data;
  const k = size / 120;
  const r = rand(17);
  const cells: number[] = [];
  const rnd: number[] = [];
  for (let y = 0; y < 120; y += pitch) {
    for (let x = 0; x < 120; x += pitch) {
      let hit = false;
      for (const sy of [0.15, 0.5, 0.85]) {
        for (const sx of [0.15, 0.5, 0.85]) {
          const px = Math.min(size - 1, Math.floor((x + sx * pitch) * k));
          const py = Math.min(size - 1, Math.floor((y + sy * pitch) * k));
          if (data[(py * size + px) * 4 + 3] > 30) hit = true;
        }
      }
      if (!hit) continue;
      const cx = x + pitch / 2;
      const cy = y + pitch / 2;
      const t = Math.min(Math.max(((cx - 14) * 90 + (cy - 10) * 102) / (90 * 90 + 102 * 102), 0), 1);
      cells.push(cx, cy);
      rnd.push(r(), 0.25 + t * 1.5 + r() * 0.3, r() * Math.PI * 2, 60 + r() * 160);
    }
  }
  return { cells: new Float32Array(cells), rnd: new Float32Array(rnd), count: cells.length / 2 };
}

type TilesProps = {
  env: HeroEnv;
  /** Se llama en el primer frame: arranca la entrada del texto (HeroPlay). */
  onStart: () => void;
  /** Desde cuándo (s) las piezas se ocultan porque las láminas ya las taparon. */
  hideAfter: number;
};

export function Tiles({ env, onStart, hideAfter }: TilesProps) {
  const { reduced, mobile } = env;
  const viewport = useThree((s) => s.viewport);
  const cssWidth = useThree((s) => s.size.width);
  const group = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const started = useRef(false);
  const pitch = mobile ? 1.6 : 1.0;

  const assets = useMemo(() => {
    const map = emblemTexture("full");
    const { cells, rnd, count } = buildTiles(map.userData.canvas as HTMLCanvasElement, pitch);
    const box = new THREE.BoxGeometry(1, 1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = box.index;
    geo.setAttribute("position", box.attributes.position);
    geo.setAttribute("normal", box.attributes.normal);
    geo.setAttribute("aCell", new THREE.InstancedBufferAttribute(cells, 2));
    geo.setAttribute("aRand", new THREE.InstancedBufferAttribute(rnd, 4));
    geo.instanceCount = count;
    return { map, box, geo };
  }, [pitch]);

  useEffect(
    () => () => {
      assets.map.dispose();
      assets.box.dispose();
      assets.geo.dispose();
    },
    [assets],
  );

  const uniforms = useMemo(
    () => ({
      uMap: { value: assets.map },
      uTime: { value: 0 },
      uPitch: { value: pitch },
      uSweep: { value: -100 },
    }),
    [assets, pitch],
  );

  const frame = emblemFrame(viewport.width, viewport.height, cssWidth);
  const scale = frame.R / 54;
  const cx = frame.cx - viewport.width / 2;
  const cy = frame.cy - viewport.height / 2;

  useFrame(() => {
    if (!started.current) {
      started.current = true;
      onStart();
    }
    const u = matRef.current?.uniforms;
    if (!u) return;
    const t = reduced ? 30 : env.time.current;
    u.uTime.value = t;
    const sk = Math.min(Math.max((t - SWEEP_START) / (SWEEP_END - SWEEP_START), 0), 1);
    u.uSweep.value = t < SWEEP_START ? -100 : SWEEP_FROM + (SWEEP_TO - SWEEP_FROM) * sk;

    // Acercamiento: el emblema llega desde un poco más atrás.
    if (group.current) group.current.visible = t < hideAfter;
    if (group.current) group.current.position.z = reduced ? 0 : -4 * (1 - Math.min(t / (DONE + 0.4), 1)) ** 3;
  });

  return (
    <group ref={group} position={[cx, cy, 0]}>
      <mesh geometry={assets.geo} scale={scale} frustumCulled={false}>
        <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={tileVertex} fragmentShader={tileFragment} />
      </mesh>
    </group>
  );
}
