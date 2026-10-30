import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

// Selector temporal de variantes. Cuando se elija una, su página pasa a ser `/`.
const variants = [
  { href: "/", name: "A · Noche", concept: "Piezas 3D que arman el emblema y quedan como ficha.", bg: "#0B0D10", fg: "#ECEAE3", accent: "#F2A93B" },
  { href: "/vuelo", name: "B · Vuelo", concept: "Una bandada que se posa formando el logo.", bg: "#0F1A3A", fg: "#F4F1EA", accent: "#FF7A59" },
  { href: "/nodo", name: "C · Nodo", concept: "Red 3D: cada proyecto, un nodo en órbita.", bg: "#F5F4F0", fg: "#121212", accent: "#2F5BFF" },
  { href: "/sombra", name: "D · Sombra", concept: "Búho en relieve, luz que gira, sombras reales.", bg: "#E6E3DC", fg: "#161616", accent: "#C8F031" },
];

export default function VariantesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-16 sm:px-8">
      <header className="flex flex-col gap-4">
        <Logo size={36} />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Cuatro variantes de la landing</h1>
        <p className="max-w-xl text-[#9A9EA6]">Elegí una. Las cuatro tienen el mismo contenido; cambian el concepto, la paleta y la animación del hero.</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {variants.map((v) => (
          <li key={v.href}>
            <Link
              href={v.href}
              className="flex min-h-56 flex-col justify-between rounded-2xl p-6 transition-transform hover:-translate-y-1"
              style={{ background: v.bg, color: v.fg, outline: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Logo size={28} color={v.fg} />
              <span className="flex flex-col gap-2">
                <span className="text-3xl font-bold tracking-tight">{v.name}</span>
                <span className="opacity-80">{v.concept}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
