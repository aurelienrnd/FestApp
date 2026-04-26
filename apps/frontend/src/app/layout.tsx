import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import ModalSetup from "../components/ModalSetup";

config.autoAddCss = false;

// Police Google
const bebasNeue = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
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
    <html lang="fr" className={bebasNeue.variable}>
      <body
        className={`${bebasNeue.className} min-h-screen bg-(--color-bg) text-(--color-text) flex flex-col`}
      >
        <div id="app-root" className="flex flex-col min-h-screen">
          <ModalSetup />
          {children}
        </div>
      </body>
    </html>
  );
}
