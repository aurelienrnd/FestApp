"use client";

import SideBarTool from "../../../components/SideBarTool";
import { navDashBordItems } from "../../../config/navigation";
import DashboardContent from "./DashboardContent";

/** Affiche le tableau de bord administrateur.
 * Utilise un template reutilisable avec navigation sticky sur desktop.
 * Injecte le contenu propre au dashboard via les children.
 * @children SideBarTool Affiche la structure commune (navigation + zone de contenu)
 * @children DashboardContent Affiche le contenu metier du dashboard
 */
export default function Page() {
  return (
    <section className="section-page flex flex-col flex-1 text-xl md:text-4xl">
      <h1 className="title1">ADMINISTRATION MODE</h1>

      <SideBarTool items={navDashBordItems}>
        <DashboardContent />
      </SideBarTool>
    </section>
  );
}
