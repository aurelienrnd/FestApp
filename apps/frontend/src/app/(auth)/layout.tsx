import Banner from "../../components/Banner";
import Footer from "../../components/Footer";

/** Layout de la zone d'authentification — applique le theme admin des le rendu serveur.
 * @children {ReactNode} children Pages d'authentification (login)
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-theme="admin" id="app-root" className="flex min-h-screen flex-col bg-(--color-bg) text-(--color-text)">
      <Banner />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
