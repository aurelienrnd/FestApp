import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddArtistModal from "@/components/modals/AddArtistModal";
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

// next/image : balise img standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// mock du hook useMutation pour controler mutate et error dans chaque test
vi.mock("@/hooks/useMutation");

// URL.createObjectURL n'existe pas en jsdom — on le simule
global.URL.createObjectURL = vi.fn(() => "blob:test");
global.URL.revokeObjectURL = vi.fn();

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

// helper : remplit les champs de l'etape 1 et navigue a l'etape 2
async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Nom de l'artiste"), "Test");
  await user.type(screen.getByPlaceholderText("Genre musical"), "Rock");
  await user.type(screen.getByPlaceholderText("Origine (pays / ville)"), "France");
  await user.type(screen.getByPlaceholderText("Biographie"), "Une bio.");
  await user.click(screen.getByText("Suivant"));
}

// helper : remplit les champs de l'etape 2 (avec image) et navigue a l'etape 3
async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
  await goToStep2(user);
  await user.type(
    screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
    "Photo artiste",
  );
  const file = new File(["img"], "artiste.png", { type: "image/png" });
  await user.upload(screen.getByLabelText(/photo de l'artiste/i), file);
  await user.click(screen.getByText("Suivant"));
}

// ---------------------------------------------------------------------------

describe("AddArtistModal", () => {
  it("le bouton Suivant de l'etape 1 est desactive si les champs requis sont vides", () => {
    // rendu initial : tous les champs de l'etape 1 sont vides
    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
      />,
    );

    // le bouton Suivant doit etre desactive tant que les champs requis sont vides
    expect(screen.getByText("Suivant")).toBeDisabled();
  });

  it("le bouton Suivant de l'etape 2 est desactive si aucun fichier n'est selectionne", async () => {
    const user = userEvent.setup();

    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
      />,
    );

    // naviguer a l'etape 2 en remplissant les champs de l'etape 1
    await goToStep2(user);

    // a l'etape 2, sans fichier image, le bouton Suivant doit etre desactive
    expect(screen.getByText("Suivant")).toBeDisabled();
  });

  it("affiche le message d'erreur API sur l'etape 3 si useMutation retourne une erreur", async () => {
    const user = userEvent.setup();

    // simuler une erreur retournee par useMutation
    vi.mocked(useMutation).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: "Acces refuse.",
      reset: mockReset,
    });

    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
      />,
    );

    // naviguer jusqu'a l'etape 3
    await goToStep3(user);

    // le message d'erreur doit etre visible sur l'etape 3
    expect(screen.getByText("Acces refuse.")).toBeInTheDocument();
  });
});
