import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContactUs from "../../../src/components/ContactUs";
import { ApiRequestError } from "../../../src/functions/apiRequest";

const mockApiRequest = vi.fn();

// Mock de `apiRequest` pour simuler les reponses API sans appel reseau
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

describe("ContactUs", () => {
  // Reinitialise le mock avant chaque test
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  // Nettoie le DOM et restaure les mocks apres chaque test
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the contact form with submit button disabled by default", () => {
    // Monte le composant
    render(<ContactUs />);

    // Verifie que tous les champs sont presents et que le bouton est desactive
    expect(screen.getByPlaceholderText("Nom Prenom")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Sujet")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Tapez votre texte ici"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("enables submit button when all fields are filled", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Monte le composant
    render(<ContactUs />);

    // Remplit tous les champs du formulaire
    await user.type(screen.getByPlaceholderText("Nom Prenom"), "Jean Dupont");
    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.fr");
    await user.type(screen.getByPlaceholderText("Sujet"), "Demande info");
    await user.type(
      screen.getByPlaceholderText("Tapez votre texte ici"),
      "Bonjour",
    );

    // Verifie que le bouton est maintenant actif
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled();
  });

  it("submits the form and shows success message", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une reponse API en succes
    mockApiRequest.mockResolvedValue({ data: { message: "Message envoye" }, error: null });

    // Monte le composant
    render(<ContactUs />);

    // Remplit tous les champs puis soumet le formulaire
    await user.type(screen.getByPlaceholderText("Nom Prenom"), "Jean Dupont");
    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.fr");
    await user.type(screen.getByPlaceholderText("Sujet"), "Demande info");
    await user.type(
      screen.getByPlaceholderText("Tapez votre texte ici"),
      "Bonjour",
    );
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // Verifie que le message de succes s'affiche et que le formulaire disparait
    expect(
      await screen.findByText("votre message est envoye"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Envoyer" }),
    ).not.toBeInTheDocument();
  });

  it("shows backend error message on 400", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une reponse API en erreur 400 avec un message explicite du backend
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError("Donnees invalides", 400),
    });

    // Monte le composant
    render(<ContactUs />);

    // Remplit tous les champs puis soumet le formulaire
    await user.type(screen.getByPlaceholderText("Nom Prenom"), "Jean Dupont");
    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.fr");
    await user.type(screen.getByPlaceholderText("Sujet"), "Demande info");
    await user.type(
      screen.getByPlaceholderText("Tapez votre texte ici"),
      "Bonjour",
    );
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // Verifie que le message d'erreur s'affiche et que le formulaire reste visible
    expect(await screen.findByText("Donnees invalides")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
  });

  it("shows server fallback message on 500", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une reponse API en erreur 500 sans message explicite
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    // Monte le composant
    render(<ContactUs />);

    // Remplit tous les champs puis soumet le formulaire
    await user.type(screen.getByPlaceholderText("Nom Prenom"), "Jean Dupont");
    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.fr");
    await user.type(screen.getByPlaceholderText("Sujet"), "Demande info");
    await user.type(
      screen.getByPlaceholderText("Tapez votre texte ici"),
      "Bonjour",
    );
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // Verifie que le message de fallback serveur s'affiche et que le formulaire reste visible
    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
  });
});
