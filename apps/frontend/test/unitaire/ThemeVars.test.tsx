import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ThemeVars from "../../src/components/ThemeVars";

// Mock de l'url de la page
let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("ThemeVars", () => {
  it("sets the admin theme for admin pages", async () => {
    // Simule une URL admin et monte le composant ThemeVars.
    mockPathname = "/admin/dashboard";
    render(<ThemeVars />);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("admin");
    });
  });

  it("sets the visitor theme for non-admin pages", async () => {
    // Simule une URL sans admin et monte le composant ThemeVars.
    mockPathname = "/";
    render(<ThemeVars />);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("visitor");
    });
  });
});
