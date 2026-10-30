import * as THREE from "three";
import { BRAND_GRADIENT, EMBLEM } from "@/components/shared/Logo";

// Rasteriza el emblema Atardecer (misma geometría que LogoMark) a una textura para el hero 3D.
// - body:    círculo menos el búho, sin franjas, con el degradé de marca (se corta en láminas).
// - details: cara y ala, con el degradé de marca (capa que flota delante de las láminas).
// - full:    el emblema completo con franjas, en sRGB crudo (para el shader de las piezas, que
//            escribe el color final sin color management). Deja su canvas en userData.canvas.
export type EmblemKind = "body" | "details" | "full";

const GRID = 120;

function layer(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.scale(size / GRID, size / GRID);
  draw(ctx);
  return c;
}

export function emblemTexture(kind: EmblemKind, size = 1024) {
  const { cx, cy, r } = EMBLEM.CIRCLE;
  const paint = (ctx: CanvasRenderingContext2D) => {
    const g = ctx.createLinearGradient(14, 10, 104, 112);
    BRAND_GRADIENT.forEach((c, i) => g.addColorStop(i / 2, c));
    return g;
  };
  const circle = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  };

  const body = layer(size, (ctx) => {
    ctx.fillStyle = paint(ctx);
    if (kind === "full") {
      for (const [y, h] of EMBLEM.BANDS) ctx.fillRect(0, y, GRID, h);
      ctx.globalCompositeOperation = "destination-in";
      circle(ctx);
      ctx.fill();
    } else {
      circle(ctx);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "destination-out";
    ctx.fill(new Path2D(EMBLEM.NEG));
  });

  const details = layer(size, (ctx) => {
    ctx.fillStyle = paint(ctx);
    ctx.save();
    circle(ctx);
    ctx.clip();
    ctx.fill(new Path2D(EMBLEM.WING));
    ctx.restore();
    ctx.fill(new Path2D(EMBLEM.FACE));
    ctx.globalCompositeOperation = "destination-out";
    for (const e of EMBLEM.EYES) {
      ctx.beginPath();
      ctx.arc(e.cx, e.cy, EMBLEM.EYE_R, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fill(new Path2D(EMBLEM.BEAK));
  });

  const out = document.createElement("canvas");
  out.width = out.height = size;
  const ctx = out.getContext("2d")!;
  if (kind !== "details") ctx.drawImage(body, 0, 0);
  if (kind !== "body") ctx.drawImage(details, 0, 0);

  const tex = new THREE.CanvasTexture(out);
  tex.colorSpace = kind === "full" ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.userData.canvas = out;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}
