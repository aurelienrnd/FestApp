"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
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
 * @children DelateUserModal - Affiche la modale de confirmation pour supprimer un utilisateur.
 */
export default function UsersContent({
  refreshToken,
}: {
  refreshToken: number;
}) {
  // États liés aux données
  const [users, setUsers] = useState<UserListRow[]>([]);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // États liés à la suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListRow | null>(null);

  // Charge la liste des utilisateurs au montage du composant et à chaque changement du refreshToken
  useEffect(() => {
    const getUsers = async () => {
      // Active le chargement et réinitialise les erreurs
      setIsLoading(true);
      setLoadErrorMessage(null);

      // Appel API pour récupérer la liste des utilisateurs
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

      // Mise à jour de la liste des utilisateurs
      setUsers(result.data?.users ?? []);
      setIsLoading(false);
    };

    getUsers();
  }, [refreshToken]);

  // Met à jour la liste des utilisateurs après suppression en retirant l’utilisateur correspondant à l’id fourni
  const handleUserDeleted = (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.filter((currentUser) => currentUser.id !== userId),
    );
  };

  // Ouvre la modal de suppression et définit l’utilisateur sélectionné
  const openDeleteModal = (user: UserListRow) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Masque la modal de confirmation et supprime la référence à l’utilisateur sélectionné
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex-1 flex justify-center ">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <p className="text-center">Chargement...</p>
        ) : loadErrorMessage ? (
          <p className="text-center text-(--color-1)">{loadErrorMessage}</p>
        ) : users.length === 0 ? (
          <p className="text-center">Aucun utilisateur.</p>
        ) : (
          <ul className="flex flex-col gap-(--gap-content-small)">
            {users.map((user) => (
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
                  <button type="button" className="btn-type-2">
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
        user={selectedUser}
        onClose={closeDeleteModal}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
}
