import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArtistDetailModal from "../../../src/app/admin/lineup/ArtistDetailModal";

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
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Callback mocke passe en prop onClose a la modale
const mockOnClose = vi.fn();

// Donnees de test representant un artiste complet avec concert
const mockArtist = {
  id: "artist-1",
  name: "Red Hot",
  genre: "Rock",
  origin: "USA",
  bio: "Une bio de groupe.",
  url_media: "/uploads/artists/test.webp",
  description_media: "Photo promo",
  youtube_url: null,
  spotify_url: null,
  stage: "main-stage",
  start_time: "2026-05-22T18:00:00.000Z",
  end_time: "2026-05-22T19:30:00.000Z",
};

describe("ArtistDetailModal", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    mockOnClose.mockReset();
  });

  it("n'affiche rien quand artist est null", () => {
    render(
      <ArtistDetailModal isOpen={true} onClose={mockOnClose} artist={null} />,
    );
    expect(screen.queryByText("Red Hot")).not.toBeInTheDocument();
  });

  it("affiche le nom de l'artiste", () => {
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={mockArtist}
      />,
    );
    expect(screen.getByText("Red Hot")).toBeInTheDocument();
  });

  it("affiche la biographie de l'artiste", () => {
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={mockArtist}
      />,
    );
    expect(screen.getByText("Une bio de groupe.")).toBeInTheDocument();
  });

  it("affiche l'image avec le bon texte alternatif", () => {
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={mockArtist}
      />,
    );
    expect(screen.getByAltText("Photo promo")).toBeInTheDocument();
  });

  it("formate la date du concert en majuscules avec le separateur H", () => {
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={mockArtist}
      />,
    );
    // Le format attendu est "JOUR JJ MOIS HHhMM" en majuscules — verifie le separateur H
    expect(screen.queryByText("Date non definie")).not.toBeInTheDocument();
    expect(screen.getByText(/H\d{2}$/)).toBeInTheDocument();
  });

  it("affiche 'Date non definie' quand start_time est absent", () => {
    const artistWithoutDate = {
      ...mockArtist,
      start_time: null as unknown as string,
    };
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={artistWithoutDate}
      />,
    );
    expect(screen.getByText("Date non definie")).toBeInTheDocument();
  });

  it("n'affiche pas les liens YouTube et Spotify quand les URLs sont nulles", () => {
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={mockArtist}
      />,
    );
    expect(screen.queryByRole("link", { name: "YouTube" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Spotify" })).not.toBeInTheDocument();
  });

  it("affiche le lien YouTube quand youtube_url est defini", () => {
    const artistWithYoutube = {
      ...mockArtist,
      youtube_url: "https://www.youtube.com/@RedHot",
    };
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={artistWithYoutube}
      />,
    );
    const link = screen.getByRole("link", { name: "YouTube" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://www.youtube.com/@RedHot");
  });

  it("affiche le lien Spotify quand spotify_url est defini", () => {
    const artistWithSpotify = {
      ...mockArtist,
      spotify_url: "https://open.spotify.com/artist/123",
    };
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={artistWithSpotify}
      />,
    );
    const link = screen.getByRole("link", { name: "Spotify" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://open.spotify.com/artist/123");
  });

  it("appelle onClose au clic sur le bouton fermer", async () => {
    const user = userEvent.setup();
    render(
      <ArtistDetailModal
        isOpen={true}
        onClose={mockOnClose}
        artist={mockArtist}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Fermer la modal" }));
    expect(mockOnClose).toHaveBeenCalled();
  });
});