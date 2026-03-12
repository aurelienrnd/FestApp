"use client";

import Link from "next/link";
import type { NavItem } from "../config/navigation";

const navigationStyle = {
  modal: {
    list: "flex flex-col gap-(--gap-content-small)",
    btnActive: "bg-(--color-1) w-70 p-(--spacing-around-small)",
    btnInactive:
      "bg-black text-white w-40 p-(--spacing-around-small) hover:bg-(--color-1) hover:w-70 hover:text-black",
  },
  sidebar: {
    list: "flex flex-col gap-(--gap-content-small)",
    btnActive: "bg-(--color-1) w-80 p-2",
    btnInactiveAdmin:
      "bg-black text-white w-60 p-(--spacing-around-small) hover:bg-(--color-1) hover:w-80 hover:text-white",
    btnInactivePublic:
      "bg-white text-black w-60 p-(--spacing-around-small) hover:bg-(--color-1) hover:w-80 hover:text-black",
  },
} as const;

/** Affiche une navigation verticale (sidebar ou modal).
 * Compare chaque lien avec l'URL courante pour appliquer le style actif.
 * Gere le cas particulier Logout en declenchant la fermeture du menu mobile (si necessaire) puis la deconnexion.
 * @param {Object} props proprietes du composant
 * @param {NavItem[]} props.items liste des liens de navigation
 * @param {string | null} [props.pathname] URL courante pour determiner le lien actif
 * @param {boolean} props.isAdminPath indique si la page actuelle est une page admin
 * @param {() => void} [props.onLogout] fonction appelee lors du clic sur Logout
 * @param {() => void} [props.setmodal] fonction appelee lors d'un changement de page (utile en mobile)
 * @param {"sidebar" | "modal"} [props.variant] variante visuelle de la navigation
 */
export default function Navigation({
  items,
  pathname,
  isAdminPath,
  onLogout,
  setmodal,
  variant = "sidebar",
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
  onLogout?: () => void;
  setmodal?: () => void;
  variant?: "sidebar" | "modal";
}) {
  // Récupère la classe CSS de la liste pour la variante de navigation choisie
  const listClass = navigationStyle[variant].list;

  // Renvoie la classe CSS du bouton selon la variante, l’état actif et le contexte admin/public
  const itemClass = (isActive: boolean) => {
    // Pour la variante "modal", renvoie la classe active ou inactive selon l’état
    if (variant === "modal") {
      return isActive
        ? navigationStyle.modal.btnActive
        : navigationStyle.modal.btnInactive;
    }

    // Si l’item est actif, renvoie la classe active de la sidebar
    if (isActive) {
      return navigationStyle.sidebar.btnActive;
    }

    // Sinon, renvoie la classe inactive selon le contexte admin ou public
    return isAdminPath
      ? navigationStyle.sidebar.btnInactiveAdmin
      : navigationStyle.sidebar.btnInactivePublic;
  };

  return (
    <nav className="side-bar">
      <ul className={listClass}>
        {items.map((item, index) => {
          const isActive = pathname === item.path || Boolean(item.active);

          if (item.labelBtn) {
            return (
              <li
                key={`${item.labelBtn}-${index}`}
                className={itemClass(isActive)}
              >
                <button
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    setmodal?.();
                    onLogout?.();
                  }}
                  className="block w-full text-right"
                >
                  {item.labelBtn}
                </button>
              </li>
            );
          }

          if (item.path) {
            return (
              <li
                key={`${item.label}-${index}`}
                className={itemClass(isActive)}
              >
                <Link
                  href={item.path}
                  className="block w-full text-right"
                  onClick={setmodal}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          return null;
        })}
      </ul>
    </nav>
  );
}
