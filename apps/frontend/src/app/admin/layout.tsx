import AdminGuard from "../../components/AdminGuard";

/** Layout des pages d’administration de l’application.
 * S’applique automatiquement à toutes les routes du segment `/admin` (et ses sous-routes).
 * Encapsule les pages enfants avec `AdminGuard` pour vérifier la session admin.
 * Affiche le contenu uniquement si l’accès est autorisé.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Composants enfants (pages admin) rendus dans le layout.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminGuard>{children}</AdminGuard>;
}
