"use client";
// Import
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { apiRequest, type ApiMessageResponse } from "../functions/apiRequest";
import { getApiErrorMessage } from "../functions/getApiErrorMessage";

/** Affiche un bouton de billetterie
 * Contient un lien externe vers un site de recherche de billetterie
 * Le lien s'ouvre dans un nouvel onglet grace a target="_blank"
 * Utilise rel="noopener noreferrer" pour des raisons de securite
 */
function BtnTicket() {
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

/** Affiche le menu de navigation pour l'affichage desktop
 * Compare chaque lien avec l'URL pour determiner lequel est actif et y appliquer un style
 * Affiche le bouton de billetterie uniquement si l'on n'est pas sur une page admin
 * @param {Object} props
 * @param {NavItem[]} props.items
 * @param {string | null} [props.pathname]
 * @param {boolean} props.isAdminPath
 * @children BtnTicket Affiche un bouton de billetterie
 */
function DesktopNav({
  items,
  pathname,
  isAdminPath,
  onLogout,
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
  onLogout: () => void;
}) {
  return (
    <nav>
      <ul className="nav-list">
        {items.map((item) => {
          const isActive = pathname === item.path;
          const isLogoutItem = isAdminPath && item.label === "Logout";

          if (isLogoutItem) {
            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={onLogout}
                  className={
                    isActive
                      ? "border-b border-(--color-1)"
                      : "border-b border-transparent transition-colors hover:border-(--color-1)"
                  }
                >
                  {item.label}
                </button>
              </li>
            );
          }

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={
                  isActive
                    ? "border-b border-(--color-1)"
                    : "border-b border-transparent transition-colors hover:border-(--color-1)"
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        {isAdminPath ? null : <BtnTicket />}
      </ul>
    </nav>
  );
}

/** Affiche le menu de navigation pour l'affichage mobile
 * Ouvre/ferme un menu via une modale (react-modal) grace a un state `isOpen`
 * Compare chaque lien avec l'URL pour determiner lequel est actif et lui appliquer un style
 * Affiche le bouton de billetterie (BtnTicket) uniquement si l'on n'est pas sur une page admin
 * @param {Object} props proprietes du composant
 * @param {NavItem[]} props.items liste des liens de navigation
 * @param {string | null} [props.pathname] URL courante pour determiner le lien actif
 * @param {boolean} props.isAdminPath indique si la page actuelle est une page admin
 * @children BtnTicket Affiche un bouton de billetterie
 */
export function MobilNav({
  items,
  pathname,
  isAdminPath,
  onLogout,
}: {
  items: NavItem[];
  pathname?: string | null;
  isAdminPath: boolean;
  onLogout: () => void;
}) {
  // Verifie si la modale est ouverte
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  return (
    <nav>
      <ul className="flex items-center gap-6 tracking-wide">
        <li className="mobil-menu">
          <button type="button" onClick={() => setIsOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </li>
        {isAdminPath ? null : <BtnTicket />}
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
              const isLogoutItem = isAdminPath && item.label === "Logout";

              if (isLogoutItem) {
                return (
                  <li key={item.path} className="bg-black text-white w-30 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onLogout();
                      }}
                      className="block w-full text-right"
                    >
                      {item.label}
                    </button>
                  </li>
                );
              }

              return (
                <li
                  key={item.path}
                  className={
                    isActive
                      ? "bg-(--color-1) w-50 p-2"
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
 * Detecte si l'URL correspond a une page admin pour choisir les bons items de navigation
 * Determine si l'affichage est en mode desktop ou mobile via matchMedia (min-width: 768px)
 * Ecoute les changements de taille d'ecran pour mettre a jour l'etat `isDesktop`
 * Affiche DesktopNav sur ecran large, sinon MobilNav
 * @children DesktopNav Affiche le menu de navigation pour l'affichage desktop
 * @children MobilNav Affiche le menu de navigation pour l'affichage mobile
 */
export default function Banner() {
  const router = useRouter();
  // Fournit l'etat UI puis choisit automatiquement la navigation admin ou visiteur.
  const { pathname, isAdminPath, isDesktop } = useAppUi();
  const items = isAdminPath ? navAdminItems : navVisitorItems;

  const handleLogout = async () => {
    const result = await apiRequest<ApiMessageResponse>("/admin/auth/logout", {
      method: "POST",
    });

    if (result.error) {
      console.error(getApiErrorMessage(result.error));
      return;
    }

    router.push("/login");
  };

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
          onLogout={handleLogout}
        />
      ) : (
        <MobilNav
          items={items}
          pathname={pathname}
          isAdminPath={isAdminPath}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
}
