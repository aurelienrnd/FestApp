import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LineupContent from "../../../src/app/admin/lineup/LineupContent";
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

// Mock de useNavPath pour simuler une route admin
vi.mock("../../../src/hooks/useNavPath", () => ({
  useNavPath: () => ({ isAdminPath: true }),
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

describe("LineupContent", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows loading state while fetching", () => {
    mockApiRequest.mockReturnValue(new Promise(() => {}));

    render(<LineupContent />);

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("shows error message when load fails", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    render(<LineupContent />);

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
  });

  it("shows empty state when no artists", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { artists: [] },
      error: null,
    });

    render(<LineupContent />);

    expect(await screen.findByText("Aucun artiste.")).toBeInTheDocument();
  });

  it("displays artist name and stage", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { artists: [mockArtist] },
      error: null,
    });

    render(<LineupContent />);

    expect(await screen.findByText("Band A")).toBeInTheDocument();
    expect(screen.getByText("Grande Scene")).toBeInTheDocument();
  });

  it("shows 'Scene non definie' and 'Date non definie' when concert is null", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: {
        artists: [
          { ...mockArtist, stage: null, start_time: null, end_time: null },
        ],
      },
      error: null,
    });

    render(<LineupContent />);

    expect(await screen.findByText("Scene non definie")).toBeInTheDocument();
    expect(screen.getByText("Date non definie")).toBeInTheDocument();
  });

  it("deletes an artist and removes it from the list", async () => {
    const user = userEvent.setup();

    mockApiRequest
      // 1. Chargement initial de la liste
      .mockResolvedValueOnce({
        data: {
          artists: [
            mockArtist,
            { ...mockArtist, id: "artist-2", name: "Band B" },
          ],
        },
        error: null,
      })
      // 2. Suppression reussie
      .mockResolvedValueOnce({
        data: { message: "Artiste supprime" },
        error: null,
      });

    render(<LineupContent />);

    await screen.findByText("Band A");
    await user.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    await screen.findByText("L'artiste a ete supprime.");
    await waitFor(() => {
      expect(screen.queryByText("Band A")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Band B")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(2, "/admin/artists/artist-1", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("edits an artist and updates it in the list", async () => {
    const user = userEvent.setup();
    const updatedArtist = { ...mockArtist, name: "Band A Updated" };

    mockApiRequest
      // 1. Chargement initial de la liste
      .mockResolvedValueOnce({
        data: { artists: [mockArtist] },
        error: null,
      })
      // 2. Modification reussie
      .mockResolvedValueOnce({
        data: { message: "Artiste modifie", artist: updatedArtist },
        error: null,
      });

    render(<LineupContent />);

    await screen.findByText("Band A");
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    // les champs sont pre-remplis, on navigue jusqu'a l'etape 3 et on soumet
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    await waitFor(() => {
      expect(screen.queryByText("Band A")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Band A Updated")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(
      2,
      `/admin/artists/${mockArtist.id}`,
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("displays multiple artists", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: {
        artists: [
          mockArtist,
          { ...mockArtist, id: "artist-2", name: "Band B" },
        ],
      },
      error: null,
    });

    render(<LineupContent />);

    expect(await screen.findByText("Band A")).toBeInTheDocument();
    expect(screen.getByText("Band B")).toBeInTheDocument();
  });
});
