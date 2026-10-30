"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { LogoMark } from "@/components/shared/Logo";
import { WhatsAppIcon, WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { brand, contact } from "@/lib/content";
import { INK, LIME } from "./tokens";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

// Si WebGL falla, nos quedamos con el fallback estático.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Fallback: el isotipo SVG con su sombra larga dibujada en CSS. Ocupa el mismo lugar que el 3D.
function StaticOwl({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 md:justify-end md:pr-[12%] ${hidden ? "opacity-0" : "opacity-100"}`}
    >
      <div className="relative">
        <div className="absolute inset-0 origin-bottom [transform:translate(-30%,8%)_skewX(55deg)_scaleY(0.45)]">
          <LogoMark size={260} colors={["#161616", "#161616", "#161616"]} className="opacity-[0.14] blur-[3px]" />
        </div>
        <LogoMark size={260} className="relative drop-shadow-[6px_10px_14px_rgba(22,22,22,0.25)]" />
      </div>
    </div>
  );
}

export function Hero() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const mobile = useMedia("(max-width: 767px)", true);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="inicio" className="relative isolate overflow-hidden">
      <div
        ref={stage}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[64svh] [mask-image:linear-gradient(to_bottom,#000_78%,transparent)] md:inset-0 md:h-full"
      >
        <StaticOwl hidden={ready} />
        <SceneBoundary>
          <div className="absolute inset-0">
            <HeroScene reduced={reduced} mobile={mobile} active={active} onReady={onReady} />
          </div>
        </SceneBoundary>
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-4 pb-14 pt-[60svh] sm:px-8 md:pb-20 md:pt-40">
        <h1
          className="max-w-[11ch] text-[clamp(3rem,10.5vw,9.5rem)] font-bold leading-[0.9] tracking-[-0.055em]"
          style={{ color: INK }}
        >
          {brand.tagline}
        </h1>
        <div className="mt-8 flex max-w-xl flex-col gap-8 md:mt-10">
          <p className="text-lg leading-relaxed text-[#45423B] md:text-xl">{brand.intro}</p>
          <div className="flex flex-wrap items-center gap-3">
            <WhatsAppLink
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full px-6 text-base font-semibold text-[#161616] shadow-[6px_8px_0_-1px_#161616] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[9px_12px_0_-1px_#161616] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#161616] active:translate-y-0 active:shadow-[3px_4px_0_-1px_#161616]"
              style={{ background: LIME }}
            >
              <WhatsAppIcon size={20} />
              {contact.cta}
            </WhatsAppLink>
            <a
              href="#productos"
              className="inline-flex min-h-12 items-center rounded-full px-6 text-base font-semibold text-[#161616] underline-offset-4 ring-1 ring-[#161616]/70 transition-colors hover:bg-[#161616] hover:text-[#E6E3DC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#161616]"
            >
              Ver productos
            </a>
          </div>
          <p className="hidden text-sm text-[#45423B] [@media(hover:hover)]:block">
            Mové el cursor: la luz la manejás vos.
          </p>
        </div>
      </div>
    </section>
  );
}
