import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ArtistsContent from "../../../src/components/ArtistsContent";
import { ApiRequestError } from "../../../src/functions/apiRequest";

// Mock de FESTIVAL_DAYS avec des dates fixes pour eviter les valeurs dynamiques en production
vi.mock("../../../src/config/festival", () => ({
  FESTIVAL_DAYS: ["2025-06-20", "2025-06-21", "2025-06-22"],
}));

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

// Mock de useNavPath pour simuler une route admin (surchargeable par test via mockUseNavPath)
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

const mockArtist = {
  id: "artist-1",
  name: "Band A",
  genre: "Metal",
  origin: "France",
  bio: "Une bio",
  url_media: "/uploads/artists/photo.webp",
  description_media: "Photo de Band A",
  youtube_url: null,
  spotify_url: null,
  stage: "Grande Scene",
  start_time: "2025-06-20T18:00:00.000Z",
  end_time: "2025-06-20T19:30:00.000Z",
};

describe("ArtistsContent", () => {
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

    render(<ArtistsContent basePath="/admin/artists" />);

    expect(screen.getByText("Chargement")).toBeInTheDocument();
  });

  it("shows error message when load fails", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 500),
    });

    render(<ArtistsContent basePath="/admin/artists" />);

    expect(
      await screen.findByText("Erreur serveur, reessayez plus tard."),
    ).toBeInTheDocument();
  });

  it("shows empty state when no artists", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { artists: [] },
      error: null,
    });

    render(<ArtistsContent basePath="/admin/artists" />);

    expect(await screen.findByText("Aucun artiste.")).toBeInTheDocument();
  });

  it("displays artist name and stage", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { artists: [mockArtist] },
      error: null,
    });

    render(<ArtistsContent basePath="/admin/artists" />);

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

    render(<ArtistsContent basePath="/admin/artists" />);

    expect(await screen.findByText("Scène non définie")).toBeInTheDocument();
    expect(screen.getByText("Date non définie")).toBeInTheDocument();
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

    render(<ArtistsContent basePath="/admin/artists" />);

    await screen.findByText("Band A");
    await user.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
    await user.click(screen.getByRole("button", { name: "Confirmer" }));

    await screen.findByText("L'artiste a ete supprime.");
    await waitFor(() => {
      expect(screen.queryByText("Band A")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Band B")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(
      2,
      "/admin/artists/artist-1",
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
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

    render(<ArtistsContent basePath="/admin/artists" />);

    await screen.findByText("Band A");
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    // les champs sont pre-remplis, on navigue jusqu'a l'etape 3 et on soumet
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(
      within(screen.getByTestId("modal")).getByRole("button", {
        name: "Modifier",
      }),
    );

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

  it("opens add modal when isAddModalOpen is true", async () => {
    mockApiRequest.mockResolvedValueOnce({
      data: { artists: [] },
      error: null,
    });

    render(<ArtistsContent basePath="/admin/artists" isAddModalOpen={true} />);

    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nom de l'artiste")).toBeInTheDocument();
  });

  it("adds an artist and appends it to the list", async () => {
    const user = userEvent.setup();
    const newArtist = { ...mockArtist, id: "artist-new", name: "New Band" };

    mockApiRequest
      .mockResolvedValueOnce({ data: { artists: [] }, error: null })
      .mockResolvedValueOnce({
        data: { message: "Artiste cree", artist: newArtist },
        error: null,
      });

    render(<ArtistsContent basePath="/admin/artists" isAddModalOpen={true} />);

    await screen.findByTestId("modal");

    // Etape 1 — infos textuelles
    await user.type(
      screen.getByPlaceholderText("Nom de l'artiste"),
      "New Band",
    );
    await user.type(screen.getByPlaceholderText("Genre musical"), "Rock");
    await user.type(
      screen.getByPlaceholderText("Origine (pays / ville)"),
      "France",
    );
    await user.type(screen.getByPlaceholderText("Biographie"), "Une bio");
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    // Etape 2 — image
    await user.type(
      screen.getByPlaceholderText("Description de l'image (texte alternatif)"),
      "Photo de New Band",
    );
    const file = new File(["image"], "photo.webp", { type: "image/webp" });
    await user.upload(screen.getByLabelText("Photo de l'artiste"), file);
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    // Etape 3 — scene et horaires
    await user.type(
      screen.getByPlaceholderText("Nom de la scène"),
      "Grande Scene",
    );
    fireEvent.change(screen.getByLabelText("Date du concert"), {
      target: { value: "2025-06-20" },
    });
    fireEvent.change(screen.getByLabelText("Heure de début"), {
      target: { value: "18:00" },
    });
    fireEvent.change(screen.getByLabelText("Heure de fin"), {
      target: { value: "19:30" },
    });
    await user.click(
      within(screen.getByTestId("modal")).getByRole("button", {
        name: "Ajouter",
      }),
    );

    expect(await screen.findByText("New Band")).toBeInTheDocument();
    expect(mockApiRequest).toHaveBeenNthCalledWith(
      2,
      "/admin/artists",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("hides Modifier and Supprimer buttons on non-admin path", async () => {
    mockUseNavPath.mockReturnValue({ isAdminPath: false });
    mockApiRequest.mockResolvedValueOnce({
      data: { artists: [mockArtist] },
      error: null,
    });

    render(<ArtistsContent basePath="/artists" />);

    await screen.findByText("Band A");
    expect(
      screen.queryByRole("button", { name: "Modifier" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Supprimer" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Voir plus" }),
    ).toBeInTheDocument();
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

    render(<ArtistsContent basePath="/admin/artists" />);

    expect(await screen.findByText("Band A")).toBeInTheDocument();
    expect(screen.getByText("Band B")).toBeInTheDocument();
  });
});
