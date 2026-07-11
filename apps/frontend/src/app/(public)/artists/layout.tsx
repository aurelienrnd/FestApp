import type { Metadata } from "next";

// Métadonnées SEO
export const metadata: Metadata = {
  title: "Programmation | Vindhellfest",
  description:
    "Découvrez la programmation du Vindhellfest : tous les artistes et groupes qui monteront sur scène.",
};

/** Layout de la section /artists — porte les metadata car la page est un composant client. */
export default function ArtistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
