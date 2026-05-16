import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MobilNav } from "../../../src/components/Banner";
import { navVisitorItems } from "../../../src/config/navigation";

// Mock du composant Link, remplace par une simple balise <a>
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

// Mock de react-modal, rend une div uniquement quand la modal est ouverte
vi.mock("react-modal", () => {
  const Modal = ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null);
  Modal.setAppElement = () => {};
  return { default: Modal };
});

describe("MobilNav", () => {
  it("opens and closes the mobile modal", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Mock de la fonction logout passee en prop
    const onLogout = vi.fn();

    // Monte le composant avec les liens visiteur
    render(
      <MobilNav
        items={navVisitorItems}
        pathname="/"
        isAdminPath={false}
        onLogout={onLogout}
      />,
    );

    // Verifie que la modale est fermee, puis l'ouvre via le bouton hamburger
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    // Ferme la modale via le bouton de fermeture
    await user.click(screen.getByRole("button", { name: "Fermer la modal" }));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
