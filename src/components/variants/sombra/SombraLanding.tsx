import { Hero } from "./Hero";
import { Clientes, Contacto, Footer, Nav, Productos, Servicios } from "./Sections";
import { INK, STONE } from "./tokens";

export function SombraLanding() {
  return (
    <div className="flex min-h-full flex-1 flex-col overflow-x-clip" style={{ background: STONE, color: INK }}>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Productos />
        <Clientes />
        <Servicios />
        <Contacto />
      </main>
      <Footer />
    </div>
  );
}
