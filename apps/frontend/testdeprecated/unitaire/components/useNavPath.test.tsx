import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNavPath } from "../../../src/hooks/useNavPath";

// Mock pour remplacer la vraie URL par une valeur controllee
let mockPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Composant consommateur qui expose les valeurs du hook dans le DOM
function Consumer() {
  const { isAdminPath } = useNavPath();
  return (
    <div>
      <span>admin:{String(isAdminPath)}</span>
    </div>
  );
}

describe("useAppUi", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes isAdminPath:true on admin route", () => {
    mockPathname = "/admin/dashboard";
    render(<Consumer />);
    expect(screen.getByText("admin:true")).toBeInTheDocument();
  });

  it("exposes isAdminPath:false on public route", () => {
    mockPathname = "/";
    render(<Consumer />);
    expect(screen.getByText("admin:false")).toBeInTheDocument();
  });
});
