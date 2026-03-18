import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../../../src/app/login/page";
import { ApiRequestError } from "../../../src/functions/apiRequest";

const mockPush = vi.fn();
const mockApiRequest = vi.fn();

// Mock `useRouter` pour contrôler et vérifier les redirections pendant le test.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock de `apiRequest`
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    // Redirige tous les appels à `apiRequest` vers le mock pour simuler les réponses API dans les tests.
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

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

// Mock du composant ForgotPassword pour verifier son affichage dans la modale
vi.mock("../../../src/components/ForgotPassword", () => ({
  default: () => <div>ForgotPassword content</div>,
}));

describe("Login page", () => {
  // Réinitialise le mock avant chaque test
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockPush.mockReset();
  });

  // Nettoie le DOM et restaure les mocks après chaque test
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows backend error message on 401", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une reponse API en erreur 401 avec un message explicite du backend
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError("Identifiants invalides", 401),
    });

    // Monte le composant
    render(<Page />);

    // Remplit le formulaire avec des identifiants incorrects puis soumet
    await user.type(
      screen.getByPlaceholderText("Votre email"),
      "admin@test.fr",
    );
    await user.type(screen.getByPlaceholderText("Votre mot de passe"), "wrong");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      await screen.findByText("Identifiants invalides"),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows fallback message on 429 when backend message is generic", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une reponse API en erreur 429 sans message explicite (trop de tentatives)
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError(undefined, 429),
    });

    // Monte le composant
    render(<Page />);

    // Remplit le formulaire puis soumet
    await user.type(
      screen.getByPlaceholderText("Votre email"),
      "admin@test.fr",
    );
    await user.type(screen.getByPlaceholderText("Votre mot de passe"), "wrong");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      await screen.findByText("Trop de tentatives, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
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
    render(<Page />);

    // Remplit le formulaire puis soumet
    await user.type(
      screen.getByPlaceholderText("Votre email"),
      "admin@test.fr",
    );
    await user.type(screen.getByPlaceholderText("Votre mot de passe"), "wrong");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("opens the forgot password modal", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Monte le composant
    render(<Page />);

    // Verifie que la modale est fermee puis clique sur le bouton mot de passe oublie
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Mot de passe oublie" }),
    );

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText("ForgotPassword content")).toBeInTheDocument();
  });

  it("closes the forgot password modal", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Monte le composant puis ouvre la modale
    render(<Page />);
    await user.click(
      screen.getByRole("button", { name: "Mot de passe oublie" }),
    );
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    // Ferme la modale via le bouton de fermeture
    await user.click(screen.getByRole("button", { name: "Fermer la modal" }));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("redirects to dashboard on success", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une connexion reussie retournant un message de confirmation
    mockApiRequest.mockResolvedValue({
      data: { message: "Connexion OK" },
      error: null,
    });

    // Monte le composant
    render(<Page />);

    // Remplit le formulaire avec des identifiants valides puis soumet
    await user.type(
      screen.getByPlaceholderText("Votre email"),
      "admin@test.fr",
    );
    await user.type(
      screen.getByPlaceholderText("Votre mot de passe"),
      "password123",
    );
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });
});
