"use client";

import Link from "next/link";
import type { NavItem } from "../type";


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
  // Renvoie la classe CSS du bouton selon la variante, l’état actif et le contexte admin/public
  const itemClass = (isActive: boolean) => {
    if (variant === "modal") {
      return isActive
        ? "bg-(--color-1) w-70 p-3"
        : "bg-black text-white hover:bg-(--color-1) hover:text-black w-40 p-3 hover:w-70";
    }

    if (isActive) return "bg-(--color-1) w-80 p-2";

    return isAdminPath
      ? "bg-black text-white hover:bg-(--color-1) hover:text-white w-60 p-3 hover:w-80"
      : "bg-white text-black hover:bg-(--color-1) hover:text-black w-60 p-3 hover:w-80";
  };

  return (
    <nav className="text-lg md:text-2xl lg:text-4xl">
      <ul className="flex flex-col gap-6">
        {items.map((item, index) => {
          const isActive = pathname === item.path || Boolean(item.active);
          const slideStyle = variant === "sidebar"
            ? { animationDelay: `${index * 0.15}s` }
            : undefined;
          const slideClass = variant === "sidebar" ? "hero-slide-left" : "";

          if (item.labelBtn) {
            return (
              <li
                key={`${item.labelBtn}-${index}`}
                className={`${itemClass(isActive)} ${slideClass}`}
                style={slideStyle}
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
                className={`${itemClass(isActive)} ${slideClass}`}
                style={slideStyle}
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
