import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordModal from "@/app/admin/dashboard/ChangePasswordModal";
import { authClient } from "@/lib/auth-client";

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock du client Better Auth pour controler changePassword dans chaque test
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    changePassword: vi.fn(),
  },
}));

beforeEach(() => {
  // par defaut : l'appel Better Auth reussit
  vi.mocked(authClient.changePassword).mockResolvedValue({
    data: null,
    error: null,
  } as never);
});

// helper : remplit les 3 champs du formulaire
async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  newPassword = "NouveauMotDePasse",
  confirmPassword = "NouveauMotDePasse",
) {
  await user.type(screen.getByPlaceholderText("Ancien mot de passe"), "AncienMotDePasse");
  await user.type(screen.getByPlaceholderText("Nouveau mot de passe"), newPassword);
  await user.type(screen.getByPlaceholderText("Confirmer le nouveau mot de passe"), confirmPassword);
}

// ---------------------------------------------------------------------------

describe("ChangePasswordModal", () => {
  it("desactive le bouton 'Modifier' si les champs sont vides", () => {
    // les 3 champs sont requis pour soumettre
    render(
      <ChangePasswordModal isOpen={true} onClose={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Modifier" })).toBeDisabled();
  });

  it("un clic sur le bouton fermer appelle onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ChangePasswordModal isOpen={true} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("affiche une erreur locale si les mots de passe ne correspondent pas", async () => {
    // la validation est faite cote client avant l'appel a Better Auth
    const user = userEvent.setup();

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    await fillForm(user, "MotDePasse1", "MotDePasse2");
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(
      screen.getByText("Les nouveaux mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
    expect(authClient.changePassword).not.toHaveBeenCalled();
  });

  it("transmet les mots de passe a Better Auth et affiche le succes", async () => {
    const user = userEvent.setup();

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(authClient.changePassword).toHaveBeenCalledWith({
      currentPassword: "AncienMotDePasse",
      newPassword: "NouveauMotDePasse",
      revokeOtherSessions: true,
    });
    expect(
      await screen.findByText(/votre mot de passe a ete modifie/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Modifier" })).not.toBeInTheDocument();
  });

  it("affiche l'erreur retournee par Better Auth", async () => {
    const user = userEvent.setup();
    vi.mocked(authClient.changePassword).mockResolvedValue({
      data: null,
      error: { message: "Acces refuse." },
    } as never);

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(await screen.findByText("Acces refuse.")).toBeInTheDocument();
  });
});
