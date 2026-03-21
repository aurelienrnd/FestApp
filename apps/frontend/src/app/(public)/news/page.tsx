import SideBarTool from "../../../components/SideBarTool";
import { filterNewsItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";

/** Page publique des articles du festival. */
export default function Page() {
  return (
    <section className="section-page">
      <div className="flex justify-center items-center gap-(--space-md)">
        <AddButton items={filterNewsItems} />
        <h1 className="title1">News</h1>
      </div>
      <SideBarTool items={filterNewsItems}>
        <p>News</p>
      </SideBarTool>
    </section>
  );
}
