import Link from "next/link";
import type { NavItem } from "../config/navigation";

/** Affiche une navigation verticale (sidebar ou mobile).
 * Compare chaque lien avec l'URL courante pour appliquer le style actif.
 * Gere le cas particulier Logout en declenchant la fermeture du menu mobile (si necessaire) puis la deconnexion.
 * @param {Object} props proprietes du composant
 * @param {NavItem[]} props.items liste des liens de navigation
 * @param {string | null} [props.pathname] URL courante pour determiner le lien actif
 * @param {boolean} props.isAdminPath indique si la page actuelle est une page admin
 * @param {() => void} [props.onLogout] fonction appelee lors du clic sur Logout
 * @param {() => void} [props.onNavigate] fonction appelee lors d'un changement de page (utile en mobile)
 * @param {"sidebar" | "mobile"} [props.variant] variante visuelle de la navigation
 */
export default function Navigation({
  items,
  pathname,
  isAdminPath,
  onLogout,
  onNavigate,
  variant = "sidebar",
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
  onLogout?: () => void;
  onNavigate?: () => void;
  variant?: "sidebar" | "mobile";
}) {
  // Definit l'espacement de la liste selon la variante d'affichage (mobile ou sidebar).
  const listClass =
    variant === "mobile" ? "flex flex-col gap-4" : "flex flex-col gap-6";

  // Retourne la classe CSS d'un item selon son etat actif et la variante de navigation.
  const itemClass = (isActive: boolean) =>
    variant === "mobile"
      ? isActive
        ? "bg-(--color-1) w-70 p-3"
        : "bg-black text-white w-40 p-3"
      : isActive
        ? "bg-(--color-1) w-80 p-2"
        : "bg-black text-white w-60 p-2 hover:bg-(--color-1) hover:w-80";

  return (
    <nav>
      <ul className={listClass}>
        {items.map((item) => {
          const isActive = pathname === item.path;
          const isLogoutItem = isAdminPath && item.label === "Logout";

          if (isLogoutItem) {
            return (
              <li key={item.path} className={itemClass(false)}>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.();
                    onLogout?.();
                  }}
                  className="block w-full text-right"
                >
                  {item.label}
                </button>
              </li>
            );
          }

          return (
            <li key={item.path} className={itemClass(isActive)}>
              <Link
                href={item.path}
                className="block w-full text-right"
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
