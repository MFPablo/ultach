import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { clientWork, contact, services } from "@/lib/content";
import { mulberry32 } from "./logoTargets";
import { FOCUS, VUELO } from "./palette";

const H2 = "text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold leading-[0.98]";
const H2_STYLE = { letterSpacing: "-0.045em" } as const;

/* ---------------------------------------------------------------- Clientes */

export function Clients() {
  return (
    <section id="clientes" className="scroll-mt-16 px-4 py-24 sm:px-8 md:py-32" style={{ background: VUELO.surface }}>
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div>
          <h2 className={H2} style={H2_STYLE}>
            Sitios para clientes
          </h2>
          <p className="mt-5 max-w-sm text-lg leading-relaxed" style={{ color: VUELO.muted }}>
            Sitios a medida que ya están publicados. Entrá y miralos funcionando.
          </p>
        </div>

        <ul className="border-t" style={{ borderColor: VUELO.line }}>
          {clientWork.map((c) => (
            <li key={c.name} className="border-b" style={{ borderColor: VUELO.line }}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${FOCUS} group grid gap-x-8 gap-y-2 py-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline md:py-10`}
              >
                <span
                  className="text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight transition-transform duration-300 ease-out group-hover:translate-x-2 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {c.name}
                </span>
                <span className="text-sm sm:text-right" style={{ color: VUELO.muted }}>
                  {c.kind}
                </span>
                <span className="max-w-[52ch] leading-relaxed sm:col-span-2" style={{ color: VUELO.muted }}>
                  {c.description}
                </span>
                <span
                  className="font-mono text-sm underline decoration-1 underline-offset-[6px] sm:col-span-2"
                  style={{ color: VUELO.accent }}
                >
                  {c.domain}
                  <span className="sr-only"> (abre en otra pestaña)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Servicios */

export function Services() {
  return (
    <section id="servicios" className="scroll-mt-16 px-4 py-24 sm:px-8 md:py-32">
      <div className="mx-auto w-full max-w-7xl">
        <h2 className={`${H2} max-w-2xl`} style={H2_STYLE}>
          Además de los productos, trabajo a medida.
        </h2>
        <ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
          {services.map((s, i) => (
            // Escalonado leve: cada servicio arranca un poco más arriba que el anterior.
            <li key={s.title} className={i === 0 ? "md:mt-16" : i === 1 ? "md:mt-8" : ""}>
              <span className="block h-[3px] w-10 rounded-full" style={{ background: VUELO.accent }} aria-hidden="true" />
              <h3 className="mt-6 text-2xl font-bold leading-tight sm:text-[1.75rem]" style={{ letterSpacing: "-0.035em" }}>
                {s.title}
              </h3>
              <p className="mt-3 max-w-[36ch] leading-relaxed" style={{ color: VUELO.muted }}>
                {s.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Contacto */

// Pequeña bandada estática de chevrones (el pico del isotipo) que sale hacia arriba a la derecha.
function StaticFlock() {
  const rand = mulberry32(19);
  const birds = Array.from({ length: 46 }, () => {
    const t = rand();
    // A lo largo de una diagonal ascendente, con dispersión que se abre hacia el final.
    const x = 40 + t * 58 + (rand() - 0.5) * 10 * t;
    const y = 88 - t * 74 + (rand() - 0.5) * 22 * t;
    return { x, y, s: 0.6 + rand() * 0.9, o: 0.25 + t * 0.55 };
  });
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      {birds.map((b, i) => (
        <path
          key={i}
          d={`M ${b.x - b.s} ${b.y + b.s * 0.6} L ${b.x} ${b.y} L ${b.x + b.s} ${b.y + b.s * 0.6}`}
          fill="none"
          stroke={i % 9 === 0 ? VUELO.accent : VUELO.text}
          strokeOpacity={b.o * 0.5}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function Contact() {
  return (
    <section
      id="contacto"
      className="relative isolate scroll-mt-16 overflow-hidden px-4 py-28 sm:px-8 md:py-40"
      style={{ background: VUELO.surface }}
    >
      <StaticFlock />
      <div className="relative mx-auto w-full max-w-7xl">
        <h2
          className="max-w-[14ch] text-balance text-[clamp(2.75rem,9vw,7.5rem)] font-bold leading-[0.92]"
          style={{ letterSpacing: "-0.055em" }}
        >
          {contact.title}
        </h2>
        <p className="mt-7 max-w-lg text-lg leading-relaxed sm:text-xl" style={{ color: VUELO.muted }}>
          {contact.body}
        </p>
        <WhatsAppLink
          className={`${FOCUS} mt-10 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-full px-9 text-lg font-semibold transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto sm:text-xl`}
          style={{ background: VUELO.accent, color: VUELO.night }}
        >
          <WhatsAppIcon size={24} />
          {contact.cta}
        </WhatsAppLink>
        <p className="mt-5 text-sm" style={{ color: VUELO.muted }}>
          Se abre WhatsApp con un mensaje listo. Contanos qué necesitás.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Footer */

export function Footer() {
  return (
    <footer className="px-4 pb-10 pt-16 sm:px-8" style={{ boxShadow: `inset 0 1px 0 ${VUELO.line}` }}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <Logo size={30} color={VUELO.text} />
          <p className="max-w-xs text-sm leading-relaxed" style={{ color: VUELO.muted }}>
            Productos propios, sitios web y software a medida.
          </p>
        </div>
        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
          {[
            { href: "#productos", label: "Productos" },
            { href: "#clientes", label: "Clientes" },
            { href: "#servicios", label: "Servicios" },
            { href: "#contacto", label: "Contacto" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`${FOCUS} inline-flex min-h-11 items-center rounded-sm px-2 transition-colors duration-200 hover:text-[#F4F1EA]`}
              style={{ color: VUELO.muted }}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div
        className="mx-auto mt-12 flex w-full max-w-7xl flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: VUELO.line, color: VUELO.muted }}
      >
        <p>© 2026 ultach</p>
        <Link href="/" className={`${FOCUS} inline-flex min-h-11 items-center gap-1.5 rounded-sm transition-colors duration-200 hover:text-[#F4F1EA]`}>
          hecho por <span className="font-bold" style={{ color: VUELO.text, letterSpacing: "-0.06em" }}>ultach</span>
        </Link>
      </div>
    </footer>
  );
}
