"use client";
// Import
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "react-modal";
import {
  navVisitorItems,
  navAdminItem,
  filterNavByRole,
  type NavItem,
} from "../config/navigation";
import { useAdminUser } from "./AdminUserProvider";
import logo from "../../public/header_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useNavPath } from "../hooks/useNavPath";
import { useIsDesktop } from "../hooks/useIsDesktop";
import ModalCloseButton from "./ModalCloseButton";
import Navigation from "./Navigation";
import { apiRequest, type ApiMessageResponse } from "../functions/apiRequest";

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
 * @param {Object} props proprietes du composant
 * @param {NavItem[]} props.items liste des liens de navigation
 * @param {string | null} [props.pathname] URL courante pour determiner le lien actif
 * @param {boolean} props.isAdminPath indique si la page actuelle est une page admin
 * @param {() => void} props.onLogout Fonction Logout
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
        {items.map((item, index) => {
          const isActive = pathname === item.path;
          const isLogoutItem = isAdminPath && Boolean(item.labelBtn);

          // Instruction pour rendre le bouton Logout dans la navigation
          if (isLogoutItem) {
            return (
              <li key={`logout-${index}`}>
                <button
                  type="button"
                  onClick={onLogout}
                  className={
                    isActive
                      ? "border-b border-(--color-1)"
                      : "border-b border-transparent transition-colors hover:border-(--color-1)"
                  }
                >
                  {item.labelBtn}
                </button>
              </li>
            );
          }

          // Evite de rendre un <Link> sans href
          if (!item.path) {
            return null;
          }

          // Instruction pour rendre le bouton de billetterie dans la navigation
          return (
            <li key={`${item.path}-${index}`}>
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
        {/* Affiche le bouton de billetterie uniquement sur les pages publiques */}
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
 * @param {() => void} props.onLogout Fonction Logout
 * @children BtnTicket Affiche un bouton de billetterie
 * @children Navigation Affiche une navigation verticale
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
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  return (
    <nav>
      <ul className="nav-list">
        <li className="border border-(--color-text-input) inline-flex rounded bg-(--color-2) px-2 py-1 text-(--color-text) transition-(--anim-btn-transition) duration-(--anim-btn-duration) hover:scale-(--anim-btn-scale)">
          <button type="button" onClick={() => setIsMenuModalOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </li>
        {isAdminPath ? null : <BtnTicket />}
      </ul>
      <Modal
        isOpen={isMenuModalOpen}
        onRequestClose={() => setIsMenuModalOpen(false)}
        contentLabel="Menu"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <ModalCloseButton onClose={() => setIsMenuModalOpen(false)} />
        <Navigation
          items={items}
          pathname={pathname}
          isAdminPath={isAdminPath}
          onLogout={onLogout}
          variant="modal"
          setmodal={() => setIsMenuModalOpen(false)}
        />
      </Modal>
    </nav>
  );
}

/** Affiche le header avec un logo et la navigation
 * Detecte si l'URL correspond a une page admin pour choisir les bons items de navigation
 * Determine si l'affichage est en mode desktop ou mobile via matchMedia (min-width: 768px)
 * Ecoute les changements de taille d'ecran pour mettre a jour l'etat `isDesktop`
 * Affiche DesktopNav sur ecran large, sinon MobilNav
 * Rend le header transparent sur la page d'accueil tant que l'utilisateur n'a pas scrolle
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Définit un message à retourner à l'utilisateur selon le statut de l'erreur
 * @children DesktopNav Affiche le menu de navigation pour l'affichage desktop
 * @children MobilNav Affiche le menu de navigation pour l'affichage mobile
 */
export default function Banner() {
  // Permet de naviguer vers une page apres une action (ex: deconnexion)

  const router = useRouter();
  // Fournit l'etat UI puis choisit automatiquement la navigation admin ou visiteur.
  const { pathname, isAdminPath } = useNavPath();
  const isDesktop = useIsDesktop();
  const adminUser = useAdminUser();

  // Filtre les items de navigation selon le role de l'utilisateur admin ou affiche les items visiteurs
  const items = isAdminPath
    ? filterNavByRole(navAdminItem, adminUser?.user.role ?? "")
    : navVisitorItems;

  // Rend le header transparent uniquement sur la home et quand l'utilisateur n'a pas encore scrolle
  const isHome = pathname === "/";
  const [scrollAtTop, setScrollAtTop] = useState(true);

  // Ecoute le scroll pour rendre le header opaque des le premier pixel de defilement
  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => setScrollAtTop(window.scrollY === 0);

    // Initialise l'etat au chargement de la page
    setScrollAtTop(window.scrollY === 0);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      setScrollAtTop(true);
    };
  }, [isHome]);

  const isOverHero = isHome && scrollAtTop;

  // Envoie la requete de deconnexion puis redirige vers `/login`
  const handleLogout = async () => {
    const result = await apiRequest<ApiMessageResponse>("/admin/auth/logout", {
      method: "POST",
    });

    if (result.error) {
      return;
    }

    router.push("/login");
  };

  return (
    <header
      className={`sticky top-0 z-50 mx-auto flex w-full items-center justify-between px-6 py-2 transition-colors duration-300 ${isOverHero ? "bg-transparent" : "bg-(--color-bg)"}`}
    >
      <Image
        src={logo}
        alt="Logo Hellfest"
        width={logo.width}
        height={logo.height}
        priority
        style={{ height: "90px", width: "auto" }}
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
