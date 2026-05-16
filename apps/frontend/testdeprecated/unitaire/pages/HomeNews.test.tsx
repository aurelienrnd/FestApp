import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeNews from "../../../src/app/(public)/HomeNews";
import type { HomeNews as HomeNewsItem } from "../../../src/type";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("../../../src/components/SectionCta", () => ({
  default: ({ href, label }: { href: string; label: string }) => (
    <a href={href}>{label}</a>
  ),
}));

const mockNewsList: HomeNewsItem[] = [
  {
    id: "news-1",
    title: "Ouverture de la billetterie",
    url_media: "/uploads/news/news-1.webp",
    description_media: "Photo billetterie",
    created_at: "2025-06-01T10:00:00.000Z",
  },
  {
    id: "news-2",
    title: "Programmation complète dévoilée",
    url_media: "/uploads/news/news-2.webp",
    description_media: "Photo programmation",
    created_at: "2025-06-05T10:00:00.000Z",
  },
];

describe("HomeNews", () => {
  afterEach(() => {
    cleanup();
  });

  it("affiche le titre de chaque news", () => {
    render(<HomeNews newsList={mockNewsList} />);
    expect(screen.getByText("Ouverture de la billetterie")).toBeInTheDocument();
    expect(screen.getByText("Programmation complète dévoilée")).toBeInTheDocument();
  });

  it("n'affiche rien si newsList est un tableau vide", () => {
    const { container } = render(<HomeNews newsList={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
