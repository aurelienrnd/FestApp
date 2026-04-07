import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeNews from "../../../src/app/(public)/HomeNews";
import type { HomeArticleRow } from "../../../src/types";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("../../../src/components/SectionCta", () => ({
  default: ({ href, label }: { href: string; label: string }) => (
    <a href={href}>{label}</a>
  ),
}));

const mockArticles: HomeArticleRow[] = [
  {
    id: "article-1",
    title: "Ouverture de la billetterie",
    url_media: "/uploads/articles/article-1.webp",
    description_media: "Photo billetterie",
    created_at: "2025-06-01T10:00:00.000Z",
  },
  {
    id: "article-2",
    title: "Programmation complète dévoilée",
    url_media: "/uploads/articles/article-2.webp",
    description_media: "Photo programmation",
    created_at: "2025-06-05T10:00:00.000Z",
  },
];

describe("HomeNews", () => {
  afterEach(() => {
    cleanup();
  });

  it("affiche le titre de chaque article", () => {
    render(<HomeNews articles={mockArticles} />);
    expect(screen.getByText("Ouverture de la billetterie")).toBeInTheDocument();
    expect(screen.getByText("Programmation complète dévoilée")).toBeInTheDocument();
  });

  it("n'affiche rien si articles est un tableau vide", () => {
    const { container } = render(<HomeNews articles={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
