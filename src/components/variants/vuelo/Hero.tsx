"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { LogoMark } from "@/components/shared/Logo";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { brand, contact } from "@/lib/content";
import { FOCUS, VUELO } from "./palette";

// El canvas se carga solo en el cliente. Mientras tanto (y si WebGL no está), queda el logo SVG
// en el "slot": la bandada lee la posición de ese mismo slot y se posa exactamente encima.
const FlockCanvas = dynamic(() => import("./FlockCanvas"), { ssr: false, loading: () => null });


export function Hero() {
  const slot = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <section id="inicio" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <FlockCanvas slot={slot} onReady={onReady} />

      <div
        className="relative flex min-h-[38svh] flex-1 items-center justify-center px-4 pb-4 pt-24 md:landscape:absolute md:landscape:inset-y-0 md:landscape:right-[3%] md:landscape:w-[48%] md:landscape:p-0"
        aria-hidden="true"
      >
        <div ref={slot} className="aspect-square w-[min(58vw,32svh)] md:landscape:w-[min(66svh,38vw)]">
          {/* Cuando el canvas pinta su primer frame, el SVG se apaga: las partículas ya ocupan su lugar. */}
          <div className="h-full w-full transition-opacity duration-700" style={{ opacity: ready ? 0 : 1 }}>
            <LogoMark size={120} className="h-full w-full" />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-end px-4 pb-14 sm:px-8 md:pb-20 md:landscape:flex-1 md:landscape:pt-28">
        <div className="max-w-[40rem] md:landscape:max-w-[min(40rem,48vw)]">
          <h1
            className="text-balance text-[clamp(2.6rem,8.4vw,6.25rem)] font-bold leading-[0.92]"
            style={{ letterSpacing: "-0.05em" }}
          >
            {brand.tagline}
          </h1>
          <p className="mt-6 max-w-[34rem] text-base leading-relaxed sm:text-xl" style={{ color: VUELO.muted }}>
            {brand.intro}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <WhatsAppLink
              className={`${FOCUS} inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-7 text-base font-semibold transition-transform duration-200 hover:-translate-y-0.5`}
              style={{ background: VUELO.accent, color: VUELO.night }}
            >
              <WhatsAppIcon size={20} />
              {contact.cta}
            </WhatsAppLink>
            <a
              href="#productos"
              className={`${FOCUS} group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 text-base font-medium`}
              style={{ boxShadow: `inset 0 0 0 1px ${VUELO.line}` }}
            >
              Ver los productos
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-y-0.5"
              >
                <path
                  d="M8 3v10M3.5 8.5 8 13l4.5-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
