import Banner from "../../components/Banner";
import Footer from "../../components/Footer";

/** Layout de la zone d'authentification — applique le theme admin des le rendu serveur.
 * @children Banner
 * @children Footer
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-theme="admin" id="app-root" className="app-root">
      <Banner />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
