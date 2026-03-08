import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UsersContent from "../../src/app/admin/users/UsersContent";
import { ApiRequestError } from "../../src/functions/apiRequest";

// Création d’un mock pour simuler les appels à l’API
const mockApiRequest = vi.fn();

// Remplace uniquement la fonction apiRequest par un mock,
vi.mock("../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

// Mock du composant react-modal pour les tests affiche le contenu uniquement si isOpen est true
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

describe("UsersContent", () => {
  // Réinitialise le mock avant chaque test
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  // Nettoie le DOM et restaure les mocks après chaque test
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("loads and displays users list", async () => {
    // Simule une réponse API réussie retournant une liste d’utilisateurs
    mockApiRequest.mockResolvedValueOnce({
      data: {
        users: [
          {
            id: "user-1",
            email: "john@test.fr",
            display_name: "John Doe",
            is_active: true,
            role: "admin",
          },
        ],
      },
      error: null,
    });

    // Rend le composant UsersContent avec un refreshToken initial
    render(<UsersContent refreshToken={0} />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@test.fr")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("deletes a user and removes it from the list", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule deux appels API successifs :
    mockApiRequest
      // 1. Récupération de la liste des utilisateurs
      .mockResolvedValueOnce({
        data: {
          users: [
            {
              id: "user-1",
              email: "john@test.fr",
              display_name: "John Doe",
              is_active: true,
              role: "admin",
            },
            {
              id: "user-2",
              email: "jane@test.fr",
              display_name: "Jane Doe",
              is_active: true,
              role: "news",
            },
          ],
        },
        error: null,
      })
      // 2. Suppression réussie d’un utilisateur
      .mockResolvedValueOnce({
        data: { message: "Utilisateur supprime" },
        error: null,
      });

    // Rend le composant UsersContent avec un refreshToken initial
    render(<UsersContent refreshToken={0} />);

    // Attend que l’utilisateur "John Doe" soit affiché, puis clique sur le premier bouton "Supprimer"
    await screen.findByText("John Doe");
    await user.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);

    expect(
      screen.getByText(/Voulez-vous confirmer la suppression de/),
    ).toBeInTheDocument();

    // Clique sur le bouton "Confirmer" pour valider la suppression
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("L'utilisateur a ete supprime."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(2, "/admin/users/user-1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("shows error message when delete fails", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule deux appels API :
    mockApiRequest
      // 1. Chargement réussi de la liste des utilisateurs
      .mockResolvedValueOnce({
        data: {
          users: [
            {
              id: "user-1",
              email: "john@test.fr",
              display_name: "John Doe",
              is_active: true,
              role: "admin",
            },
          ],
        },
        error: null,
      })
      // 2. Échec de la suppression avec une erreur 500
      .mockResolvedValueOnce({
        data: null,
        error: new ApiRequestError(undefined, 500),
      });

    // Rend le composant UsersContent avec un refreshToken initial
    render(<UsersContent refreshToken={0} />);

    // Attend l’affichage de "John Doe", clique sur "Supprimer", puis confirme la suppression
    await screen.findByText("John Doe");
    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
  });
});
