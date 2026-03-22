import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Banner from "../../../src/components/Banner";
import { ApiRequestError } from "../../../src/functions/apiRequest";

const mockPush = vi.fn();
const mockApiRequest = vi.fn();

// Mock `useRouter` pour controler et verifier les redirections pendant le test
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock de `apiRequest` pour simuler les reponses API sans appel reseau
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

// Mock du hook useNavPath pour contrôler les valeurs retournées par le hook
const mockUseNavPath = vi.fn();
vi.mock("../../../src/hooks/useNavPath", () => ({
  useNavPath: () => mockUseNavPath(),
}));

// Mock du hook useIsDesktop pour contrôler le mode desktop dans les tests
const mockUseIsDesktop = vi.fn();
vi.mock("../../../src/hooks/useIsDesktop", () => ({
  useIsDesktop: () => mockUseIsDesktop(),
}));

// Mock du hook useAdminUser pour controler l'utilisateur connecte dans les tests
const mockUseAdminUser = vi.fn();
vi.mock("../../../src/components/AdminUserProvider", () => ({
  useAdminUser: () => mockUseAdminUser(),
}));

// Mock du composant Image de Next.js
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

// Mock pour remplacer <Link> par une balise <a>
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

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

describe("Banner", () => {
  // Réinitialise les mocks apres chaque utilisation
  afterEach(() => {
    cleanup();
    mockUseNavPath.mockReset();
    mockUseIsDesktop.mockReset();
    mockUseAdminUser.mockReset();
    mockPush.mockReset();
    mockApiRequest.mockReset();
  });

  it("renders desktop navigation when isDesktop is true", () => {
    // Simule une route publique en mode desktop
    mockUseNavPath.mockReturnValue({ pathname: "/", isAdminPath: false });
    mockUseIsDesktop.mockReturnValue(true);
    mockUseAdminUser.mockReturnValue(null);

    // Monte le composant
    render(<Banner />);

    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Billetterie")).toBeInTheDocument();
  });

  it("renders mobile navigation when isDesktop is false", () => {
    // Simule une route publique en mode mobile
    mockUseNavPath.mockReturnValue({ pathname: "/", isAdminPath: false });
    mockUseIsDesktop.mockReturnValue(false);
    mockUseAdminUser.mockReturnValue(null);

    // Monte le composant
    render(<Banner />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("hides the ticket button on admin routes", () => {
    // Simule une route admin en mode desktop avec un utilisateur admin
    mockUseNavPath.mockReturnValue({ pathname: "/admin/dashboard", isAdminPath: true });
    mockUseIsDesktop.mockReturnValue(true);
    mockUseAdminUser.mockReturnValue({ user: { id: "1", email: "a@a.fr", display_name: "Admin", role: "admin" }, mustChangePassword: false });

    // Monte le composant
    render(<Banner />);

    expect(screen.queryByText("Billetterie")).not.toBeInTheDocument();
  });

  it("redirects to /login after successful logout", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une route admin en mode desktop avec un utilisateur admin
    mockUseNavPath.mockReturnValue({ pathname: "/admin/dashboard", isAdminPath: true });
    mockUseIsDesktop.mockReturnValue(true);
    mockUseAdminUser.mockReturnValue({ user: { id: "1", email: "a@a.fr", display_name: "Admin", role: "admin" }, mustChangePassword: false });

    // Simule une deconnexion reussie retournant un message de confirmation
    mockApiRequest.mockResolvedValueOnce({ data: { message: "OK" }, error: null });

    // Monte le composant puis clique sur le bouton de deconnexion
    render(<Banner />);
    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("does not redirect when logout fails", async () => {
    // Initialise userEvent pour simuler les interactions utilisateur
    const user = userEvent.setup();

    // Simule une route admin en mode desktop avec un utilisateur admin
    mockUseNavPath.mockReturnValue({ pathname: "/admin/dashboard", isAdminPath: true });
    mockUseIsDesktop.mockReturnValue(true);
    mockUseAdminUser.mockReturnValue({ user: { id: "1", email: "a@a.fr", display_name: "Admin", role: "admin" }, mustChangePassword: false });

    // Simule une erreur serveur lors de la deconnexion
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    // Monte le composant puis clique sur le bouton de deconnexion
    render(<Banner />);
    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
