import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { brand, clientWork, contact, products, services } from "@/lib/content";
import { clientAnchor, GRAPH_EDGES, GRAPH_NODES, productAnchor } from "./graph";
import { HeroCanvas } from "./HeroCanvas";

const pad = (n: number) => String(n).padStart(2, "0");

const anchors = [
  { href: "#productos", label: "Productos" },
  { href: "#clientes", label: "Clientes" },
  { href: "#servicios", label: "Servicios" },
  { href: "#contacto", label: "Contacto" },
];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F5BFF]";
const btnPrimary = `inline-flex min-h-11 items-center justify-center gap-2 bg-[#2F5BFF] px-5 text-[15px] font-medium text-white transition-colors hover:bg-[#1F45E0] ${focus}`;
const btnGhost = `inline-flex min-h-11 items-center justify-center gap-2 border border-[#121212] px-5 text-[15px] font-medium transition-colors hover:bg-[#121212] hover:text-white ${focus}`;
const label = "font-mono text-[11px] uppercase tracking-[0.08em] text-[#55554F]";
const container = "mx-auto w-full max-w-[1240px] px-4 sm:px-8";

function SectionHead({ id, index, tag, title, note }: { id: string; index: string; tag: string; title: string; note?: string }) {
  return (
    <div className="grid gap-3 border-t border-[#121212] pt-4 md:grid-cols-12">
      <p className={`${label} md:col-span-3`}>
        {index} / {tag}
      </p>
      <h2 id={id} className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1] tracking-[-0.035em] md:col-span-6">{title}</h2>
      {note && <p className="text-[15px] leading-relaxed text-[#55554F] md:col-span-3">{note}</p>}
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2h6v6M10 2 2 10" />
    </svg>
  );
}

export function NodoLanding() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#F5F4F0] text-[#121212] selection:bg-[#2F5BFF] selection:text-white">
      <a href="#contenido" className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-3 focus:py-2 ${focus}`}>
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-50 border-b border-[#D8D6CF] bg-[#F5F4F0]/95 backdrop-blur-sm">
        <nav className={`${container} flex h-16 items-center justify-between gap-4`} aria-label="Principal">
          <a href="#" className={`inline-flex min-h-11 items-center ${focus}`} aria-label="ultach, inicio">
            <Logo size={26} />
          </a>
          <ul className="hidden items-center gap-7 md:flex">
            {anchors.map((a) => (
              <li key={a.href}>
                <a href={a.href} className={`inline-flex min-h-11 items-center text-[15px] text-[#55554F] hover:text-[#121212] ${focus}`}>
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
          <WhatsAppLink className={`${btnPrimary} px-4 text-[14px]`}>
            <WhatsAppIcon size={16} />
            WhatsApp
          </WhatsAppLink>
        </nav>
      </header>

      <main id="contenido" className="flex-1">
        {/* HERO */}
        <section aria-labelledby="hero-title" className={`${container} grid gap-8 pb-16 pt-10 lg:grid-cols-12 lg:gap-6 lg:pt-16`}>
          <div className="flex flex-col gap-8 lg:col-span-5 lg:pt-6">
            <h1 id="hero-title" className="text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
              {brand.tagline}
            </h1>
            <p className="max-w-[46ch] text-[17px] leading-relaxed text-[#55554F]">{brand.intro}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <WhatsAppLink className={btnPrimary}>
                <WhatsAppIcon size={18} />
                {contact.cta}
              </WhatsAppLink>
              <a href="#productos" className={btnGhost}>
                Ver productos
              </a>
            </div>

            <div>
              <p className={`${label} mb-2`}>Nodos conectados</p>
              <ul className="border-t border-[#D8D6CF] font-mono text-[13px]">
                {products.map((p) => (
                  <li key={p.domain} className="border-b border-[#D8D6CF]">
                    <a href={`#${productAnchor(p.name)}`} className={`flex min-h-11 items-center gap-3 hover:text-[#2F5BFF] ${focus}`}>
                      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#121212]" />
                      <span className="flex-1">{p.domain}</span>
                      <span className="text-[#55554F]">producto</span>
                    </a>
                  </li>
                ))}
                {clientWork.map((c) => (
                  <li key={c.domain} className="border-b border-[#D8D6CF]">
                    <a href={`#${clientAnchor(c.name)}`} className={`flex min-h-11 items-center gap-3 hover:text-[#2F5BFF] ${focus}`}>
                      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-[#121212] bg-white" />
                      <span className="min-w-0 flex-1 truncate">{c.domain}</span>
                      <span className="text-[#55554F]">cliente</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              aria-hidden="true"
              className="relative isolate h-[420px] overflow-hidden border border-[#D8D6CF] bg-[#F5F4F0] sm:h-[520px] lg:h-[min(680px,calc(100svh-7rem))] lg:min-h-[520px]"
            >
              <HeroCanvas />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3 font-mono text-[11px] text-[#55554F]">
                <span>fig. 01 / red</span>
                <span>
                  {GRAPH_NODES.length + 1} nodos, {GRAPH_EDGES.length} enlaces
                </span>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-4 gap-y-1 p-3 font-mono text-[11px] text-[#55554F]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#121212]" /> producto
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full border border-[#121212] bg-white" /> cliente
                </span>
                <span className="ml-auto hidden pointer-fine:inline">arrastrá para rotar, tocá un nodo para ir</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCTOS */}
        <section id="productos" aria-labelledby="productos-title" className={`${container} scroll-mt-16 py-16 md:py-24`}>
          <SectionHead id="productos-title" index="01" tag="Productos" title="Productos propios" note="Apps que hago, mantengo y uso. El soporte es directo, por WhatsApp." />
          <div className="mt-10 border border-[#D8D6CF] bg-white">
            {products.map((p, i) => (
              <article
                key={p.domain}
                id={productAnchor(p.name)}
                aria-labelledby={`${productAnchor(p.name)}-name`}
                className="grid scroll-mt-20 gap-6 border-b border-[#D8D6CF] p-5 last:border-b-0 sm:p-8 md:grid-cols-12 md:gap-8"
              >
                <div className="flex flex-col gap-3 md:col-span-3">
                  <p className={label}>
                    {pad(i + 1)} / Producto
                  </p>
                  <h3 id={`${productAnchor(p.name)}-name`} className="text-[2rem] font-semibold leading-none tracking-[-0.04em]">
                    {p.name}
                  </h3>
                  <p className="font-mono text-[13px] text-[#55554F]">{p.domain}</p>
                </div>

                <div className="flex flex-col gap-4 md:col-span-5">
                  <p className="text-[20px] font-medium leading-snug tracking-[-0.01em]">{p.tagline}</p>
                  <p className="max-w-[56ch] text-[15px] leading-relaxed text-[#55554F]">{p.description}</p>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className={`${btnGhost} mt-2 self-start`}>
                    Ir a {p.domain}
                    <ExternalIcon />
                  </a>
                </div>

                <dl className="grid content-start gap-0 border-t border-[#D8D6CF] text-[14px] md:col-span-4 md:border-l md:border-t-0 md:pl-6">
                  <div className="grid grid-cols-[88px_1fr] gap-3 border-b border-[#D8D6CF] py-3 md:pt-0">
                    <dt className={label}>Público</dt>
                    <dd>{p.audience}</dd>
                  </div>
                  <div className="grid grid-cols-[88px_1fr] gap-3 py-3">
                    <dt className={label}>Funciones</dt>
                    <dd>
                      <ul className="flex flex-col gap-2">
                        {p.features.map((f) => (
                          <li key={f} className="flex gap-2.5">
                            <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-[#2F5BFF]" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {/* CLIENTES */}
        <section id="clientes" aria-labelledby="clientes-title" className={`${container} scroll-mt-16 pb-16 md:pb-24`}>
          <SectionHead id="clientes-title" index="02" tag="Clientes" title="Sitios para clientes" note="Sitios para marcas y profesionales, en producción." />
          <ul className="mt-10 border-t border-[#D8D6CF]">
            {clientWork.map((c) => (
              <li key={c.domain} id={clientAnchor(c.name)} className="scroll-mt-20 border-b border-[#D8D6CF]">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group grid gap-2 py-6 transition-colors hover:bg-white md:grid-cols-12 md:items-baseline md:gap-6 md:px-3 ${focus}`}
                >
                  <span className={`${label} md:col-span-2`}>{c.kind}</span>
                  <span className="text-[22px] font-semibold leading-tight tracking-[-0.02em] md:col-span-3">{c.name}</span>
                  <span className="text-[15px] leading-relaxed text-[#55554F] md:col-span-4">{c.description}</span>
                  <span className="inline-flex items-center gap-2 font-mono text-[13px] text-[#2F5BFF] group-hover:underline md:col-span-3 md:justify-end">
                    {c.domain}
                    <ExternalIcon />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" aria-labelledby="servicios-title" className={`${container} scroll-mt-16 pb-16 md:pb-24`}>
          <SectionHead id="servicios-title" index="03" tag="Servicios" title="Qué hacemos" />
          <ul className="mt-10 grid border-l border-t border-[#D8D6CF] md:grid-cols-3">
            {services.map((s) => (
              <li key={s.title} className="flex flex-col gap-3 border-b border-r border-[#D8D6CF] bg-white p-6 sm:p-8">
                <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#55554F]">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* CONTACTO */}
        <section id="contacto" aria-labelledby="contacto-title" className={`${container} scroll-mt-16 pb-20 md:pb-28`}>
          <div className="grid gap-3 border-t border-[#121212] pt-4 md:grid-cols-12">
            <p className={`${label} md:col-span-3`}>04 / Contacto</p>
            <div className="flex flex-col gap-4 md:col-span-9">
              <h2 id="contacto-title" className="text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                {contact.title}
              </h2>
              <p className="max-w-[52ch] text-[17px] leading-relaxed text-[#55554F]">{contact.body}</p>
            </div>
          </div>
          <WhatsAppLink
            className={`group mt-10 flex min-h-24 items-center justify-between gap-6 bg-[#2F5BFF] px-5 py-6 text-white transition-colors hover:bg-[#1F45E0] sm:px-8 ${focus}`}
          >
            <span className="flex items-center gap-4 text-[clamp(1.375rem,3.5vw,2.5rem)] font-semibold leading-tight tracking-[-0.03em]">
              <WhatsAppIcon size={32} />
              {contact.cta}
            </span>
            <span className="hidden font-mono text-[13px] sm:inline">wa.me / respuesta directa</span>
          </WhatsAppLink>
        </section>
      </main>

      <footer className="border-t border-[#D8D6CF]">
        <div className={`${container} flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between`}>
          <Logo size={22} />
          <Link href="/" className={`inline-flex min-h-11 items-center font-mono text-[13px] text-[#55554F] hover:text-[#121212] ${focus}`}>
            hecho por ultach
          </Link>
        </div>
      </footer>
    </div>
  );
}
