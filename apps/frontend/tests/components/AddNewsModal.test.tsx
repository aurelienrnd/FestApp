import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddNewsModal from "@/components/modals/AddNewsModal";
import { useMutation } from "@/hooks/useMutation";
import type { NewsItem } from "@/type";

// react-modal : div standard pour eviter les erreurs Next.js en jsdom
vi.mock("react-modal", () => ({
  default: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div>{children}</div> : null),
}));

// next/image : balise img standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock du hook useMutation pour controler l'etat retourne
vi.mock("@/hooks/useMutation", async (importOriginal: <T>() => Promise<T>) => {
  const actual = await importOriginal<typeof import("@/hooks/useMutation")>();
  return { ...actual, useMutation: vi.fn() };
});

// news existante utilisee pour tester le mode edition
const mockNewsToEdit: NewsItem = {
  id: "uuid-1",
  title: "Titre existant",
  content: "Contenu existant",
  is_published: true,
  created_at: "2025-08-01T10:00:00Z",
  url_media: "/img/news.webp",
  description_media: "Photo news",
  author_name: "Auteur",
};

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:test");
  vi.mocked(useMutation).mockReturnValue({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
    reset: vi.fn(),
  });
});

// navigue vers l'etape 2 en remplissant le titre (minimum 2 caracteres)
async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Titre de la news"), "Ma news");
  await user.click(screen.getByRole("button", { name: "Suivant" }));
}

// ---------------------------------------------------------------------------

describe("AddNewsModal", () => {
  it("le bouton de progression est desactive a chaque etape si les champs requis sont vides", async () => {
    // verifie la chaine de validation des 2 etapes en mode creation
    const user = userEvent.setup();

    render(
      <AddNewsModal isOpen={true} onClose={vi.fn()} handleNews={vi.fn()} />,
    );

    // etape 1 : titre vide — Suivant doit etre desactive
    expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();

    // remplir le titre et naviguer vers etape 2
    await goToStep2(user);

    // etape 2 : description remplie mais aucune image — Ajouter doit etre desactive
    await user.type(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
      "Alt text",
    );

    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("un clic sur le bouton fermer appelle onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AddNewsModal isOpen={true} onClose={onClose} handleNews={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /fermer la modal/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("ne desactive pas le bouton 'Modifier' sans nouvelle image en mode edition", async () => {
    // en mode edition, l'image existante est conservee si aucune nouvelle n'est choisie
    const user = userEvent.setup();

    render(
      <AddNewsModal
        isOpen={true}
        onClose={vi.fn()}
        handleNews={vi.fn()}
        newsToEdit={mockNewsToEdit}
      />,
    );

    // le titre est pre-rempli donc Suivant est actif
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    // la description est aussi pre-remplie — Modifier doit etre actif sans nouvelle image
    expect(screen.getByRole("button", { name: "Modifier" })).not.toBeDisabled();
  });

  it("pre-remplit les champs avec les donnees de newsToEdit en mode edition", () => {
    // les valeurs initiales du formulaire doivent correspondre a la news a modifier
    render(
      <AddNewsModal
        isOpen={true}
        onClose={vi.fn()}
        handleNews={vi.fn()}
        newsToEdit={mockNewsToEdit}
      />,
    );

    expect(screen.getByDisplayValue("Titre existant")).toBeInTheDocument();
  });

  it("affiche l'erreur retournee par l'API sur l'etape 2", async () => {
    // l'erreur renvoyee par useMutation doit etre visible apres la tentative de soumission
    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: "Erreur serveur, reessayez plus tard.",
      reset: vi.fn(),
    });

    const user = userEvent.setup();

    render(
      <AddNewsModal isOpen={true} onClose={vi.fn()} handleNews={vi.fn()} />,
    );

    await goToStep2(user);

    expect(
      screen.getByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
  });
});
