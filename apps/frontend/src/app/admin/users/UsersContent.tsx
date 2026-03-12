"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import AddUserModal from "./AddUserModal";
import DelateUserModal from "./DelateUserModal";

type UserListRow = {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  role: string;
};

type ListUsersResponse = { users: UserListRow[] };

/** Affiche la liste des utilisateurs.
 * Recupere les utilisateurs via l'API puis affiche un etat de chargement/erreur.
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Definit un message a retourner selon le statut de l'erreur
 * @param isAddModalOpen Ouvre la modale d'ajout utilisateur.
 * @param onCloseAddModal Ferme la modale d'ajout utilisateur.
 * @param filterBy filtre les utilisateurs
 * @children AddUserModal - Affiche la modale d'ajout d'utilisateur.
 * @children AddUserModal - Affiche la modale d'edition d'utilisateur.
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
  // Etats lies aux donnees
  const [users, setUsers] = useState<UserListRow[]>([]);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Etats lies a la suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] =
    useState<UserListRow | null>(null);

  // Etats lies a la modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserToBeUpdate, setSelectedUserToBeUpdate] =
    useState<UserListRow | null>(null);

  // Charge la liste des utilisateurs au montage du composant
  useEffect(() => {
    const getUsers = async () => {
      // Active le chargement et reinitialise les erreurs
      setIsLoading(true);
      setLoadErrorMessage(null);

      // Appel API pour recuperer la liste des utilisateurs
      const result = await apiRequest<ListUsersResponse>("/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Gestion des erreurs API
      if (result.error) {
        setLoadErrorMessage(getApiErrorMessage(result.error));
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
    setUsers((currentUsers) =>
      currentUsers.filter((currentUser) => currentUser.id !== userId),
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

  // Ouvre la modal de modification et definit l'utilisateur selectionne
  const openEditModal = (user: UserListRow) => {
    setSelectedUserToBeUpdate(user);
    setIsEditModalOpen(true);
  };
  // Ferme la fenetre modale de modification et reinitialise l'utilisateur selectionne
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUserToBeUpdate(null);
  };
  // Met a jour la liste apres modification utilisateur puis ferme la modal d'edition
  const handleUserEdited = (savedUser: UserListRow) => {
    upsertUser(savedUser);
    closeEditModal();
  };

  // Met a jour la liste apres ajout utilisateur puis ferme la modal d'ajout
  const handleUserAdded = (savedUser: UserListRow) => {
    upsertUser(savedUser);
    onCloseAddModal();
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
        ) : loadErrorMessage ? (
          <p className="text-center text-(--color-1)">{loadErrorMessage}</p>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p>Aucun utilisateur.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-(--gap-content-small)">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="w-full rounded-md border border-(--color-text-input) p-(--spacing-around-small)
             flex flex-col gap-3
             md:flex-row md:items-center md:justify-between md:gap-x-(--gap-content-small)"
              >
                <div
                  className="flex flex-col gap-3
               sm:flex-row sm:justify-between sm:gap-x-(--gap-content-small)
               md:flex-1"
                >
                  <div className="flex flex-col">
                    <p className="font-semibold text-base md:text-lg">
                      {user.display_name}
                    </p>
                    <p className="text-xs md:text-sm text-(--color-text-input)">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end md:items-end">
                    <p className="text-sm md:text-base">{user.role}</p>
                    <p className="text-xs md:text-sm text-(--color-text-input)">
                      {user.is_active ? "actif" : "non actif"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-x-3 md:gap-x-(--gap-content-small)">
                  <button
                    type="button"
                    className="btn-type-2"
                    onClick={() => openEditModal(user)}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="btn-type-2"
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
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        handleUser={handleUserAdded}
      />
      <AddUserModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        handleUser={handleUserEdited}
        selectedUser={selectedUserToBeUpdate}
      />
    </div>
  );
}
