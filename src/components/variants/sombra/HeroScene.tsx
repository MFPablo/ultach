"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LOGO_BEAK_PATH, LOGO_EYES, LOGO_HEAD_PATH } from "@/components/shared/legacyMark";

// Retícula del logo: 120×120 en coordenadas SVG (y hacia abajo).
// La pasamos a mundo 3D con y hacia arriba y la base del arco (y=94) apoyada en el piso.
const S = 0.032;
const HEAD_R = 3.5 * S; // trazo 7
const BEAK_R = 2.5 * S; // trazo 5
const BASE_Y = 94;

const CLAY = "#F1EEE7";
const LIME = "#C8F031";

type Pt = { x: number; y: number };

function toWorld(p: Pt, out = new THREE.Vector3()) {
  return out.set((p.x - 60) * S, (BASE_Y - p.y) * S + HEAD_R, 0);
}

// Arco circular definido en espacio SVG; devuelve puntos ya pasados a mundo.
class SvgArcCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private c: Pt,
    private r: number,
    private a0: number,
    private a1: number,
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = this.a0 + (this.a1 - this.a0) * t;
    return toWorld({ x: this.c.x + this.r * Math.cos(a), y: this.c.y + this.r * Math.sin(a) }, target);
  }
}

function arcFromEndpoints(p0: Pt, p1: Pt, r: number, largeArc: boolean, sweep: boolean) {
  const mx = (p0.x + p1.x) / 2;
  const my = (p0.y + p1.y) / 2;
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const d = Math.hypot(dx, dy) / 2;
  const rr = Math.max(r, d);
  const h = Math.sqrt(Math.max(rr * rr - d * d, 0));
  const nx = -dy / (2 * d);
  const ny = dx / (2 * d);
  const candidates: Pt[] = [
    { x: mx + nx * h, y: my + ny * h },
    { x: mx - nx * h, y: my - ny * h },
  ];
  for (const c of candidates) {
    const a0 = Math.atan2(p0.y - c.y, p0.x - c.x);
    let delta = Math.atan2(p1.y - c.y, p1.x - c.x) - a0;
    if (sweep && delta < 0) delta += Math.PI * 2;
    if (!sweep && delta > 0) delta -= Math.PI * 2;
    const isLarge = Math.abs(delta) > Math.PI + 1e-6;
    if (isLarge === largeArc || h === 0) return { c, r: rr, a0, a1: a0 + delta };
  }
  const c = candidates[0];
  const a0 = Math.atan2(p0.y - c.y, p0.x - c.x);
  return { c, r: rr, a0, a1: Math.atan2(p1.y - c.y, p1.x - c.x) };
}

// Parser mínimo para los comandos absolutos que usa el isotipo (M, L, H, V, A).
function pathToCurve(d: string) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? [];
  const path = new THREE.CurvePath<THREE.Vector3>();
  const vertices: THREE.Vector3[] = [];
  let i = 0;
  let cur: Pt = { x: 0, y: 0 };
  let cmd = "";
  const num = () => parseFloat(tokens[i++]);
  const lineTo = (next: Pt) => {
    path.add(new THREE.LineCurve3(toWorld(cur), toWorld(next)));
    cur = next;
    vertices.push(toWorld(cur));
  };
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    switch (cmd) {
      case "M":
        cur = { x: num(), y: num() };
        vertices.push(toWorld(cur));
        cmd = "L";
        break;
      case "L":
        lineTo({ x: num(), y: num() });
        break;
      case "H":
        lineTo({ x: num(), y: cur.y });
        break;
      case "V":
        lineTo({ x: cur.x, y: num() });
        break;
      case "A": {
        const rx = num();
        num(); // ry: el isotipo usa arcos circulares
        num(); // rotación
        const large = num() === 1;
        const sweep = num() === 1;
        const next = { x: num(), y: num() };
        const arc = arcFromEndpoints(cur, next, rx, large, sweep);
        path.add(new SvgArcCurve(arc.c, arc.r, arc.a0, arc.a1));
        cur = next;
        vertices.push(toWorld(cur));
        break;
      }
      default:
        i++;
    }
  }
  return { path, vertices };
}

function ClayMaterial() {
  return <meshStandardMaterial color={CLAY} roughness={0.93} metalness={0} />;
}

function Owl() {
  const head = useMemo(() => pathToCurve(LOGO_HEAD_PATH), []);
  const beak = useMemo(() => pathToCurve(LOGO_BEAK_PATH), []);
  const eyes = useMemo(() => LOGO_EYES.map((e) => ({ key: e.cx, r: e.r * S, pos: toWorld({ x: e.cx, y: e.cy }) })), []);

  return (
    <group>
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[head.path, 480, HEAD_R, 28, false]} />
        <ClayMaterial />
      </mesh>
      {/* Caps y joins redondos: una esfera en cada vértice del trazo. */}
      {head.vertices.map((v, idx) => (
        <mesh key={`h${idx}`} position={v} castShadow receiveShadow>
          <sphereGeometry args={[HEAD_R, 28, 20]} />
          <ClayMaterial />
        </mesh>
      ))}
      {eyes.map((e) => (
        <mesh key={e.key} position={e.pos} rotation-x={Math.PI / 2} castShadow receiveShadow>
          <cylinderGeometry args={[e.r, e.r, HEAD_R * 1.6, 40]} />
          <ClayMaterial />
        </mesh>
      ))}
      <group position-z={HEAD_R * 0.6}>
        <mesh castShadow>
          <tubeGeometry args={[beak.path, 96, BEAK_R, 20, false]} />
          <meshStandardMaterial color={LIME} roughness={0.75} />
        </mesh>
        {beak.vertices.map((v, idx) => (
          <mesh key={`b${idx}`} position={v} castShadow>
            <sphereGeometry args={[BEAK_R, 20, 14]} />
            <meshStandardMaterial color={LIME} roughness={0.75} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

type Pointer = { x: number; y: number };

function Sun({ reduced, mapSize, pointer }: { reduced: boolean; mapSize: number; pointer: React.RefObject<Pointer> }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const smooth = useRef<Pointer>({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const l = light.current;
    if (!l) return;
    const k = 1 - Math.exp(-delta * 2.5);
    smooth.current.x += (pointer.current.x - smooth.current.x) * k;
    smooth.current.y += (pointer.current.y - smooth.current.y) * k;
    // Arranca atrás a la derecha: la sombra larga cae hacia adelante y a la izquierda.
    const orbit = reduced ? 0 : state.clock.elapsedTime * 0.11;
    const angle = -Math.PI / 4 + orbit + smooth.current.x * 1.1;
    const height = THREE.MathUtils.clamp(2.3 + smooth.current.y * 1.8, 0.9, 5);
    const radius = 7;
    l.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
  });

  const ext = 10;
  return (
    <directionalLight
      ref={light}
      position={[5, 2.3, -5]}
      intensity={2.6}
      color="#FFF5E6"
      castShadow
      shadow-mapSize-width={mapSize}
      shadow-mapSize-height={mapSize}
      shadow-radius={4}
      shadow-bias={-0.0004}
      shadow-normalBias={0.025}
      shadow-camera-left={-ext}
      shadow-camera-right={ext}
      shadow-camera-top={ext}
      shadow-camera-bottom={-ext}
      shadow-camera-near={0.5}
      shadow-camera-far={30}
    />
  );
}

const CAM_POS = new THREE.Vector3(4.4, 2.5, 7.6);
const CAM_TARGET = new THREE.Vector3(0, 1.2, 0);

function Rig({ reduced }: { reduced: boolean }) {
  const width = useThree((s) => s.size.width);
  const tmp = useMemo(
    () => ({ right: new THREE.Vector3(), dir: new THREE.Vector3(), off: new THREE.Vector3(), look: new THREE.Vector3() }),
    [],
  );

  useFrame((state) => {
    const t = reduced ? 0 : state.clock.elapsedTime;
    // En desktop el texto va a la izquierda: corremos la cámara para que el búho quede a la derecha.
    const shift = width >= 768 ? 1.75 : 0;
    tmp.dir.subVectors(CAM_TARGET, CAM_POS).normalize();
    tmp.right.crossVectors(tmp.dir, THREE.Object3D.DEFAULT_UP).normalize();
    tmp.off.copy(tmp.right).multiplyScalar(-shift);
    const cam = state.camera;
    cam.position.copy(CAM_POS).add(tmp.off);
    cam.position.x += Math.sin(t * 0.31) * 0.14;
    cam.position.y += Math.sin(t * 0.47) * 0.09;
    tmp.look.copy(CAM_TARGET).add(tmp.off);
    cam.lookAt(tmp.look);
  });
  return null;
}

type Props = {
  reduced: boolean;
  mobile: boolean;
  active: boolean;
  onReady: () => void;
};

export default function HeroScene({ reduced, mobile, active, onReady }: Props) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      shadows="percentage"
      flat
      dpr={[1, 2]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 32, near: 0.1, far: 100, position: [CAM_POS.x, CAM_POS.y, CAM_POS.z] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady()}
    >
      <hemisphereLight args={["#FFFFFF", "#BDB7AA", 0.55]} />
      <ambientLight intensity={0.12} />
      <Sun key={mobile ? "m" : "d"} reduced={reduced} mapSize={mobile ? 1024 : 2048} pointer={pointer} />
      <Owl />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial transparent opacity={0.26} color="#2B271F" />
      </mesh>
      <ContactShadows position={[0, 0.002, 0]} scale={6} far={1.4} blur={2.2} opacity={0.45} color="#161616" frames={1} />
      <Rig reduced={reduced} />
    </Canvas>
  );
}
