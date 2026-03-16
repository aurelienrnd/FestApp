import SideBarTool from "../../../components/SideBarTool";
import { filterLineUpItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";
import LineupContent from "./LineupContent";

export default function Page() {
  return (
    <section className="section-page">
      <div className="flex justify-center item-center gap-6">
        <AddButton items={filterLineUpItems} className="mb-12" />
        <h1 className="title1">Admin Lineup</h1>
      </div>

      <SideBarTool items={filterLineUpItems}>
        <LineupContent />
      </SideBarTool>
    </section>
  );
}
