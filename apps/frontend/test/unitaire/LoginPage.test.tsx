import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../../src/app/login/page";
import { ApiRequestError } from "../../src/functions/apiRequest";

const mockPush = vi.fn();
const mockApiRequest = vi.fn();

// Mock `useRouter` pour contrôler et vérifier les redirections pendant le test.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock de `apiRequest`
vi.mock("../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../src/functions/apiRequest");
  return {
    ...actual,
    // Redirige tous les appels à `apiRequest` vers le mock pour simuler les réponses API dans les tests.
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

// Mock de la modal mot de passe oublié
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

describe("Login page", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockPush.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows backend error message on 401", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError("Identifiants invalides", 401),
    });

    render(<Page />);

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
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError(undefined, 429),
    });

    render(<Page />);

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
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValue({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    render(<Page />);

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

  it("redirects to dashboard on success", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValue({
      data: { message: "Connexion OK" },
      error: null,
    });

    render(<Page />);

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
