import Banner from "../../components/Banner";
import Footer from "../../components/Footer";

/** Layout des pages publiques — fournit la banniere et le footer.
 * @children {ReactNode} children Pages publiques (accueil, lineup, news, practical-info, login)
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-theme="visitor" id="app-root" className="flex min-h-screen flex-col bg-(--color-bg) text-(--color-text)">
      <Banner />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
