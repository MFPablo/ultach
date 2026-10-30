import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { clientWork, contact, products, services } from "@/lib/content";
import { LIME, longShadow } from "./tokens";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#161616]";

// Sombra "de papel bajo sol bajo": siempre hacia abajo a la derecha, como en el hero.
const paperShadow = "shadow-[2px_3px_4px_-1px_rgba(22,22,22,0.22),18px_26px_44px_-18px_rgba(22,22,22,0.38)]";
const paperShadowHover = "hover:shadow-[3px_4px_6px_-1px_rgba(22,22,22,0.22),28px_40px_60px_-20px_rgba(22,22,22,0.42)]";

const nameShadow = longShadow(22, "#C7C2B6");

export const navLinks = [
  { href: "#productos", label: "Productos" },
  { href: "#clientes", label: "Clientes" },
  { href: "#servicios", label: "Servicios" },
  { href: "#contacto", label: "Contacto" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-[#E6E3DC]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-6 px-4 sm:px-8">
        <a href="#inicio" className={`flex min-h-14 items-center rounded-md ${focus}`} aria-label="ultach, inicio">
          <Logo size={28} color="#161616" />
        </a>
        <nav aria-label="Secciones" className="order-3 -mx-3 flex w-full justify-between sm:order-none sm:mx-0 sm:w-auto sm:justify-start sm:gap-2">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`flex min-h-11 items-center rounded-full px-3 text-[15px] font-medium text-[#161616] transition-colors hover:bg-[#D2CEC4] ${focus}`}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <WhatsAppLink
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-[#161616] ${focus}`}
          style={{ background: LIME }}
        >
          <WhatsAppIcon size={18} />
          WhatsApp
        </WhatsAppLink>
      </div>
    </header>
  );
}

function SectionTitle({ id, children, lead }: { id: string; children: React.ReactNode; lead?: string }) {
  return (
    <div className="mb-14 grid gap-4 md:mb-20 md:grid-cols-12">
      <h2 id={id} className="text-[clamp(2.25rem,6vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.045em] md:col-span-7">
        {children}
      </h2>
      {lead ? <p className="max-w-md self-end text-lg leading-relaxed text-[#45423B] md:col-span-5 md:justify-self-end">{lead}</p> : null}
    </div>
  );
}

export function Productos() {
  return (
    <section id="productos" aria-labelledby="productos-title" className="mx-auto max-w-[1400px] scroll-mt-24 px-4 py-24 sm:px-8 md:py-36">
      <SectionTitle id="productos-title" lead="Tres productos propios, en uso todos los días. Los diseño, los programo y les doy soporte yo.">
        Productos
      </SectionTitle>

      <div className="flex flex-col gap-28 md:gap-40">
        {products.map((p, i) => {
          const flip = i % 2 === 1;
          return (
            <article key={p.name} aria-labelledby={`p-${i}`} className="grid gap-10 md:grid-cols-12 md:gap-8">
              <h3
                id={`p-${i}`}
                className={`text-[clamp(3.75rem,15vw,12rem)] font-bold leading-[0.85] tracking-[-0.06em] text-[#161616] md:col-span-12 ${flip ? "md:text-right" : ""}`}
                style={{ textShadow: nameShadow }}
              >
                {p.name}
              </h3>

              <p
                className={`text-2xl font-medium leading-snug tracking-[-0.02em] md:col-span-4 md:text-3xl ${flip ? "md:col-start-9 md:row-start-2" : "md:col-start-1"}`}
              >
                {p.tagline}
              </p>

              <div
                className={`rounded-[4px] bg-[#D2CEC4] p-6 sm:p-9 md:col-span-7 ${flip ? "md:col-start-1 md:row-start-2" : "md:col-start-6"} ${paperShadow}`}
              >
                <p className="text-lg leading-relaxed">{p.description}</p>
                <dl className="mt-8 grid gap-8 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-semibold text-[#45423B]">Para quién</dt>
                    <dd className="mt-2 text-base leading-relaxed">{p.audience}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-[#45423B]">Qué trae</dt>
                    <dd className="mt-2">
                      <ul className="flex flex-col gap-2 text-base leading-snug">
                        {p.features.map((f) => (
                          <li key={f} className="flex gap-3">
                            <span aria-hidden="true" className="mt-[0.55em] h-[3px] w-3 shrink-0 bg-[#161616]" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-10 inline-flex min-h-11 items-center rounded-full bg-[#161616] px-5 font-mono text-sm text-[#E6E3DC] transition-transform hover:-translate-y-0.5 ${focus}`}
                >
                  Visitar {p.domain}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Clientes() {
  return (
    <section id="clientes" aria-labelledby="clientes-title" className="scroll-mt-24 bg-[#D2CEC4]">
      <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-8 md:py-36">
        <SectionTitle id="clientes-title" lead="Sitios para marcas y profesionales. Rápidos, prolijos y fáciles de mantener.">
          Sitios para clientes
        </SectionTitle>
        <ul className="flex flex-col gap-4">
          {clientWork.map((c) => (
            <li key={c.name}>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group grid gap-3 rounded-[4px] bg-[#E6E3DC] p-6 transition-[transform,box-shadow] duration-300 hover:-translate-x-1 hover:-translate-y-1 sm:p-8 md:grid-cols-12 md:items-baseline md:gap-8 ${paperShadow} ${paperShadowHover} ${focus}`}
              >
                <span className="text-3xl font-bold tracking-[-0.04em] md:col-span-5 md:text-5xl">{c.name}</span>
                <span className="flex flex-col gap-1 md:col-span-4">
                  <span className="text-sm font-semibold text-[#45423B]">{c.kind}</span>
                  <span className="text-base leading-relaxed">{c.description}</span>
                </span>
                <span className="font-mono text-sm underline decoration-1 underline-offset-4 md:col-span-3 md:justify-self-end">
                  {c.domain}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Servicios() {
  return (
    <section id="servicios" aria-labelledby="servicios-title" className="mx-auto max-w-[1400px] scroll-mt-24 px-4 py-24 sm:px-8 md:py-36">
      <SectionTitle id="servicios-title">Qué hacemos</SectionTitle>
      <ul className="grid gap-14 md:grid-cols-3 md:gap-10">
        {services.map((s) => (
          <li key={s.title} className="flex flex-col gap-4">
            <span aria-hidden="true" className="relative block h-16 w-16">
              <span className="absolute inset-0 translate-x-3 translate-y-3 rounded-full bg-[#161616] opacity-15 blur-[3px]" />
              <span className="absolute inset-0 rounded-full bg-[#F1EEE7] shadow-[inset_-6px_-8px_12px_rgba(22,22,22,0.12)]" />
            </span>
            <h3 className="text-2xl font-bold tracking-[-0.03em] md:text-3xl">{s.title}</h3>
            <p className="max-w-sm text-lg leading-relaxed text-[#45423B]">{s.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Contacto() {
  return (
    <section id="contacto" aria-labelledby="contacto-title" className="mx-auto max-w-[1400px] scroll-mt-24 px-4 pb-24 sm:px-8 md:pb-36">
      <div
        className="rounded-[6px] p-8 text-[#161616] shadow-[3px_4px_6px_-1px_rgba(22,22,22,0.25),40px_56px_80px_-28px_rgba(22,22,22,0.45)] sm:p-12 md:p-20"
        style={{ background: LIME }}
      >
        <h2 id="contacto-title" className="max-w-[14ch] text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.92] tracking-[-0.05em]">
          {contact.title}
        </h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed md:text-xl">{contact.body}</p>
        <WhatsAppLink
          className={`mt-10 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#161616] px-7 text-lg font-semibold text-[#E6E3DC] transition-transform hover:-translate-y-0.5 md:min-h-16 md:px-9 md:text-xl ${focus}`}
        >
          <WhatsAppIcon size={22} />
          {contact.cta}
        </WhatsAppLink>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#161616] text-[#E6E3DC]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 py-14 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <Logo size={34} color="#E6E3DC" />
          <p className="max-w-xs text-[#B9B5AC]">Productos propios, sitios web y software a medida. Soporte por WhatsApp.</p>
        </div>
        <nav aria-label="Pie" className="-mx-3 flex flex-wrap">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="flex min-h-11 items-center rounded-full px-3 hover:text-white focus-visible:outline-2 focus-visible:outline-[#C8F031]">
              {l.label}
            </a>
          ))}
        </nav>
        <Link href="/" className="inline-flex min-h-11 items-center self-start text-sm text-[#B9B5AC] hover:text-white focus-visible:outline-2 focus-visible:outline-[#C8F031] md:self-end">
          hecho por <span className="font-bold tracking-[-0.06em] text-[#E6E3DC]">&nbsp;ultach</span>
        </Link>
      </div>
    </footer>
  );
}
