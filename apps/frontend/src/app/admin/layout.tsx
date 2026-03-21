import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminUserProvider,
  type AdminAuthMeResponse,
} from "../../components/AdminUserProvider";

/** Verifie la session via le backend avant de rendre les pages `/admin`.
 * Redirige vers `/login` si la session est absente, invalide ou si le backend est inaccessible.
 * Injecte les donnees utilisateur dans AdminUserProvider pour les rendre accessibles a toutes les pages admin.
 * @children {ReactNode} children Pages enfants de la zone admin
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

  // Verifie si l'URL de l'API est definie dans les variables d'environnement
  if (!apiBaseUrl) {
    throw new Error("Missing env var: API_URL_SERVER or NEXT_PUBLIC_API_URL");
  }

  // Verifie la session admin et redirige vers /login si la requete echoue ou renvoie une reponse non valide.
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

  // Parse les donnees utilisateur retournees par l'API
  const me = (await response.json()) as AdminAuthMeResponse;

  // Fournit les donnees utilisateur a toutes les pages enfants de la zone admin via le contexte
  return <AdminUserProvider value={me}>{children}</AdminUserProvider>;
}
