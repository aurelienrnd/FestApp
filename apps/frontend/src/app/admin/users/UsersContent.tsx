"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";
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
  // Verifie si le chemin d'acces contient "/admin" pour afficher ou non les boutons
  const router = useRouter();
  const currentUser = useAdminUser();

  // initialise les etats pour la liste des utilisateurs, le chargement et l'erreur
  const [baseUsers, setBaseUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recupere la liste des utilisateurs via l'API Better Auth et met a jour les etats
  useEffect(() => {
    // Evite de mettre a jour l'etat apres un unmount du composant (ex: changement de page)
    let cancelled = false;

    // Recupere la liste des utilisateurs via l'API Better Auth et met a jour les etats
    async function loadUsers() {
      try {
        const result = await authClient.admin.listUsers({
          query: { sortBy: "name" },
        });

        // Si le composant a ete unmount, on ne met pas a jour l'etat
        if (cancelled) return;

        // Si une erreur est survenue, on met a jour l'etat error et on quitte la fonction
        if (result.error) {
          setError(result.error.message ?? "Une erreur est survenue.");
          return;
        }

        // createdAt est un objet Date cote client Better Auth, converti en ISO string pour rester coherent avec le reste de UserItem.
        setBaseUsers(
          result.data.users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserItem["role"],
            created_at: new Date(user.createdAt).toISOString(),
          })),
        );
      } catch {
        // Si une erreur est survenue, on met a jour l'etat error
        if (!cancelled) setError("Une erreur est survenue.");
      } finally {
        // Si le composant a ete unmount, on ne met pas a jour l'etat
        if (!cancelled) setIsLoading(false);
      }
    }
    loadUsers();

    // Nettoie l'effet en annulant la mise à jour de l'état si le composant est démonté
    return () => {
      cancelled = true;
    };
  }, []);

  // Gere les utilisateurs ajoutes, modifies et supprimes dans la session pour ne pas recharger la page
  const [addedUsers, setAddedUsers] = useState<UserItem[]>([]);
  const [overrides, setOverrides] = useState<Map<string, UserItem>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Gere l'ouverture et la fermeture de la modale de suppression d'utilisateur
  const {
    isOpen: isDeleteModalOpen,
    item: selectedUserToDelete,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal<UserItem>();

  // Gere l'ouverture et la fermeture de la modale d'edition d'utilisateur
  const {
    isOpen: isEditModalOpen,
    item: userToEdit,
    open: openEditModal,
    close: closeEditModal,
  } = useModal<UserItem>();

  // Ajoute l'id de l'artiste supprime a la liste des ids supprimes pour le filtrage
  const handleUserSavedDeleted = (userId: string) => {
    if (userId === currentUser?.user.id) {
      router.push("/login");
      return;
    }
    setDeletedIds((current) => new Set([...current, userId]));
  };

  // Ajoute ou remplace un utilisateur dans la liste des utilisateurs affiches selon s'il existait deja ou pas
  const upsertUser = (savedUser: UserItem) => {
    //Verifie si l'utilisateur a etait modifier ou ajouter
    const existsInBase = baseUsers.some((u) => u.id === savedUser.id);
    const existsInAdded = addedUsers.some((u) => u.id === savedUser.id);

    // Si l'utilisateur existait deja dans la base, on ajoute une override pour le remplacer par le nouvel utilisateur modifie
    if (existsInBase) {
      setOverrides(
        (current) => new Map([...current, [savedUser.id, savedUser]]),
      );
    }
    // si lutilisateur a etait ajouter dans la session
    else if (existsInAdded) {
      setAddedUsers((current) =>
        current.map((u) => (u.id === savedUser.id ? savedUser : u)),
      );
    }
    // Sinon, on ajoute le nouvel utilisateur a la liste des utilisateurs ajoutes
    else {
      setAddedUsers((current) => [...current, savedUser]);
    }
  };

  // Ferme la modale et reinitialise l'utilisateur selectionne
  const closeUserModal = () => {
    closeEditModal();
    onCloseAddModal();
  };

  // Met a jour la liste apres ajout ou modification puis ferme la modale
  const handleUserSaved = (savedUser: UserItem) => {
    upsertUser(savedUser);
    closeUserModal();
  };

  // filtrage des utilisateurs a afficher
  const filteredUsers = useMemo(() => {
    // Merge les utilisateurs de la base, les utilisateurs ajoutes et les utilisateurs modifies, puis filtre selon le role selectionne
    const merged = [
      ...baseUsers
        .filter((u) => !deletedIds.has(u.id))
        .map((u) => overrides.get(u.id) ?? u),
      ...addedUsers.filter((u) => !deletedIds.has(u.id)),
    ];
    
    // Filtre les utilisateurs selon le role selectionne
    return filterBy === "all"
      ? merged
      : merged.filter((u) => u.role === filterBy);
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
                  {(user.name ?? "U").slice(0, 1)}
                </div>

                {/* Infos */}
                <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full text-center sm:text-left">
                  <div className="flex flex-col gap-2">
                    <p className="card-primary text-xl">
                      {user.name ?? "Utilisateur"}
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
        onConfirm={(id) => authClient.admin.removeUser({ userId: id })}
        entityName="utilisateur"
        getLabel={(u) => u.name}
      />
      <AddUserModal
        key={userToEdit?.id ?? "new"}
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={closeUserModal}
        handleUserSaved={handleUserSaved}
        userToEdit={userToEdit}
      />
    </div>
  );
}
