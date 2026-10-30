import { emblemInner } from "@/components/shared/emblem";
import { SITE_URL, firma } from "@/lib/content";

// Firma "hecho por ultach" para el footer de las otras apps. Define el web component <ultach-firma>:
//   <script src="https://www.ultach.ar/firma.js" defer></script>
//   <ultach-firma variant="powered" theme="dark" app="mindora"><a href="https://www.ultach.ar">ultach</a></ultach-firma>
// Atributos: variant (design | powered), theme (dark: con noche | light: sin noche), app (utm_source del link),
// logo (false para ocultar el emblema; por defecto se muestra). El <a> de adentro es el fallback si el script no carga.
// Se prerenderiza en el build; el Cache-Control corto está en next.config.ts.

// A tamaño de texto el emblema va siempre sólido. Los ids viven dentro del shadow root de cada instancia.
const mark = (night: boolean) =>
  `<svg viewBox="0 0 120 120" aria-hidden="true">${emblemInner({ id: "uf", flat: true, night })}</svg>`;

const config = { url: SITE_URL, text: firma, mark: { dark: mark(true), light: mark(false) } };

const script = `(() => {
  if (typeof window === "undefined" || !window.customElements || customElements.get("ultach-firma")) return;
  const C = ${JSON.stringify(config)};

  // Space Grotesk solo para el wordmark: con text= Google sirve únicamente esas letras.
  if (!document.querySelector("link[data-ultach-firma]")) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&text=ultach&display=swap";
    l.dataset.ultachFirma = "";
    document.head.appendChild(l);
  }

  const CSS = \`
    :host { display: inline-block; color: inherit; font: inherit; line-height: 1; }
    a { display: inline-flex; align-items: center; gap: .4em; min-height: 44px; color: inherit;
        text-decoration: none; opacity: .72; transition: opacity .2s; }
    a:hover, a:focus-visible { opacity: 1; }
    a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; border-radius: 4px; }
    .b { display: inline-flex; align-items: center; gap: .22em; font-size: 1.5em; }
    svg { width: 1.1em; height: 1.1em; flex: none; }
    .w { font-family: "Space Grotesk", ui-sans-serif, system-ui, sans-serif; font-weight: 700; letter-spacing: -.06em; }
    @media (prefers-reduced-motion: reduce) { a { transition: none; } }
  \`;

  class UltachFirma extends HTMLElement {
    static observedAttributes = ["variant", "theme", "app", "logo"];
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.shadowRoot) this.render(); }
    render() {
      const root = this.shadowRoot || this.attachShadow({ mode: "open" });
      const variant = this.getAttribute("variant") === "powered" ? "powered" : "design";
      const theme = this.getAttribute("theme") === "light" ? "light" : "dark";
      const logo = this.getAttribute("logo") !== "false";
      const app = this.getAttribute("app");
      const href = C.url + "/" + (app ? "?utm_source=" + encodeURIComponent(app) + "&utm_medium=firma" : "");
      root.innerHTML =
        "<style>" + CSS + "</style>" +
        '<a part="link" href="' + href + '" target="_blank" rel="noopener">' +
        "<span>" + C.text[variant] + "</span>" + '<span class="b">' + (logo ? C.mark[theme] : "") + '<span class="w">ultach</span></span></a>';
    }
  }
  customElements.define("ultach-firma", UltachFirma);
})();
`;

export function GET() {
  return new Response(script, { headers: { "Content-Type": "text/javascript; charset=utf-8" } });
}
