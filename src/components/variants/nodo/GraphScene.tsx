"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { GRAPH_EDGES, GRAPH_NODES, NODO, type GraphNode } from "./graph";

// Objetos de trabajo reutilizados en cada frame (una sola escena por página).
const POSITIONS = [new THREE.Vector3(), ...GRAPH_NODES.map(() => new THREE.Vector3())];
const DUMMY = new THREE.Object3D();
const COLOR_EDGE = new THREE.Color(NODO.edge);
const COLOR_HOT = new THREE.Color(NODO.accent);
const COLOR_DIM = new THREE.Color(NODO.hair);
const PACKETS_PER_EDGE = 2;
const PACKET_EDGES = GRAPH_EDGES.map((e, i) => (e[2] ? i : -1)).filter((i) => i >= 0);

function useMedia(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function scrollToAnchor(id: string, reduced: boolean) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

function orbitQuaternion(n: GraphNode) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(n.tilt[0], 0, n.tilt[1]));
}

function writeNodePosition(n: GraphNode, q: THREE.Quaternion, t: number, out: THREE.Vector3) {
  const a = n.phase + t * n.speed;
  out.set(Math.cos(a) * n.orbit, 0, Math.sin(a) * n.orbit).applyQuaternion(q);
}

type GraphProps = { reduced: boolean; small: boolean; spin: boolean };

function Graph({ reduced, small, spin }: GraphProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const time = useRef(0);
  const world = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const edgeGeo = useRef<THREE.BufferGeometry>(null);
  const packets = useRef<THREE.InstancedMesh>(null);

  const quats = useMemo(() => GRAPH_NODES.map(orbitQuaternion), []);
  const edgeArrays = useMemo(
    () => ({ pos: new Float32Array(GRAPH_EDGES.length * 6), col: new Float32Array(GRAPH_EDGES.length * 6) }),
    [],
  );

  const rings = useMemo(
    () =>
      GRAPH_NODES.map((n, i) => {
        const pts: [number, number, number][] = [];
        const v = new THREE.Vector3();
        for (let s = 0; s <= 96; s++) {
          const a = (s / 96) * Math.PI * 2;
          v.set(Math.cos(a) * n.orbit, 0, Math.sin(a) * n.orbit).applyQuaternion(quats[i]);
          pts.push([v.x, v.y, v.z]);
        }
        return pts;
      }),
    [quats],
  );

  const gridPoints = useMemo(() => {
    const step = small ? 2.2 : 1.6;
    const out: number[] = [];
    for (let x = -9; x <= 9; x += step)
      for (let y = -5; y <= 5; y += step) for (let z = -7; z <= 3; z += step * 1.25) out.push(x, y, z);
    return new Float32Array(out);
  }, [small]);

  const packetSeeds = useMemo(
    () => Array.from({ length: PACKET_EDGES.length * PACKETS_PER_EDGE }, (_, i) => ((i * 0.618) % 1) + 0.0001),
    [],
  );

  useEffect(() => () => void (document.body.style.cursor = ""), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!reduced) time.current += dt;
    const t = time.current;

    if (spin && !reduced && world.current) world.current.rotation.y += dt * 0.08;
    if (core.current && !reduced) {
      core.current.rotation.y = t * 0.25;
      core.current.rotation.x = t * 0.1;
    }

    GRAPH_NODES.forEach((n, i) => {
      const p = POSITIONS[i + 1];
      writeNodePosition(n, quats[i], t, p);
      const g = nodes.current[i];
      if (g) {
        g.position.copy(p);
        const target = hovered === i + 1 ? 1.35 : 1;
        g.scale.setScalar(reduced ? target : THREE.MathUtils.lerp(g.scale.x, target, 0.2));
      }
    });

    const geo = edgeGeo.current;
    if (geo) {
      const { pos, col } = edgeArrays;
      GRAPH_EDGES.forEach(([a, b], e) => {
        const pa = POSITIONS[a];
        const pb = POSITIONS[b];
        pos.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], e * 6);
        const hot = hovered !== null && (a === hovered || b === hovered);
        const c = hovered === null ? COLOR_EDGE : hot ? COLOR_HOT : COLOR_DIM;
        col.set([c.r, c.g, c.b, c.r, c.g, c.b], e * 6);
      });
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.computeBoundingSphere();
    }

    const inst = packets.current;
    if (inst) {
      packetSeeds.forEach((seed, k) => {
        const [a, b] = GRAPH_EDGES[PACKET_EDGES[Math.floor(k / PACKETS_PER_EDGE)]];
        const u = (t * 0.32 + seed) % 1;
        DUMMY.position.lerpVectors(POSITIONS[a], POSITIONS[b], u);
        DUMMY.scale.setScalar(0.35 + Math.sin(u * Math.PI) * 0.65);
        DUMMY.updateMatrix();
        inst.setMatrixAt(k, DUMMY.matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  const over = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(i);
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    setHovered(null);
    document.body.style.cursor = "";
  };

  return (
    <group ref={world}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gridPoints, 3]} />
        </bufferGeometry>
        <pointsMaterial color={NODO.ink} size={0.035} sizeAttenuation transparent opacity={0.28} depthWrite={false} />
      </points>

      {rings.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={NODO.ink}
          lineWidth={1}
          transparent
          opacity={hovered === i + 1 ? 0.35 : 0.1}
          dashed={GRAPH_NODES[i].kind === "client"}
          dashSize={0.12}
          gapSize={0.12}
        />
      ))}

      <lineSegments>
        <bufferGeometry ref={edgeGeo}>
          <bufferAttribute attach="attributes-position" args={[edgeArrays.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[edgeArrays.col, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.9} />
      </lineSegments>

      <group ref={core}>
        <mesh>
          <icosahedronGeometry args={[0.72, 0]} />
          <meshStandardMaterial color={NODO.accent} flatShading roughness={0.45} metalness={0.05} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1.02, 1]} />
          <meshBasicMaterial color={NODO.accent} wireframe transparent opacity={0.45} />
        </mesh>
      </group>
      <Html position={[0, -1.35, 0]} center zIndexRange={[20, 0]} pointerEvents="none">
        <span className="block whitespace-nowrap bg-[#2F5BFF] px-1.5 py-0.5 font-mono text-[11px] leading-none text-white">
          ultach / núcleo
        </span>
      </Html>

      {GRAPH_NODES.map((n, i) => {
        const id = i + 1;
        const hot = hovered === id;
        return (
          <group key={n.anchor} ref={(g) => void (nodes.current[i] = g)}>
            {n.kind === "product" ? (
              <mesh>
                <sphereGeometry args={[n.size, 32, 16]} />
                <meshStandardMaterial color={hot ? NODO.accent : NODO.ink} roughness={0.5} />
              </mesh>
            ) : (
              <>
                <mesh>
                  <sphereGeometry args={[n.size, 24, 12]} />
                  <meshBasicMaterial color={NODO.surface} />
                </mesh>
                <mesh scale={1.22}>
                  <sphereGeometry args={[n.size, 24, 12]} />
                  <meshBasicMaterial color={hot ? NODO.accent : NODO.ink} side={THREE.BackSide} />
                </mesh>
              </>
            )}
            {/* Zona de toque más grande que el nodo visible. */}
            <mesh
              onPointerOver={over(id)}
              onPointerOut={out}
              onClick={(e) => {
                if (e.delta > 6) return;
                e.stopPropagation();
                scrollToAnchor(n.anchor, reduced);
              }}
            >
              <sphereGeometry args={[Math.max(n.size * 1.8, 0.42), 12, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <Html position={[0, n.size + 0.32, 0]} center zIndexRange={[20, 0]} pointerEvents="none">
              <span
                className={`block whitespace-nowrap border px-1.5 py-0.5 font-mono text-[11px] leading-none transition-colors ${
                  hot ? "border-[#2F5BFF] bg-[#2F5BFF] text-white" : "border-[#D8D6CF] bg-white text-[#121212]"
                }`}
              >
                {n.label}
              </span>
            </Html>
          </group>
        );
      })}

      {!reduced && (
        <instancedMesh ref={packets} args={[undefined, undefined, packetSeeds.length]} frustumCulled={false}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshBasicMaterial color={NODO.accent} />
        </instancedMesh>
      )}
    </group>
  );
}

export default function GraphScene() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const coarse = useMedia("(pointer: coarse)");
  const small = useMedia("(max-width: 767px)");
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        frameloop={visible && !reduced ? "always" : "demand"}
        camera={{ position: [0, 1.4, small ? 12.5 : 10.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: coarse ? "pan-y" : "none" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 5]} intensity={1.6} />
        <Graph reduced={reduced} small={small} spin={coarse} />
        {/* En touch no montamos los controles: así el canvas no bloquea el scroll de la página. */}
        {!coarse && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            autoRotate={!reduced}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI * 0.3}
            maxPolarAngle={Math.PI * 0.7}
          />
        )}
      </Canvas>
    </div>
  );
}
