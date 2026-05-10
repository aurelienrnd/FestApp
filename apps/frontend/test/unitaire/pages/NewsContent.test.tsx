import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NewsContent from "../../../src/components/NewsContent";
import { ApiRequestError } from "../../../src/functions/apiRequest";

// Mock de next/image pour eviter les erreurs de rendu dans jsdom
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

// Mock de react-modal — affiche le contenu si isOpen est true
vi.mock("react-modal", () => {
  const Modal = ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null);
  Modal.setAppElement = () => {};
  return { default: Modal };
});

// Mock de useNavPath pour simuler une route admin (surchargeable par test)
const mockUseNavPath = vi.fn();
vi.mock("../../../src/hooks/useNavPath", () => ({
  useNavPath: () => mockUseNavPath(),
}));

// Mock de apiRequest pour eviter les appels reseau
const mockApiRequest = vi.fn();
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

const mockNews = {
  id: "news-1",
  title: "Ouverture de la billetterie",
  content: "La billetterie ouvre.",
  is_published: true,
  created_at: "2026-04-06T10:00:00.000Z",
  url_media: "/uploads/news/uuid.webp",
  description_media: "Photo de la billetterie",
  author_name: "Admin",
};

describe("NewsContent", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockUseNavPath.mockReturnValue({ isAdminPath: true });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows loading state while fetching", () => {
    mockApiRequest.mockReturnValue(new Promise(() => {}));

    render(<NewsContent />);

    expect(screen.getByText("Chargement")).toBeInTheDocument();
  });

  it("shows error message when load fails", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    render(<NewsContent />);

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
  });

  it("shows empty state when no news", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { newsList:[] },
      error: null,
    });

    render(<NewsContent />);

    expect(await screen.findByText("Aucune news.")).toBeInTheDocument();
  });

  it("displays news title and author", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { newsList:[mockNews] },
      error: null,
    });

    render(<NewsContent />);

    expect(
      await screen.findByText("Ouverture de la billetterie"),
    ).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows 'Auteur inconnu' when author_name is null", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { newsList:[{ ...mockNews, author_name: null }] },
      error: null,
    });

    render(<NewsContent />);

    expect(await screen.findByText("Auteur inconnu")).toBeInTheDocument();
  });

  it("shows draft badge in admin path for unpublished news", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { newsList:[{ ...mockNews, is_published: false }] },
      error: null,
    });

    render(<NewsContent />);

    expect(await screen.findByText("Brouillon")).toBeInTheDocument();
  });

  it("hides draft badge on non-admin path", async () => {
    mockUseNavPath.mockReturnValue({ isAdminPath: false });
    mockApiRequest.mockResolvedValueOnce({
      data: { newsList:[mockNews] },
      error: null,
    });

    render(<NewsContent />);

    await screen.findByText("Ouverture de la billetterie");
    expect(screen.queryByText("Brouillon")).not.toBeInTheDocument();
  });

  it("hides unpublished news on non-admin path", async () => {
    mockUseNavPath.mockReturnValue({ isAdminPath: false });
    mockApiRequest.mockResolvedValueOnce({
      data: {
        newsList: [
          mockNews,
          { ...mockNews, id: "news-2", title: "Brouillon secret", is_published: false },
        ],
      },
      error: null,
    });

    render(<NewsContent />);

    expect(
      await screen.findByText("Ouverture de la billetterie"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Brouillon secret")).not.toBeInTheDocument();
  });

  it("shows Modifier and Supprimer buttons on admin path for news", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { newsList:[mockNews] },
      error: null,
    });

    render(<NewsContent />);

    await screen.findByText("Ouverture de la billetterie");
    expect(screen.getByRole("button", { name: "Modifier" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Supprimer" }),
    ).toBeInTheDocument();
  });

  it("shows 'Voir plus' button on non-admin path", async () => {
    mockUseNavPath.mockReturnValue({ isAdminPath: false });
    mockApiRequest.mockResolvedValueOnce({
      data: { newsList:[mockNews] },
      error: null,
    });

    render(<NewsContent />);

    await screen.findByText("Ouverture de la billetterie");
    expect(screen.getByRole("button", { name: "Voir plus" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Modifier" }),
    ).not.toBeInTheDocument();
  });

  it("reverses news order when activeFilter is 'Croissant'", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: {
        newsList: [
          { ...mockNews, id: "news-1", title: "News Recente" },
          { ...mockNews, id: "news-2", title: "News Ancienne" },
        ],
      },
      error: null,
    });

    render(<NewsContent activeFilter="Croissant" />);

    await screen.findByText("News Recente");
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("News Ancienne");
    expect(items[1]).toHaveTextContent("News Recente");
  });

  it("deletes a news and removes it from the list", async () => {
    const user = userEvent.setup();

    mockApiRequest
      .mockResolvedValueOnce({
        data: {
          newsList: [
            mockNews,
            { ...mockNews, id: "news-2", title: "Deuxieme News" },
          ],
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { message: "News supprimee" },
        error: null,
      });

    render(<NewsContent />);

    await screen.findByText("Ouverture de la billetterie");
    await user.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    await screen.findByText("L'news a ete supprime.");
    await waitFor(() => {
      expect(
        screen.queryByText("Ouverture de la billetterie"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Deuxieme News")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(
      2,
      "/admin/news/news-1",
      { method: "DELETE", headers: { "Content-Type": "application/json" } },
    );
  });

  it("edits a news and updates it in the list", async () => {
    const user = userEvent.setup();
    const updatedNews = {
      ...mockNews,
      title: "Ouverture de la billetterie (modifie)",
    };

    mockApiRequest
      .mockResolvedValueOnce({
        data: { newsList:[mockNews] },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { message: "News modifiee", news: updatedNews },
        error: null,
      });

    render(<NewsContent />);

    await screen.findByText("Ouverture de la billetterie");
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    // Les champs sont pre-remplis, on passe a l'etape 2 et on soumet
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(
      within(screen.getByTestId("modal")).getByRole("button", { name: "Modifier" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Ouverture de la billetterie"),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByText("Ouverture de la billetterie (modifie)"),
    ).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(
      2,
      `/admin/news/${mockNews.id}`,
      expect.objectContaining({ method: "PATCH" }),
    );
  });
});
