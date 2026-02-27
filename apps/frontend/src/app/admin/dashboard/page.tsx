"use client";

import { useAdminUser } from "../../../components/AdminUserProvider";
import { useAppUi } from "../../../components/AppUiProvider";
import Navigation from "../../../components/Navigation";
import { navDashBordItems } from "../../../config/navigation";

/** Affiche le tableau de bord administrateur.
 * Recupere l'utilisateur connecte et les infos UI (route courante + mode desktop/mobile).
 * Affiche la navigation admin uniquement sur desktop.
 * Presente les informations du compte et les actions principales de gestion.
 * @children Navigation Affiche une navigation verticale
 */
export default function Page() {
  // Recupere la route actuelle et detecte si l'affichage est en mode desktop.
  const { pathname, isDesktop } = useAppUi();
  // Recupere l'utilisateur connecte et la liste des liens de navigation du dashboard admin.
  const { user } = useAdminUser();
  const items = navDashBordItems;

  return (
    <section className="section-page flex flex-col flex-1 text-xl md:text-4xl">
      <h1 className="title1">ADMINISTRATION MODE</h1>

      <div className="flex flex-1 gap-6 pr-4">
        {isDesktop ? (
          <div className="sticky top-4 flex items-center">
            <Navigation items={items} pathname={pathname} isAdminPath={true} />
          </div>
        ) : null}

        <div className="flex-1 flex justify-center">
          <div className="h-full flex flex-col justify-center gap-20">
            <div>
              <p>Name : {user.display_name}</p>
              <p>Email : {user.email}</p>
            </div>

            <div>
              <p>Type : {user.role}</p>

              <div className="flex items-center gap-6">
                <p>Password :</p>
                <button type="button" className="btn-cta">
                  Modifier
                </button>
              </div>
            </div>

            <div>
              <p>Prochain evenement : du 23 mai 2026 au 24 mai 2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
