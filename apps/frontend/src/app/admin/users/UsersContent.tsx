"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "../../../hooks/useFetch";
import { useModal } from "../../../hooks/useModal";
import { useAdminUser } from "../../../components/AdminUserProvider";
import AddUserModal from "./AddUserModal";
import DeleteModal from "../../../components/modals/DeleteModal";
import type { UserItem } from "../../../type";
import LoadingLine from "../../../components/LoadingLine";
import { formatDateLong } from "../../../functions/formatDate";

/** Affiche la liste des utilisateurs.
 * Recupere les utilisateurs via l'API puis affiche un etat de chargement/erreur.
 * @function useFetch Recupere les utilisateurs depuis l'API et gere les etats loading/error
 * @param isAddModalOpen Ouvre la modale d'ajout utilisateur.
 * @param onCloseAddModal Ferme la modale d'ajout utilisateur.
 * @param filterBy filtre les utilisateurs
 * @children AddUserModal - Affiche la modale d'ajout ou d'edition d'utilisateur.
 * @children DelateUserModal - Affiche la modale de confirmation pour supprimer un utilisateur.
 */
export default function UsersContent({
  isAddModalOpen = false,
  onCloseAddModal = () => {},
  filterBy = "all",
}: {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  filterBy?: "all" | "admin" | "artists" | "news";
}) {
  // Navigation et contexte utilisateur
  const router = useRouter();
  const currentUser = useAdminUser();

  const { data, isLoading, error } = useFetch<{ users: UserItem[] }>(
    "/admin/users",
  );

  const baseUsers = useMemo(() => data?.users ?? [], [data]);
  const [addedUsers, setAddedUsers] = useState<UserItem[]>([]);
  const [overrides, setOverrides] = useState<Map<string, UserItem>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const {
    isOpen: isDeleteModalOpen,
    item: selectedUserToDelete,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal<UserItem>();

  const {
    isOpen: isEditModalOpen,
    item: userToEdit,
    open: openEditModal,
    close: closeEditModal,
  } = useModal<UserItem>();

  const handleUserSavedDeleted = (userId: string) => {
    if (userId === currentUser?.user.id) {
      router.push("/login");
      return;
    }
    setDeletedIds((current) => new Set([...current, userId]));
  };

  const upsertUser = (savedUser: UserItem) => {
    const existsInBase = baseUsers.some((u) => u.id === savedUser.id);
    const existsInAdded = addedUsers.some((u) => u.id === savedUser.id);

    if (existsInBase) {
      setOverrides((current) => new Map([...current, [savedUser.id, savedUser]]));
    } else if (existsInAdded) {
      setAddedUsers((current) =>
        current.map((u) => (u.id === savedUser.id ? savedUser : u)),
      );
    } else {
      setAddedUsers((current) => [...current, savedUser]);
    }
  };

  // Ferme la modale (ajout ou edition) et reinitialise l'utilisateur selectionne
  const closeUserModal = () => {
    closeEditModal();
    onCloseAddModal();
  };

  // Met a jour la liste apres ajout ou modification puis ferme la modale
  const handleUserSaved = (savedUser: UserItem) => {
    upsertUser(savedUser);
    closeUserModal();
  };

  const filteredUsers = useMemo(() => {
    const merged = [
      ...baseUsers
        .filter((u) => !deletedIds.has(u.id))
        .map((u) => overrides.get(u.id) ?? u),
      ...addedUsers.filter((u) => !deletedIds.has(u.id)),
    ];
    return filterBy === "all" ? merged : merged.filter((u) => u.role === filterBy);
  }, [baseUsers, addedUsers, overrides, deletedIds, filterBy]);

  return (
    <div className="admin-content-wrapper">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <LoadingLine />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <div className="content-centered">
            <p>Aucun utilisateur.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4 w-full">
            {filteredUsers.map((user) => (
              <li key={user.id} className="card-profile p-6 gap-6">
                {/* Avatar */}
                <div className="card-profile-avatar w-14 h-14 text-2xl">
                  {(user.display_name ?? "U").slice(0, 1)}
                </div>

                {/* Infos */}
                <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full text-center sm:text-left">
                  <div className="flex flex-col gap-2">
                    <p className="card-primary text-xl">
                      {user.display_name ?? "Utilisateur"}
                    </p>
                    <div className="flex items-center gap-3 justify-center sm:justify-start">
                      <span className="card-profile-badge px-3 py-1">
                        {user.role}
                      </span>
                      <p className="text-sm text-(--color-text-input)">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs uppercase text-(--color-text-input)">
                      <span>Créé le {formatDateLong(user.created_at)}</span>
                      <span>
                        Mot de passe{" "}
                        {user.password_changed_at
                          ? `modifié le ${formatDateLong(user.password_changed_at)}`
                          : "provisoire"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 shrink-0">
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => openEditModal(user)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => openDeleteModal(user)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        item={selectedUserToDelete}
        onClose={closeDeleteModal}
        onDeleted={handleUserSavedDeleted}
        endpoint="/admin/users"
        entityName="utilisateur"
        getLabel={(u) => u.display_name}
      />
      <AddUserModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={closeUserModal}
        handleUserSaved={handleUserSaved}
        userToEdit={userToEdit}
      />
    </div>
  );
}
