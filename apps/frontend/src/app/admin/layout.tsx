import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Layout serveur des pages d'administration.
 * Verifie la session via le backend avant de rendre les pages `/admin`.
 * Redirige vers `/login` si la session est absente ou invalide.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Prefer a server-only API URL when running in Docker/SSR contexts.
  const apiBaseUrl =
    process.env.API_URL_SERVER ?? process.env.NEXT_PUBLIC_API_URL;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

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
