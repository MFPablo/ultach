import type { CSSProperties } from "react";
import type { HeroDraft } from "@/lib/content";
import { contact } from "@/lib/content";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { NocheHeroCanvas } from "./NocheHeroCanvas";
import { at, css, HERO_TIMING as T } from "./hero/anim";
import { btnPrimary, btnSecondary, gutter } from "./styles";

// Borrador del hero para comparar frases sobre el 3D real. Mismo layout que NocheHero.
const sizes = {
  quote: "max-w-[24ch] text-[clamp(1.75rem,3.9vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.045em] text-[#9A9EA6]",
  big: "max-w-[13ch] text-[clamp(2.6rem,6.6vw,6.25rem)] font-bold leading-[0.92] tracking-[-0.06em]",
  huge: "text-[clamp(3.6rem,12vw,11rem)] font-bold leading-[0.85] tracking-[-0.07em]",
};

export function NocheHeroDraft({ draft }: { draft: HeroDraft }) {
  const term = draft.terminal ?? [];
  // El H1 arranca después de la terminal, si la hay.
  const start = draft.start ?? (term.length ? T.words + term.length * 0.5 + 0.2 : T.words);
  const step = draft.size === "quote" ? 0.045 : T.wordStep;

  const keepCount = draft.keep ? draft.keep.split(" ").length : 0;
  const lines = draft.lines.map((l) => l.text.split(" "));
  const total = lines.flat().length;
  const wordsEnd = start + total * step + 0.6;
  const dimAt = wordsEnd + 0.4;
  const after = draft.keep ? dimAt + 0.3 : wordsEnd - 0.2;

  let n = 0;
  const whatsapp = (i: number) => (
    <WhatsAppLink key="w" className={`${i === 0 ? btnPrimary : btnSecondary} ${css.rise}`} style={at(after + 0.5 + i * 0.15, 0.8)}>
      {i === 0 && <WhatsAppIcon />}
      <span>{contact.cta}</span>
    </WhatsAppLink>
  );
  const productos = (i: number) => (
    <a key="p" href="#proyectos" className={`${i === 0 ? btnPrimary : btnSecondary} ${css.rise}`} style={at(after + 0.5 + i * 0.15, 0.8)}>
      Ver productos
    </a>
  );
  const ctas = draft.primary === "whatsapp" ? [whatsapp(0), productos(1)] : [productos(0), whatsapp(1)];

  return (
    <section id="inicio" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <NocheHeroCanvas />
      </div>
      <div className={`${gutter} mt-auto pb-14 pt-[58svh] md:pb-20 md:pt-[46svh]`}>
        {term.length > 0 && (
          <div aria-hidden="true" className="mb-6 grid font-mono text-[clamp(0.8rem,1.2vw,1rem)] leading-[1.8] text-[#9A9EA6]">
            {term.map((t, i) => (
              <span key={i} className={`${css.fade} hb-type justify-self-start ${t.ok ? "text-[#8FD18B]" : ""}`} style={at(T.words + i * 0.5, 0.5)}>
                {t.text}
              </span>
            ))}
          </div>
        )}
        <h1 className={`${sizes[draft.size]} text-balance`}>
          {lines.map((words, li) => (
            <span key={li} className={`block ${draft.lines[li].accent ? "text-[#F2A93B]" : ""}`}>
              {words.map((w, i) => {
                const idx = n++;
                const role = !draft.keep ? "" : idx >= total - keepCount ? "hb-key" : "hb-dim";
                return (
                  <span key={i}>
                    <span className={`${css.rise} ${role} inline-block`} style={{ ...at(start + idx * step, 0.8), "--at2": `${dimAt}s` } as CSSProperties}>
                      {w}
                    </span>{" "}
                  </span>
                );
              })}
              {draft.size === "huge" && li === lines.length - 1 && (
                <span aria-hidden="true" className={`${css.fade} inline-block`} style={at(wordsEnd, 0.4)}>
                  <span className="hb-caret ml-1 inline-block h-[0.72em] w-[0.36em] bg-[#F2A93B] align-[-0.02em]" />
                </span>
              )}
            </span>
          ))}
        </h1>
        {draft.cite && (
          <p className={`${css.fade} mt-5 font-mono text-sm tracking-wide text-[#9A9EA6]`} style={at(after, 0.9)}>
            <span className="text-[#ECEAE3]">{draft.cite.author}</span> · {draft.cite.detail}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between md:gap-12">
          <p className={`${css.fade} max-w-[40ch] text-lg leading-relaxed text-[#9A9EA6] md:text-xl`} style={at(after + 0.25, 0.9)}>
            {draft.intro}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">{ctas}</div>
        </div>
      </div>
    </section>
  );
}
