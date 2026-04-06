import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AddArticleModal from "../../../src/app/admin/news/AddArticleModal";
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

// Mock de apiRequest pour eviter les appels reseau
const mockApiRequest = vi.fn();
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

// Mock de URL.createObjectURL / revokeObjectURL (non disponible dans jsdom)
global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

const mockOnClose = vi.fn();
const mockHandleArticle = vi.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  handleArticle: mockHandleArticle,
};

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

/** Passe a l'etape 2 en remplissant le titre requis */
async function goToStep2(
  user: ReturnType<typeof userEvent.setup>,
  title = "Ouverture de la billetterie",
) {
  await user.type(screen.getByPlaceholderText("Titre de l'article"), title);
  await user.click(screen.getByRole("button", { name: "Suivant" }));
}

describe("AddArticleModal", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockOnClose.mockReset();
    mockHandleArticle.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("desactive le bouton Suivant quand le titre est vide", () => {
    render(<AddArticleModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
  });

  it("active le bouton Suivant quand le titre est rempli", async () => {
    const user = userEvent.setup();
    render(<AddArticleModal {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("Titre de l'article"), "Mon article");

    expect(screen.getByRole("button", { name: "Suivant" })).toBeEnabled();
  });

  it("passe a l'etape 2 apres clic sur Suivant", async () => {
    const user = userEvent.setup();
    render(<AddArticleModal {...defaultProps} />);

    await goToStep2(user);

    expect(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
    ).toBeInTheDocument();
  });

  it("revient a l'etape 1 apres clic sur Retour", async () => {
    const user = userEvent.setup();
    render(<AddArticleModal {...defaultProps} />);

    await goToStep2(user);
    await user.click(screen.getByRole("button", { name: "Retour" }));

    expect(
      screen.getByPlaceholderText("Titre de l'article"),
    ).toBeInTheDocument();
  });

  it("desactive le bouton Ajouter quand la description est vide et aucune image", async () => {
    const user = userEvent.setup();
    render(<AddArticleModal {...defaultProps} />);

    await goToStep2(user);

    expect(screen.getByRole("button", { name: "Ajouter" })).toBeDisabled();
  });

  it("soumet le formulaire en POST et appelle handleArticle", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Article cree", article: mockArticle },
      error: null,
    });

    render(<AddArticleModal {...defaultProps} />);

    await goToStep2(user);

    await user.type(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
      "Photo de la billetterie",
    );
    const file = new File(["image"], "photo.webp", { type: "image/webp" });
    await user.upload(screen.getByLabelText("Image de l'article"), file);

    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() => {
      expect(mockHandleArticle).toHaveBeenCalledWith(mockArticle);
    });
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/articles",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("affiche un message d'erreur API en cas d'echec", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError("Image requise", 400),
    });

    render(<AddArticleModal {...defaultProps} />);

    await goToStep2(user);
    await user.type(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
      "Photo de la billetterie",
    );
    const file = new File(["image"], "photo.webp", { type: "image/webp" });
    await user.upload(screen.getByLabelText("Image de l'article"), file);
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(await screen.findByText("Image requise")).toBeInTheDocument();
    expect(mockHandleArticle).not.toHaveBeenCalled();
  });

  it("pre-remplit les champs en mode edition", () => {
    render(
      <AddArticleModal {...defaultProps} articleToEdit={mockArticle} />,
    );

    expect(screen.getByDisplayValue("Ouverture de la billetterie")).toBeInTheDocument();
    expect(screen.getByDisplayValue("La billetterie ouvre.")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("soumet en PATCH en mode edition", async () => {
    const user = userEvent.setup();
    const updatedArticle = { ...mockArticle, title: "Titre modifie" };
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Article modifie", article: updatedArticle },
      error: null,
    });

    render(
      <AddArticleModal {...defaultProps} articleToEdit={mockArticle} />,
    );

    // Les champs sont pre-remplis — passe directement a l'etape 2
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    // En mode edition, pas besoin d'uploader une image
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    await waitFor(() => {
      expect(mockHandleArticle).toHaveBeenCalledWith(updatedArticle);
    });
    expect(mockApiRequest).toHaveBeenCalledWith(
      `/admin/articles/${mockArticle.id}`,
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("en mode edition, le bouton Modifier est actif sans nouvelle image", async () => {
    const user = userEvent.setup();
    render(
      <AddArticleModal {...defaultProps} articleToEdit={mockArticle} />,
    );

    await user.click(screen.getByRole("button", { name: "Suivant" }));

    // description_media est pre-remplie, pas besoin d'image
    expect(screen.getByRole("button", { name: "Modifier" })).toBeEnabled();
  });
});
