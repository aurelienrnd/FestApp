import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Verifie la session via le backend avant de rendre les pages `/admin`
 * Redirige vers `/login` si la session est absente ou invalide.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Definit l'URL de l'API
  const apiBaseUrl =
    process.env.API_URL_SERVER ?? process.env.NEXT_PUBLIC_API_URL;

  // Recupere les cookies de la requete en cours cote serveur et le convertit en string
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Vérifie si l'URL de l'API est definie dans les variables d'environnement
  if (!apiBaseUrl) {
    throw new Error("Missing env var: API_URL_SERVER or NEXT_PUBLIC_API_URL");
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/admin/auth/me`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
  } catch {
    redirect("/login");
  }

  if (!response.ok) {
    redirect("/login");
  }

  return <>{children}</>;
}
