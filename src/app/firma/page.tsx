import type { Metadata } from "next";
import Script from "next/script";
import { Logo } from "@/components/shared/Logo";
import { SITE_URL } from "@/lib/content";

// Página interna (no linkeada): vista previa de la firma remota y snippets para pegar en cada app.
export const metadata: Metadata = {
  title: "Firma · ultach",
  description: "Vista previa de la firma <ultach-firma> y cómo usarla en otras apps.",
  robots: { index: false, follow: false },
};

const surfaces = [
  { name: "Fondo oscuro · theme=\"dark\"", theme: "dark", bg: "#0B0D10", fg: "#ECEAE3" },
  { name: "Fondo claro · theme=\"light\"", theme: "light", bg: "#F5F4F0", fg: "#121212" },
] as const;

const html = `<script src="${SITE_URL}/firma.js" defer></script>

<!-- sitios de clientes -->
<ultach-firma variant="design" theme="dark" app="cliente">
  <a href="${SITE_URL}">hecho por ultach</a>
</ultach-firma>

<!-- productos propios -->
<ultach-firma variant="powered" theme="light" app="mindora">
  <a href="${SITE_URL}">un producto de ultach</a>
</ultach-firma>`;

const react = `// index.html (Vite) o <Script src="${SITE_URL}/firma.js" /> (Next):
// <script src="${SITE_URL}/firma.js" defer></script>
// Tipos: copiar src/types/ultach-firma.d.ts de este repo.

export function Footer() {
  return (
    <footer>
      <ultach-firma variant="powered" theme="dark" app="mindora">
        <a href="${SITE_URL}">un producto de ultach</a>
      </ultach-firma>
    </footer>
  );
}`;

const attrs = [
  ["variant", "design (default): “hecho por ultach”. powered: “un producto de ultach”."],
  ["theme", "dark (default): emblema con noche. light: sin noche, para fondos claros."],
  ["app", "Nombre de la app. Se manda como utm_source para saber de dónde llega cada visita."],
  ["logo", "false oculta el emblema. Por defecto se muestra."],
  ["::part(link)", "El link de adentro, por si una app necesita ajustarlo (p. ej. min-height)."],
];

export default function FirmaPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-4 py-16 sm:px-8">
      <Script src="/firma.js" strategy="afterInteractive" />
      <header className="flex flex-col gap-4">
        <Logo size={36} />
        <h1 className="text-4xl font-bold tracking-tight">Firma para las apps</h1>
        <p className="max-w-xl text-[#9A9EA6]">
          Cada app carga <code className="font-mono">{SITE_URL}/firma.js</code>. Los cambios de texto, link o estética se hacen en este
          repo y llegan a todas con el próximo deploy (el script se cachea una hora).
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {surfaces.map((s) => (
          <div key={s.theme} className="flex flex-col gap-3 rounded-2xl p-6" style={{ background: s.bg, color: s.fg }}>
            <p className="font-mono text-xs opacity-70">{s.name}</p>
            <div className="text-sm">
              <ultach-firma variant="design" theme={s.theme} app="firma-preview">
                <a href={SITE_URL}>hecho por ultach</a>
              </ultach-firma>
            </div>
            <div className="text-sm">
              <ultach-firma variant="powered" theme={s.theme} app="firma-preview">
                <a href={SITE_URL}>un producto de ultach</a>
              </ultach-firma>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Atributos</h2>
        <dl className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          {attrs.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-mono text-sm text-[#F2A93B]">{k}</dt>
              <dd className="text-sm text-[#9A9EA6]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {[
        ["HTML", html],
        ["React", react],
      ].map(([title, code]) => (
        <section key={title} className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <pre className="overflow-x-auto rounded-xl bg-[#171B22] p-4 font-mono text-xs leading-relaxed text-[#ECEAE3]">{code}</pre>
        </section>
      ))}
    </main>
  );
}
