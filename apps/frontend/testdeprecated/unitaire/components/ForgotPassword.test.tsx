import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPassword from "../../../src/components/ForgotPassword";
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

describe("ForgotPassword", () => {
  // Reinitialise le mock avant chaque test
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  // Nettoie le DOM et restaure les mocks apres chaque test
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the form with submit button disabled when email is empty", () => {
    // Monte le composant
    render(<ForgotPassword />);

    // Verifie que le champ email est present et que le bouton est desactive
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("enables submit button when email is filled", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Monte le composant
    render(<ForgotPassword />);

    // Saisit un email valide dans le champ
    await user.type(screen.getByPlaceholderText("Votre email"), "admin@test.fr");

    // Verifie que le bouton est maintenant actif
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeEnabled();
  });

  it("shows success message and hides form on success", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une reponse API en succes
    mockApiRequest.mockResolvedValue({ data: { message: "OK" }, error: null });

    // Monte le composant
    render(<ForgotPassword />);

    // Remplit le champ email puis soumet le formulaire
    await user.type(screen.getByPlaceholderText("Votre email"), "admin@test.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // Verifie que le message de succes s'affiche et que le formulaire disparait
    expect(
      await screen.findByText("Un nouveau mot de passe vous a ete envoye par email."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Envoyer" }),
    ).not.toBeInTheDocument();
  });

  it("shows backend error message on 404", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une reponse API en erreur 404 avec un message explicite du backend
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError("Aucun compte associe a cet email", 404),
    });

    // Monte le composant
    render(<ForgotPassword />);

    // Remplit le champ email puis soumet le formulaire
    await user.type(screen.getByPlaceholderText("Votre email"), "inconnu@test.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // Verifie que le message d'erreur s'affiche et que le formulaire reste visible
    expect(
      await screen.findByText("Aucun compte associe a cet email"),
    ).toBeInTheDocument();
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
    render(<ForgotPassword />);

    // Remplit le champ email puis soumet le formulaire
    await user.type(screen.getByPlaceholderText("Votre email"), "admin@test.fr");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // Verifie que le message de fallback serveur s'affiche et que le formulaire reste visible
    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeInTheDocument();
  });
});
