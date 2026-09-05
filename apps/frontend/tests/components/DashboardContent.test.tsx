import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardContent from "@/app/admin/dashboard/DashboardContent";
import { useAdminUser } from "@/components/AdminUserProvider";
import type { AdminAuthMeResponse } from "@/type";

// next/navigation : mock de useRouter pour eviter les erreurs Next.js en jsdom
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}));

// next/link : balise a standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// mock de useAdminUser pour simuler differents utilisateurs connectes
vi.mock("@/components/AdminUserProvider", () => ({
  useAdminUser: vi.fn(),
}));

// mock de ChangePasswordModal : div identifiable pour verifier l'ouverture
vi.mock("@/app/admin/dashboard/ChangePasswordModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Modale changement mot de passe</div> : null,
}));

// utilisateur admin connecte
const mockAdminUser: AdminAuthMeResponse = {
  session: { id: "session-1", userId: "uuid-1", expiresAt: "2099-01-01" },
  user: {
    id: "uuid-1",
    email: "admin@test.com",
    name: "Admin Test",
    role: "admin",
  },
};

// utilisateur avec le role "news"
const mockNewsUser: AdminAuthMeResponse = {
  session: { id: "session-2", userId: "uuid-2", expiresAt: "2099-01-01" },
  user: {
    id: "uuid-2",
    email: "news@test.com",
    name: "News Test",
    role: "news",
  },
};

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  vi.mocked(useAdminUser).mockReturnValue(mockAdminUser);
});

// ---------------------------------------------------------------------------

describe("DashboardContent", () => {
  it("retourne null si adminUser est null", () => {
    // sans utilisateur connecte, le composant ne doit rien afficher
    vi.mocked(useAdminUser).mockReturnValue(null);

    const { container } = render(<DashboardContent />);

    expect(container).toBeEmptyDOMElement();
  });

  it("affiche le name et le role de l'utilisateur connecte", () => {
    render(<DashboardContent />);

    expect(screen.getByText("Admin Test")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("affiche uniquement les liens accessibles selon le role", () => {
    // role "admin" voit tous les raccourcis, role "news" ne voit que News
    render(<DashboardContent />);

    expect(screen.getByText("programmation")).toBeInTheDocument();
    expect(screen.getByText("News")).toBeInTheDocument();
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument();

    // re-render avec un utilisateur news
    vi.mocked(useAdminUser).mockReturnValue(mockNewsUser);
    const { unmount } = render(<DashboardContent />);

    expect(screen.getAllByText("News")).toHaveLength(2);
    expect(screen.queryAllByText("programmation")).toHaveLength(1);
    expect(screen.queryAllByText("Utilisateurs")).toHaveLength(1);

    unmount();
  });

  it("ouvre la modale au clic sur le bouton 'Modifier'", async () => {
    const user = userEvent.setup();

    render(<DashboardContent />);

    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(screen.getByText("Modale changement mot de passe")).toBeInTheDocument();
  });
});
