import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AddUserModal from "../../../src/app/admin/users/AddUserModal";
import { ApiRequestError } from "../../../src/functions/apiRequest";
import type { UserRole } from "../../../src/types";

// Mock de react-modal — affiche le contenu si isOpen est true
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

// Mock de apiRequest pour eviter les appels reseau
const mockApiRequest = vi.fn();
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

// Callbacks mockes passes en props a la modale
const mockOnClose = vi.fn();
const mockHandleUser = vi.fn();

// Props par defaut pour les tests en mode creation
const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  handleUser: mockHandleUser,
};

// Donnees de test simulant la reponse de l'API apres creation
const mockCreatedUser = {
  id: "user-1",
  email: "john@test.fr",
  display_name: "John Doe",
  role: "lineup" as UserRole,
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("AddUserModal", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockOnClose.mockReset();
    mockHandleUser.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("desactive le bouton Ajouter quand les champs sont vides", () => {
    render(<AddUserModal {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("active le bouton Ajouter quand tous les champs sont remplis", async () => {
    const user = userEvent.setup();
    render(<AddUserModal {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("Prenom"), "John");
    await user.type(screen.getByPlaceholderText("Nom"), "Doe");
    await user.type(screen.getByPlaceholderText("Email"), "john@test.fr");
    await user.selectOptions(screen.getByRole("combobox"), "lineup");

    expect(screen.getByRole("button", { name: "Ajouter" })).toBeEnabled();
  });

  it("appelle POST /admin/users avec le bon body en mode creation", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { user: mockCreatedUser },
      error: null,
    });

    render(<AddUserModal {...defaultProps} />);
    await user.type(screen.getByPlaceholderText("Prenom"), "John");
    await user.type(screen.getByPlaceholderText("Nom"), "Doe");
    await user.type(screen.getByPlaceholderText("Email"), "john@test.fr");
    await user.selectOptions(screen.getByRole("combobox"), "lineup");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(mockApiRequest).toHaveBeenCalledWith("/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john@test.fr",
        first_name: "John",
        last_name: "Doe",
        role: "lineup",
      }),
    });
    expect(mockHandleUser).toHaveBeenCalledWith(mockCreatedUser);
  });

  it("appelle PATCH /admin/users/:id en mode edition", async () => {
    const userToEdit = {
      id: "user-42",
      email: "old@test.fr",
      display_name: "Old Name",
      role: "admin" as UserRole,
      created_at: "2026-01-01T00:00:00.000Z",
    };
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { user: { ...userToEdit, email: "new@test.fr" } },
      error: null,
    });

    render(<AddUserModal {...defaultProps} userToEdit={userToEdit} />);
    const emailInput = screen.getByPlaceholderText("Email");
    await user.clear(emailInput);
    await user.type(emailInput, "new@test.fr");
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(mockApiRequest).toHaveBeenCalledWith(
      `/admin/users/${userToEdit.id}`,
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(mockHandleUser).toHaveBeenCalled();
  });

  it("affiche un message d'erreur quand l'API echoue", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    render(<AddUserModal {...defaultProps} />);
    await user.type(screen.getByPlaceholderText("Prenom"), "John");
    await user.type(screen.getByPlaceholderText("Nom"), "Doe");
    await user.type(screen.getByPlaceholderText("Email"), "john@test.fr");
    await user.selectOptions(screen.getByRole("combobox"), "lineup");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(mockHandleUser).not.toHaveBeenCalled();
  });

  it("pre-remplit les champs en mode edition", () => {
    const userToEdit = {
      id: "user-42",
      email: "john@test.fr",
      display_name: "John Doe",
      role: "lineup" as UserRole,
      created_at: "2026-01-01T00:00:00.000Z",
    };

    render(<AddUserModal {...defaultProps} userToEdit={userToEdit} />);

    expect(screen.getByPlaceholderText("Prenom")).toHaveValue("John");
    expect(screen.getByPlaceholderText("Nom")).toHaveValue("Doe");
    expect(screen.getByPlaceholderText("Email")).toHaveValue("john@test.fr");
    expect(screen.getByRole("button", { name: "Modifier" })).toBeInTheDocument();
  });
});
