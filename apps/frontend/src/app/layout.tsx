import type { Metadata } from "next";
import { Koulen } from "next/font/google";
import { AppUiProvider } from "../components/AppUiProvider";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import "./globals.css";

// Police Google
const koulen = Koulen({
  subsets: ["latin"],
  weight: "400", // OBLIGATOIRE pour Koulen
});

// Métadonnées SEO
export const metadata: Metadata = {
  title: "Vindellfest",
  description: "A music festival website built with Next.js", //TODO a modifier
};

/**Layout global de l'aplication
 * @children ThemeVars : Définit les variables CSS pour la gestion des page admin et visiteur
 * @children Banner : Affiché sur toutes les pages
 * @children Footer : Affiché sur toutes les pages
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${koulen.className}`}>
      <body className="bg-(--collor-bg) text-(--collor-text)">
        <AppUiProvider>
          <Banner />
          <main>{children}</main>
          <Footer />
        </AppUiProvider>
      </body>
    </html>
  );
}
