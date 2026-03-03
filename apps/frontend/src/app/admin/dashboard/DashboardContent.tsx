"use client";

import { useAdminUser } from "../../../components/AdminUserProvider";

/** Affiche les informations principales du compte administrateur.
 * Recupere l'utilisateur connecte et presente les donnees de profil.*/
export default function DashboardContent() {
  const { user } = useAdminUser();

  return (
    <div className="flex-1 flex justify-center text-2xl lg:text-5xl">
      <div className="h-full flex flex-col justify-center gap-(--gap-content-big)">
        <div>
          <p>Name : {user.display_name}</p>
          <p>Email : {user.email}</p>
        </div>

        <div>
          <p>Type : {user.role}</p>

          <div className="flex items-center gap-(--gap-content-small)">
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
  );
}
