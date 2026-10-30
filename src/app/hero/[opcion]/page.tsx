import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { heroDrafts } from "@/lib/content";
import { NocheNav } from "@/components/variants/noche/NocheNav";
import { NocheHeroDraft } from "@/components/variants/noche/NocheHeroDraft";
import { HeroPlay } from "@/components/variants/noche/hero/play";
import { HERO_TIMING, css } from "@/components/variants/noche/hero/anim";
import { NocheContact } from "@/components/variants/noche/NocheContact";
import { NocheServices } from "@/components/variants/noche/NocheServices";
import { NocheProjects } from "@/components/variants/noche/NocheProjects";
import { NocheFooter } from "@/components/variants/noche/NocheFooter";

// Preview interno de los borradores del hero (no linkeado). Se borra cuando se elija uno.
type Props = { params: Promise<{ opcion: string }> };

export function generateStaticParams() {
  return Object.keys(heroDrafts).map((opcion) => ({ opcion }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { opcion } = await params;
  return { title: `ultach — hero ${opcion.toUpperCase()}`, robots: { index: false } };
}

export default async function HeroDraftPage({ params }: Props) {
  const { opcion } = await params;
  const draft = heroDrafts[opcion];
  if (!draft) notFound();
  return (
    <HeroPlay className="flex min-h-full flex-1 flex-col bg-[#0B0D10] text-[#ECEAE3] selection:bg-[#F2A93B] selection:text-[#0B0D10]">
      <div className={css.nav} style={{ "--at": `${HERO_TIMING.nav}s` } as CSSProperties}>
        <NocheNav />
      </div>
      <main id="contenido" className="flex-1">
        <NocheHeroDraft draft={draft} />
        <NocheProjects />
        <NocheServices />
        <NocheContact />
      </main>
      <NocheFooter />
    </HeroPlay>
  );
}
