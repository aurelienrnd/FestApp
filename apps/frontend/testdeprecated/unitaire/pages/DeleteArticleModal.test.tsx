import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeleteModal from "../../../src/components/modals/DeleteModal";
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
const mockOnDeleted = vi.fn();

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

const defaultProps = {
  isOpen: true,
  item: mockNews,
  onClose: mockOnClose,
  onDeleted: mockOnDeleted,
  endpoint: "/admin/news",
  entityName: "news",
  getLabel: (a: typeof mockNews) => a.title,
};

describe("DeleteModal (news)", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockOnClose.mockReset();
    mockOnDeleted.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("affiche le titre de la news dans le message de confirmation", () => {
    render(<DeleteModal {...defaultProps} />);

    expect(
      screen.getByText(/Voulez-vous confirmer la suppression de/),
    ).toBeInTheDocument();
    expect(screen.getByText("Ouverture de la billetterie")).toBeInTheDocument();
  });

  it("appelle onDeleted et affiche le succes apres confirmation", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "News supprimee" },
      error: null,
    });

    render(<DeleteModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("L'news a ete supprime."),
    ).toBeInTheDocument();
    expect(mockOnDeleted).toHaveBeenCalledWith("news-1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/news/news-1", {
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

    render(<DeleteModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(mockOnDeleted).not.toHaveBeenCalled();
  });

  it("appelle onClose au clic sur Fermer apres suppression", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "News supprimee" },
      error: null,
    });

    render(<DeleteModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    await screen.findByText("L'news a ete supprime.");
    await user.click(screen.getByRole("button", { name: "Fermer" }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
