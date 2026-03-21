import { AppUiProvider } from "../../components/AppUiProvider";
import Banner from "../../components/Banner";
import Footer from "../../components/Footer";

/** Layout des pages publiques — fournit le contexte UI, la banniere et le footer.
 * @children {ReactNode} children Pages publiques (accueil, lineup, news, practical-info, login)
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppUiProvider>
      <div id="app-root" className="flex min-h-screen flex-col">
        <Banner />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
    </AppUiProvider>
  );
}
