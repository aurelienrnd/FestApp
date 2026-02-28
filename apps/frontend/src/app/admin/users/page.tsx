import SideBarTool from "../../../components/SideBarTool";
import { filterUsersItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";

export default function Page() {
  return (
    <section className="section-page">
      <div className="flex justify-center item-center gap-(--gap-content-small)">
        <AddButton items={filterUsersItems} />
        <h1 className="title1">Admin Users</h1>
      </div>
      <SideBarTool items={filterUsersItems}>
        <p>exemple</p>
      </SideBarTool>
    </section>
  );
}
