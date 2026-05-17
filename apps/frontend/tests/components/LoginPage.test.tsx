import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import { useMutation } from "@/hooks/useMutation";

// next/navigation : mock de useRouter pour verifier la redirection sans Next.js
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock de ForgotPassword : div identifiable pour verifier l'ouverture de la modale
vi.mock("@/components/ForgotPassword", () => ({
  default: () => <div>Formulaire mot de passe oublie</div>,
}));

// mock du hook useMutation pour controler mutate et error dans chaque test
vi.mock("@/hooks/useMutation");

const mockMutate = vi.fn();

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  mockPush.mockClear();
  vi.mocked(useMutation).mockReturnValue({
    mutate: mockMutate,
    isLoading: false,
    error: null,
    reset: vi.fn(),
  });
});

// ---------------------------------------------------------------------------

describe("LoginPage", () => {
  it("desactive le bouton 'Envoyer' si email ou mot de passe est vide", () => {
    // les deux champs sont requis pour soumettre le formulaire
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("affiche l'erreur retournee par l'API si la connexion echoue", () => {
    // l'erreur renvoyee par useMutation doit etre visible au-dessus du bouton
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: "Session expiree, merci de vous reconnecter.",
      reset: vi.fn(),
    });

    render(<LoginPage />);

    expect(
      screen.getByText("Session expiree, merci de vous reconnecter."),
    ).toBeInTheDocument();
  });

  it("redirige vers /admin/dashboard apres connexion reussie", async () => {
    // quand mutate appelle son callback, router.push doit etre appele avec la bonne route
    const user = userEvent.setup();

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn().mockImplementation((_data: unknown, onSuccess: () => void) => {
        onSuccess();
      }),
      isLoading: false,
      error: null,
      reset: vi.fn(),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Votre email"), "admin@test.com");
    await user.type(screen.getByPlaceholderText("Votre mot de passe"), "motdepasse");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("ouvre la modale mot de passe oublie au clic sur le bouton dedie", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByText("Mot de passe oublie"));

    expect(
      screen.getByText("Formulaire mot de passe oublie"),
    ).toBeInTheDocument();
  });

  it("ferme la modale mot de passe oublie au clic sur le bouton fermer", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    // ouvrir la modale
    await user.click(screen.getByText("Mot de passe oublie"));
    expect(
      screen.getByText("Formulaire mot de passe oublie"),
    ).toBeInTheDocument();

    // fermer la modale via le bouton fermer
    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    expect(
      screen.queryByText("Formulaire mot de passe oublie"),
    ).not.toBeInTheDocument();
  });
});
