import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { emblemInner } from "@/components/shared/emblem";
import { SITE_URL, seo } from "@/lib/content";

// Vista previa al compartir el link (WhatsApp, redes, Slack): emblema con noche a la izquierda,
// wordmark y bajada a la derecha, sobre el fondo de Noche. Se genera en el build.

export const alt = "ultach: software y sitios web a medida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [bold, regular] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/SpaceGrotesk-700.ttf")),
  readFile(join(process.cwd(), "assets/fonts/SpaceGrotesk-400.ttf")),
]);

const emblem = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 120 120">${emblemInner({ id: "og" })}</svg>`,
).toString("base64")}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "0 96px",
          background: "radial-gradient(circle at 300px 315px, #2A1A12 0%, #0B0D10 55%)",
          color: "#ECEAE3",
          fontFamily: "Space Grotesk",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={emblem} width={360} height={360} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 168, fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1 }}>ultach</div>
          <div style={{ marginTop: 20, fontSize: 40, fontWeight: 400, color: "#B9B6AE", lineHeight: 1.2 }}>{seo.ogLine}</div>
          <div style={{ marginTop: 40, fontSize: 28, fontWeight: 400, color: "#F2A93B" }}>{SITE_URL.replace("https://", "")}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: bold, weight: 700, style: "normal" },
        { name: "Space Grotesk", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
