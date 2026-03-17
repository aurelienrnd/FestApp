"use client";

import type { ReactNode } from "react";
import { useAppUi } from "./AppUiProvider";
import Navigation from "./Navigation";
import type { NavItem } from "../config/navigation";

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
  const { pathname, isDesktop, isAdminPath } = useAppUi();

  return (
    <div className="flex flex-1 gap-(--space-md) pr-0 md:pr-(--space-md)">
      {isDesktop ? (
        <div className="sticky flex items-center">
          <Navigation
            items={items}
            pathname={pathname}
            isAdminPath={isAdminPath}
          />
        </div>
      ) : null}

      {children}
    </div>
  );
}
