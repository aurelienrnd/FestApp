import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewsContent from "@/components/NewsContent";
import { useFetch } from "@/hooks/useFetch";
import { useNavPath } from "@/hooks/useNavPath";
import type { NewsItem } from "@/type";

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

// mock du hook useFetch pour controler les donnees retournees
vi.mock("@/hooks/useFetch");

// mock du hook useNavPath pour simuler un chemin admin
vi.mock("@/hooks/useNavPath");

// mock de AddNewsModal : expose un bouton qui appelle handleNews directement
// permet de tester l'ajout optimiste sans passer par le formulaire
vi.mock("@/components/modals/AddNewsModal", () => ({
  default: ({
    isOpen,
    handleNews,
  }: {
    isOpen: boolean;
    handleNews: (news: NewsItem) => void;
  }) =>
    isOpen ? (
      <button onClick={() => handleNews(mockNewNews)}>Simuler ajout</button>
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

// news existante retournee par l'API (publiee)
const mockNews = {
  id: "uuid-1",
  title: "News Existante",
  url_media: "/img/news.webp",
  description_media: "Photo news",
  author_name: "Auteur Test",
  created_at: "2025-08-01T10:00:00Z",
  is_published: true,
};

// news non publiee pour tester l'affichage du badge Brouillon
const mockDraftNews = {
  id: "uuid-2",
  title: "News Brouillon",
  url_media: "/img/draft.webp",
  description_media: "Photo brouillon",
  author_name: "Auteur Test",
  created_at: "2025-08-01T12:00:00Z",
  is_published: false,
};

// nouvelle news ajoutee via la modale
const mockNewNews: NewsItem = {
  id: "uuid-3",
  title: "Nouvelle News",
  url_media: "/img/nouvelle.webp",
  description_media: "Photo nouvelle",
  author_name: "Auteur Nouveau",
  created_at: "2025-08-02T10:00:00Z",
  is_published: true,
  content: null,
};

beforeEach(() => {
  // reinitialise les mocks entre chaque test
  vi.mocked(useFetch).mockReturnValue({
    data: { news: [mockNews] },
    isLoading: false,
    error: null,
  });
  vi.mocked(useNavPath).mockReturnValue({
    isAdminPath: true,
    pathname: "/admin/news",
  });
});

// ---------------------------------------------------------------------------

describe("NewsContent", () => {
  it("affiche les news retournees par l'API", () => {
    // rendu avec une news retournee par useFetch
    render(<NewsContent />);

    expect(screen.getByText("News Existante")).toBeInTheDocument();
  });

  it("ajoute la news a la liste localement apres un ajout reussi", async () => {
    const user = userEvent.setup();

    // rendu avec la modale d'ajout ouverte
    render(<NewsContent isAddModalOpen={true} />);

    // simuler un ajout via le bouton expose par le mock de AddNewsModal
    await user.click(screen.getByText("Simuler ajout"));

    // la nouvelle news doit apparaitre dans la liste sans refetch
    expect(screen.getByText("Nouvelle News")).toBeInTheDocument();
  });

  it("retire la news de la liste localement apres une suppression reussie", async () => {
    const user = userEvent.setup();

    render(<NewsContent />);

    // verifier que la news est bien presente avant suppression
    expect(screen.getByText("News Existante")).toBeInTheDocument();

    // ouvrir la modale de suppression via le bouton Supprimer de la carte
    await user.click(screen.getByText("Supprimer"));

    // simuler la suppression via le bouton expose par le mock de DeleteModal
    await user.click(screen.getByText("Simuler suppression"));

    // la news doit avoir disparu de la liste sans refetch
    expect(screen.queryByText("News Existante")).not.toBeInTheDocument();
  });

  it("inverse l'ordre de la liste avec le filtre 'Plus ancien'", () => {
    // l'API retourne les news en ordre decroissant : Recente en premier
    const newsRecente = { ...mockNews, id: "uuid-a", title: "News Recente" };
    const newsAncienne = { ...mockNews, id: "uuid-b", title: "News Ancienne" };

    vi.mocked(useFetch).mockReturnValue({
      data: { news: [newsRecente, newsAncienne] },
      isLoading: false,
      error: null,
    });
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: false,
      pathname: "/news",
    });

    render(<NewsContent activeFilter="Plus ancien" />);

    // avec le filtre "Plus ancien", l'ordre doit etre inverse
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("News Ancienne");
    expect(items[1]).toHaveTextContent("News Recente");
  });

  it("affiche le badge 'Brouillon' pour les news non publiees en vue admin", () => {
    // le badge Brouillon doit etre visible uniquement en vue admin pour les news non publiees
    vi.mocked(useFetch).mockReturnValue({
      data: { news: [mockDraftNews] },
      isLoading: false,
      error: null,
    });

    render(<NewsContent />);

    expect(screen.getByText("Brouillon")).toBeInTheDocument();
  });

  it("masque le bouton 'Supprimer' en vue publique", () => {
    // en vue publique isAdminPath est false, le bouton Supprimer ne doit pas etre rendu
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: false,
      pathname: "/news",
    });

    render(<NewsContent />);

    expect(screen.queryByRole("button", { name: "Supprimer" })).not.toBeInTheDocument();
  });

  it("masque le badge 'Brouillon' en vue publique", () => {
    // en vue publique les news non publiees sont filtrees, le badge Brouillon ne s'affiche pas
    vi.mocked(useFetch).mockReturnValue({
      data: { news: [mockDraftNews] },
      isLoading: false,
      error: null,
    });
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: false,
      pathname: "/news",
    });

    render(<NewsContent />);

    expect(screen.queryByText("Brouillon")).not.toBeInTheDocument();
  });

  it("masque les news non publiees en vue publique", () => {
    // en vue publique seules les news publiees doivent apparaitre dans la liste
    const mockPublishedNews = { ...mockNews, id: "uuid-pub", title: "News Publiee" };

    vi.mocked(useFetch).mockReturnValue({
      data: { news: [mockPublishedNews, mockDraftNews] },
      isLoading: false,
      error: null,
    });
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: false,
      pathname: "/news",
    });

    render(<NewsContent />);

    expect(screen.getByText("News Publiee")).toBeInTheDocument();
    expect(screen.queryByText("News Brouillon")).not.toBeInTheDocument();
  });
});
