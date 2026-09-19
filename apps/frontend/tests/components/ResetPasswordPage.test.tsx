import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import { authClient } from "@/lib/auth-client";

// next/navigation : mock de useRouter (redirection) et useSearchParams (token/error dans l'URL)
const mockPush = vi.fn();
let searchParams: Record<string, string> = {};
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => searchParams[key] ?? null,
  }),
}));

// mock du client Better Auth pour controler resetPassword dans chaque test
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    resetPassword: vi.fn(),
  },
}));

beforeEach(() => {
  mockPush.mockClear();
  searchParams = {};
  // par defaut : l'appel Better Auth reussit
  vi.mocked(authClient.resetPassword).mockResolvedValue({
    data: { status: true },
    error: null,
  } as never);
});

// remplit les 2 champs du formulaire
async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  newPassword = "NouveauMotDePasse",
  confirmPassword = "NouveauMotDePasse",
) {
  await user.type(screen.getByPlaceholderText("Nouveau mot de passe"), newPassword);
  await user.type(
    screen.getByPlaceholderText("Confirmer le nouveau mot de passe"),
    confirmPassword,
  );
}

// ---------------------------------------------------------------------------

describe("ResetPasswordPage", () => {
  it("affiche un lien invalide et masque le formulaire quand le token est absent", () => {
    // page ouverte directement, sans passer par le lien recu par email
    render(<ResetPasswordPage />);

    expect(
      screen.getByText(/lien de reinitialisation est invalide ou a expire/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Nouveau mot de passe"),
    ).not.toBeInTheDocument();
  });

  it("affiche un lien invalide quand Better Auth redirige avec ?error=INVALID_TOKEN", () => {
    // token expire ou deja consomme : Better Auth redirige avec ?error au lieu de ?token
    searchParams = { error: "INVALID_TOKEN" };

    render(<ResetPasswordPage />);

    expect(
      screen.getByText(/lien de reinitialisation est invalide ou a expire/i),
    ).toBeInTheDocument();
  });

  it("affiche le formulaire quand un token est present dans l'URL", () => {
    searchParams = { token: "tok123" };

    render(<ResetPasswordPage />);

    expect(screen.getByRole("button", { name: "Reinitialiser" })).toBeDisabled();
  });

  it("affiche une erreur locale si les mots de passe ne correspondent pas", async () => {
    // la validation est faite cote client avant l'appel a Better Auth
    searchParams = { token: "tok123" };
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await fillForm(user, "MotDePasse1", "MotDePasse2");
    await user.click(screen.getByRole("button", { name: "Reinitialiser" }));

    expect(
      screen.getByText("Les mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
    expect(authClient.resetPassword).not.toHaveBeenCalled();
  });

  it("transmet le nouveau mot de passe et le token a Better Auth et affiche le succes", async () => {
    searchParams = { token: "tok123" };
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Reinitialiser" }));

    expect(authClient.resetPassword).toHaveBeenCalledWith({
      newPassword: "NouveauMotDePasse",
      token: "tok123",
    });
    expect(
      await screen.findByText(/votre mot de passe a ete modifie/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reinitialiser" }),
    ).not.toBeInTheDocument();
  });

  it("redirige vers /login au clic sur 'Se connecter' apres succes", async () => {
    searchParams = { token: "tok123" };
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Reinitialiser" }));
    await user.click(await screen.findByRole("button", { name: "Se connecter" }));

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("affiche l'erreur retournee par Better Auth (ex: token deja consomme)", async () => {
    searchParams = { token: "tok123" };
    vi.mocked(authClient.resetPassword).mockResolvedValue({
      data: null,
      error: { message: "Token invalide." },
    } as never);
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Reinitialiser" }));

    expect(await screen.findByText("Token invalide.")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // ?context=invite — utilisateur cree par un admin (AddUserModal.tsx), jamais eu de
  // mot de passe. Meme mecanisme de token, textes adaptes.

  it("affiche un texte de bienvenue et le bouton adapte quand context=invite", () => {
    searchParams = { token: "tok123", context: "invite" };

    render(<ResetPasswordPage />);

    expect(screen.getByText("Bienvenue")).toBeInTheDocument();
    expect(
      screen.getByText(/un compte a ete cree pour vous/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Creer mon mot de passe" }),
    ).toBeInTheDocument();
    // le libelle "reinitialisation" ne doit pas apparaitre pour une invitation
    expect(screen.queryByText(/reinitialisation/i)).not.toBeInTheDocument();
  });

  it("affiche un message d'invitation invalide (pas de reinitialisation) quand context=invite et le lien est casse", () => {
    searchParams = { context: "invite" };

    render(<ResetPasswordPage />);

    expect(
      screen.getByText(/lien d'invitation est invalide ou a expire/i),
    ).toBeInTheDocument();
  });

  it("affiche un message de compte active (pas de mot de passe modifie) apres succes quand context=invite", async () => {
    searchParams = { token: "tok123", context: "invite" };
    const user = userEvent.setup();

    render(<ResetPasswordPage />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Creer mon mot de passe" }));

    expect(
      await screen.findByText(/votre compte est pret/i),
    ).toBeInTheDocument();
  });
});
