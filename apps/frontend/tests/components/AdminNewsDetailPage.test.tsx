import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "@/app/admin/news/[id]/page";
import { useFetch } from "@/hooks/useFetch";
import type { NewsItem } from "@/type";

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

// mock de NewsDetailContent : affiche uniquement le titre de la news recue en prop
// permet de verifier que la page transmet la bonne news apres edition
vi.mock("@/components/NewsDetailContent", () => ({
  default: ({ news }: { news: NewsItem }) => <div>{news.title}</div>,
}));

// mock de NewsEditButton : expose un bouton qui appelle onNewsEdited directement
// permet de tester la mise a jour optimiste sans passer par le formulaire
vi.mock("@/app/admin/news/NewsEditButton", () => ({
  default: ({
    onNewsEdited,
  }: {
    news: NewsItem;
    onNewsEdited: (news: NewsItem) => void;
  }) => (
    <button onClick={() => onNewsEdited(mockUpdatedNews)}>
      Simuler modification
    </button>
  ),
}));

// news retournee par l'API
const mockNews: NewsItem = {
  id: "uuid-1",
  title: "News Originale",
  content: "Contenu de la news.",
  is_published: true,
  created_at: "2025-08-01T10:00:00Z",
  url_media: "/img/news.webp",
  description_media: "Photo news",
  author_name: "Auteur Test",
};

// news avec un titre modifie retournee par la modale d'edition
const mockUpdatedNews: NewsItem = {
  ...mockNews,
  title: "News Modifiee",
};

beforeEach(() => {
  vi.mocked(useFetch).mockReturnValue({
    data: { news: mockNews },
    isLoading: false,
    error: null,
  });
});

// ---------------------------------------------------------------------------

describe("AdminNewsDetailPage", () => {
  it("affiche les informations de la news retournee par l'API", () => {
    render(<Page />);

    expect(screen.getByText("News Originale")).toBeInTheDocument();
  });

  it("met a jour les informations affichees apres une modification reussie", async () => {
    const user = userEvent.setup();

    render(<Page />);

    // la news originale est affichee avant la modification
    expect(screen.getByText("News Originale")).toBeInTheDocument();

    // simuler une modification via le bouton expose par le mock de NewsEditButton
    await user.click(screen.getByText("Simuler modification"));

    // editedNews prend le relais sur la donnee API : le nouveau titre doit s'afficher
    expect(screen.getByText("News Modifiee")).toBeInTheDocument();
    expect(screen.queryByText("News Originale")).not.toBeInTheDocument();
  });
});
