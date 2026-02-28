import SideBarTool from "../../components/SideBarTool";
import { filterLineUpItems } from "../../config/navigation";
import AddButton from "../../components/AddButton";

export default function Page() {
  return (
    <section className="section-page">
      <div className="flex justify-center item-center gap-6">
        <AddButton items={filterLineUpItems} />
        <h1 className="title1">Lineup</h1>
      </div>
      <SideBarTool items={filterLineUpItems}>
        <p>exemple</p>
      </SideBarTool>
    </section>
  );
}
