import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AddArtistModal from "../../../src/app/admin/lineup/AddArtistModal";
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
const mockHandleArtist = vi.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  handleArtist: mockHandleArtist,
};

const mockArtist = {
  id: "artist-1",
  name: "Band A",
  genre: "Metal",
  origin: "France",
  bio: "Une bio",
  url_media: "/uploads/artists/photo.webp",
  description_media: "Photo de Band A",
  stage: "Grande Scene",
  start_time: "2025-06-20T18:00:00.000Z",
  end_time: "2025-06-20T19:30:00.000Z",
};

/** Remplit les champs de l'etape 1 */
async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Nom de l'artiste"), "Band A");
  await user.type(screen.getByPlaceholderText("Genre musical"), "Metal");
  await user.type(screen.getByPlaceholderText("Origine (pays / ville)"), "France");
  await user.type(screen.getByPlaceholderText("Biographie"), "Une bio");
}

/** Remplit l'etape 1 et navigue vers l'etape 2 */
async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
  await fillStep1(user);
  await user.click(screen.getByRole("button", { name: "Suivant" }));
}

/** Remplit les etapes 1 et 2 puis navigue vers l'etape 3 */
async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
  await goToStep2(user);
  await user.type(
    screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
    "Photo de Band A",
  );
  const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
  await user.upload(screen.getByLabelText("Photo de l'artiste"), file);
  await user.click(screen.getByRole("button", { name: "Suivant" }));
}

/** Remplit les champs de l'etape 3 via fireEvent pour les inputs date et time */
function fillStep3() {
  fireEvent.change(screen.getByLabelText("Scène"), {
    target: { value: "Grande Scene" },
  });
  fireEvent.change(screen.getByLabelText("Date du concert"), {
    target: { value: "2025-06-20" },
  });
  fireEvent.change(screen.getByLabelText("Heure de début"), {
    target: { value: "18:00" },
  });
  fireEvent.change(screen.getByLabelText("Heure de fin"), {
    target: { value: "19:30" },
  });
}

describe("AddArtistModal", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockOnClose.mockReset();
    mockHandleArtist.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders step 1 fields when open", () => {
    render(<AddArtistModal {...defaultProps} />);

    expect(screen.getByPlaceholderText("Nom de l'artiste")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Genre musical")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Origine (pays / ville)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Biographie")).toBeInTheDocument();
  });

  it("disables 'Suivant' when step 1 fields are empty", () => {
    render(<AddArtistModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
  });

  it("enables 'Suivant' when all step 1 fields are filled", async () => {
    const user = userEvent.setup();
    render(<AddArtistModal {...defaultProps} />);

    await fillStep1(user);

    expect(screen.getByRole("button", { name: "Suivant" })).toBeEnabled();
  });

  it("navigates to step 2 when step 1 is complete", async () => {
    const user = userEvent.setup();
    render(<AddArtistModal {...defaultProps} />);

    await goToStep2(user);

    expect(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
    ).toBeInTheDocument();
  });

  it("navigates back to step 1 from step 2", async () => {
    const user = userEvent.setup();
    render(<AddArtistModal {...defaultProps} />);

    await goToStep2(user);
    await user.click(screen.getByRole("button", { name: "Retour" }));

    expect(screen.getByPlaceholderText("Nom de l'artiste")).toBeInTheDocument();
  });

  it("navigates to step 3 when step 2 is complete", async () => {
    const user = userEvent.setup();
    render(<AddArtistModal {...defaultProps} />);

    await goToStep3(user);

    expect(screen.getByPlaceholderText("Nom de la scène")).toBeInTheDocument();
  });

  it("navigates back to step 2 from step 3", async () => {
    const user = userEvent.setup();
    render(<AddArtistModal {...defaultProps} />);

    await goToStep3(user);
    await user.click(screen.getByRole("button", { name: "Retour" }));

    expect(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
    ).toBeInTheDocument();
  });

  it("calls handleArtist on successful submission", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Artiste cree", artist: mockArtist },
      error: null,
    });

    render(<AddArtistModal {...defaultProps} />);
    await goToStep3(user);
    fillStep3();
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() => {
      expect(mockHandleArtist).toHaveBeenCalledWith(mockArtist);
    });
  });

  it("shows error message when submission fails", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    render(<AddArtistModal {...defaultProps} />);
    await goToStep3(user);
    fillStep3();
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(mockHandleArtist).not.toHaveBeenCalled();
  });

  it("resets to step 1 after closing", async () => {
    const user = userEvent.setup();
    render(<AddArtistModal {...defaultProps} />);

    await goToStep2(user);
    await user.click(screen.getByLabelText("Fermer la modal"));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
