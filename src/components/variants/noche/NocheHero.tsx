import type { CSSProperties } from "react";
import { hero } from "@/lib/content";
import { BRAND_GRADIENT } from "@/components/shared/brand";
import { NocheHeroCanvas } from "./NocheHeroCanvas";
import { at, css } from "./hero/anim";
import { gutter } from "./styles";

// Hero de Noche. El texto es HTML y entra sincronizado con el 3D: va dentro de HeroPlay.
// La cita entra palabra por palabra; después se apaga todo menos la cola (hero.keep), que queda con
// el ámbar del logo. En desktop la cita va centrada en alto con el emblema (emblemFrame: cy 50%).
const STEP = 0.045;
const keyColor = { "--key": BRAND_GRADIENT[0] };

export function NocheHero() {
  const words = hero.quote.split(" ");
  const keepFrom = words.length - hero.keep.split(" ").length;
  const wordsEnd = hero.start + words.length * STEP + 0.6;
  const dimAt = wordsEnd + 0.4;
  const after = dimAt + 0.3;

  return (
    <section id="inicio" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <NocheHeroCanvas />
      </div>
      <div className={`${gutter} mt-auto pb-14 pt-[58svh] text-center lg:my-auto lg:py-24 lg:text-left`}>
        <blockquote className="lg:max-w-[52%]">
          <h1 className="mx-auto max-w-[24ch] text-[clamp(1.75rem,3.9vw,3.6rem)] font-medium leading-[1.04] tracking-[-0.045em] text-[#9A9EA6] text-balance lg:mx-0">
            {words.map((w, i) => {
              const key = i >= keepFrom;
              return (
                <span key={i}>
                  <span
                    className={`${css.rise} ${key ? "hb-key" : "hb-dim"} inline-block`}
                    style={{ ...at(hero.start + i * STEP, 0.8), "--at2": `${dimAt}s`, ...(key ? keyColor : {}) } as CSSProperties}
                  >
                    {w}
                  </span>{" "}
                </span>
              );
            })}
          </h1>
          <footer className={`${css.fade} mt-5 font-mono text-sm tracking-wide text-[#9A9EA6]`} style={at(after, 0.9)}>
            <cite className="not-italic text-[#ECEAE3]">{hero.cite.author}</cite> · {hero.cite.detail}
          </footer>
        </blockquote>
        <p
          className={`${css.fade} mx-auto mt-8 max-w-[40ch] text-lg leading-relaxed text-[#9A9EA6] md:mt-10 md:text-xl lg:mx-0`}
          style={at(after + 0.25, 0.9)}
        >
          {hero.intro}
        </p>
      </div>
    </section>
  );
}
