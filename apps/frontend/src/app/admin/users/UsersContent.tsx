"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import { useAdminUser } from "../../../components/AdminUserProvider";
import AddUserModal from "./AddUserModal";
import DelateUserModal from "./DelateUserModal";
import type { UserListRow } from "../../../types";

type ListUsersResponse = { users: UserListRow[] };

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
  const router = useRouter();
  const currentUser = useAdminUser();

  // Etats lies aux donnees
  const [users, setUsers] = useState<UserListRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Etats lies a la suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] =
    useState<UserListRow | null>(null);

  // Utilisateur en cours d'edition (null = mode ajout)
  const [userToEdit, setUserToEdit] = useState<UserListRow | null>(null);

  // Charge la liste des utilisateurs au montage du composant
  useEffect(() => {
    const getUsers = async () => {
      // Active le chargement et reinitialise les erreurs
      setIsLoading(true);
      setError(null);

      // Appel API pour recuperer la liste des utilisateurs
      const result = await apiRequest<ListUsersResponse>("/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Gestion des erreurs API
      if (result.error) {
        setError(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // Mise a jour de la liste des utilisateurs
      setUsers(result.data?.users ?? []);
      setIsLoading(false);
    };

    getUsers();
  }, []);

  // Ouvre la modal de suppression et definit l'utilisateur selectionne
  const openDeleteModal = (user: UserListRow) => {
    setSelectedUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
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
  // Masque la modal de suppression et reinitialise l'utilisateur selectionne
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUserToDelete(null);
  };

  // Ajoute ou met a jour un utilisateur dans la liste locale
  const upsertUser = (savedUser: UserListRow) => {
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

  // Ouvre la modale d'edition pour l'utilisateur selectionne
  const openEditModal = (user: UserListRow) => {
    setUserToEdit(user);
  };

  // Ferme la modale (ajout ou edition) et reinitialise l'utilisateur selectionne
  const closeModal = () => {
    setUserToEdit(null);
    onCloseAddModal();
  };

  // Met a jour la liste apres ajout ou modification puis ferme la modale
  const handleUser = (savedUser: UserListRow) => {
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
    <div className="flex-1 flex justify-center ">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <p className="text-center">Chargement...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p>Aucun utilisateur.</p>
          </div>
        ) : (
          <ul className="flex flex-col items-center gap-6">
            {filteredUsers.map((user) => (
              <li key={user.id} className="card-row">
                <div className="flex items-center justify-center m-3 mb-0 lg:mb-3">
                  <span className="flex items-center justify-center">
                    {user.display_name ?? "Utilisateur"}
                  </span>
                </div>

                <div className="flex-1 flex flex-wrap flex-col lg:flex-row items-center gap-3 justify-between">
                  <span className="whitespace-nowrap">{user.email}</span>

                  <div className="flex flex-nowrap">
                    <span className="whitespace-nowrap">Cree le&nbsp;</span>
                    <span className="whitespace-nowrap">
                      {formatDateFr(user.created_at)}
                    </span>
                  </div>

                  <span className="whitespace-nowrap">{user.role}</span>

                  <div className="flex flex-nowrap">
                    <span className="whitespace-nowrap">
                      Mot de passe&nbsp;
                    </span>
                    <span className="whitespace-nowrap">
                      {user.password_changed_at
                        ? `Modifie le ${formatDateFr(user.password_changed_at)}`
                        : "Provisoire"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-6 mb-3 lg:m-3">
                  <button
                    type="button"
                    className="btn-type-2 rounded-md border border-(--color-text-input) p-2"
                    onClick={() => openEditModal(user)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn-type-2 rounded-md border border-(--color-text-input) p-2"
                    onClick={() => openDeleteModal(user)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DelateUserModal
        isOpen={isDeleteModalOpen}
        selectedUser={selectedUserToDelete}
        onClose={closeDeleteModal}
        handleUser={handleUserDeleted}
      />
      <AddUserModal
        key={userToEdit?.id ?? "new"}
        isOpen={isAddModalOpen || userToEdit !== null}
        onClose={closeModal}
        handleUser={handleUser}
        userToEdit={userToEdit}
      />
    </div>
  );
}
