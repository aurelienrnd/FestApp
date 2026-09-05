import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordModal from "@/app/admin/dashboard/ChangePasswordModal";
import { useMutation } from "@/hooks/useMutation";

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock du hook useMutation pour controler mutate et error dans chaque test
vi.mock("@/hooks/useMutation");

const mockMutate = vi.fn();
const mockReset = vi.fn();

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  vi.mocked(useMutation).mockReturnValue({
    mutate: mockMutate,
    isLoading: false,
    error: null,
    reset: mockReset,
  });
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
    // la validation est faite cote client avant l'appel API
    const user = userEvent.setup();

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    await fillForm(user, "MotDePasse1", "MotDePasse2");
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(
      screen.getByText("Les nouveaux mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
  });

  it("affiche le message de succes et masque le formulaire apres changement reussi", async () => {
    const user = userEvent.setup();

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn().mockImplementation((_data: unknown, onSuccess: () => void) => {
        onSuccess();
      }),
      isLoading: false,
      error: null,
      reset: mockReset,
    });

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(
      screen.getByText(/votre mot de passe a ete modifie/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Modifier" })).not.toBeInTheDocument();
  });

  it("affiche l'erreur retournee par l'API", () => {
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: "Acces refuse.",
      reset: mockReset,
    });

    render(<ChangePasswordModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Acces refuse.")).toBeInTheDocument();
  });
});
