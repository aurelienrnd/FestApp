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
  display: "swap",
  variable: "--font-koulen",
});

// Métadonnées SEO
export const metadata: Metadata = {
  title: "Vindellfest",
  description: "A music festival website built with Next.js", //TODO a modifier
};

/**Layout global de l'aplication
 * @children AppUiProvider : Fournit un contexte global d’interface utilisateur (UI) à l’application.
 * @children Banner : Affiché sur toutes les pages
 * @children Footer : Affiché sur toutes les pages
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={koulen.variable}>
      <body
        className={`${koulen.className} min-h-screen bg-(--color-bg) text-(--color-text) flex flex-col`}
      >
        <AppUiProvider>
          <div id="app-root" className="flex min-h-screen flex-col">
            <Banner />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AppUiProvider>
      </body>
    </html>
  );
}
