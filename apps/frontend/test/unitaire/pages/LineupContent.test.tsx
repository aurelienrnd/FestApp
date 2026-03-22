import { cleanup, render, screen } from "@testing-library/react";
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
