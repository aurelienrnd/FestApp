import SideBarTool from "../../../components/SideBarTool";
import { filterNewsItems } from "../../../config/navigation";

export default function Page() {
  return (
    <section className="section-page flex flex-col flex-1 text-xl md:text-4xl">
      <h1 className="title1">Admin News</h1>

      <SideBarTool items={filterNewsItems}>
        <p>exemple</p>
      </SideBarTool>
    </section>
  );
}
