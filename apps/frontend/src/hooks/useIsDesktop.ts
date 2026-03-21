"use client";

import { useEffect, useState } from "react";

/** Detecte si l'ecran est en mode desktop (largeur >= 768px) via une media query.
 * Ecoute les changements de taille d'ecran pour mettre a jour l'etat en temps reel.
 * @returns {boolean} true si l'ecran fait au moins 768px de large
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsDesktop(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}
