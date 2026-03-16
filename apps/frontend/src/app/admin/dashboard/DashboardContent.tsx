"use client";

import { useAdminUser } from "../../../components/AdminUserProvider";

/** Affiche les informations principales du compte administrateur.
 * Recupere l'utilisateur connecte et presente les donnees de profil.
 */
export default function DashboardContent() {
  const { user } = useAdminUser();

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-(--gap-content-big)">
      <div className="w-full max-w-6xl">
        <div
          className="w-full rounded-2xl border border-(--color-text-input) p-(--spacing-around-small) md:p-(--spacing-around-big)
                     flex flex-wrap justify-around items-center gap-(--gap-content-small)"
        >
          <p className="font-semibold text-xl md:text-2xl lg:text-4xl">
            Name: {user.display_name}
          </p>
          <p className="text-base md:text-lg lg:text-2xl text-(--color-text-input)">
            Email: {user.email}
          </p>

          <p className="text-lg md:text-xl lg:text-3xl">Type: {user.role}</p>
          <div className="flex flex-row items-center gap-x-(--gap-content-small)">
            <p className="text-lg md:text-xl lg:text-3xl">Password:</p>
            <button type="button" className="btn-cta w-fit">
              Modifier
            </button>
          </div>
        </div>
      </div>
      <p className="text-base md:text-lg lg:text-2xl text-(--color-text-input) lg:text-center">
        Prochain evenement : du 23 mai 2026 au 24 mai 2026
      </p>
    </div>
  );
}
