"use client";

import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import SideBarTool from "../../../components/SideBarTool";
import { filterNewsItems } from "../../../config/ui";
import AddButton from "../../../components/AddButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import NewsContent from "../../../components/NewsContent";
import { useRoleGuard } from "../../../hooks/useRoleGuard";

/** Page admin de gestion des articles.
 * Affiche les filtres et la liste des articles.
 * Gere le filtre actif (tri) et le transmet a NewsContent.
 * Ouvre une modale permettant d'ajouter un article.
 * @children SideBarTool Affiche une navigation sticky sur desktop.
 * @children AddButton Affiche la navigation des filtres sur mobile.
 * @children NewsContent Affiche la liste des articles filtree.
 */
export default function Page() {
  useRoleGuard();

  const { isOpen, open, close } = useModal();
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
        <button
          type="button"
          className="mb-(--ctx-title-mb)"
          aria-label="Ajouter un article"
          onClick={() => open()}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <SideBarTool items={items}>
        <NewsContent
          isAddModalOpen={isOpen}
          onCloseAddModal={close}
          activeFilter={activeFilter}
        />
      </SideBarTool>
    </section>
  );
}
