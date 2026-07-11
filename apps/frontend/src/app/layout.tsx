import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import ModalSetup from "../components/ModalSetup";

config.autoAddCss = false;

// Police Google
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

// Métadonnées SEO
const title = "Vindhellfest";
const description =
  "Vindhellfest — Le festival de musique en Charente. Programmation, actualités et informations pratiques.";
const image = "/hero_bg.webp";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [image],
    siteName: "Vindhellfest",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
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
