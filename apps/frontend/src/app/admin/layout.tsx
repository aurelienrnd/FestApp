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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!apiBaseUrl) {
    throw new Error("Missing env var: NEXT_PUBLIC_API_URL");
  }

  const response = await fetch(`${apiBaseUrl}/admin/auth/me`, {
    method: "GET",
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/login");
  }

  return <>{children}</>;
}
