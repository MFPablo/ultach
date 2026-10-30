// Shaders de la bandada. Todo el movimiento se calcula en el vertex shader:
// 1. flowPos: cada partícula deriva en x (con wrap) y se desvía por un campo curl noise.
// 2. targetPos: su punto del isotipo, escalado y ubicado según el viewport.
// 3. uMix (con retardo por partícula y easing) mezcla vuelo → logo.
// 4. uMouse empuja las partículas cercanas al puntero.

const simplex = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(x),
    snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)),
    snoise(vec3(x.z + 74.2, x.x - 124.4, x.y + 99.4))
  );
}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 px0 = snoiseVec3(p - dx);
  vec3 px1 = snoiseVec3(p + dx);
  vec3 py0 = snoiseVec3(p - dy);
  vec3 py1 = snoiseVec3(p + dy);
  vec3 pz0 = snoiseVec3(p - dz);
  vec3 pz1 = snoiseVec3(p + dz);
  float x = py1.z - py0.z - pz1.y + pz0.y;
  float y = pz1.x - pz0.x - px1.z + px0.z;
  float z = px1.y - px0.y - py1.x + py0.x;
  return vec3(x, y, z) / (2.0 * e);
}
`;

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMix;
uniform vec2 uBounds;      // medio ancho y medio alto visibles en z = 0
uniform vec3 uLogo;        // xy: centro del logo, z: escala (alto en unidades de mundo)
uniform vec3 uMouse;       // xy: puntero en mundo, z: intensidad (0 si no hay puntero)
uniform float uSize;
uniform float uPixelRatio;

attribute vec3 aSeed;
attribute vec3 aTarget;
attribute vec4 aMeta;      // x: tipo, y: retardo, z: velocidad, w: tamaño

varying float vKind;
varying float vAlpha;
varying float vFormed;

${simplex}

vec3 flowPosition(vec3 s, float t) {
  // Ancho de wrap mayor que el viewport para que el salto ocurra fuera de cuadro.
  float W = 2.0 * (uBounds.x + 3.0);
  float x = mod(s.x * W * 0.5 + t * 0.55 * aMeta.z + W * 0.5, W) - W * 0.5;
  vec3 p = vec3(x, s.y * uBounds.y * 0.75, s.z * 1.6);
  // Barrida coherente: la franja entera ondula, como una murmuración.
  p.y += sin(p.x * 0.32 + t * 0.42) * uBounds.y * 0.28;
  p.y += sin(p.x * 0.11 - t * 0.23) * uBounds.y * 0.18;
  // Curl noise: turbulencia sin divergencia, las partículas no se amontonan.
  p += curlNoise(p * 0.18 + vec3(0.0, 0.0, t * 0.05)) * 0.9;
  return p;
}

void main() {
  vKind = aMeta.x;
  vec3 flowPos = flowPosition(aSeed, uTime);

  vec3 targetPos = vec3(aTarget.xy * uLogo.z + uLogo.xy, aTarget.z);
  // Respiración leve mientras el logo está formado.
  targetPos.xy += vec2(
    sin(uTime * 1.7 + aMeta.y * 40.0),
    cos(uTime * 1.3 + aMeta.y * 31.0)
  ) * 0.012 * uLogo.z;

  // Las partículas libres nunca se posan.
  float isMark = step(0.5, aMeta.x);
  const float stagger = 0.55;
  float m = clamp(uMix * (1.0 + stagger) - aMeta.y * stagger, 0.0, 1.0) * isMark;
  float e = m * m * (3.0 - 2.0 * m);

  vec3 pos = mix(flowPos, targetPos, e);
  // Arco en profundidad durante el trayecto, para que no viajen en línea recta.
  pos.z += sin(e * 3.14159) * (aMeta.y - 0.5) * 2.4;

  // Repulsión del puntero.
  vec2 d = pos.xy - uMouse.xy;
  float dist2 = dot(d, d);
  float radius = 0.9 + 0.25 * uLogo.z;
  float push = exp(-dist2 / (radius * radius)) * uMouse.z;
  pos.xy += normalize(d + 1e-4) * push * 0.75;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = uSize * aMeta.w * mix(1.0, 1.25, e);
  gl_PointSize = size * uPixelRatio * (10.0 / -mv.z);

  vFormed = e;
  vAlpha = mix(0.55, 0.95, e) * mix(0.55, 1.0, isMark);
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;

varying float vKind;
varying float vAlpha;
varying float vFormed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.12, d) * vAlpha;
  vec3 color = vKind > 1.5 ? uAccent : uColor;
  gl_FragColor = vec4(color, a);
}
`;
