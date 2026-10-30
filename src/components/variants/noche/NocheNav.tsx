import { Logo } from "@/components/shared/Logo";
import { NocheNavCta, NocheNavLinks } from "./NocheNavLinks";
import { focusRing, gutter } from "./styles";

export function NocheNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#ECEAE3]/[0.06] bg-[#0B0D10]/75 backdrop-blur-md">
      <a
        href="#contenido"
        className={`sr-only rounded-full bg-[#F2A93B] px-4 py-2 font-semibold text-[#0B0D10] focus:not-sr-only focus:absolute focus:left-4 focus:top-3 ${focusRing}`}
      >
        Saltar al contenido
      </a>
      <nav className={`${gutter} flex h-16 items-center justify-between gap-6`} aria-label="Principal">
        <a href="#inicio" aria-label="ultach, volver al inicio" className={`-m-2 rounded-lg p-2 ${focusRing}`}>
          <Logo size={26} />
        </a>
        <NocheNavLinks />
        <NocheNavCta />
      </nav>
    </header>
  );
}
