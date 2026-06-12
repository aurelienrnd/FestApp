import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPassword from "@/components/ForgotPassword";
import { useMutation } from "@/hooks/useMutation";

// mock du hook useMutation pour controler mutate et error dans chaque test
vi.mock("@/hooks/useMutation");

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  vi.mocked(useMutation).mockReturnValue({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
    reset: vi.fn(),
  });
});

// ---------------------------------------------------------------------------

describe("ForgotPassword", () => {
  it("desactive le bouton 'Envoyer' si le champ email est vide", () => {
    // le champ email doit contenir du texte pour activer le bouton d'envoi
    render(<ForgotPassword />);

    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("affiche un message de succes et masque le formulaire apres envoi reussi", async () => {
    // quand mutate appelle son callback, setSuccess(true) remplace le formulaire
    const user = userEvent.setup();

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn().mockImplementation((_data: unknown, onSuccess: () => void) => {
        onSuccess();
      }),
      isLoading: false,
      error: null,
      reset: vi.fn(),
    });

    render(<ForgotPassword />);

    await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.com");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // le message de succes doit remplacer le formulaire
    expect(
      screen.getByText(/un nouveau mot de passe vous a ete envoye/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Envoyer" })).not.toBeInTheDocument();
  });

  it("affiche l'erreur retournee par l'API", () => {
    // l'erreur renvoyee par useMutation doit etre visible sous le bouton
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: "Ressource introuvable.",
      reset: vi.fn(),
    });

    render(<ForgotPassword />);

    expect(screen.getByText("Ressource introuvable.")).toBeInTheDocument();
  });
});
