"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";

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
 */
export default function UsersContent() {
  const [users, setUsers] = useState<UserListRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await apiRequest<ListUsersResponse>("/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (result.error) {
        setErrorMessage(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      setUsers(result.data?.users ?? []);
      setIsLoading(false);
    };

    getUsers();
  }, []);

  return (
    <div className="flex-1 flex justify-center ">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <p className="text-center">Chargement...</p>
        ) : errorMessage ? (
          <p className="text-center text-(--color-1)">{errorMessage}</p>
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
                  <button type="button" className="btn-type-2">
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
