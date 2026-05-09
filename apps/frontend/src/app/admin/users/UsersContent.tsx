"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFetch } from "../../../hooks/useFetch";
import { useModal } from "../../../hooks/useModal";
import { useAdminUser } from "../../../components/AdminUserProvider";
import AddUserModal from "./AddUserModal";
import DeleteModal from "../../../components/DeleteModal";
import type { UserItem } from "../../../type";
import LoadingLine from "../../../components/LoadingLine";

const formatDateFr = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Affiche la liste des utilisateurs.
 * Recupere les utilisateurs via l'API puis affiche un etat de chargement/erreur.
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Definit un message a retourner selon le statut de l'erreur
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
  filterBy?: "all" | "admin" | "lineup" | "news";
}) {
  // Navigation et contexte utilisateur
  const router = useRouter();
  const currentUser = useAdminUser();

  // Initialise la liste des utilisateurs
  const [users, setUsers] = useState<UserItem[]>([]);
  const { data, isLoading, error } = useFetch<{ users: UserItem[] }>(
    "/admin/users",
  );
  useEffect(() => {
    setUsers(data?.users ?? []);
  }, [data]);

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

  // Met a jour la liste des utilisateurs apres suppression en retirant l'utilisateur correspondant a l'id fourni
  const handleUserDeleted = (userId: string) => {
    // Redirige vers /login si l'utilisateur supprime est l'utilisateur connecte
    if (userId === currentUser?.user.id) {
      router.push("/login");
      return;
    }

    // Filtre la liste des utilisateurs pour retirer l'utilisateur supprime
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    );
  };

  // Ajoute ou met a jour un utilisateur dans la liste locale
  const upsertUser = (savedUser: UserItem) => {
    setUsers((currentUsers) => {
      // Vérifie si un utilisateur avec le même id existe déjà
      const userAlreadyExists = currentUsers.some(
        (currentUser) => currentUser.id === savedUser.id,
      );

      // Si l'utilisateur n'existe pas encore on l'ajoute à la liste existante
      if (!userAlreadyExists) {
        return [...currentUsers, savedUser];
      }
      // Si l'utilisateur existe déjà on parcourt la liste pour remplacer l'ancien utilisateur
      return currentUsers.map((currentUser) =>
        currentUser.id === savedUser.id ? savedUser : currentUser,
      );
    });
  };

  // Ferme la modale (ajout ou edition) et reinitialise l'utilisateur selectionne
  const closeModal = () => {
    closeEditModal();
    onCloseAddModal();
  };

  // Met a jour la liste apres ajout ou modification puis ferme la modale
  const handleUser = (savedUser: UserItem) => {
    upsertUser(savedUser);
    closeModal();
  };

  // On crée un nouveau tableau contenant uniquement les utilisateurs correspondant au filtre sélectionné
  const filteredUsers = users.filter((user) => {
    // Si le filtre est "all", on retourne tous les utilisateurs
    if (filterBy === "all") {
      return true;
    }
    // On normalise le rôle de l'utilisateur et aussi le filtre pour être sûr que la comparaison soit cohérente
    const normalizedRole = user.role.toLowerCase().replace(/\s+/g, "");
    const normalizedFilter = filterBy.toLowerCase();

    return normalizedRole === normalizedFilter;
  });

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
                      <span>Créé le {formatDateFr(user.created_at)}</span>
                      <span>
                        Mot de passe{" "}
                        {user.password_changed_at
                          ? `modifié le ${formatDateFr(user.password_changed_at)}`
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
        onDeleted={handleUserDeleted}
        endpoint="/admin/users"
        entityName="utilisateur"
        getLabel={(u) => u.display_name}
      />
      <AddUserModal
        key={userToEdit?.id ?? "new"}
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={closeModal}
        handleUser={handleUser}
        userToEdit={userToEdit}
      />
    </div>
  );
}
