import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import NewsDetailModal from "../../../src/app/admin/news/NewsDetailModal";

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

// Mock de next/image pour eviter le rendu SSR
// next/image n'est pas compatible avec jsdom (environnement de test) — on le remplace par un <img> brut.
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const mockOnClose = vi.fn();

const mockArticle = {
  id: "article-1",
  title: "Ouverture de la billetterie",
  content: "La billetterie du festival ouvre ses portes.",
  is_published: true,
  created_at: "2026-04-06T10:00:00.000Z",
  url_media: "/uploads/articles/uuid.webp",
  description_media: "Photo de la billetterie",
  author_name: "Admin",
};

describe("NewsDetailModal", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    mockOnClose.mockReset();
  });

  it("n'affiche rien quand article est null", () => {
    render(
      <NewsDetailModal isOpen={true} onClose={mockOnClose} article={null} />,
    );
    expect(
      screen.queryByText("Ouverture de la billetterie"),
    ).not.toBeInTheDocument();
  });

  it("affiche le titre de l'article", () => {
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={mockArticle}
      />,
    );
    expect(
      screen.getByText("Ouverture de la billetterie"),
    ).toBeInTheDocument();
  });

  it("affiche le contenu de l'article", () => {
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={mockArticle}
      />,
    );
    expect(
      screen.getByText("La billetterie du festival ouvre ses portes."),
    ).toBeInTheDocument();
  });

  it("n'affiche pas de contenu quand content est null", () => {
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={{ ...mockArticle, content: null }}
      />,
    );
    expect(
      screen.queryByText("La billetterie du festival ouvre ses portes."),
    ).not.toBeInTheDocument();
  });

  it("affiche le nom de l'auteur", () => {
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={mockArticle}
      />,
    );
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("affiche 'Auteur inconnu' quand author_name est null", () => {
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={{ ...mockArticle, author_name: null }}
      />,
    );
    expect(screen.getByText("Auteur inconnu")).toBeInTheDocument();
  });

  it("affiche la date formatee en francais", () => {
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={mockArticle}
      />,
    );
    // "2026-04-06" → "6 avril 2026" en fr-FR
    expect(screen.getByText(/avril 2026/)).toBeInTheDocument();
  });

  it("affiche l'image avec le bon texte alternatif", () => {
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={mockArticle}
      />,
    );
    expect(screen.getByAltText("Photo de la billetterie")).toBeInTheDocument();
  });

  it("appelle onClose au clic sur le bouton fermer", async () => {
    const user = userEvent.setup();
    render(
      <NewsDetailModal
        isOpen={true}
        onClose={mockOnClose}
        article={mockArticle}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Fermer la modal" }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
