import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ArtistsContent from "@/components/ArtistsContent";
import { useFetch } from "@/hooks/useFetch";
import { useNavPath } from "@/hooks/useNavPath";
import type { ArtistItem } from "@/type";

// next/image : balise img standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// next/link : balise a standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// mock du hook useFetch pour controler les donnees retournees
vi.mock("@/hooks/useFetch");

// mock du hook useNavPath pour simuler un chemin admin
vi.mock("@/hooks/useNavPath");

// mock de AddArtistModal : expose un bouton qui appelle handleArtist directement
// permet de tester l'ajout optimiste sans passer par le formulaire multi-etapes
vi.mock("@/components/modals/AddArtistModal", () => ({
  default: ({
    isOpen,
    handleArtist,
  }: {
    isOpen: boolean;
    handleArtist: (artist: ArtistItem) => void;
  }) =>
    isOpen ? (
      <button onClick={() => handleArtist(mockNewArtist)}>
        Simuler ajout
      </button>
    ) : null,
}));

// mock de DeleteModal : expose un bouton qui appelle onDeleted directement
// permet de tester la suppression optimiste sans passer par la confirmation
vi.mock("@/components/modals/DeleteModal", () => ({
  default: ({
    isOpen,
    item,
    onDeleted,
  }: {
    isOpen: boolean;
    item: { id: string } | null;
    onDeleted: (id: string) => void;
  }) =>
    isOpen && item ? (
      <button onClick={() => onDeleted(item.id)}>Simuler suppression</button>
    ) : null,
}));

// artiste existant retourne par l'API
const mockArtist = {
  id: "uuid-1",
  name: "Artiste Existant",
  url_media: "/img/artiste.webp",
  description_media: "Photo artiste",
  stage: "Scene Principale",
  start_time: "2025-08-01T20:00:00Z",
  is_featured: false,
};

// nouvel artiste ajoute via la modale
const mockNewArtist: ArtistItem = {
  id: "uuid-2",
  name: "Nouvel Artiste",
  url_media: "/img/nouveau.webp",
  description_media: "Photo nouvel artiste",
  stage: "Scene Secondaire",
  start_time: "2025-08-01T22:00:00Z",
  end_time: "2025-08-01T23:00:00Z",
  is_featured: false,
  genre: "Metal",
  origin: "France",
  bio: "Une bio.",
  youtube_url: null,
  spotify_url: null,
};

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  vi.mocked(useFetch).mockReturnValue({
    data: { artists: [mockArtist] },
    isLoading: false,
    error: null,
  });
  vi.mocked(useNavPath).mockReturnValue({
    isAdminPath: true,
    pathname: "/admin/artists",
  });
});

// ---------------------------------------------------------------------------

describe("ArtistsContent", () => {
  it("affiche les artistes retournes par l'API", () => {
    // rendu avec un artiste retourne par useFetch
    render(<ArtistsContent />);

    // le nom de l'artiste doit etre visible dans la liste
    expect(screen.getByText("Artiste Existant")).toBeInTheDocument();
  });

  it("ajoute l'artiste a la liste localement apres un ajout reussi", async () => {
    const user = userEvent.setup();

    // rendu avec la modale d'ajout ouverte
    render(<ArtistsContent isAddModalOpen={true} />);

    // simuler un ajout via le bouton expose par le mock de AddArtistModal
    await user.click(screen.getByText("Simuler ajout"));

    // le nouvel artiste doit apparaitre dans la liste sans refetch
    expect(screen.getByText("Nouvel Artiste")).toBeInTheDocument();
  });

  it("retire l'artiste de la liste localement apres une suppression reussie", async () => {
    const user = userEvent.setup();

    render(<ArtistsContent />);

    // verifier que l'artiste est bien present avant suppression
    expect(screen.getByText("Artiste Existant")).toBeInTheDocument();

    // ouvrir la modale de suppression via le bouton Supprimer de la carte
    await user.click(screen.getByText("Supprimer"));

    // simuler la suppression via le bouton expose par le mock de DeleteModal
    await user.click(screen.getByText("Simuler suppression"));

    // l'artiste doit avoir disparu de la liste sans refetch
    expect(screen.queryByText("Artiste Existant")).not.toBeInTheDocument();
  });

  it("masque le bouton 'Supprimer' en vue publique", () => {
    // en vue publique isAdminPath est false, le bouton Supprimer ne doit pas etre rendu
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: false,
      pathname: "/artists",
    });

    render(<ArtistsContent />);

    expect(screen.queryByRole("button", { name: "Supprimer" })).not.toBeInTheDocument();
  });

  it("affiche le badge 'Page d'accueil' en vue admin pour un artiste mis en avant", () => {
    // le badge n'apparait que si isAdminPath est true et is_featured est true
    vi.mocked(useFetch).mockReturnValue({
      data: { artists: [{ ...mockArtist, is_featured: true }] },
      isLoading: false,
      error: null,
    });

    render(<ArtistsContent />);

    expect(screen.getByText("Page d'accueil")).toBeInTheDocument();
  });

  it("masque le badge 'Page d'accueil' en vue publique", () => {
    // meme si is_featured est true, le badge ne s'affiche pas en vue publique
    vi.mocked(useFetch).mockReturnValue({
      data: { artists: [{ ...mockArtist, is_featured: true }] },
      isLoading: false,
      error: null,
    });
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: false,
      pathname: "/artists",
    });

    render(<ArtistsContent />);

    expect(screen.queryByText("Page d'accueil")).not.toBeInTheDocument();
  });
});
