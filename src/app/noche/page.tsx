import { redirect } from "next/navigation";

// Noche es la variante principal y vive en `/`.
export default function NocheRedirect() {
  redirect("/");
}
