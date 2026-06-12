import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "@/app/admin/news/page";
import { useFetch } from "@/hooks/useFetch";
import type { NewsItem } from "@/type";

// next/navigation : mock de useRouter pour eviter les erreurs Next.js en jsdom
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// next/link : balise a standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// next/image : balise img standard pour eviter les erreurs Next.js en jsdom
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// fontawesome : composant vide pour eviter les erreurs de rendu en jsdom
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => null,
}));

// react-modal : rendu direct des enfants quand isOpen est true
vi.mock("react-modal", () => ({
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <>{children}</> : null,
}));

// mock du hook useFetch pour controler les donnees retournees
vi.mock("@/hooks/useFetch");

// mock de useNavPath pour eviter les erreurs de navigation en jsdom
vi.mock("@/hooks/useNavPath", () => ({
  useNavPath: vi.fn().mockReturnValue({ isAdminPath: true, pathname: "/admin/news" }),
}));

// mock de useRoleGuard : aucune redirection dans les tests
vi.mock("@/hooks/useRoleGuard", () => ({
  useRoleGuard: vi.fn(),
}));

// mock de AddNewsModal : div identifiable pour verifier l'ouverture
vi.mock("@/components/modals/AddNewsModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>Modale ajout news</div> : null,
}));

// mock de DeleteModal : non utilise dans ces tests
vi.mock("@/components/modals/DeleteModal", () => ({
  default: () => null,
}));

// news recente (index 0 dans l'ordre par defaut de l'API)
const mockRecentNews: NewsItem = {
  id: "uuid-1",
  title: "News Recente",
  content: null,
  is_published: true,
  created_at: "2025-08-02T10:00:00Z",
  url_media: "/img/recent.webp",
  description_media: "Photo recente",
  author_name: "Auteur",
};

// news ancienne (index 1 dans l'ordre par defaut de l'API)
const mockOldNews: NewsItem = {
  id: "uuid-2",
  title: "News Ancienne",
  content: null,
  is_published: true,
  created_at: "2025-08-01T10:00:00Z",
  url_media: "/img/ancienne.webp",
  description_media: "Photo ancienne",
  author_name: "Auteur",
};

beforeEach(() => {
  // l'API retourne les news en ordre decroissant : recente en premier
  vi.mocked(useFetch).mockReturnValue({
    data: { news: [mockRecentNews, mockOldNews] },
    isLoading: false,
    error: null,
  });
});

// ---------------------------------------------------------------------------

describe("NewsPage", () => {
  it("inverse l'ordre de la liste apres clic sur le filtre 'Plus ancien'", async () => {
    const user = userEvent.setup();

    render(<Page />);

    // DOCUMENT_POSITION_FOLLOWING (4) : le second element se trouve apres le premier dans le DOM
    const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;

    // ordre par defaut : "News Recente" doit apparaitre avant "News Ancienne"
    expect(
      screen.getByText("News Recente").compareDocumentPosition(screen.getByText("News Ancienne")) & FOLLOWING
    ).toBeTruthy();

    // clic sur le filtre "Plus ancien"
    await user.click(screen.getByRole("button", { name: "Plus ancien" }));

    // apres le filtre : "News Ancienne" doit apparaitre avant "News Recente"
    expect(
      screen.getByText("News Ancienne").compareDocumentPosition(screen.getByText("News Recente")) & FOLLOWING
    ).toBeTruthy();
  });

  it("ouvre la modale d'ajout au clic sur le bouton dedie", async () => {
    const user = userEvent.setup();

    render(<Page />);

    await user.click(screen.getByRole("button", { name: "Ajouter une news" }));

    expect(screen.getByText("Modale ajout news")).toBeInTheDocument();
  });
});
