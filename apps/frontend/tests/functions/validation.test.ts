import { isEmpty } from "@/functions/validation";

// ---------------------------------------------------------------------------

describe("isEmpty", () => {
  it("retourne true pour une chaine vide", () => {
    expect(isEmpty("")).toBe(true);
  });

  it("retourne true pour une chaine ne contenant que des espaces", () => {
    // les chaines avec uniquement des espaces sont considerees comme vides apres trim
    expect(isEmpty("   ")).toBe(true);
  });

  it("retourne false pour une chaine non vide", () => {
    expect(isEmpty("texte")).toBe(false);
  });
});
