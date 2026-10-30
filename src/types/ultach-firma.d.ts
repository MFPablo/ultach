// Tipos JSX de <ultach-firma> (lo define https://www.ultach.ar/firma.js). Copiar este archivo tal cual
// en las apps con React + TypeScript que usen la firma.
import "react";

type UltachFirmaProps = React.HTMLAttributes<HTMLElement> & {
  variant?: "design" | "powered";
  theme?: "dark" | "light";
  app?: string;
  logo?: "false";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ultach-firma": UltachFirmaProps;
    }
  }
}
