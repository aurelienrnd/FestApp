import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeProgrammation from "../../../src/app/(public)/HomeProgrammation";
import type { HomeArtistRow } from "../../../src/types";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("../../../src/components/SectionCta", () => ({
  default: ({ href, label }: { href: string; label: string }) => (
    <a href={href}>{label}</a>
  ),
}));

const mockArtists: HomeArtistRow[] = [
  {
    id: "artist-1",
    name: "Band A",
    url_media: "/uploads/artists/band-a.webp",
    description_media: "Photo Band A",
    stage: "Grande Scene",
    start_time: "2025-06-21T20:00:00.000Z",
    end_time: "2025-06-21T21:30:00.000Z",
  },
  {
    id: "artist-2",
    name: "Band B",
    url_media: "/uploads/artists/band-b.webp",
    description_media: "Photo Band B",
    stage: "Scene Metal",
    start_time: "2025-06-20T18:00:00.000Z",
    end_time: "2025-06-20T19:30:00.000Z",
  },
];

describe("HomeProgrammation", () => {
  afterEach(() => {
    cleanup();
  });

  it("affiche le nom de chaque artiste", () => {
    render(<HomeProgrammation artists={mockArtists} />);
    expect(screen.getByText("Band A")).toBeInTheDocument();
    expect(screen.getByText("Band B")).toBeInTheDocument();
  });

  it("affiche la scène de chaque artiste", () => {
    render(<HomeProgrammation artists={mockArtists} />);
    expect(screen.getByText("Grande Scene")).toBeInTheDocument();
    expect(screen.getByText("Scene Metal")).toBeInTheDocument();
  });

  it("affiche une date formatée en fr-FR pour chaque artiste", () => {
    render(<HomeProgrammation artists={mockArtists} />);
    const dates = screen.getAllByText(/samedi|vendredi|jeudi|mercredi|mardi|lundi|dimanche/i);
    expect(dates.length).toBeGreaterThan(0);
  });

  it("n'affiche rien si artists est un tableau vide", () => {
    const { container } = render(<HomeProgrammation artists={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
