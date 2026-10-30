import { Hero } from "./Hero";
import { Nav } from "./Nav";
import { Products } from "./Products";
import { Clients, Contact, Footer, Services } from "./Sections";
import { VUELO } from "./palette";

export function VueloLanding() {
  return (
    <div className="flex min-h-full flex-1 flex-col overflow-x-clip" style={{ background: VUELO.night, color: VUELO.text }}>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-full px-4 py-3 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        style={{ background: VUELO.accent, color: VUELO.night }}
      >
        Saltar al contenido
      </a>
      <Nav />
      <main id="contenido" className="flex-1">
        <Hero />
        <Products />
        <Clients />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
