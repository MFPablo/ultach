import { clientWork, products } from "@/lib/content";

// Tokens de la variante Nodo (claro, técnico).
export const NODO = {
  paper: "#F5F4F0",
  surface: "#FFFFFF",
  ink: "#121212",
  muted: "#55554F", // 6.8:1 sobre paper
  hair: "#D8D6CF",
  edge: "#9C9A93",
  accent: "#2F5BFF",
} as const;

export function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const productAnchor = (name: string) => `producto-${slug(name)}`;
export const clientAnchor = (name: string) => `cliente-${slug(name)}`;

export type GraphNode = {
  kind: "product" | "client";
  label: string;
  anchor: string;
  size: number;
  orbit: number;
  tilt: [number, number];
  phase: number;
  speed: number;
};

const TAU = Math.PI * 2;

// Índice 0 = núcleo ultach. Nodos 1..3 = productos, 4..6 = clientes.
export const GRAPH_NODES: GraphNode[] = [
  ...products.map<GraphNode>((p, i) => ({
    kind: "product",
    label: p.domain,
    anchor: productAnchor(p.name),
    size: 0.3,
    orbit: 2.7,
    tilt: [0.32 - i * 0.28, 0.18 + i * 0.12],
    phase: (i / products.length) * TAU,
    speed: 0.16,
  })),
  ...clientWork.map<GraphNode>((c, i) => ({
    kind: "client",
    label: c.domain,
    anchor: clientAnchor(c.name),
    size: 0.17,
    orbit: 4.1,
    tilt: [-0.22 + i * 0.24, -0.3 + i * 0.2],
    phase: (i / clientWork.length) * TAU + TAU / 6,
    speed: -0.09,
  })),
];

// [desde, hacia, lleva paquetes]. Los paquetes viajan de "desde" a "hacia", siempre en dirección al núcleo.
const P = (i: number) => 1 + i;
const C = (i: number) => 1 + products.length + i;

export const GRAPH_EDGES: [number, number, boolean][] = [
  ...GRAPH_NODES.map<[number, number, boolean]>((_, i) => [i + 1, 0, true]),
  ...products.map<[number, number, boolean]>((_, i) => [C(i), P(i), true]),
  ...products.map<[number, number, boolean]>((_, i) => [P(i), P((i + 1) % products.length), false]),
];
