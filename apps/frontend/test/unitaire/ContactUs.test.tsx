import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactUs from "../../src/components/ContactUs";

describe("ContactUs", () => {
  // Réinitialise le DOM et les mocks entre chaque test
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the contact form with submit button disabled by default", () => {
    // Monte le composant
    render(<ContactUs />);

    expect(screen.getByPlaceholderText("Nom Prenom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Sujet")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Tapez votre texte ici"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("enables submit button when all fields are filled", async () => {
    // Initialise un utilisateur puis monte le composant
    const user = userEvent.setup();
    render(<ContactUs />);

    await user.type(screen.getByPlaceholderText("Nom Prenom"), "Jean Dupont");
    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.fr");
    await user.type(screen.getByPlaceholderText("Sujet"), "Demande info");
    await user.type(
      screen.getByPlaceholderText("Tapez votre texte ici"),
      "Bonjour",
    );

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled();
  });

  it("submits the form and shows success message", async () => {
    // Initialise un utilisateur, mock le log puis monte le composant
    const user = userEvent.setup();
    render(<ContactUs />);

    await user.type(screen.getByPlaceholderText("Nom Prenom"), "Jean Dupont");
    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.fr");
    await user.type(screen.getByPlaceholderText("Sujet"), "Demande info");
    await user.type(
      screen.getByPlaceholderText("Tapez votre texte ici"),
      "Bonjour",
    );
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(screen.getByText("votre message est envoye")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Envoyer" }),
    ).not.toBeInTheDocument();
  });
});

