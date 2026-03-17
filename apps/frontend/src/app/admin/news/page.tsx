import SideBarTool from "../../../components/SideBarTool";
import { filterNewsItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";

/** Page admin de gestion des articles. */
export default function Page() {
  return (
    <section className="section-page">
      <div className="flex justify-center item-center gap-6">
        <AddButton items={filterNewsItems} className="mb-12" />
        <h1 className="title1">Admin News</h1>
      </div>
      <SideBarTool items={filterNewsItems}>
        <p>exemple</p>
      </SideBarTool>
    </section>
  );
}
