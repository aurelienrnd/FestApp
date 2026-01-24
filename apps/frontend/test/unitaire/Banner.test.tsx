import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Banner from "../../src/components/Banner";

// Mock du hook useAppUi pour contrôler les valeurs retournées par le contexte.
const mockUseAppUi = vi.fn();
vi.mock("../../src/components/AppUiProvider", () => ({
  useAppUi: () => mockUseAppUi(),
}));

// Mock du composant Image de Next.js
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

// Mock pour remplacer <Link> par une balise <a>
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Banner", () => {
  // Réinitialise le mock apres chaque utilisation
  afterEach(() => {
    cleanup();
    mockUseAppUi.mockReset();
  });

  it("renders desktop navigation when isDesktop is true", () => {
    // Simulation de UseAppUi
    mockUseAppUi.mockReturnValue({
      pathname: "/",
      isAdminPath: false,
      isDesktop: true,
    });

    // Monte le composent
    render(<Banner />);

    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Billetterie")).toBeInTheDocument();
  });

  it("renders mobile navigation when isDesktop is false", () => {
    // Simulation de UseAppUi
    mockUseAppUi.mockReturnValue({
      pathname: "/",
      isAdminPath: false,
      isDesktop: false,
    });

    // Monte le composent
    render(<Banner />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("hides the ticket button on admin routes", () => {
    // Simulation de UseAppUi
    mockUseAppUi.mockReturnValue({
      pathname: "/admin/dashboard",
      isAdminPath: true,
      isDesktop: true,
    });

    // Monte le composent
    render(<Banner />);

    expect(screen.queryByText("Billetterie")).not.toBeInTheDocument();
  });
});
