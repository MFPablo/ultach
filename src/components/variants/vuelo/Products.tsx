import { products } from "@/lib/content";
import { FOCUS, VUELO } from "./palette";

// Los productos como una trayectoria de despegue: en desktop cada uno arranca más alto que el
// anterior y una línea punteada los une; en mobile la trayectoria es una vertical a la izquierda.
// Alturas de arranque de cada columna (px) y la curva que pasa por esos tres puntos.
const LIFT = [288, 176, 0] as const;
const FLIGHT_PATH = "M 0 288 Q 190 262 333 176 T 667 0 T 1000 -170";

export function Chevron({ className = "" }: { className?: string }) {
  // El mismo chevron del pico del isotipo, como viñeta.
  return (
    <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true" className={className}>
      <path d="M1.5 6.5 6 1.5l4.5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Products() {
  return (
    <section id="productos" className="relative scroll-mt-16 px-4 pb-24 pt-24 sm:px-8 md:pt-32 lg:pb-36">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-bold leading-[0.98]" style={{ letterSpacing: "-0.045em" }}>
            Productos propios, ya en vuelo.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: VUELO.muted }}>
            Diseñados, programados y mantenidos acá. Si usás alguno, el soporte pasa por el mismo WhatsApp.
          </p>
        </div>

        <div className="relative mt-16 lg:mt-24">
          <svg
            className="pointer-events-none absolute left-0 top-0 hidden h-[288px] w-full overflow-visible lg:block"
            viewBox="0 0 1000 288"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={FLIGHT_PATH}
              fill="none"
              stroke={VUELO.accent}
              strokeOpacity="0.55"
              strokeWidth="1.5"
              strokeDasharray="2 9"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <ul className="relative lg:grid lg:grid-cols-3">
            {products.map((p, i) => (
              <li
                key={p.name}
                className="relative border-l pb-16 pl-8 last:pb-0 lg:border-l-0 lg:pb-0 lg:pl-0 lg:pr-10 lg:[margin-top:var(--lift)]"
                style={{ borderColor: VUELO.line, ["--lift" as string]: `${LIFT[i] ?? 0}px` }}
              >
                <span
                  className="absolute left-0 top-1 block h-3 w-3 -translate-x-1/2 rounded-full lg:top-0 lg:-translate-y-1/2"
                  style={{ background: VUELO.accent, boxShadow: `0 0 0 6px ${VUELO.night}` }}
                  aria-hidden="true"
                />
                <article className="lg:pt-10">
                  <h3 className="text-[clamp(2.5rem,5vw,3.75rem)] font-bold leading-none" style={{ letterSpacing: "-0.05em" }}>
                    {p.name}
                  </h3>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${FOCUS} mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm font-mono text-sm underline decoration-1 underline-offset-[6px] transition-colors duration-200 hover:text-[#F4F1EA]`}
                    style={{ color: VUELO.accent }}
                  >
                    {p.domain}
                    <span className="sr-only"> (abre en otra pestaña)</span>
                  </a>
                  <p className="mt-5 text-xl font-medium leading-snug">{p.tagline}</p>
                  <p className="mt-4 max-w-[34ch] leading-relaxed" style={{ color: VUELO.muted }}>
                    {p.description}
                  </p>
                  <p className="mt-6 text-[0.95rem] leading-relaxed">
                    <span style={{ color: VUELO.muted }}>Para </span>
                    {p.audience.charAt(0).toLowerCase() + p.audience.slice(1)}
                  </p>
                  <ul className="mt-6 flex flex-col gap-2.5 border-t pt-6" style={{ borderColor: VUELO.line }}>
                    {p.features.map((f) => (
                      <li key={f} className="flex items-baseline gap-3 leading-snug">
                        <Chevron className="shrink-0 translate-y-[-1px] text-[#FF7A59]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
