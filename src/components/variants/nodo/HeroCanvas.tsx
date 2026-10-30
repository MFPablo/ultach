"use client";

import dynamic from "next/dynamic";
import { GraphFallback } from "./GraphFallback";

const GraphScene = dynamic(() => import("./GraphScene"), {
  ssr: false,
  loading: () => <GraphFallback />,
});

export function HeroCanvas() {
  return <GraphScene />;
}
