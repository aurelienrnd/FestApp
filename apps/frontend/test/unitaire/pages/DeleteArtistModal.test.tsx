import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeleteArtistModal from "../../../src/app/admin/artists/DeleteArtistModal";
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
const mockHandleArtist = vi.fn();

const defaultProps = {
  isOpen: true,
  selectedArtist: { id: "artist-1", name: "Band A" },
  onClose: mockOnClose,
  handleArtist: mockHandleArtist,
};

describe("DeleteArtistModal", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
    mockOnClose.mockReset();
    mockHandleArtist.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("affiche le nom de l'artiste dans le message de confirmation", () => {
    render(<DeleteArtistModal {...defaultProps} />);

    expect(
      screen.getByText(/Voulez-vous confirmer la suppression de/),
    ).toBeInTheDocument();
    expect(screen.getByText("Band A")).toBeInTheDocument();
  });

  it("appelle handleArtist et affiche le succes apres confirmation", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Artiste supprime" },
      error: null,
    });

    render(<DeleteArtistModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("L'artiste a ete supprime."),
    ).toBeInTheDocument();
    expect(mockHandleArtist).toHaveBeenCalledWith("artist-1");
    expect(mockApiRequest).toHaveBeenCalledWith("/admin/artists/artist-1", {
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

    render(<DeleteArtistModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
    expect(mockHandleArtist).not.toHaveBeenCalled();
  });

  it("appelle onClose au clic sur Fermer apres suppression", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Artiste supprime" },
      error: null,
    });

    render(<DeleteArtistModal {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));
    await screen.findByText("L'artiste a ete supprime.");
    await user.click(screen.getByRole("button", { name: "Fermer" }));

    expect(mockOnClose).toHaveBeenCalled();
  });
});
