import { filterNavByRole, navAdminItem } from "@/config/ui";

// ---------------------------------------------------------------------------

describe("filterNavByRole", () => {
  it("retourne tous les items sans champ role (ex : Logout)", () => {
    // les items sans champ role doivent toujours etre inclus quel que soit le role
    const result = filterNavByRole(navAdminItem, "news");

    expect(result.some((item) => item.labelBtn === "Logout")).toBe(true);
  });

  it("retourne uniquement les items autorises pour le role admin", () => {
    // le role admin a acces a tous les items qui listent "admin" dans leur role
    const result = filterNavByRole(navAdminItem, "admin");

    const labels = result.map((item) => item.label ?? item.labelBtn);
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("Programation");
    expect(labels).toContain("News");
    expect(labels).toContain("Utilisateurs");
  });

  it("retourne uniquement les items autorises pour le role news", () => {
    // le role news ne doit pas voir les items reserves a admin ou artists
    const result = filterNavByRole(navAdminItem, "news");

    const labels = result.map((item) => item.label ?? item.labelBtn);
    expect(labels).toContain("Dashboard");
    expect(labels).toContain("News");
    expect(labels).not.toContain("Programation");
    expect(labels).not.toContain("Utilisateurs");
  });

  it("retourne un tableau vide si aucun item ne correspond au role", () => {
    // aucun item de cette liste ne contient "inconnu" dans son champ role
    const items = [
      { label: "Exclusif", path: "/exclusif", role: "superadmin" },
    ];

    const result = filterNavByRole(items, "inconnu");

    expect(result).toHaveLength(0);
  });
});
