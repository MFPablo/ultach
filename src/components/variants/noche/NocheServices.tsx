"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { services, servicesSection, type Service } from "@/lib/content";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { btnPrimary, gutter, sectionTitle } from "./styles";

// Servicios en "pila": una tarjeta grande por servicio, con sticky. Al scrollear, la siguiente sube y tapa a la
// anterior, que se achica y se apaga un poco (como apilar fichas). Sin JS o con reduced motion, la
// pila funciona igual: solo no hay achique.
const COLORS = ["#F7C062", "#E0703A", "#9E2B45"];
const pad = (n: number) => String(n).padStart(2, "0");

function ServiceCta({ s }: { s: Service }) {
  return (
    <WhatsAppLink message={s.message} className={`${btnPrimary} w-fit`}>
      <WhatsAppIcon size={18} />
      <span>{s.slug === "soporte" ? "Pedir ayuda" : "Consultar"}</span>
    </WhatsAppLink>
  );
}

export function NocheServices() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const ol = list.current;
    if (!ol || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...ol.children] as HTMLElement[];
    const cards = items.map((li) => li.firstElementChild as HTMLElement);

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        const next = items[i + 1];
        if (!next) return;
        // Cuánto subió la siguiente tarjeta sobre esta: 0 recién asoma, 1 ya la tapó.
        const p = Math.max(0, Math.min(1, 1 - (next.getBoundingClientRect().top - card.getBoundingClientRect().top) / (vh * 0.8)));
        card.style.transform = `scale(${1 - p * 0.08})`;
        card.style.filter = `brightness(${1 - p * 0.45})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section aria-labelledby="servicios-title" id="servicios" className="scroll-mt-16 py-24 md:py-36">
      <div className={`${gutter} flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-16`}>
        <h2 id="servicios-title" className={sectionTitle}>
          {servicesSection.title}
        </h2>
        <p className="max-w-[34ch] text-lg leading-relaxed text-[#9A9EA6] md:pb-2 md:text-right">{servicesSection.lead}</p>
      </div>
      <ol ref={list} className={`${gutter} mt-14 flex flex-col gap-6 md:mt-20`}>
        {services.map((s, i) => (
          <li
            key={s.slug}
            className="sticky top-[calc(4.5rem+var(--i)*0.75rem)] md:top-[calc(5rem+var(--i)*1.25rem)]"
            style={{ "--i": i } as CSSProperties}
          >
            <article className="relative flex origin-top flex-col justify-between gap-6 overflow-hidden rounded-[28px] border border-[#ECEAE3]/[0.08] bg-[#171B22] p-6 will-change-transform sm:gap-12 sm:rounded-[36px] sm:p-10 md:min-h-[70svh] md:p-14">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-[0.08em] -top-[0.18em] select-none font-bold leading-none tracking-[-0.08em] text-[clamp(7rem,20vw,16rem)]"
                style={{ color: "transparent", WebkitTextStroke: `2px ${COLORS[i % COLORS.length]}`, opacity: 0.35 }}
              >
                {pad(i + 1)}
              </span>
              <div className="relative flex items-center gap-3 font-mono text-sm uppercase tracking-[0.14em] text-[#9A9EA6]">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {pad(i + 1)} / {pad(services.length)}
              </div>
              <div className="relative grid gap-6 sm:gap-8 md:grid-cols-12 md:items-end md:gap-10">
                <div className="flex flex-col gap-4 sm:gap-6 md:col-span-7">
                  <h3 className="max-w-[12ch] text-[clamp(2.5rem,8vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.06em]">{s.title}</h3>
                  <p className="max-w-[40ch] leading-relaxed text-[#9A9EA6] sm:text-lg md:text-xl">{s.description}</p>
                </div>
                <div className="flex flex-col gap-5 sm:gap-6 md:col-span-5">
                  {/* Mobile: los puntos en una línea corrida, así la card entra en pantalla. */}
                  <p className="text-sm leading-relaxed text-[#ECEAE3]/80 md:hidden">{s.points.join(" · ")}</p>
                  <ul className="hidden md:flex md:flex-col md:border-t md:border-[#ECEAE3]/10">
                    {s.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-center gap-3 border-b border-[#ECEAE3]/10 py-3 text-[#ECEAE3]/90"
                      >
                        <span aria-hidden="true" className="font-mono text-xs" style={{ color: COLORS[i % COLORS.length] }}>
                          ✦
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <ServiceCta s={s} />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
