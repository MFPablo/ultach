import type { Metadata } from "next";
import { VueloLanding } from "@/components/variants/vuelo/VueloLanding";
import { brand } from "@/lib/content";

const title = "ultach · Vuelo";
const description =
  "Productos digitales propios (Mindora, Tendu, trac.ar), sitios web para marcas y software a medida. Soporte y contacto por WhatsApp.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `ultach — ${brand.tagline}`,
    description,
    type: "website",
    locale: "es_AR",
    siteName: "ultach",
  },
  twitter: { card: "summary_large_image", title: `ultach — ${brand.tagline}`, description },
};

export const viewport = { themeColor: "#0F1A3A" };

export default function VueloPage() {
  return <VueloLanding />;
}
