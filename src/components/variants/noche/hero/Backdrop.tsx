"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Fondo del hero: plano a pantalla completa con un halo cálido detrás del emblema que crece al
// cerrar el ensamble y una onda expansiva cuando aterriza la última pieza. Escribe el color final en
// sRGB crudo, sin pasar por el color management de three.

const vertexShader = /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const fragmentShader = (done: number) => /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform float uDpr;

  const vec3 BG = vec3(0.043, 0.051, 0.063);
  const vec3 BRAND_A = vec3(0.969, 0.753, 0.384);
  const vec3 BRAND_B = vec3(0.878, 0.439, 0.227);
  const vec3 BRAND_C = vec3(0.620, 0.169, 0.271);

  // Encaje del emblema (igual que emblemFrame en stage.tsx).
  bool wide() { return uRes.x >= 1024.0 * uDpr && uRes.x > uRes.y * 1.15; }
  float emblemR() { return wide() ? min(0.26 * uRes.y, 0.22 * uRes.x) : min(0.22 * uRes.y, 0.40 * uRes.x); }
  vec2 emblemC(float R) { return wide() ? vec2(0.75 * uRes.x, 0.5 * uRes.y) : vec2(0.5 * uRes.x, uRes.y * 0.89 - R); }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 f = gl_FragCoord.xy;
    float R = emblemR();
    float d = length(f - emblemC(R)) / R;
    float t = uTime;
    vec3 c = BG;
    c += BRAND_B * exp(-pow(max(d - 0.95, 0.0) * 1.4, 2.0)) * 0.09 * smoothstep(2.4, 4.2, t);
    c += BRAND_C * exp(-d * d * 0.35) * 0.05 * (1.0 - smoothstep(0.0, 3.2, t));
    float r = 1.0 + max(t - ${done.toFixed(2)}, 0.0) * 1.7;
    float ring = exp(-pow((d - r) / 0.05, 2.0)) * step(${done.toFixed(2)}, t) * (1.0 - smoothstep(0.0, 1.1, t - ${done.toFixed(2)}));
    c += BRAND_A * ring * 0.35;

    // Baja la luz en el tercio inferior (y a la izquierda en desktop) para que el texto se lea limpio.
    float k = smoothstep(0.1, 0.52, f.y / uRes.y);
    if (wide()) k = max(k, smoothstep(0.52, 0.68, f.x / uRes.x));
    c = mix(BG, c, mix(0.18, 1.0, k));
    // Dither para que los degradés oscuros no hagan banding.
    c += (hash(f + fract(t)) - 0.5) / 255.0;
    gl_FragColor = vec4(c, 1.0);
  }
`;

export function Backdrop({ reduced, done, time }: { reduced: boolean; done: number; time: RefObject<number> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uDpr: { value: 1 } }), []);

  useFrame((state) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    u.uTime.value = reduced ? 30 : time.current;
    state.gl.getDrawingBufferSize(u.uRes.value);
    u.uDpr.value = state.gl.getPixelRatio();
  });

  return (
    // renderOrder -1: es el fondo, se dibuja antes que las piezas y las láminas.
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader(done)}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
