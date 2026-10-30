import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { seo } from "@/lib/content";
import { NocheNav } from "@/components/variants/noche/NocheNav";
import { NocheHero } from "@/components/variants/noche/NocheHero";
import { HeroPlay } from "@/components/variants/noche/hero/play";
import { HERO_TIMING, css } from "@/components/variants/noche/hero/anim";
import { NocheContact } from "@/components/variants/noche/NocheContact";
import { NocheServices } from "@/components/variants/noche/NocheServices";
import { NocheProjects } from "@/components/variants/noche/NocheProjects";
import { NocheFooter } from "@/components/variants/noche/NocheFooter";

export const metadata: Metadata = {
  title: { absolute: seo.title },
  description: seo.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: "/",
    type: "website",
    locale: "es_AR",
    siteName: "ultach",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
  },
};

// Hero "Ficha": las piezas arman el emblema, entra el texto y queda la ficha de láminas 3D.
// HeroPlay sincroniza la entrada del texto y del nav con el primer frame del canvas.
export default function Home() {
  return (
    <HeroPlay
      className="flex min-h-full flex-1 flex-col bg-[#0B0D10] text-[#ECEAE3] selection:bg-[#F2A93B] selection:text-[#0B0D10]"
    >
      <div className={css.nav} style={{ "--at": `${HERO_TIMING.nav}s` } as CSSProperties}>
        <NocheNav />
      </div>
      <main id="contenido" className="flex-1">
        <NocheHero />
        <NocheProjects />
        <NocheServices />
        <NocheContact />
      </main>
      <NocheFooter />
    </HeroPlay>
  );
}
