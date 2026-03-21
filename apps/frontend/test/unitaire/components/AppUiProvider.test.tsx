import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppUiProvider, useAppUi } from "../../../src/components/AppUiProvider";

// Mock pour remplacer la vraie URL par une valeur controllee
let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Composant consommateur qui expose les valeurs du contexte dans le DOM
function Consumer() {
  const { isAdminPath } = useAppUi();
  return (
    <div>
      <span>admin:{String(isAdminPath)}</span>
    </div>
  );
}

describe("AppUiProvider", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes isAdminPath:true on admin route", () => {
    // Simule une URL admin
    mockPathname = "/admin/dashboard";

    // Monte le composant
    render(
      <AppUiProvider>
        <Consumer />
      </AppUiProvider>,
    );

    expect(screen.getByText("admin:true")).toBeInTheDocument();
  });

  it("exposes isAdminPath:false on public route", () => {
    // Simule une URL publique (non admin)
    mockPathname = "/";

    // Monte le composant
    render(
      <AppUiProvider>
        <Consumer />
      </AppUiProvider>,
    );

    expect(screen.getByText("admin:false")).toBeInTheDocument();
  });

  it("throws when useAppUi is used outside AppUiProvider", () => {
    // Supprime les erreurs React dans la console pour ne pas polluer la sortie du test
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Composant qui utilise le hook sans provider parent
    function BadComponent() {
      useAppUi();
      return null;
    }

    // Verifie que le rendu sans provider leve bien l'erreur attendue
    expect(() => render(<BadComponent />)).toThrow(
      "useAppUi must be used within AppUiProvider",
    );
    consoleError.mockRestore();
  });
});
