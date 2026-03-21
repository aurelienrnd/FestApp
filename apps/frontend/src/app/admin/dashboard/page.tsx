"use client";

import SideBarTool from "../../../components/SideBarTool";
import { useAdminUser } from "../../../components/AdminUserProvider";
import { navDashBordItems, filterNavByRole } from "../../../config/navigation";
import DashboardContent from "./DashboardContent";

/** Affiche le tableau de bord administrateur.
 * Utilise un template reutilisable avec navigation sticky sur desktop.
 * Injecte le contenu propre au dashboard via les children.
 * @children SideBarTool Affiche la structure commune (navigation + zone de contenu)
 * @children DashboardContent Affiche le contenu metier du dashboard
 */
export default function Page() {
  const adminUser = useAdminUser();
  const filteredItems = filterNavByRole(navDashBordItems, adminUser?.user.role ?? "");

  return (
    <section className="section-page ">
      <h1 className="title1">ADMINISTRATION MODE</h1>

      <SideBarTool items={filteredItems}>
        <DashboardContent />
      </SideBarTool>
    </section>
  );
}
