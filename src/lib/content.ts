// Única fuente de contenido de la landing. Las 4 variantes leen de acá.

// +54 11 2700 2700. Formato wa.me: internacional sin + ni espacios, con el 9 de celular de Argentina.
export const WHATSAPP_NUMBER = "5491127002700";

// TODO(pablo): placeholder hasta tener un mail de ultach.
export const EMAIL = "dev.mindora@gmail.com";

export function whatsappUrl(message = "Hola Ultach! Quería consultar por") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const brand = {
  name: "ultach",
  tagline: "Software que se usa todos los días.",
  intro:
    "Hago productos digitales propios y sitios web para marcas y profesionales. Un solo lugar para soporte, consultas y nuevos proyectos.",
};

// Hero de la home: una cita que entra palabra por palabra; después se apaga todo menos `keep`.
export const hero = {
  quote: "“La perfección se alcanza no cuando no hay nada más que agregar, sino cuando no queda nada que quitar.”",
  keep: "nada que quitar.”",
  cite: { author: "Antoine de Saint-Exupéry", detail: "Tierra de hombres, 1939" },
  intro: "Trabajamos así: puliendo cada detalle hasta que no sobre nada.",
  /** Cuándo empieza a entrar la cita (s desde el primer frame del canvas). */
  start: 1,
};

/** Color de marca del proyecto (el marcador del catálogo). */
export type Poster = { color: string };

/** "trabajando": todavía no está en producción. Va al final del catálogo con su etiqueta. */
export type Status = "andando" | "trabajando";

export type Product = {
  name: string;
  status?: Status;
  url: string;
  domain: string;
  category: string;
  poster: Poster;
  tagline: string;
  description: string;
  audience: string;
  features: string[];
};

export const products: Product[] = [
  {
    name: "Mindora",
    url: "https://mindora.com.ar",
    domain: "mindora.com.ar",
    category: "Gestión de consultorio",
    poster: { color: "#E07A4F" },
    tagline: "Tu práctica profesional, simple de llevar.",
    description:
      "Gestión de consultorio para profesionales de salud mental: turnos, historias, notas cifradas, validación de pagos y corrección automática de tests.",
    audience: "Psicólogos y profesionales de evaluación",
    features: ["Turnos online y lista de espera", "Notas cifradas", "29 baterías de tests con corrección automática", "Informes en PDF"],
  },
  {
    name: "Tendu",
    status: "trabajando",
    url: "https://tendu.com.ar",
    domain: "tendu.com.ar",
    category: "Tienda de cursos",
    poster: { color: "#E5584A" },
    tagline: "Para profesionales que venden conocimiento.",
    description:
      "Tu tienda con tu marca para vender cursos, libros, clases y productos digitales, con cobro por MercadoPago directo a tu cuenta.",
    audience: "Coaches, educadores y profesionales",
    features: ["Cursos con módulos y progreso", "Clases con cupo y cobro automático", "Productos físicos y digitales", "MercadoPago sin intermediarios"],
  },
  {
    name: "trac.ar",
    url: "https://trac.ar",
    domain: "trac.ar",
    category: "Buscador de autos",
    poster: { color: "#1DB37F" },
    tagline: "Buscá. Compará. Decidí con datos.",
    description:
      "Buscador independiente de autos usados que junta avisos de varias plataformas y muestra el precio típico de cada modelo.",
    audience: "Quien compra un auto o moto usada en Argentina",
    features: ["Avisos de múltiples fuentes", "Precio típico por modelo", "Actualización diaria", "Sin registro"],
  },
];

export type ClientWork = {
  name: string;
  url: string;
  domain: string;
  kind: string;
  poster: Poster;
  description: string;
};

export const clientWork: ClientWork[] = [
  {
    name: "Magallanes Estudio",
    url: "https://magallanesestudio.com.ar",
    domain: "magallanesestudio.com.ar",
    kind: "Portfolio",
    poster: { color: "#F2C61F" },
    description: "Portfolio de Pedro Magallanes, diseñador gráfico y artista digital.",
  },
  {
    name: "Ikcelam",
    url: "https://www.ikcelam.com.ar",
    domain: "ikcelam.com.ar",
    kind: "Sitio de empresa",
    poster: { color: "#2FBF64" },
    description: "Más de 30 años en construcción, decoración y materiales para obra residencial, comercial e industrial.",
  },
  {
    name: "Lic. Giuliana Covello",
    url: "https://www.giulianacovello.com.ar",
    domain: "giulianacovello.com.ar",
    kind: "Sitio profesional",
    poster: { color: "#7F9CC0" },
    description: "Evaluación neuropsicológica infantil en CABA: diagnóstico ADOS-2 y ADI-R, neurodesarrollo y TEA.",
  },
];

/** Catálogo: productos propios y trabajos para clientes en una sola lista. */
export type Origin = "propio" | "cliente";

export type Project = {
  slug: string;
  name: string;
  url: string;
  domain: string;
  origin: Origin;
  category: string;
  /** Frase corta: tagline del producto o descripción del trabajo. */
  summary: string;
  description?: string;
  audience?: string;
  details: string[];
  poster: Poster;
  status: Status;
};

const slug = (name: string) =>
  name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const projects: Project[] = [
  ...products.map<Project>((p) => ({
    slug: slug(p.name),
    name: p.name,
    url: p.url,
    domain: p.domain,
    origin: "propio",
    category: p.category,
    summary: p.tagline,
    description: p.description,
    audience: p.audience,
    details: p.features,
    poster: p.poster,
    status: p.status ?? "andando",
  })),
  ...clientWork.map<Project>((c) => ({
    slug: slug(c.name),
    name: c.name,
    url: c.url,
    domain: c.domain,
    origin: "cliente",
    category: c.kind,
    summary: c.description,
    details: [],
    poster: c.poster,
    status: "andando" as const,
  })),
  // Lo que todavía no está en producción, al final.
].sort((a, b) => Number(a.status === "trabajando") - Number(b.status === "trabajando"));

export const catalog = {
  title: "Proyectos",
  lead: "Mejor que contarlo: entrá y usalo.",
  statuses: { andando: "En línea", trabajando: "Trabajando ahora" } satisfies Record<Status, string>,
  origins: { propio: "Producto propio", cliente: "Para un cliente" } satisfies Record<Origin, string>,
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  /** Lo que incluye, en frases cortas. */
  points: string[];
  /** Mensaje precargado del WhatsApp de este servicio. */
  message: string;
};

export const services: Service[] = [
  {
    slug: "software",
    title: "Software a medida",
    description: "Sistemas de gestión, paneles y herramientas internas, desde la idea hasta producción.",
    points: ["Sistemas de gestión", "Paneles y reportes", "Herramientas internas", "De la idea a producción"],
    message: "Hola Ultach! Quería consultar por un software a medida.",
  },
  {
    slug: "sitios",
    title: "Sitios web",
    description: "Para tu marca, tu empresa o tu consultorio. Rápidos, fáciles de encontrar en Google y listos en días, no en meses.",
    points: ["Diseño propio, sin plantillas", "Rápidos en el celular", "Fáciles de encontrar en Google", "Listos en días"],
    message: "Hola Ultach! Quería consultar por un sitio web.",
  },
  {
    slug: "soporte",
    title: "Soporte de productos",
    description: "¿Usás Mindora o trac.ar? Escribinos por WhatsApp y te respondemos nosotros.",
    points: ["Mindora, Tendu y trac.ar", "Por WhatsApp", "Te responde quien lo hizo"],
    message: "Hola Ultach! Necesito ayuda con",
  },
];

export const servicesSection = {
  title: "Qué hacemos",
  lead: "Las mismas manos que hicieron Mindora y trac.ar, en tu proyecto.",
};

export const contact = {
  title: "¿Tenés una idea o una duda?",
  body: "Soporte, consultas o un proyecto nuevo: todo pasa por el mismo WhatsApp.",
  cta: "Escribinos por WhatsApp",
  note: "Te respondemos nosotros, no un bot.",
  topicsLabel: "¿De qué querés hablar?",
  composer: "Seguís escribiendo en WhatsApp",
  send: "Enviar",
  /** Temas para arrancar la charla: cada uno precarga su mensaje de WhatsApp. */
  topics: [
    { label: "Una idea", message: "Hola Ultach! Tengo una idea y quería contarles:" },
    { label: "Un sitio web", message: "Hola Ultach! Quería consultar por un sitio web." },
    { label: "Software a medida", message: "Hola Ultach! Quería consultar por un software a medida." },
    { label: "Soporte", message: "Hola Ultach! Necesito ayuda con" },
  ],
};

// Borradores del hero para comparar (rutas /hero/c, /hero/d y /hero/f). Cuando se elija uno, pasa a `brand`.
export type HeroDraft = {
  label: string;
  /** Líneas del H1. `accent` la pinta con el color de acento. */
  lines: { text: string; accent?: boolean }[];
  size: "quote" | "big" | "huge";
  /** Cuándo empieza a entrar el H1 (s desde el primer frame del canvas). Default: HERO_TIMING.words. */
  start?: number;
  /** Cola de la frase que queda encendida; el resto se apaga después de entrar. */
  keep?: string;
  cite?: { author: string; detail: string };
  /** Líneas de terminal que se tipean antes del H1. */
  terminal?: { text: string; ok?: boolean }[];
  intro: string;
  primary: "whatsapp" | "productos";
};

export const heroDrafts: Record<string, HeroDraft> = {
  c: {
    label: "Nada que quitar",
    lines: [{ text: "“La perfección se alcanza no cuando no hay nada más que agregar, sino cuando no queda nada que quitar.”" }],
    size: "quote",
    start: 1,
    keep: "nada que quitar.”",
    cite: { author: "Antoine de Saint-Exupéry", detail: "Tierra de hombres, 1939" },
    intro: "Trabajamos así: puliendo cada detalle hasta que no sobre nada.",
    primary: "whatsapp",
  },
  d: {
    label: "Mostrame el código",
    lines: [{ text: "Hablar es fácil." }, { text: "Mostrame el código.", accent: true }],
    size: "big",
    start: 1,
    cite: { author: "Linus Torvalds", detail: "creador de Linux, 2000" },
    intro: "Mindora y trac.ar ya están andando. Mirá lo hecho y después hablamos de lo tuyo.",
    primary: "productos",
  },
  f: {
    label: "Funciona",
    terminal: [{ text: "$ npm run build" }, { text: "✓ Compiled successfully", ok: true }, { text: "✓ Deploy en producción", ok: true }],
    lines: [{ text: "Funciona." }],
    size: "huge",
    intro: "Mindora y trac.ar corren todos los días. Lo tuyo puede ser lo próximo.",
    primary: "whatsapp",
  },
};
