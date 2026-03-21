import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppUiProvider, useAppUi } from "../../../src/components/AppUiProvider";

// Mock pour remplacer la vraie URL par une valeur controllee
let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Composant consommateur qui expose les valeurs du contexte dans le DOM
function Consumer() {
  const { isAdminPath, isDesktop } = useAppUi();
  return (
    <div>
      <span>admin:{String(isAdminPath)}</span>
      <span>desktop:{String(isDesktop)}</span>
    </div>
  );
}

describe("AppUiProvider", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes admin flag and desktop state", async () => {
    // Simule une URL admin
    mockPathname = "/admin/dashboard";

    // Mock la media query pour simuler un ecran desktop (au moins 768px)
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    // Monte le composant
    render(
      <AppUiProvider>
        <Consumer />
      </AppUiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("admin:true")).toBeInTheDocument();
      expect(screen.getByText("desktop:true")).toBeInTheDocument();
    });
  });

  it("exposes isDesktop:false when viewport is mobile", async () => {
    // Simule une URL publique (non admin)
    mockPathname = "/";

    // Mock la media query pour simuler un ecran mobile (moins de 768px)
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    // Monte le composant
    render(
      <AppUiProvider>
        <Consumer />
      </AppUiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("desktop:false")).toBeInTheDocument();
      expect(screen.getByText("admin:false")).toBeInTheDocument();
    });
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
