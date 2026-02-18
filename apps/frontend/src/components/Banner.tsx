"use client";
// Import
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  navVisitorItems,
  navAdminItems,
  type NavItem,
} from "../config/navigation";
import logo from "../../public/header_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useAppUi } from "./AppUiProvider";
import ModalCloseButton from "./ModalCloseButton";

/** Affiche un bouton de billetterie
 * Contient un lien externe vers un site de recherche de billetterie
 * Le lien s’ouvre dans un nouvel onglet grâce à target="_blank"
 * Utilise rel="noopener noreferrer" pour des raisons de sécurité
 */
function BtnTiket() {
  return (
    <li>
      <a
        href="https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8"
        className="btn-cta"
        target="_blank"
        rel="noopener noreferrer"
      >
        Billetterie
      </a>
    </li>
  );
}

/** Affiche le menu de navigation pour l’affichage desktop
 * Compare chaque lien avec l’URL pour déterminer lequel est actif et y appliquer un style
 * Affiche le bouton de billetterie uniquement si l’on n’est pas sur une page admin
 * @param {Object} props
 * @param {NavItem[]} props.items
 * @param {string | null} [props.pathname]
 * @param {boolean} props.isAdminPath
 * @children BtnTiket Affiche un bouton de billetterie
 */
function DesktopNav({
  items,
  pathname,
  isAdminPath,
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
}) {
  return (
    <nav>
      <ul className="flex items-center gap-6 tracking-wides">
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={
                  isActive
                    ? "border-b border-(--collor-1)"
                    : "border-b border-transparent transition-colors hover:border-(--collor-1)"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        {isAdminPath ? null : <BtnTiket />}
      </ul>
    </nav>
  );
}

/** Affiche le menu de navigation pour l’affichage mobile
 * Ouvre/ferme un menu via une modale (react-modal) grâce à un state `isOpen`
 * Compare chaque lien avec l’URL pour déterminer lequel est actif et lui appliquer un style
 * Affiche le bouton de billetterie (BtnTiket) uniquement si l’on n’est pas sur une page admin
 * @param {Object} props - Propriétés du composant
 * @param {NavItem[]} props.items - Liste des liens de navigation
 * @param {string | null} [props.pathname] - URL courante pour déterminer le lien actif
 * @param {boolean} props.isAdminPath - Indique si la page actuelle est une page admin
 * @children BtnTiket : Affiche un bouton de billetterie
 */
export function MobilNav({
  items,
  pathname,
  isAdminPath,
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
}) {
  // verifie ci la modal est ouverte
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  return (
    <nav>
      <ul className="flex items-center gap-6 tracking-wides">
        <li className="mobil-menu">
          <button type="button" onClick={() => setIsOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </li>
        {isAdminPath ? null : <BtnTiket />}
      </ul>
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Menu"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <ModalCloseButton onClose={() => setIsOpen(false)} />
        <nav>
          <ul className="flex flex-col gap-6">
            {items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li
                  key={item.path}
                  className={
                    isActive
                      ? "bg-(--collor-1) w-50 p-2"
                      : "bg-black text-white w-30 p-2"
                  }
                >
                  <Link href={item.path} className="block w-full text-right">
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Modal>
    </nav>
  );
}

/** Affiche le header avec un logo et la navigation
 * Détecte si l’URL correspond à une page admin pour choisir les bons items de navigation
 * Détermine si l’affichage est en mode desktop ou mobile via matchMedia (min-width: 768px)
 * Écoute les changements de taille d’écran pour mettre à jour l’état `isDesktop`
 * Affiche DesktopNav sur écran large, sinon MobilNav
 * @children DesktopNav :  Affiche le menu de navigation pour l’affichage desktop
 * @children MobilNav :  Affiche le menu de navigation pour l’affichage mobile
 */
export default function Banner() {
  // Fournit l’état UI puis choisit automatiquement la navigation admin ou visiteur.
  const { pathname, isAdminPath, isDesktop } = useAppUi();
  const items = isAdminPath ? navAdminItems : navVisitorItems;

  return (
    <header className="mx-auto flex w-full items-center justify-between px-4 py-2">
      <Image
        src={logo}
        alt="Logo Hellfest"
        width={90}
        height={90}
        priority
        style={{ width: "auto", height: "auto" }}
      />
      {isDesktop ? (
        <DesktopNav
          items={items}
          pathname={pathname}
          isAdminPath={isAdminPath}
        />
      ) : (
        <MobilNav items={items} pathname={pathname} isAdminPath={isAdminPath} />
      )}
    </header>
  );
}
