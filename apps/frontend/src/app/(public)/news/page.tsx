"use client";

import { useState } from "react";
import SideBarTool from "../../../components/SideBarTool";
import { filterNewsItems } from "../../../config/ui";
import AddButton from "../../../components/AddButton";
import NewsContent from "../../../components/NewsContent";

/** Page publique des news du festival.
 * Gere le filtre actif (tri) et le transmet a NewsContent.
 * @children AddButton Affiche la navigation des filtres sur mobile.
 * @children SideBarTool Affiche une navigation sticky sur desktop.
 * @children NewsContent Affiche la liste des news filtree.
 */
export default function Page() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const items = filterNewsItems.map((item) => ({
    ...item,
    active:
      item.labelBtn === activeFilter ||
      (item.labelBtn === "Toutes les news" && activeFilter === null),
    onClick: () =>
      setActiveFilter(item.labelBtn === "Toutes les news" ? null : (item.labelBtn ?? null)),
  }));

  return (
    <section className="section-page">
      <div className="filter-row">
        <AddButton items={items} />
        <h1 className="title1">News</h1>
      </div>
      <SideBarTool items={items}>
        <NewsContent activeFilter={activeFilter} />
      </SideBarTool>
    </section>
  );
}
