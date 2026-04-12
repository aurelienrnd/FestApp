"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminUser } from "../../../components/AdminUserProvider";
import { FESTIVAL_DAYS } from "../../../config/festival";
import ChangePasswordModal from "./ChangePasswordModal";

/** Affiche les informations principales du compte administrateur.
 * Recupere l'utilisateur connecte et presente les donnees de profil.
 * Si mustChangePassword est vrai, ouvre automatiquement la modale en mode force.
 * Les dates du festival sont derivees dynamiquement depuis FESTIVAL_DAYS.
 */
export default function DashboardContent() {
  const adminUser = useAdminUser();
  const router = useRouter();
  const [isChangePasswordModalOpen, setIsChangePasswordModal] = useState(
    adminUser?.mustChangePassword ?? false,
  );

  if (!adminUser) return null;
  const { user, mustChangePassword } = adminUser;

  // Ferme la modale et rafraichit le layout serveur si le changement etait force
  const handleModalClose = () => {
    setIsChangePasswordModal(false);
    if (mustChangePassword) router.refresh();
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-20">
      <div className="w-full max-w-5xl flex flex-col justify-center items-center gap-6">
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
              <button
                type="button"
                className="btn-cta"
                onClick={() => setIsChangePasswordModal(true)}
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-festival-date text-(--color-text-input)">
        Prochain evenement : du{" "}
        {new Date(FESTIVAL_DAYS[0]).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        au{" "}
        {new Date(FESTIVAL_DAYS[FESTIVAL_DAYS.length - 1]).toLocaleDateString(
          "fr-FR",
          { day: "numeric", month: "long", year: "numeric" },
        )}
      </p>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleModalClose}
        forced={mustChangePassword}
      />
    </div>
  );
}
