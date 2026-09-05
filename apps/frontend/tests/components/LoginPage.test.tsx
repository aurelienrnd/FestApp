import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import { authClient } from "@/lib/auth-client";

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

// mock du client Better Auth pour controler signIn.email dans chaque test
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  mockPush.mockClear();
  vi.mocked(authClient.signIn.email).mockResolvedValue({
    data: null,
    error: null,
  } as never);
});

// remplit le formulaire puis soumet
async function submitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Votre email"), "admin@test.com");
  await user.type(screen.getByPlaceholderText("Votre mot de passe"), "motdepasse");
  await user.click(screen.getByRole("button", { name: "Envoyer" }));
}

// ---------------------------------------------------------------------------

describe("LoginPage", () => {
  it("desactive le bouton 'Envoyer' si email ou mot de passe est vide", () => {
    // les deux champs sont requis pour soumettre le formulaire
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("affiche l'erreur retournee par l'API si la connexion echoue", async () => {
    // l'erreur renvoyee par authClient.signIn.email doit etre visible au-dessus du bouton
    const user = userEvent.setup();
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: null,
      error: { message: "Session expiree, merci de vous reconnecter." },
    } as never);

    render(<LoginPage />);
    await submitForm(user);

    expect(
      await screen.findByText("Session expiree, merci de vous reconnecter."),
    ).toBeInTheDocument();
  });

  it("redirige vers /admin/dashboard apres connexion reussie", async () => {
    // quand signIn.email reussit (error: null), router.push doit etre appele avec la bonne route
    const user = userEvent.setup();
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: { user: {} },
      error: null,
    } as never);

    render(<LoginPage />);
    await submitForm(user);

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
