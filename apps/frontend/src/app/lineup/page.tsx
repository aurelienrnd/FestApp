import SideBarTool from "../../components/SideBarTool";
import { filterLineUpItems } from "../../config/navigation";

export default function Page() {
  return (
    <section className="section-page flex flex-col flex-1 text-xl md:text-4xl">
      <h1 className="title1">Lineup</h1>

      <SideBarTool items={filterLineUpItems}>
        <p>exemple</p>
      </SideBarTool>
    </section>
  );
}
