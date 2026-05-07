"use client";

import type { ReactNode } from "react";
import { useNavPath } from "../hooks/useNavPath";
import Navigation from "./Navigation";
import type { NavItem } from "../type";

/** Affiche une zone de contenu avec une navigation sticky sur desktop.
 * Sur mobile, affiche uniquement le contenu enfant.
 * @param {Object} props proprietes du composant
 * @param {NavItem[]} props.items liste des liens affiches dans la navigation sticky
 * @param {ReactNode} props.children contenu principal de la page
 * @children children Affiche le contenu specifique a la page courante
 */
export default function SideBarTool({
  items,
  children,
}: {
  items: NavItem[];
  children: ReactNode;
}) {
  const { pathname, isAdminPath } = useNavPath();

  return (
    <div className="flex flex-1 gap-6 pr-0 md:pr-6">
      <div className="hidden md:flex flex-col sticky top-(--header-height) self-start py-10">
        <Navigation
          items={items}
          pathname={pathname}
          isAdminPath={isAdminPath}
        />
      </div>

      {children}
    </div>
  );
}
