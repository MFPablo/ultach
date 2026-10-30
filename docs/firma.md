# Firma `<ultach-firma>`

Firma "hecho por ultach" / "un producto de ultach" para el footer de las otras apps. Vive en este repo y
la sirve `https://ultach.ar/firma.js`: cambiar texto, link, logo o estética acá y deployar la cambia en
todas las apps, sin tocarlas.

Vista previa y probador: `/firma` (página interna, no indexada).

## Cómo se usa

### 1. Cargar el script (una vez por app)

HTML / Vite (`index.html`):

```html
<script src="https://ultach.ar/firma.js" defer></script>
```

Next.js (en el layout):

```tsx
import Script from "next/script";

<Script src="https://ultach.ar/firma.js" strategy="afterInteractive" />
```

### 2. Poner la firma en el footer

Sitio de un cliente:

```html
<ultach-firma variant="design" theme="dark" app="nombre-cliente">
  <a href="https://ultach.ar">hecho por ultach</a>
</ultach-firma>
```

Producto propio (Mindora, Tendu, trac.ar):

```html
<ultach-firma variant="powered" theme="light" app="mindora">
  <a href="https://ultach.ar">un producto de ultach</a>
</ultach-firma>
```

El `<a>` de adentro es el fallback: se ve solo si el script no carga (bloqueado, caído). Dejarlo siempre.

### 3. React + TypeScript

Copiar `src/types/ultach-firma.d.ts` de este repo a la app (por ejemplo a `src/types/`). Con eso
`<ultach-firma>` tiene tipos en JSX. Se usa igual que en HTML; no hace falta wrapper.

## Atributos

| Atributo | Valores | Qué hace |
|---|---|---|
| `variant` | `design` (default), `powered` | `design`: "hecho por ultach" (sitios de clientes). `powered`: "un producto de ultach" (productos propios). |
| `theme` | `dark` (default), `light` | `dark`: emblema con noche, para fondos oscuros. `light`: emblema sin noche, para fondos claros. |
| `app` | texto | Nombre de la app. Se agrega al link como `?utm_source=<app>&utm_medium=firma`. |
| `logo` | `false` | Oculta el emblema. Por defecto se muestra. |

## Cómo se ve

- El texto ("hecho por", "un producto de") hereda color, fuente y tamaño del footer donde está.
- Emblema + wordmark "ultach" van 1.5× el tamaño del texto. El wordmark siempre en Space Grotesk 700
  (el script carga de Google Fonts solo las letras de "ultach").
- Opacidad 0.72, 1 en hover/focus. Link real, abre en pestaña nueva, alto mínimo 44px.
- Vive en Shadow DOM: los estilos de la app no la rompen y ella no toca los de la app.
- Ajuste puntual desde una app: `ultach-firma::part(link) { ... }`.

## Cómo cambiarla

| Qué | Dónde |
|---|---|
| Textos ("hecho por", "un producto de") y URL | `src/lib/content.ts` → `firma`, `SITE_URL` |
| Estilos, tamaños, atributos | `src/app/firma.js/route.ts` |
| Logo | `src/components/shared/emblem.ts` (el mismo que usa `LogoMark`) |
| Caché del script | `next.config.ts` → `headers()` |

Después: commit, push, deploy en Vercel. El navegador cachea el script 1 hora
(`max-age=3600, stale-while-revalidate=86400`), así que en a lo sumo una hora todas las apps muestran
la firma nueva.

Si se agrega un atributo nuevo, actualizar también `src/types/ultach-firma.d.ts` y volver a copiarlo
en las apps con TypeScript (solo los tipos; el comportamiento llega solo).

## Requisitos en cada app

- **CSP**: si la app tiene Content-Security-Policy, agregar `https://ultach.ar` a `script-src`,
  `https://fonts.googleapis.com` a `style-src` y `https://fonts.gstatic.com` a `font-src`.
- **Dominio**: `ultach.ar` tiene que apuntar a este proyecto en Vercel.
