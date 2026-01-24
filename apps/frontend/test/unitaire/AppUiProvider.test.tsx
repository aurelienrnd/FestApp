import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppUiProvider, useAppUi } from "../../src/components/AppUiProvider";

// Mock pour remplacer la vraie URL par une valeur
let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Récupère les valeurs `isAdminPath` et `isDesktop` depuis le contexte
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
  it("exposes admin flag and desktop state", async () => {
    // Simule une URL admin
    mockPathname = "/admin/dashboard";

    // Mock pour savoir ci le media query est vrais ou fausse
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(), // ecoute pour savoir ci le media query change
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
});
