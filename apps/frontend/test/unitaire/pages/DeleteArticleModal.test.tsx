import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeleteArticleModal from "../../../src/app/admin/news/DeleteArticleModal";
import { ApiRequestError } from "../../../src/functions/apiRequest";

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

// Mock de apiRequest pour eviter les appels reseau
const mockApiRequest = vi.fn();
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

const mockOnClose = vi.fn();
const mockHandleArticle = vi.fn();

const mockArticle = {
  id: "article-1",
  title: "Ouverture de la billetterie",
  content: "La billetterie ouvre.",
  is_published: true,
  created_at: "2026-04-06T10:00:00.000Z",
  url_media: "/uploads/articles/uuid.webp",
  description_media: "Photo de la billetterie",
  author_name: "Admin",
};

const defaultProps = {
  isOpen: true,
  selectedArticle: mockArticle,
  onClose: mockOnClose,
  handleArticle: mockHandleArticle,
};

describe("DeleteArticleModal", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockOnClose.mockReset();
    mockHandleArticle.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("affiche le titre de l'article dans le message de confirmation", () => {
    render(<DeleteArticleModal {...defaultProps} />);

    expect(
      screen.getByText(/Voulez-vous confirmer la suppression de/),
    ).toBeInTheDocument();
    expect(screen.getByText("Ouverture de la billetterie")).toBeInTheDocument();
  });

  it("appelle handleArticle et affiche le succes apres confirmation", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Article supprime" },
      error: null,
    });

    render(<DeleteArticleModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("L'article a ete supprime."),
    ).toBeInTheDocument();
    expect(mockHandleArticle).toHaveBeenCalledWith("article-1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/articles/article-1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("affiche un message d'erreur quand la suppression echoue", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    render(<DeleteArticleModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(mockHandleArticle).not.toHaveBeenCalled();
  });

  it("appelle onClose au clic sur Fermer apres suppression", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Article supprime" },
      error: null,
    });

    render(<DeleteArticleModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    await screen.findByText("L'article a ete supprime.");
    await user.click(screen.getByRole("button", { name: "Fermer" }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
