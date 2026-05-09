"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminUser } from "../../../components/AdminUserProvider";
import { useModal } from "../../../hooks/useModal";
import { FESTIVAL_DAYS, FESTIVAL_LOCATION } from "../../../config/festival";
import { navAdminQuickLinks, filterNavByRole } from "../../../config/ui";
import ChangePasswordModal from "./ChangePasswordModal";

/** Formate une date ISO en français long. */
function formatDateFr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Retourne le nombre de jours restants avant une date ISO. */
function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/** Affiche les informations principales du compte administrateur.
 * Recupere l'utilisateur connecte et presente les donnees de profil.
 * Si mustChangePassword est vrai, ouvre automatiquement la modale en mode force.
 * Les dates du festival sont derivees dynamiquement depuis FESTIVAL_DAYS.
 */
export default function DashboardContent() {
  const adminUser = useAdminUser();
  const router = useRouter();
  const {
    isOpen: isChangePasswordModalOpen,
    open: openChangePassword,
    close: closeChangePassword,
  } = useModal(adminUser?.mustChangePassword ?? false);

  if (!adminUser) return null;
  const { user, mustChangePassword } = adminUser;

  const handleModalClose = () => {
    closeChangePassword();
    if (mustChangePassword) router.refresh();
  };

  const daysLeft = getDaysUntil(FESTIVAL_DAYS[0]);
  const accessibleLinks = filterNavByRole(navAdminQuickLinks, user.role);

  return (
    <div className="flex-1 flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* Carte profil */}
      <div className="card-profile p-8 gap-8">
        {/* Avatar */}
        <div className="card-profile-avatar w-24 h-24 text-4xl">
          {(user.display_name ?? "U").slice(0, 1)}
        </div>

        {/* Infos — distribue sur toute la largeur */}
        <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 w-full text-center sm:text-left">
          <div className="flex flex-col gap-2">
            <p className="card-primary text-4xl">
              {user.display_name}
            </p>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <span className="card-profile-badge px-4 py-1.5">
                {user.role}
              </span>
              <p className="text-sm text-(--color-text-input)">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-center shrink-0">
            <span className="text-xs uppercase tracking-wide text-(--color-text-input)">
              Mot de passe
            </span>
            <button
              type="button"
              className="btn-cta"
              onClick={() => openChangePassword()}
            >
              Modifier
            </button>
          </div>
        </div>
      </div>

      {/* Grille du bas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Compte à rebours festival */}
        <div className="border border-(--color-text-input) rounded-md p-6 flex flex-col gap-4">
          <div className="w-10 h-1 bg-(--color-1) rounded-full" />
          <h2 className="text-sm font-black uppercase tracking-wide text-(--color-text-input)">
            Prochain événement
          </h2>

          <div className="flex items-end gap-3">
            <span className="text-7xl font-black text-(--color-1) leading-none">
              {Math.max(0, daysLeft)}
            </span>
            <span className="text-sm font-bold uppercase pb-2 text-(--color-text-input)">
              jour{daysLeft > 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <p className="font-bold uppercase">{FESTIVAL_LOCATION.name}</p>
            <p className="text-(--color-text-input) uppercase text-xs">
              {FESTIVAL_LOCATION.address}
            </p>
            <p className="text-(--color-text-input) uppercase text-xs">
              {FESTIVAL_LOCATION.city}
            </p>
          </div>

          <p className="text-xs text-(--color-text-input) border-t border-(--color-text-input) pt-4 uppercase tracking-wide">
            Du {formatDateFr(FESTIVAL_DAYS[0])} au{" "}
            {formatDateFr(FESTIVAL_DAYS[FESTIVAL_DAYS.length - 1])}
          </p>
        </div>

        {/* Accès rapide */}
        {accessibleLinks.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="w-10 h-1 bg-(--color-1) rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-wide text-(--color-text-input)">
              Accès rapide
            </h2>
            <div className="flex flex-col gap-3">
              {accessibleLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path!}
                  className="border border-(--color-text-input) rounded-md p-4 flex flex-col gap-1 transition-opacity hover:opacity-70"
                >
                  <span className="font-black uppercase tracking-wide">
                    {link.label}
                  </span>
                  <span className="text-xs text-(--color-text-input)">
                    {link.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleModalClose}
        forced={mustChangePassword}
      />
    </div>
  );
}
