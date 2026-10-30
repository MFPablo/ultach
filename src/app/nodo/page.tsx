import type { Metadata } from "next";
import { NodoLanding } from "@/components/variants/nodo/NodoLanding";
import { brand } from "@/lib/content";

const title = "ultach / nodo: productos, clientes y soporte en una red";
const description =
  "Ultach conecta todo: productos propios (Mindora, Tendu, trac.ar), sitios para clientes y soporte directo por WhatsApp.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description: `${brand.tagline} ${description}`,
    type: "website",
    locale: "es_AR",
    siteName: "ultach",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function NodoPage() {
  return <NodoLanding />;
}
