import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddUserModal from "@/app/admin/users/AddUserModal";
import { authClient } from "@/lib/auth-client";
import type { UserItem } from "@/type";

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock du client Better Auth pour controler createUser/updateUser/requestPasswordReset
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    admin: {
      createUser: vi.fn(),
      updateUser: vi.fn(),
    },
    requestPasswordReset: vi.fn(),
  },
}));

// utilisateur existant utilise pour tester le mode edition
const mockUserToEdit: UserItem = {
  id: "uuid-1",
  email: "jean.dupont@test.com",
  name: "Jean Dupont",
  role: "news",
  created_at: "2025-01-01T00:00:00Z",
};

beforeEach(() => {
  // reinitialise les mocks (et leur historique d'appels) entre chaque test
  vi.clearAllMocks();
  // par defaut : creation, modification et envoi du lien reussissent
  vi.mocked(authClient.admin.createUser).mockResolvedValue({
    data: {
      user: {
        id: "uuid-2",
        email: "nouveau@test.com",
        name: "Nouveau Utilisateur",
        role: "news",
        createdAt: new Date("2025-02-01T00:00:00Z"),
      },
    },
    error: null,
  } as never);
  vi.mocked(authClient.admin.updateUser).mockResolvedValue({
    data: {
      id: "uuid-1",
      email: "jean.modifie@test.com",
      name: "Jean Modifie",
      role: "admin",
      createdAt: new Date("2025-01-01T00:00:00Z"),
    },
    error: null,
  } as never);
  vi.mocked(authClient.requestPasswordReset).mockResolvedValue({
    data: { status: true },
    error: null,
  } as never);
});

// remplit le formulaire de creation
async function fillCreateForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Prenom"), "Nouveau");
  await user.type(screen.getByPlaceholderText("Nom"), "Utilisateur");
  await user.type(screen.getByPlaceholderText("Email"), "nouveau@test.com");
  await user.selectOptions(screen.getByRole("combobox"), "news");
}

// ---------------------------------------------------------------------------

describe("AddUserModal", () => {
  it("desactive le bouton 'Ajouter' si les champs requis sont vides", () => {
    // prenom, nom, email et role sont tous requis pour soumettre
    render(
      <AddUserModal isOpen={true} onClose={vi.fn()} handleUserSaved={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("un clic sur le bouton fermer appelle onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AddUserModal isOpen={true} onClose={onClose} handleUserSaved={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("splittes name en prenom et nom en mode edition", () => {
    // "Jean Dupont" doit etre decoupe en firstName="Jean" et lastName="Dupont"
    render(
      <AddUserModal
        isOpen={true}
        onClose={vi.fn()}
        handleUserSaved={vi.fn()}
        userToEdit={mockUserToEdit}
      />,
    );

    expect(screen.getByDisplayValue("Jean")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dupont")).toBeInTheDocument();
  });

  it("cree l'utilisateur via Better Auth et envoie un lien de reinitialisation", async () => {
    const user = userEvent.setup();
    const handleUserSaved = vi.fn();

    render(
      <AddUserModal isOpen={true} onClose={vi.fn()} handleUserSaved={handleUserSaved} />,
    );

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(authClient.admin.createUser).toHaveBeenCalledWith({
      email: "nouveau@test.com",
      name: "Nouveau Utilisateur",
      role: "news",
    });

    await waitFor(() =>
      expect(handleUserSaved).toHaveBeenCalledWith({
        id: "uuid-2",
        email: "nouveau@test.com",
        name: "Nouveau Utilisateur",
        role: "news",
        created_at: "2025-02-01T00:00:00.000Z",
      }),
    );

    expect(authClient.requestPasswordReset).toHaveBeenCalledWith({
      email: "nouveau@test.com",
      redirectTo: expect.stringMatching(/\/reset-password$/),
    });
  });

  it("affiche l'erreur retournee par Better Auth en mode creation", async () => {
    const user = userEvent.setup();
    vi.mocked(authClient.admin.createUser).mockResolvedValue({
      data: null,
      error: { message: "Email deja utilise." },
    } as never);

    render(
      <AddUserModal isOpen={true} onClose={vi.fn()} handleUserSaved={vi.fn()} />,
    );

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(await screen.findByText("Email deja utilise.")).toBeInTheDocument();
    // l'echec de la creation ne doit pas declencher l'envoi du lien
    expect(authClient.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("modifie l'utilisateur via Better Auth en mode edition", async () => {
    const user = userEvent.setup();
    const handleUserSaved = vi.fn();

    render(
      <AddUserModal
        isOpen={true}
        onClose={vi.fn()}
        handleUserSaved={handleUserSaved}
        userToEdit={mockUserToEdit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(authClient.admin.updateUser).toHaveBeenCalledWith({
      userId: "uuid-1",
      data: { email: "jean.dupont@test.com", name: "Jean Dupont", role: "news" },
    });

    await waitFor(() =>
      expect(handleUserSaved).toHaveBeenCalledWith({
        id: "uuid-1",
        email: "jean.modifie@test.com",
        name: "Jean Modifie",
        role: "admin",
        created_at: "2025-01-01T00:00:00.000Z",
      }),
    );
    // la modification ne passe jamais par le flux de reinitialisation de mot de passe
    expect(authClient.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("affiche l'erreur retournee par Better Auth en mode edition", async () => {
    const user = userEvent.setup();
    vi.mocked(authClient.admin.updateUser).mockResolvedValue({
      data: null,
      error: { message: "Email deja utilise." },
    } as never);

    render(
      <AddUserModal
        isOpen={true}
        onClose={vi.fn()}
        handleUserSaved={vi.fn()}
        userToEdit={mockUserToEdit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(await screen.findByText("Email deja utilise.")).toBeInTheDocument();
  });
});
