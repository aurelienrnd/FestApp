"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "../functions/apiRequest";

type ApiError = { message?: string; status?: number };

/** Protège l’accès aux pages d’administration.
 * Vérifie la session admin courante via l’endpoint `/admin/auth/me`.
 * Redirige l’utilisateur vers `/login` si la session est invalide ou absente.
 * Affiche un état de chargement pendant la vérification.
 * Rend les composants enfants uniquement si l’authentification admin est valide.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu admin affiché après validation de la session.
 */
export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const result = await apiRequest("/admin/auth/me", { method: "GET" });

      if (result.error) {
        const apiError = result.error as ApiError;
        setError(apiError);
        console.log(error);
        router.push("/login");

        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return <div className="p-6">Chargement...</div>;
  }
  return <>{children}</>;
}
