"use client";

import { useEffect, useState } from "react";
import { focusRing } from "./styles";

// Adónde lleva cada link. "top": el título (h2) queda justo debajo del nav; "center": la card de la
// sección ([data-nav-center]) queda centrada en lo que se ve debajo del nav. Las secciones tienen
// mucho padding arriba, así que ir al borde de la sección deja el contenido demasiado abajo.
const links = [
  { href: "#proyectos", label: "Proyectos", align: "top" },
  { href: "#servicios", label: "Servicios", align: "top" },
  { href: "#contacto", label: "Contacto", align: "center" },
] as const;

const GAP = 40;

function scrollToSection(href: string, align: "top" | "center") {
  const section = document.querySelector<HTMLElement>(href);
  if (!section) return false;
  const target = section.querySelector<HTMLElement>(align === "center" ? "[data-nav-center]" : "h2") ?? section;
  const nav = document.querySelector("header")?.getBoundingClientRect().height ?? 64;
  const r = target.getBoundingClientRect();
  const room = window.innerHeight - nav;
  // Si la card no entra centrada, se alinea arriba como un título.
  const offset = align === "center" && r.height < room - GAP * 2 ? nav + (room - r.height) / 2 : nav + GAP;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: window.scrollY + r.top - offset, behavior: reduce ? "auto" : "smooth" });
  history.replaceState(null, "", href);
  // Como el link nativo: el foco pasa a la sección (para teclado y lectores de pantalla).
  if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
  section.focus({ preventScroll: true });
  return true;
}

// Links del nav. Subrayado ámbar que crece desde el centro de la palabra hacia los costados: al pasar
// el cursor o con foco, y fijo en el link de la sección que se está viendo. Una sección cuenta como
// "la que se ve" cuando cruza la línea al 40% del alto de pantalla; al llegar al final, Contacto.
export function NocheNavLinks() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => el !== null);
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const hit = atBottom
        ? sections[sections.length - 1]
        : sections.find((el) => {
            const r = el.getBoundingClientRect();
            return r.top <= line && r.bottom > line;
          });
      setActive(hit ? `#${hit.id}` : null);
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
    <ul className="hidden items-center gap-1 md:flex">
      {links.map((l) => {
        const on = l.href === active;
        return (
          <li key={l.href}>
            <a
              href={l.href}
              onClick={(e) => {
                if (scrollToSection(l.href, l.align)) e.preventDefault();
              }}
              aria-current={on ? "location" : undefined}
              className={`group relative inline-flex min-h-11 items-center rounded-full px-4 text-[15px] transition-colors hover:text-[#ECEAE3] ${focusRing} ${
                on ? "text-[#ECEAE3]" : "text-[#9A9EA6]"
              }`}
            >
              {l.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-4 bottom-2 h-0.5 origin-center rounded-full bg-[#F2A93B] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none ${
                  on ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// Globo de chat con los tres puntos de "escribiendo…": al pasar el cursor (o con foco) saltan en
// cadena, como cuando alguien te está respondiendo. Keyframes en globals.css (nav-typing).
function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 overflow-visible">
      <path
        d="M12 3.5c-4.97 0-9 3.36-9 7.5 0 2.2 1.14 4.18 2.95 5.55L5.2 20.2a.5.5 0 0 0 .68.6l4.13-1.9c.64.13 1.3.2 1.99.2 4.97 0 9-3.36 9-7.5s-4.03-7.6-9-7.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {[8, 12, 16].map((cx, k) => (
        <circle
          key={cx}
          cx={cx}
          cy="11"
          r="1.35"
          fill="currentColor"
          className="nav-dot"
          style={{ animationDelay: `${k * 0.12}s` }}
        />
      ))}
    </svg>
  );
}

// Botón del nav: lleva a la card de contacto (centrada), donde se elige el tema y se abre WhatsApp.
export function NocheNavCta() {
  return (
    <a
      href="#contacto"
      onClick={(e) => {
        if (scrollToSection("#contacto", "center")) e.preventDefault();
      }}
      className={`group inline-flex min-h-11 items-center gap-2 rounded-full bg-[#F2A93B] px-5 text-[15px] font-semibold text-[#0B0D10] transition-colors hover:bg-[#F7BD62] ${focusRing}`}
    >
      <ChatIcon />
      Hablanos
    </a>
  );
}
