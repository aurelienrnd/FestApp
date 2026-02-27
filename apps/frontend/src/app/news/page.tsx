import SideBarTool from "../../components/SideBarTool";
import { navDashBordItems } from "../../config/navigation";

export default function Page() {
  return (
    <section className="section-page flex flex-col flex-1 text-xl md:text-4xl">
      <h1 className="title1">News</h1>

      <SideBarTool items={navDashBordItems}>
        <p>News</p>
      </SideBarTool>
    </section>
  );
}
