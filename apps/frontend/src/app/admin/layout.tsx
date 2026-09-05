import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminUserProvider } from "../../components/AdminUserProvider";
import type { AdminAuthMeResponse } from "../../type";
import Banner from "../../components/Banner";
import Footer from "../../components/Footer";

/** Verifie la session Better Auth via le backend avant de rendre les pages `/admin`.
 * Redirige vers `/login` si la session est absente ou si le backend est inaccessible.
 * Injecte les donnees utilisateur dans AdminUserProvider pour les rendre accessibles a toutes les pages admin.
 * @children Banner
 * @children Footer
 * @children AdminUserProvider contexte
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

  // Verifie la session admin aupres de Better Auth ({ session, user } ou null si absente).
  // Chaque cas d'echec (reseau injoignable, reponse non-ok, pas de session) converge vers `me = null`.
  let me: AdminAuthMeResponse | null;
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/get-session`, {
      method: "GET",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    // Si la reponse est ok, parse le JSON pour obtenir les donnees utilisateur, sinon retourne null
    me = response.ok ? await response.json() : null;
  } catch {
    me = null;
  }

  // Si la session est absente, redirige vers la page de connexion
  if (!me) {
    redirect("/login");
  }

  // Fournit les donnees utilisateur a toutes les pages enfants de la zone admin via le contexte
  return (
    <AdminUserProvider value={me}>
      <div data-theme="admin" id="app-root" className="app-root">
        <Banner />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    </AdminUserProvider>
  );
}
