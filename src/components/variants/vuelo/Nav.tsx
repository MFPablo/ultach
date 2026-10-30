import { Logo } from "@/components/shared/Logo";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { FOCUS, VUELO } from "./palette";

const anchors = [
  { href: "#productos", label: "Productos" },
  { href: "#clientes", label: "Clientes" },
  { href: "#servicios", label: "Servicios" },
  { href: "#contacto", label: "Contacto" },
];

export function Nav() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(15, 26, 58, 0.72)", boxShadow: `0 1px 0 ${VUELO.line}` }}
    >
      <nav aria-label="Principal" className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <a href="#inicio" className={`${FOCUS} -m-2 inline-flex min-h-11 items-center rounded-md p-2`} aria-label="ultach, ir al inicio">
          <Logo size={26} color={VUELO.text} />
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {anchors.map((a) => (
            <li key={a.href}>
              <a
                href={a.href}
                className={`${FOCUS} inline-flex min-h-11 items-center rounded-full px-4 text-[0.95rem] transition-colors duration-200 hover:text-[#F4F1EA]`}
                style={{ color: VUELO.muted }}
              >
                {a.label}
              </a>
            </li>
          ))}
        </ul>
        <WhatsAppLink
          className={`${FOCUS} inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold`}
          style={{ background: VUELO.accent, color: VUELO.night }}
        >
          <WhatsAppIcon size={18} />
          WhatsApp
        </WhatsAppLink>
      </nav>
    </header>
  );
}
