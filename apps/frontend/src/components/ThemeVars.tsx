"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ThemeVars() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const isAdmin =
      pathname.includes("/admin") || pathname.includes("/login");
    const root = document.documentElement;

    root.dataset.theme = isAdmin ? "admin" : "visitor";
  }, [pathname]);

  return null;
}
