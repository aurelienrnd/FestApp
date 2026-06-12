import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactUs from "@/components/ContactUs";
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

// helper : remplit tous les champs du formulaire
async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Nom Prenom"), "Jean Dupont");
  await user.type(screen.getByPlaceholderText("Votre email"), "jean@test.com");
  await user.type(screen.getByPlaceholderText("Sujet"), "Un sujet");
  await user.type(screen.getByPlaceholderText("Tapez votre texte ici"), "Un message.");
}

// ---------------------------------------------------------------------------

describe("ContactUs", () => {
  it("desactive le bouton 'Envoyer' si les champs requis sont vides", () => {
    // nom, email, sujet et message sont tous requis pour soumettre
    render(<ContactUs />);

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

    render(<ContactUs />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    // le message de succes doit remplacer le formulaire
    expect(screen.getByText(/votre message est envoye/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Envoyer" })).not.toBeInTheDocument();
  });

  it("affiche l'erreur retournee par l'API", () => {
    // l'erreur renvoyee par useMutation doit etre visible sous le bouton
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: "Erreur serveur, reessayez plus tard.",
      reset: vi.fn(),
    });

    render(<ContactUs />);

    expect(
      screen.getByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
  });
});
