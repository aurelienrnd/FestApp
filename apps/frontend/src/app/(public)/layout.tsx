import Banner from "../../components/Banner";
import Footer from "../../components/Footer";

/** Layout des pages publiques — fournit la banniere et le footer.
 * @children Banner
 * @children Footer
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-theme="visitor" id="app-root" className="app-root">
      <Banner />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
