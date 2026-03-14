import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
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
            role: "admin",

            created_at: "2026-03-12T10:15:30.000Z",
            password_changed_at: "2026-03-12T12:00:00.000Z",
          },
        ],
      },
      error: null,
    });

    // Rend le composant UsersContent
    render(<UsersContent />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@test.fr")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("adds a user and updates the list locally", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule deux appels API successifs :
    mockApiRequest
      // 1. Chargement initial de la liste (vide)
      .mockResolvedValueOnce({
        data: { users: [] },
        error: null,
      })
      // 2. Creation reussie d'un utilisateur
      .mockResolvedValueOnce({
        data: {
          message: "Utilisateur cree",
          temporary_password: "abc123456789def0",
          user: {
            id: "user-3",
            email: "new@test.fr",
            display_name: "New User",
            role: "news",

            created_at: "2026-03-12T10:30:00.000Z",
            password_changed_at: null,
          },
        },
        error: null,
      });

    // Rend le composant UsersContent avec la modale d'ajout ouverte
    render(<UsersContent isAddModalOpen />);

    // Remplit le formulaire d'ajout utilisateur puis soumet
    await user.type(screen.getByPlaceholderText("Prenom"), "New");
    await user.type(screen.getByPlaceholderText("Nom"), "User");
    await user.type(screen.getByPlaceholderText("Email"), "new@test.fr");
    await user.selectOptions(screen.getByLabelText("Role"), "news");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(await screen.findByText("New User")).toBeInTheDocument();
    expect(screen.getByText("new@test.fr")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(2, "/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "new@test.fr",
        first_name: "New",
        last_name: "User",
        role: "news",
      }),
    });
  });

  it("edits a user and updates the list locally", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule deux appels API successifs :
    mockApiRequest
      // 1. Chargement initial de la liste
      .mockResolvedValueOnce({
        data: {
          users: [
            {
              id: "user-1",
              email: "john@test.fr",
              display_name: "John Doe",
              role: "admin",

              created_at: "2026-03-12T10:15:30.000Z",
              password_changed_at: "2026-03-12T12:00:00.000Z",
            },
          ],
        },
        error: null,
      })
      // 2. Modification reussie de l'utilisateur
      .mockResolvedValueOnce({
        data: {
          message: "Utilisateur modifie",
          user: {
            id: "user-1",
            email: "john@test.fr",
            display_name: "Jane Doe",
            role: "admin",

            created_at: "2026-03-12T10:15:30.000Z",
            password_changed_at: "2026-03-12T12:00:00.000Z",
          },
        },
        error: null,
      });

    // Rend le composant UsersContent
    render(<UsersContent />);

    // Ouvre la modale de modification via le bouton de la liste
    await screen.findByText("John Doe");
    await user.click(screen.getAllByRole("button", { name: "Modifier" })[0]);
    const modal = screen.getByTestId("modal");

    // Met a jour le prenom puis soumet le formulaire
    await user.clear(screen.getByPlaceholderText("Prenom"));
    await user.type(screen.getByPlaceholderText("Prenom"), "Jane");
    await user.click(within(modal).getByRole("button", { name: "Modifier" }));

    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });
    expect(mockApiRequest).toHaveBeenNthCalledWith(2, "/admin/users/user-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john@test.fr",
        first_name: "Jane",
        last_name: "Doe",
        role: "admin",
      }),
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
              role: "admin",

              created_at: "2026-03-12T10:15:30.000Z",
              password_changed_at: "2026-03-12T12:00:00.000Z",
            },
            {
              id: "user-2",
              email: "jane@test.fr",
              display_name: "Jane Doe",
              role: "news",

              created_at: "2026-03-12T10:20:00.000Z",
              password_changed_at: null,
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

    // Rend le composant UsersContent
    render(<UsersContent />);

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
              role: "admin",

              created_at: "2026-03-12T10:15:30.000Z",
              password_changed_at: "2026-03-12T12:00:00.000Z",
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

    // Rend le composant UsersContent
    render(<UsersContent />);

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


