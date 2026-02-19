import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Footer from "../../src/components/Footer";

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

// Mock des icones pour simplifier le rendu du composant
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

// Mock des contenus de modales pour verifier lequel est affiché
vi.mock("../../src/components/LegalMention", () => ({
  default: () => <div>LegalMention content</div>,
}));
vi.mock("../../src/components/ContactUs", () => ({
  default: () => <div>ContactUs content</div>,
}));

describe("Footer", () => {
  // Réinitialise le DOM entre chaque test
  afterEach(() => {
    cleanup();
  });

  it("opens and closes the mentions legales modal", async () => {
    // Initialise un utilisateur puis monte le composant
    const user = userEvent.setup();
    render(<Footer />);

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mentions legales" }));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mentions legales" }),
    ).toBeInTheDocument();
    expect(screen.getByText("LegalMention content")).toBeInTheDocument();
    expect(screen.queryByText("ContactUs content")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fermer la modal" }));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("opens the nous contacter modal and shows the right content", async () => {
    // Initialise un utilisateur puis monte le composant
    const user = userEvent.setup();
    render(<Footer />);

    await user.click(screen.getByRole("button", { name: "Nous contacter" }));

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nous contacter" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ContactUs content")).toBeInTheDocument();
    expect(screen.queryByText("LegalMention content")).not.toBeInTheDocument();
  });
});
