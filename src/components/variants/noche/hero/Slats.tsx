"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EMBLEM } from "@/components/shared/Logo";
import { IDLE_AFTER, emblemFrame, now, type HeroEnv } from "./stage";
import { emblemTexture } from "./emblemTexture";

// El emblema armado con láminas, como una persiana: cada franja es una lámina con espesor que
// gira sobre su eje. Aparecen en `startAt`, calzando encima de las piezas ya armadas, hacen una onda
// en cascada que muestra el volumen y quedan ondulando apenas, inclinándose con el puntero. La cara
// y el ala se despegan hacia adelante, a otro plano. Para que el relevo piezas → láminas no se note:
// - Sin fundido: las láminas aparecen de golpe en `startAt` con la cara emisiva (el color plano de la
//   textura, igual que las piezas en reposo) y la iluminación entra de a poco mientras hacen la onda.
// - Los shaders y las texturas se compilan al montar. Si no, three los compila en el primer frame
//   visible y la escena se congela justo en el relevo.

const LAYERS = 6; // capas por lámina para simular espesor
const DEPTH = 1.8; // espesor de la lámina, en unidades de la retícula
const DETAILS_Z = 7;
const LIT_IN = 1.0; // segundos hasta llegar a la iluminación completa

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const easeOut = (x: number) => 1 - (1 - clamp01(x)) ** 3;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function slatGeometry(y: number, h: number) {
  const geo = new THREE.PlaneGeometry(120, h);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const v0 = 1 - (y + h) / 120;
  const v1 = 1 - y / 120;
  for (let i = 0; i < uv.count; i++) uv.setY(i, v0 + uv.getY(i) * (v1 - v0));
  return geo;
}

export function Slats({ env, startAt }: { env: HeroEnv; startAt: number }) {
  const { reduced, pointer } = env;
  const viewport = useThree((s) => s.viewport);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const dirLight = useRef<THREE.DirectionalLight>(null);
  const cssWidth = useThree((s) => s.size.width);
  const root = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const slats = useRef<(THREE.Group | null)[]>([]);
  const details = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const anim = useRef({ px: 0, py: 0, tilt: EMBLEM.BANDS.map(() => 0) });

  const assets = useMemo(() => {
    const body = emblemTexture("body");
    const det = emblemTexture("details");
    const common = { alphaTest: 0.5, transparent: true, side: THREE.DoubleSide, roughness: 0.42, metalness: 0.25 };
    return {
      body,
      det,
      geos: EMBLEM.BANDS.map(([y, h]) => slatGeometry(y, h)),
      detGeo: new THREE.PlaneGeometry(120, 120),
      front: new THREE.MeshStandardMaterial({ map: body, emissiveMap: body, emissive: "#ffffff", ...common }),
      edge: new THREE.MeshStandardMaterial({ map: body, color: "#5b4744", ...common }),
      detFront: new THREE.MeshStandardMaterial({ map: det, emissiveMap: det, emissive: "#ffffff", ...common }),
      detEdge: new THREE.MeshStandardMaterial({ map: det, color: "#5b4744", ...common }),
    };
  }, []);

  useEffect(
    () => () => {
      const { body, det, geos, detGeo, front, edge, detFront, detEdge } = assets;
      [body, det, detGeo, front, edge, detFront, detEdge, ...geos].forEach((x) => x.dispose());
    },
    [assets],
  );

  // Compila con las láminas y sus luces visibles, así el programa queda listo para el relevo.
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const was = r.visible;
    r.visible = true;
    gl.compile(scene, camera);
    gl.initTexture(assets.body);
    gl.initTexture(assets.det);
    r.visible = was;
  }, [gl, scene, camera, assets]);

  const frame = emblemFrame(viewport.width, viewport.height, cssWidth);
  const R = frame.R;
  const centerX = frame.cx - viewport.width / 2;
  const centerY = frame.cy - viewport.height / 2;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = reduced ? 30 : env.time.current - startAt;
    const a = anim.current;
    const p = pointer.current;

    if (root.current) root.current.visible = s > 0;
    if (s <= 0) return;

    // Relevo de color: de la cara emisiva (color plano, igual a las piezas) a la iluminada.
    const lit = reduced ? 1 : smooth(0.05, LIT_IN, s);
    for (const m of [assets.front, assets.detFront]) {
      m.color.setScalar(lit);
      m.emissiveIntensity = 1 - lit;
    }
    if (dirLight.current) dirLight.current.intensity = 1.6 * lit;
    if (light.current) light.current.intensity = 18 * lit;

    // Recién después de la onda, la escena empieza a responder al puntero.
    const ramp = reduced ? 1 : smooth(0.1, 0.9, s);
    const active = !reduced && now() - p.last < IDLE_AFTER;
    const tx = active ? p.x : reduced ? 0 : Math.sin(s * 0.3) * 0.35;
    const ty = active ? p.y : reduced ? 0 : Math.sin(s * 0.21 + 1) * 0.25;
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3);
    a.px += (tx * ramp - a.px) * k;
    a.py += (ty * ramp - a.py) * k;

    if (group.current) {
      group.current.rotation.y = a.px * 0.28;
      group.current.rotation.x = -a.py * 0.14;
    }

    slats.current.forEach((slat, i) => {
      if (!slat) return;
      const popK = reduced ? 1 : clamp01((s - i * 0.07) / 0.9);
      const pop = Math.sin(Math.PI * popK) * 0.6;
      // Cada lámina llega a la inclinación del puntero con un poco más de demora que la anterior.
      a.tilt[i] += (a.py * 0.55 - a.tilt[i]) * (reduced ? 1 : 1 - Math.exp(-dt * (3.2 - i * 0.2)));
      const wave = reduced ? 0 : Math.sin(s * 0.7 - i * 0.5) * 0.07;
      slat.rotation.x = -pop + ramp * (wave - a.tilt[i]);
    });

    if (details.current) {
      const out = reduced ? 1 : easeOut((s - 0.1) / 1.3);
      details.current.position.z = DETAILS_Z * out + (reduced ? 0 : Math.sin(s * 0.8) * 0.6 * ramp);
    }

    if (light.current) {
      light.current.position.set(centerX + a.px * viewport.width * 0.4, centerY + a.py * viewport.height * 0.5 + R * 0.4, 3.2);
    }
  });

  return (
    <group ref={root} visible={false}>
      <ambientLight intensity={0.55} />
      <directionalLight ref={dirLight} position={[-3, 5, 8]} intensity={1.6} />
      <pointLight ref={light} color="#F7C062" intensity={18} distance={0} decay={2} />
      <group ref={group} position={[centerX, centerY, 0]} scale={R / 54}>
        {EMBLEM.BANDS.map(([y, h], i) => (
          <group
            key={y}
            position={[0, 60 - y - h / 2, 0]}
            ref={(el) => {
              slats.current[i] = el;
            }}
          >
            {Array.from({ length: LAYERS }, (_, l) => (
              <mesh
                key={l}
                geometry={assets.geos[i]}
                material={l === 0 ? assets.front : assets.edge}
                position={[0, 0, DEPTH / 2 - (l * DEPTH) / (LAYERS - 1)]}
              />
            ))}
          </group>
        ))}
        <group ref={details}>
          {[0, 1, 2].map((l) => (
            <mesh key={l} geometry={assets.detGeo} material={l === 0 ? assets.detFront : assets.detEdge} position={[0, 0, DEPTH / 2 - l * 0.6]} />
          ))}
        </group>
      </group>
    </group>
  );
}
