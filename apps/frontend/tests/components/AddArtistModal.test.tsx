import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddArtistModal from "@/components/modals/AddArtistModal";
import { useMutation } from "@/hooks/useMutation";
import type { ArtistItem } from "@/type";

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
    // eslint-disable-next-line @next/next/no-img-element
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

// artiste existant utilise pour tester le mode edition
const mockArtistToEdit: ArtistItem = {
  id: "uuid-1",
  name: "Artiste Existant",
  genre: "Metal",
  origin: "France",
  bio: "Une bio existante.",
  url_media: "/img/artiste.webp",
  description_media: "Photo artiste",
  youtube_url: null,
  spotify_url: null,
  is_featured: false,
  stage: "Scene Principale",
  start_time: "2025-08-01T20:00:00Z",
  end_time: "2025-08-01T22:00:00Z",
};

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
  it("le bouton de progression est desactive a chaque etape si les champs requis sont vides", async () => {
    // verifie la chaine de validation des 3 etapes en mode creation
    const user = userEvent.setup();

    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
      />,
    );

    // etape 1 : tous les champs vides — Suivant doit etre desactive
    expect(screen.getByText("Suivant")).toBeDisabled();

    // remplir etape 1 et naviguer vers etape 2
    await goToStep2(user);

    // etape 2 : aucune image selectionnee — Suivant doit etre desactive
    expect(screen.getByText("Suivant")).toBeDisabled();

    // remplir la description et uploader une image pour naviguer vers etape 3
    await user.type(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
      "Photo artiste",
    );
    const file = new File(["img"], "artiste.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/photo de l'artiste/i), file);
    await user.click(screen.getByText("Suivant"));

    // etape 3 : scene, date et heures vides — Ajouter doit etre desactive
    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("ne desactive pas le bouton 'Suivant' a l'etape 2 sans nouvelle image en mode edition", async () => {
    // en mode edition, l'image existante est conservee — aucune nouvelle image n'est requise
    const user = userEvent.setup();

    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
        artistToEdit={mockArtistToEdit}
      />,
    );

    // en mode edition, les champs de l'etape 1 sont pre-remplis — Suivant est actif d'emblee
    await user.click(screen.getByText("Suivant"));

    // a l'etape 2, la description est pre-remplie et l'image est optionnelle — Suivant actif
    expect(screen.getByText("Suivant")).not.toBeDisabled();
  });

  it("pre-remplit les champs avec les donnees de artistToEdit en mode edition", () => {
    // les valeurs initiales du formulaire doivent correspondre a l'artiste a modifier
    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
        artistToEdit={mockArtistToEdit}
      />,
    );

    expect(screen.getByDisplayValue("Artiste Existant")).toBeInTheDocument();
  });

  it("un clic sur le bouton fermer appelle onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AddArtistModal isOpen={true} onClose={onClose} handleArtist={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("affiche une erreur si l'URL YouTube ne correspond pas au domaine attendu", async () => {
    // seules les URLs youtube.com ou youtu.be sont acceptees
    const user = userEvent.setup();

    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
      />,
    );

    // remplir les champs requis de l'etape 1
    await user.type(screen.getByPlaceholderText("Nom de l'artiste"), "Test");
    await user.type(screen.getByPlaceholderText("Genre musical"), "Rock");
    await user.type(screen.getByPlaceholderText("Origine (pays / ville)"), "France");
    await user.type(screen.getByPlaceholderText("Biographie"), "Une bio.");

    // saisir une URL YouTube invalide
    await user.type(
      screen.getByPlaceholderText("Lien YouTube (optionnel)"),
      "https://vimeo.com/123456",
    );

    await user.click(screen.getByText("Suivant"));

    // le message d'erreur doit etre affiche sous le champ YouTube
    expect(
      screen.getByText(
        "Le lien doit provenir de YouTube (youtube.com ou youtu.be).",
      ),
    ).toBeInTheDocument();
  });

  it("affiche une erreur si l'URL Spotify ne correspond pas au domaine attendu", async () => {
    // seules les URLs open.spotify.com sont acceptees
    const user = userEvent.setup();

    render(
      <AddArtistModal
        isOpen={true}
        onClose={vi.fn()}
        handleArtist={vi.fn()}
      />,
    );

    // remplir les champs requis de l'etape 1
    await user.type(screen.getByPlaceholderText("Nom de l'artiste"), "Test");
    await user.type(screen.getByPlaceholderText("Genre musical"), "Rock");
    await user.type(screen.getByPlaceholderText("Origine (pays / ville)"), "France");
    await user.type(screen.getByPlaceholderText("Biographie"), "Une bio.");

    // saisir une URL Spotify invalide
    await user.type(
      screen.getByPlaceholderText("Lien Spotify (optionnel)"),
      "https://deezer.com/track/123",
    );

    await user.click(screen.getByText("Suivant"));

    // le message d'erreur doit etre affiche sous le champ Spotify
    expect(
      screen.getByText("Le lien doit provenir de Spotify (open.spotify.com)."),
    ).toBeInTheDocument();
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
