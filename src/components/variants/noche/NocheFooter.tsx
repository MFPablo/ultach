import { EMAIL, clientWork, products } from "@/lib/content";
import { Logo } from "@/components/shared/Logo";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { focusRing, gutter } from "./styles";

const linkClass = `inline-flex min-h-11 items-center text-[#9A9EA6] transition-colors hover:text-[#ECEAE3] ${focusRing}`;

export function NocheFooter() {
  return (
    <footer className="border-t border-[#ECEAE3]/[0.07] pb-10 pt-16 md:pt-20">
      <div className={`${gutter} grid gap-12 md:grid-cols-12`}>
        <div className="flex flex-col gap-4 md:col-span-4">
          <Logo size={32} />
          <p className="max-w-[30ch] text-[#9A9EA6]">Productos propios, sitios web y software a medida.</p>
        </div>
        <nav aria-label="Productos" className="md:col-span-2">
          <h2 className="text-sm text-[#ECEAE3]">Productos</h2>
          <ul className="mt-3">
            {products.map((p) => (
              <li key={p.name}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Clientes" className="md:col-span-3">
          <h2 className="text-sm text-[#ECEAE3]">Clientes</h2>
          <ul className="mt-3">
            {clientWork.map((c) => (
              <li key={c.name}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <h2 className="text-sm text-[#ECEAE3]">Contacto</h2>
          <ul className="mt-3">
            <li>
              <WhatsAppLink className={linkClass}>WhatsApp</WhatsAppLink>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className={`${linkClass} break-all md:break-normal`}>
                {EMAIL}
              </a>
            </li>
            <li>
              <a href="#inicio" className={linkClass}>
                Volver arriba
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={`${gutter} mt-16 flex justify-end border-t border-[#ECEAE3]/[0.07] pt-6 text-sm text-[#9A9EA6]`}>
        <p>
          Hecho de noche por{" "}
          <a href="#inicio" className={`font-bold tracking-[-0.04em] text-[#ECEAE3] hover:text-[#F2A93B] ${focusRing}`}>
            ultach
          </a>
        </p>
      </div>
    </footer>
  );
}
