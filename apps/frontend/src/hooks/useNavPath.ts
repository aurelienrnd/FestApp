"use client";
import { usePathname } from "next/navigation";

/** Retourne le pathname courant et indique si la route est une route admin. */
export function useNavPath() {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin") ?? false;
  return { pathname, isAdminPath };
}
