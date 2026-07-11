import type { Metadata } from "next";

// Métadonnées SEO
export const metadata: Metadata = {
  title: "Actualités | Vindhellfest",
  description:
    "Suivez toute l'actualité du Vindhellfest : annonces, coulisses et informations sur le festival.",
};

/** Layout de la section /news — porte les metadata car la page est un composant client. */
export default function NewsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
