import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "@/app/admin/artists/[id]/page";
import { useFetch } from "@/hooks/useFetch";
import type { ArtistItem } from "@/type";

// next/navigation : mock de useParams pour simuler un id de route et useRouter pour eviter les erreurs
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "uuid-1" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// mock du hook useFetch pour controler les donnees retournees
vi.mock("@/hooks/useFetch");

// mock de useRoleGuard : aucune redirection dans les tests
vi.mock("@/hooks/useRoleGuard", () => ({
  useRoleGuard: vi.fn(),
}));

// mock de ArtistDetailContent : affiche uniquement le nom de l'artiste recu en prop
// permet de verifier que la page transmet le bon artiste apres edition
vi.mock("@/components/ArtistDetailContent", () => ({
  default: ({ artist }: { artist: ArtistItem }) => <div>{artist.name}</div>,
}));

// mock de ArtistEditButton : expose un bouton qui appelle onArtistEdited directement
// permet de tester la mise a jour optimiste sans passer par le formulaire multi-etapes
vi.mock("@/app/admin/artists/ArtistEditButton", () => ({
  default: ({
    onArtistEdited,
  }: {
    artist: ArtistItem;
    onArtistEdited: (artist: ArtistItem) => void;
  }) => (
    <button onClick={() => onArtistEdited(mockUpdatedArtist)}>
      Simuler modification
    </button>
  ),
}));

// artiste retourne par l'API
const mockArtist: ArtistItem = {
  id: "uuid-1",
  name: "Artiste Original",
  genre: "Metal",
  origin: "France",
  bio: "Une bio.",
  url_media: "/img/artiste.webp",
  description_media: "Photo artiste",
  youtube_url: null,
  spotify_url: null,
  is_featured: false,
  stage: "MainStage",
  start_time: "2027-05-21T20:00:00Z",
  end_time: "2027-05-21T22:00:00Z",
};

// artiste avec un nom modifie retourne par la modale d'edition
const mockUpdatedArtist: ArtistItem = {
  ...mockArtist,
  name: "Artiste Modifie",
};

beforeEach(() => {
  vi.mocked(useFetch).mockReturnValue({
    data: { artist: mockArtist },
    isLoading: false,
    error: null,
  });
});

// ---------------------------------------------------------------------------

describe("AdminArtistDetailPage", () => {
  it("affiche les informations de l'artiste retourne par l'API", () => {
    render(<Page />);

    expect(screen.getByText("Artiste Original")).toBeInTheDocument();
  });

  it("met a jour les informations affichees apres une modification reussie", async () => {
    const user = userEvent.setup();

    render(<Page />);

    // l'artiste original est affiche avant la modification
    expect(screen.getByText("Artiste Original")).toBeInTheDocument();

    // simuler une modification via le bouton expose par le mock de ArtistEditButton
    await user.click(screen.getByText("Simuler modification"));

    // editedArtist prend le relais sur la donnee API : le nouveau nom doit s'afficher
    expect(screen.getByText("Artiste Modifie")).toBeInTheDocument();
    expect(screen.queryByText("Artiste Original")).not.toBeInTheDocument();
  });
});
