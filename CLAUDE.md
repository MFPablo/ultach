@AGENTS.md

# Ultach — landing de marca

Ultach es la marca paraguas de los productos y trabajos de Pablo. Esta landing:

1. Muestra un catálogo de proyectos: productos propios (Mindora, Tendu, trac.ar) y sitios hechos para clientes.
2. No usa la palabra "landing" en textos visibles: se dice "sitio" o "sitio web".
3. Centraliza el contacto y el soporte por WhatsApp.
4. Capta clientes para software y landings a medida.

Cada app lleva en el footer la firma `<ultach-firma>`, servida desde `www.ultach.ar/firma.js`: "hecho por ultach" (sitios de clientes) o "un producto de ultach" (productos propios). Textos en `content.ts` (`firma`); cambiarla acá la cambia en todas las apps. Uso y atributos: `docs/firma.md`.

## Stack

- Next.js 16 (App Router, `src/`), TypeScript y Tailwind CSS v4. Deploy en Vercel (plan gratis).
- three.js con `@react-three/fiber` y `@react-three/drei` para los heroes 3D.
- Fuentes por `next/font/google`: Space Grotesk (display/UI) y JetBrains Mono (detalles).
- Sin backend. El contacto va por un link `wa.me`. Sin CMS: el contenido vive en `src/lib/content.ts`.

## Estructura

```
src/
  app/
    page.tsx            # Variante A "Noche" = LANDING PRINCIPAL
    noche/page.tsx      # redirect a /
    variantes/page.tsx  # selector interno de variantes (no linkeado)
    firma.js/route.ts   # firma remota <ultach-firma> que cargan las otras apps (cache 1h en next.config.ts)
    firma/page.tsx      # vista previa interna de la firma + snippets (noindex, no linkeado)
    vuelo/page.tsx      # Variante B
    nodo/page.tsx       # Variante C
    sombra/page.tsx     # Variante D
  components/
    shared/             # Logo, WhatsAppLink: los comparten todas las variantes; emblem.ts dibuja el isotipo (lo usan LogoMark y firma.js)
    variants/<nombre>/  # Hero 3D + secciones propias de cada variante
    variants/noche/hero/ # hero 3D de Noche: piezas (Tiles), láminas (Slats), fondo y entrada del texto
    variants/noche/NocheProjects.tsx # catálogo de proyectos: nombres gigantes con marcador que maneja el scroll
    variants/noche/NocheServices.tsx # servicios en "pila": tarjetas sticky que se tapan al scrollear
    variants/noche/NocheContact.tsx  # contacto: card ámbar con mini WhatsApp (temas que precargan el mensaje)
  lib/content.ts        # ÚNICA fuente de textos, proyectos, clientes y WhatsApp
```

## Variantes (concepto, hero 3D y paleta)

| Ruta | Concepto | Hero three.js | Fondo / Superficie / Texto / Acento |
|---|---|---|---|
| `/noche` | Visión nocturna: "vemos lo que otros no" | "Ficha": miles de piezas 3D arman el emblema Atardecer en espiral, entra el hero, y el emblema queda como ficha de láminas que se inclina con el cursor (`components/variants/noche/hero/Ficha.tsx`) | `#0B0D10` / `#171B22` / `#ECEAE3` / `#F2A93B` |
| `/vuelo` | Bandada: los productos despegan | Miles de partículas que fluyen en un flow field (curl noise) y se posan formando el isotipo U-Búho | `#0F1A3A` / `#1A2752` / `#F4F1EA` / `#FF7A59` |
| `/nodo` | Red: Ultach como el nodo que conecta todo | Grafo 3D con Ultach en el centro y cada proyecto como un nodo en órbita, unidos por líneas; se puede rotar con drag | `#F5F4F0` / `#FFFFFF` / `#121212` / `#2F5BFF` |
| `/sombra` | Luz y sombra: oficio, precisión | Isotipo extruido en 3D sobre un plano, con una luz que gira (y sigue al cursor) y proyecta sombras reales | `#E6E3DC` / `#D2CEC4` / `#161616` / `#C8F031` |

Las 4 variantes muestran el mismo contenido. Lo que cambia es el concepto, el layout, la tipografía de las secciones y la animación.

## Marca

- Isotipo elegido: **"Atardecer"** (tablero v6 del canvas). Es un emblema circular de franjas horizontales que engrosan hacia abajo. El búho está recortado en negativo:
  - cabeza en cúpula;
  - cara de lechuza en escudo, con dos lóbulos y muesca arriba y base redonda; ojos y pico calados;
  - ala de 3 espigas paralelas a −35°.
- Degradé de marca: `#F7C062 → #E0703A → #9E2B45` (ámbar, brasa, vino), un solo degradé `userSpaceOnUse` para todo el emblema. Está en `BRAND_GRADIENT`.
- Código: `src/components/shared/Logo.tsx` (`LogoMark`, `Logo`). Los huecos se hacen con `<mask>`, así son transparentes sobre cualquier fondo. Debajo de 40px se usa automáticamente la versión sólida, sin franjas y con 2 espigas. Favicon: `src/app/icon.svg`, versión sólida. No se redibuja el logo en otro lado.
- Dos versiones, con la prop `night`:
  - `night` (default, **con noche**): el emblema circular. Es la versión principal y va en fondos oscuros, la landing, el hero, las redes, el favicon y el avatar de WhatsApp.
  - `night={false}` (**sin noche**): las franjas van dentro del búho y no hay círculo. Va en fondos claros, la firma "hecho por ultach" de las apps, documentos y merch.
  - Las franjas nunca se sacan; se invierten. Un búho solo en contorno pierde identidad.
- `src/components/shared/legacyMark.ts` guarda la geometría del isotipo v1 (U-Búho). Solo la usan los heroes 3D de Vuelo y Sombra hasta que se adapten al emblema.
- Wordmark: "ultach" en minúscula, Space Grotesk 700, `letter-spacing: -0.06em`.
- Exploración de logo y paleta: https://claude.ai/artifact/MoJ2WU6NWybsuEvxt8ptou
- Tono: español rioplatense, con voseo ("contanos", "escribinos"). Directo y sin humo. Nada de "soluciones innovadoras" ni stats inventadas.

## Reglas de código

- Todo el contenido sale de `src/lib/content.ts`. No se hardcodean textos de proyectos en los componentes.
- Componentes 3D:
  - Son `"use client"` y se cargan con `next/dynamic` y `ssr: false` desde la sección hero.
  - Mientras carga, el hero queda en negro (la entrada arma el emblema; un logo estático antes parpadea). Con reduced motion, fallback estático con el logo SVG. Sin layout shift.
  - Respetan `prefers-reduced-motion`: animación pausada o mínima.
  - Capan el DPR con `dpr={[1, 2]}` y bajan la cantidad de partículas en mobile (menos de 768px).
  - Liberan geometrías y materiales al desmontar (R3F lo hace solo si no se crean fuera del árbol).
- Mobile first: gutter de 16px, sin scroll horizontal y touch targets de 44px o más.
- Accesibilidad: `<a href>` y `<button>` reales; el canvas lleva `aria-hidden`, y el texto del hero es HTML, no 3D. Contraste mínimo 4.5:1.
- Sin libs de animación extra (no GSAP ni framer-motion) salvo que haga falta de verdad. Alcanza con CSS y R3F `useFrame`.
- Imágenes con `next/image`. Metadata (title, description, OG) en cada `page.tsx`.

## Comandos

- `npm run dev`: desarrollo.
- `npm run build`: tiene que pasar sin errores antes de dar algo por terminado.
- `npm run lint`: ESLint.

## Pendientes del dueño

- Mail real de contacto en `content.ts` (`EMAIL`): hoy es el placeholder dev.mindora@gmail.com.
- Decidir si se borran las variantes B, C y D (`/vuelo`, `/nodo`, `/sombra`).
