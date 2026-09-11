import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPassword from "@/components/ForgotPassword";
import { authClient } from "@/lib/auth-client";

// mock du client Better Auth pour controler requestPasswordReset dans chaque test
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    requestPasswordReset: vi.fn(),
  },
}));

beforeEach(() => {
  // par defaut : l'appel Better Auth reussit
  vi.mocked(authClient.requestPasswordReset).mockResolvedValue({
    data: { status: true },
    error: null,
  } as never);
});

// ---------------------------------------------------------------------------

describe("ForgotPassword", () => {
  it("desactive le bouton 'Envoyer' si le champ email est vide", () => {
    // le champ email doit contenir une adresse valide pour activer le bouton d'envoi
    render(<ForgotPassword />);

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("transmet l'email et un redirectTo absolu vers /reset-password a Better Auth", async () => {
    const user = userEvent.setup();

    render(<ForgotPassword />);

    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.com");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(authClient.requestPasswordReset).toHaveBeenCalledWith({
      email: "jean@test.com",
      redirectTo: expect.stringMatching(/^https?:\/\/.+\/reset-password$/),
    });
  });

  it("affiche un message de succes neutre et masque le formulaire apres envoi reussi", async () => {
    // le message ne doit pas confirmer l'existence du compte : Better Auth repond
    // toujours 200, que l'email soit connu ou non.
    const user = userEvent.setup();

    render(<ForgotPassword />);

    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.com");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      await screen.findByText(/si un compte existe pour cet email/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Envoyer" })).not.toBeInTheDocument();
  });

  it("affiche l'erreur retournee par Better Auth", async () => {
    const user = userEvent.setup();
    vi.mocked(authClient.requestPasswordReset).mockResolvedValue({
      data: null,
      error: { message: "Trop de tentatives, reessayer plus tard." },
    } as never);

    render(<ForgotPassword />);

    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.com");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(
      await screen.findByText("Trop de tentatives, reessayer plus tard."),
    ).toBeInTheDocument();
  });
});
