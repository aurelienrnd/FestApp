import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Footer from "@/components/Footer";

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div>{children}</div> : null,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock de ContactUs : div identifiable pour verifier l'ouverture de la modale contact
vi.mock("@/components/ContactUs", () => ({
  default: () => <div>Formulaire contact</div>,
}));

// mock de LegalMention : div identifiable pour verifier l'ouverture de la modale mentions
vi.mock("@/components/LegalMention", () => ({
  default: () => <div>Mentions legales contenu</div>,
}));

// ---------------------------------------------------------------------------

describe("Footer", () => {
  it("ouvre la modale contact au clic sur 'Nous contacter'", async () => {
    const user = userEvent.setup();

    render(<Footer />);

    await user.click(screen.getByText("Nous contacter"));

    expect(screen.getByText("Formulaire contact")).toBeInTheDocument();
  });

  it("ouvre la modale mentions legales au clic sur 'Mentions legales'", async () => {
    const user = userEvent.setup();

    render(<Footer />);

    await user.click(screen.getByText("Mentions legales"));

    expect(screen.getByText("Mentions legales contenu")).toBeInTheDocument();
  });

  it("ferme la modale au clic sur le bouton fermer", async () => {
    const user = userEvent.setup();

    render(<Footer />);

    // ouvrir la modale contact
    await user.click(screen.getByText("Nous contacter"));
    expect(screen.getByText("Formulaire contact")).toBeInTheDocument();

    // fermer la modale via le bouton fermer
    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    expect(screen.queryByText("Formulaire contact")).not.toBeInTheDocument();
  });
});
