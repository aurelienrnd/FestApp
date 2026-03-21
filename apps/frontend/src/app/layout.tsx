import type { Metadata } from "next";
import { Koulen } from "next/font/google";
import "./globals.css";
import ModalSetup from "../components/ModalSetup";

// Police Google
const koulen = Koulen({
  subsets: ["latin"],
  weight: "400", // OBLIGATOIRE pour Koulen
  display: "swap",
  variable: "--font-koulen",
});

// Métadonnées SEO
export const metadata: Metadata = {
  title: "Vindellfest",
  description: "A music festival website built with Next.js", //TODO a modifier
};

/** Layout racine — definit uniquement le squelette HTML commun a toutes les pages.
 * Banner, Footer et providers sont deleguees aux layouts de section.
 * @children {ReactNode} children Layouts de section (public ou admin)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={koulen.variable}>
      <body
        id="app-root"
        className={`${koulen.className} min-h-screen bg-(--color-bg) text-(--color-text) flex flex-col`}
      >
        <ModalSetup />
        {children}
      </body>
    </html>
  );
}
