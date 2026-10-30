"use client";

import { useEffect, useRef } from "react";
import { catalog, projects, type Project } from "@/lib/content";
import { focusRing, gutter, sectionTitle } from "./styles";

// Catálogo de proyectos. Cada nombre va en cuerpo gigante, repetido, y corre de costado con el
// scroll (una fila para cada lado). Como pasar un marcador, pero lo mueve el scroll: detrás del
// nombre se estira una barra con el color de la marca a medida que la fila se acerca al centro de
// la pantalla (cercanía 0 → 1), y la letra se oscurece justo hasta donde llega la barra.
// Con reduced motion las filas no corren de costado; el marcador sigue (lo maneja quien scrollea).
const REPEAT = 3;
const pad = (n: number) => String(n).padStart(2, "0");

function StatusBadge({ p }: { p: Project }) {
  if (p.status !== "trabajando") return null;
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#F2A93B]/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#F2A93B]">
      <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-[#F2A93B] motion-reduce:animate-none" />
      {catalog.statuses.trabajando}
    </span>
  );
}

function Marked({ p }: { p: Project }) {
  return (
    <span className="relative inline-block px-[0.06em]">
      <span style={{ color: "transparent", WebkitTextStroke: "1.5px #4A4F58" }}>{p.name}</span>
      <span
        data-bar
        className="absolute inset-x-0 -bottom-[0.02em] top-[0.02em] origin-left -skew-x-6 rounded-[0.04em] will-change-transform"
        style={{ background: p.poster.color, transform: "scaleX(0)" }}
      />
      {/* La letra oscura va recortada al largo de la barra: oscura donde hay marcador, contorno donde no. */}
      <span data-ink className="absolute inset-0 px-[0.06em] text-[#0B0D10]" style={{ clipPath: "inset(0 100% -0.05em 0)" }}>
        {p.name}
      </span>
    </span>
  );
}

export function NocheProjects() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Medidas cacheadas: en el scroll solo se lee window.scrollY y se escriben estilos, sin
    // getBoundingClientRect (leer layout después de escribir estilos fuerza un reflow por fila).
    type Row = { top: number; h: number; track: HTMLElement | null; bars: HTMLElement[]; inks: HTMLElement[]; near: number; x: number };
    let rows: Row[] = [];
    let vh = window.innerHeight;
    let vw = window.innerWidth;
    const measure = () => {
      vh = window.innerHeight;
      vw = window.innerWidth;
      const y = window.scrollY;
      rows = ([...ol.children] as HTMLElement[]).map((li) => {
        const r = li.getBoundingClientRect();
        return {
          top: r.top + y,
          h: r.height,
          track: li.querySelector<HTMLElement>("[data-track]"),
          bars: [...li.querySelectorAll<HTMLElement>("[data-bar]")],
          inks: [...li.querySelectorAll<HTMLElement>("[data-ink]")],
          near: -1,
          x: NaN,
        };
      });
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.scrollY + vh / 2;
      rows.forEach((row, i) => {
        const d = row.top + row.h / 2 - mid;
        // Lejos de la pantalla no se toca nada.
        if (Math.abs(d) > vh * 1.5) return;
        const near = Math.round(Math.max(0, Math.min(1, 1.4 - Math.abs(d) / (vh * 0.3))) * 500) / 500;
        if (near !== row.near) {
          row.near = near;
          for (const b of row.bars) b.style.transform = `scaleX(${near})`;
          for (const ink of row.inks) ink.style.clipPath = `inset(0 ${((1 - near) * 100).toFixed(2)}% -0.05em 0)`;
        }
        if (row.track && !reduce) {
          const x = Math.round((i % 2 ? 1 : -1) * d * 0.45 - vw * 0.25);
          if (x !== row.x) {
            row.x = x;
            row.track.style.transform = `translate3d(${x}px,0,0)`;
          }
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    // Re-medir si cambia el alto de la lista (fuentes que cargan, resize) o el de la página.
    const ro = new ResizeObserver(onResize);
    ro.observe(ol);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section aria-labelledby="proyectos-title" id="proyectos" className="scroll-mt-16 overflow-hidden py-24 md:py-36">
      <div className={`${gutter} flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-16`}>
        <h2 id="proyectos-title" className={sectionTitle}>
          {catalog.title}
        </h2>
        <p className="max-w-[34ch] text-lg leading-relaxed text-[#9A9EA6] md:pb-2 md:text-right">{catalog.lead}</p>
      </div>

      <ol ref={list} className="mt-14 border-t border-[#ECEAE3]/10 md:mt-20">
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-[#ECEAE3]/10">
            <a href={p.url} target="_blank" rel="noopener noreferrer" className={`group block py-6 md:py-8 ${focusRing}`}>
              <span
                aria-hidden="true"
                data-track
                className="flex w-max items-center gap-[0.3em] whitespace-nowrap text-[clamp(4rem,13vw,12rem)] font-bold leading-[0.86] tracking-[-0.06em] will-change-transform"
              >
                {Array.from({ length: REPEAT }, (_, k) => (
                  <span key={k} className="flex items-center gap-[0.3em]">
                    <Marked p={p} />
                    <span className="size-[0.18em] min-h-3 min-w-3 rounded-full bg-[#2A2F38]" />
                  </span>
                ))}
              </span>
              <span className={`${gutter} mt-4 grid gap-2 text-base md:mt-5 md:grid-cols-12 md:items-baseline md:gap-8`}>
                <span className="font-mono text-sm text-[#9A9EA6] md:col-span-1">{pad(i + 1)}</span>
                <span className="flex flex-col gap-1 font-semibold text-[#ECEAE3] md:col-span-3">
                  {p.name}
                  <span className="block text-sm font-normal text-[#9A9EA6]">
                    {p.category} · {catalog.origins[p.origin]}
                  </span>
                </span>
                <span className="flex flex-col gap-3 md:col-span-6">
                  <StatusBadge p={p} />
                  <span className="max-w-[52ch] leading-relaxed text-[#9A9EA6]">{p.summary}</span>
                </span>
                <span className="whitespace-nowrap font-mono text-sm text-[#ECEAE3] underline decoration-[#ECEAE3]/25 underline-offset-4 group-hover:decoration-[#F2A93B] md:col-span-2 md:text-right">
                  {p.domain} <span aria-hidden="true">↗</span>
                </span>
              </span>
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
