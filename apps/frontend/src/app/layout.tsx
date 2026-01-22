import type { Metadata } from "next";
import { Koulen } from "next/font/google";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import "./globals.css";

const koulen = Koulen({
  subsets: ["latin"],
  weight: "400", // OBLIGATOIRE pour Koulen
});

export const metadata: Metadata = {
  title: "Vindellfest",
  description: "A music festival website built with Next.js", //TODO a modifier
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${koulen.className}`}>
      <body className="bg-black text-white">
        <Banner />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
