import SideBarTool from "../../components/SideBarTool";
import { filterLineUpItems } from "../../config/navigation";
import AddButton from "../../components/AddButton";
import LineupContent from "../admin/lineup/LineupContent";

/** Page publique de la programmation du festival. */
export default function Page() {
  return (
    <section className="section-page">
      <div className="flex justify-center items-center gap-(--space-md)">
        <AddButton items={filterLineUpItems} />
        <h1 className="title1">Lineup</h1>
      </div>
      <SideBarTool items={filterLineUpItems}>
        <LineupContent />
      </SideBarTool>
    </section>
  );
}
