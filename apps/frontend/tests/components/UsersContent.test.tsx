import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersContent from "@/app/admin/users/UsersContent";
import { useFetch } from "@/hooks/useFetch";
import { useAdminUser } from "@/components/AdminUserProvider";
import type { UserItem } from "@/type";

// next/navigation : mock de useRouter pour verifier la redirection sans Next.js
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// mock du hook useFetch pour controler les donnees retournees
vi.mock("@/hooks/useFetch");

// mock de useAdminUser pour simuler l'utilisateur connecte
vi.mock("@/components/AdminUserProvider", () => ({
  useAdminUser: vi.fn(),
}));

// mock de AddUserModal : expose un bouton qui appelle handleUserSaved directement
// distingue le mode ajout (pas de userToEdit) du mode edition (userToEdit present)
// permet de tester l'ajout et la modification optimistes sans passer par le formulaire
vi.mock("@/app/admin/users/AddUserModal", () => ({
  default: ({
    isOpen,
    handleUserSaved,
    userToEdit,
  }: {
    isOpen: boolean;
    handleUserSaved: (user: UserItem) => void;
    userToEdit?: UserItem;
  }) =>
    isOpen ? (
      <button
        onClick={() => handleUserSaved(userToEdit ? mockUpdatedUser : mockNewUser)}
      >
        {userToEdit ? "Simuler modification" : "Simuler ajout"}
      </button>
    ) : null,
}));

// mock de DeleteModal : expose un bouton qui appelle onDeleted directement
// permet de tester la suppression optimiste sans passer par la confirmation
vi.mock("@/components/modals/DeleteModal", () => ({
  default: ({
    isOpen,
    item,
    onDeleted,
  }: {
    isOpen: boolean;
    item: { id: string } | null;
    onDeleted: (id: string) => void;
  }) =>
    isOpen && item ? (
      <button onClick={() => onDeleted(item.id)}>Simuler suppression</button>
    ) : null,
}));

// utilisateur existant retourne par l'API
const mockUser: UserItem = {
  id: "uuid-1",
  email: "admin@test.com",
  display_name: "Admin Test",
  role: "admin",
  created_at: "2024-01-01T00:00:00Z",
  password_changed_at: null,
};

// nouvel utilisateur ajoute via la modale
const mockNewUser: UserItem = {
  id: "uuid-2",
  email: "news@test.com",
  display_name: "Nouvel Utilisateur",
  role: "news",
  created_at: "2024-02-01T00:00:00Z",
  password_changed_at: null,
};

// utilisateur modifie retourne par la modale d'edition
const mockUpdatedUser: UserItem = {
  ...mockUser,
  display_name: "Admin Modifie",
  email: "admin.modifie@test.com",
};

beforeEach(() => {
  mockPush.mockClear();
  vi.mocked(useFetch).mockReturnValue({
    data: { users: [mockUser] },
    isLoading: false,
    error: null,
  });
  // utilisateur connecte different de mockUser pour ne pas declencher la redirection par defaut
  vi.mocked(useAdminUser).mockReturnValue({
    user: { id: "uuid-99", email: "other@test.com", display_name: "Other", role: "admin" },
    mustChangePassword: false,
  });
});

// ---------------------------------------------------------------------------

describe("UsersContent", () => {
  it("affiche les utilisateurs retournes par l'API", () => {
    // rendu avec un utilisateur retourne par useFetch
    render(<UsersContent />);

    expect(screen.getByText("Admin Test")).toBeInTheDocument();
  });

  it("ajoute l'utilisateur a la liste localement apres un ajout reussi", async () => {
    const user = userEvent.setup();

    // rendu avec la modale d'ajout ouverte
    render(<UsersContent isAddModalOpen={true} />);

    // simuler un ajout via le bouton expose par le mock de AddUserModal
    await user.click(screen.getByText("Simuler ajout"));

    // le nouvel utilisateur doit apparaitre dans la liste sans refetch
    expect(screen.getByText("Nouvel Utilisateur")).toBeInTheDocument();
  });

  it("retire l'utilisateur de la liste localement apres une suppression reussie", async () => {
    const user = userEvent.setup();

    render(<UsersContent />);

    expect(screen.getByText("Admin Test")).toBeInTheDocument();

    // ouvrir la modale de suppression via le bouton Supprimer de la carte
    await user.click(screen.getByRole("button", { name: "Supprimer" }));

    // simuler la suppression via le bouton expose par le mock de DeleteModal
    await user.click(screen.getByText("Simuler suppression"));

    // l'utilisateur doit avoir disparu de la liste sans refetch
    expect(screen.queryByText("Admin Test")).not.toBeInTheDocument();
  });

  it("met a jour l'utilisateur dans la liste localement apres une modification reussie", async () => {
    const user = userEvent.setup();

    render(<UsersContent />);

    // ouvrir la modale d'edition via le bouton Modifier de la carte
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    // simuler la modification via le bouton expose par le mock de AddUserModal
    await user.click(screen.getByText("Simuler modification"));

    // le display_name mis a jour doit remplacer l'ancien sans refetch
    expect(screen.getByText("Admin Modifie")).toBeInTheDocument();
    expect(screen.queryByText("Admin Test")).not.toBeInTheDocument();
  });

  it("redirige vers /login si l'utilisateur supprime est l'utilisateur connecte", async () => {
    const user = userEvent.setup();

    // l'utilisateur connecte est le meme que celui dans la liste (uuid-1)
    vi.mocked(useAdminUser).mockReturnValue({
      user: { id: "uuid-1", email: "admin@test.com", display_name: "Admin Test", role: "admin" },
      mustChangePassword: false,
    });

    render(<UsersContent />);

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(screen.getByText("Simuler suppression"));

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("clic sur 'Modifier' ouvre la modale d'edition", async () => {
    const user = userEvent.setup();

    render(<UsersContent />);

    await user.click(screen.getByRole("button", { name: "Modifier" }));

    // le mock de AddUserModal expose "Simuler modification" quand userToEdit est present
    expect(screen.getByText("Simuler modification")).toBeInTheDocument();
  });

  it("clic sur 'Supprimer' ouvre la modale de suppression", async () => {
    const user = userEvent.setup();

    render(<UsersContent />);

    await user.click(screen.getByRole("button", { name: "Supprimer" }));

    expect(screen.getByText("Simuler suppression")).toBeInTheDocument();
  });
});
