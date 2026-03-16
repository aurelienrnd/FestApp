"use client";

import { useAdminUser } from "../../../components/AdminUserProvider";

/** Affiche les informations principales du compte administrateur.
 * Recupere l'utilisateur connecte et presente les donnees de profil.
 */
export default function DashboardContent() {
  const { user } = useAdminUser();

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-(--gap-content-big)">
      <div className="w-full max-w-5xl flex flex-col justify-center items-center gap-(--gap-content-small)">
        <div className="card-row">
          <div className="card-dashboard-media-center">
            <div className="card-dashboard-avatar">
              {(user.display_name ?? "U").slice(0, 1)}
            </div>
          </div>

          <div className="card-dashboard-content">
            <div className="card-dashboard-field">
              <span>Name: {user.display_name}</span>
            </div>

            <div className="card-dashboard-field">
              <span>Email: {user.email}</span>
            </div>

            <div className="card-dashboard-field">
              <span>Type: {user.role}</span>
            </div>

            <div className="card-dashboard-actions">
              <span>Password:</span>
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
