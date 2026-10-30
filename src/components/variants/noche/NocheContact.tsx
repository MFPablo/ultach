"use client";

import { useState } from "react";
import { contact } from "@/lib/content";
import { LogoMark } from "@/components/shared/Logo";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { btnPrimary, focusRing, gutter } from "./styles";

// Contacto: card ámbar (el único bloque grande de acento de la página) con un mini WhatsApp oscuro.
// Elegís de qué querés hablar, el mensaje aparece en la burbuja y "Enviar" lo abre tal cual.
export function NocheContact() {
  const [active, setActive] = useState(0);
  const topic = contact.topics[active];

  return (
    <section aria-labelledby="contacto-title" id="contacto" className="scroll-mt-16 py-24 md:py-40">
      <div className={gutter}>
        <div data-nav-center className="grid gap-6 overflow-hidden rounded-[28px] bg-[#F2A93B] px-4 py-6 text-[#0B0D10] sm:gap-12 sm:rounded-[36px] sm:px-12 sm:py-14 md:py-20 lg:grid-cols-12 lg:gap-10 lg:px-16">
          <div className="flex flex-col justify-between gap-4 sm:gap-8 lg:col-span-6">
            <h2
              id="contacto-title"
              className="max-w-[14ch] text-[clamp(2.25rem,8vw,7rem)] font-bold leading-[0.92] tracking-[-0.06em] text-balance"
            >
              {contact.title}
            </h2>
            <p className="max-w-[34ch] font-medium leading-relaxed text-[#0B0D10]/80 sm:text-lg md:text-xl">{contact.body}</p>
          </div>

          <div className="flex flex-col self-center overflow-hidden rounded-[22px] bg-[#0B0D10] text-[#ECEAE3] sm:rounded-[28px] shadow-[0_30px_60px_-20px_rgba(11,13,16,0.55)] lg:col-span-6">
            <div className="flex items-center gap-3 border-b border-[#ECEAE3]/10 px-4 py-3 sm:px-5 sm:py-4">
              <LogoMark size={36} />
              <div className="flex flex-col">
                <span className="font-semibold tracking-[-0.02em]">ultach</span>
                <span className="flex items-center gap-1.5 text-xs text-[#9A9EA6] sm:text-sm">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-[#2FBF64]" />
                  {contact.note}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 px-4 py-4 sm:min-h-40 sm:px-5 sm:py-6">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9A9EA6]" id="contacto-temas">
                {contact.topicsLabel}
              </p>
              <div role="group" aria-labelledby="contacto-temas" className="flex flex-wrap gap-2">
                {contact.topics.map((t, i) => (
                  <button
                    key={t.label}
                    type="button"
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                    className={`min-h-11 rounded-full border px-3 text-sm transition-colors sm:px-4 sm:text-[15px] ${focusRing} ${
                      i === active
                        ? "border-[#F2A93B] bg-[#F2A93B] font-medium text-[#0B0D10]"
                        : "border-[#ECEAE3]/15 text-[#ECEAE3]/85 hover:border-[#ECEAE3]/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <p
                key={topic.label}
                aria-live="polite"
                className="mt-2 max-w-[88%] self-end rounded-2xl rounded-br-sm bg-[#171B22] px-3.5 py-2.5 text-sm font-medium sm:mt-4 sm:px-4 sm:py-3 sm:text-base text-[#ECEAE3] ring-1 ring-[#F2A93B]/40 motion-safe:animate-[contacto-in_.35s_ease-out]"
              >
                {topic.message}
                {/* Puntos suspensivos solo si el mensaje queda abierto para que sigas escribiendo. */}
                {!/[.!?]$/.test(topic.message) && <span aria-hidden="true">…</span>}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#ECEAE3]/10 p-2.5 sm:p-3">
              <span className="hidden flex-1 truncate px-3 text-[#9A9EA6] sm:block">{contact.composer}</span>
              <WhatsAppLink message={topic.message} className={`${btnPrimary} shrink-0`}>
                <WhatsAppIcon size={18} />
                <span>{contact.send}</span>
              </WhatsAppLink>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes contacto-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
