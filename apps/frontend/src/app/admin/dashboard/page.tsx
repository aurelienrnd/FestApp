import DashboardContent from "./DashboardContent";

/** Affiche le tableau de bord administrateur.
 * @children DashboardContent - Le contenu du tableau de bord administrateur.
 */
export default function Page() {
  return (
    <section className="section-page">
      <h1 className="title1">Administration</h1>
      <DashboardContent />
    </section>
  );
}
