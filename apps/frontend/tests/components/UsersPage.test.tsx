import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "@/app/admin/users/page";
import { useFetch } from "@/hooks/useFetch";
import { useAdminUser } from "@/components/AdminUserProvider";
import type { UserItem } from "@/type";

// next/navigation : mock de useRouter pour eviter les erreurs Next.js en jsdom
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// next/link : balise a standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// mock du hook useFetch pour controler les donnees retournees
vi.mock("@/hooks/useFetch");

// mock de useAdminUser pour simuler l'utilisateur connecte
vi.mock("@/components/AdminUserProvider", () => ({
  useAdminUser: vi.fn(),
}));

// mock de useNavPath pour eviter les erreurs de navigation en jsdom
vi.mock("@/hooks/useNavPath", () => ({
  useNavPath: vi.fn().mockReturnValue({ isAdminPath: true, pathname: "/admin/users" }),
}));

// mock de useRoleGuard : aucune redirection dans les tests
vi.mock("@/hooks/useRoleGuard", () => ({
  useRoleGuard: vi.fn(),
}));

// mock de AddUserModal : div identifiable pour verifier l'ouverture
vi.mock("@/app/admin/users/AddUserModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Modale ajout utilisateur</div> : null,
}));

// mock de DeleteModal : non utilise dans ces tests
vi.mock("@/components/modals/DeleteModal", () => ({
  default: () => null,
}));

// utilisateurs avec des roles differents pour tester le filtre
const mockAdminUser: UserItem = {
  id: "uuid-1",
  email: "admin@test.com",
  display_name: "Admin User",
  role: "admin",
  created_at: "2024-01-01T00:00:00Z",
  password_changed_at: null,
};

const mockArtistsUser: UserItem = {
  id: "uuid-2",
  email: "artists@test.com",
  display_name: "Artists User",
  role: "artists",
  created_at: "2024-01-01T00:00:00Z",
  password_changed_at: null,
};

const mockNewsUser: UserItem = {
  id: "uuid-3",
  email: "news@test.com",
  display_name: "News User",
  role: "news",
  created_at: "2024-01-01T00:00:00Z",
  password_changed_at: null,
};

beforeEach(() => {
  mockPush.mockClear();
  vi.mocked(useFetch).mockReturnValue({
    data: { users: [mockAdminUser, mockArtistsUser, mockNewsUser] },
    isLoading: false,
    error: null,
  });
  // utilisateur connecte different des utilisateurs de la liste
  vi.mocked(useAdminUser).mockReturnValue({
    user: { id: "uuid-99", email: "other@test.com", name: "Other", role: "admin" },
  });
});

// ---------------------------------------------------------------------------

describe("UsersPage", () => {
  it("filtre les utilisateurs par role apres clic sur un filtre", async () => {
    const user = userEvent.setup();

    render(<Page />);

    // tous les utilisateurs sont visibles par defaut
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Artists User")).toBeInTheDocument();
    expect(screen.getByText("News User")).toBeInTheDocument();

    // clic sur le filtre "Admin" dans la navigation
    await user.click(screen.getByRole("button", { name: "Admin" }));

    // seul l'utilisateur admin doit rester visible
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.queryByText("Artists User")).not.toBeInTheDocument();
    expect(screen.queryByText("News User")).not.toBeInTheDocument();
  });

  it("ouvre la modale d'ajout au clic sur le bouton dedie", async () => {
    const user = userEvent.setup();

    render(<Page />);

    await user.click(screen.getByRole("button", { name: "Ajouter un utilisateur" }));

    expect(screen.getByText("Modale ajout utilisateur")).toBeInTheDocument();
  });
});
