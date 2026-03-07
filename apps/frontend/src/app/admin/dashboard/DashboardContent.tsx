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
          className="w-full rounded-2xl border border-(--color-text-input) p-(--spacing-around-big)
                     flex flex-col gap-(--gap-content-big)
                     lg:flex-row lg:items-center lg:justify-between lg:gap-x-(--gap-content-big)"
        >
          <div
            className="flex flex-col gap-(--gap-content-small)
                       sm:flex-row sm:justify-between sm:gap-x-(--gap-content-big)
                       lg:flex-1 lg:items-center"
          >
            <div className="flex flex-col">
              <p className="font-semibold text-xl md:text-2xl lg:text-4xl">
                Name: {user.display_name}
              </p>
              <p className="text-base md:text-lg lg:text-2xl text-(--color-text-input)">
                Email: {user.email}
              </p>
            </div>

            <div className="flex flex-col sm:items-end lg:items-end">
              <p className="text-lg md:text-xl lg:text-3xl">Type: {user.role}</p>
            </div>
          </div>

          <div className="flex flex-col gap-(--gap-content-small) lg:items-end">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-x-(--gap-content-small) lg:justify-end">
              <p className="text-lg md:text-xl lg:text-3xl">Password:</p>
              <button type="button" className="btn-cta">
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-base md:text-lg lg:text-2xl text-(--color-text-input) lg:text-center">
        Prochain evenement : du 23 mai 2026 au 24 mai 2026
      </p>
    </div>
  );
}
