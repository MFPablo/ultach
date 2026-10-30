import type { Metadata } from "next";
import { SombraLanding } from "@/components/variants/sombra/SombraLanding";
import { brand } from "@/lib/content";

const title = `ultach — ${brand.tagline}`;

export const metadata: Metadata = {
  title,
  description: brand.intro,
  openGraph: {
    title,
    description: brand.intro,
    type: "website",
    locale: "es_AR",
    siteName: "ultach",
  },
};

export default function SombraPage() {
  return <SombraLanding />;
}
