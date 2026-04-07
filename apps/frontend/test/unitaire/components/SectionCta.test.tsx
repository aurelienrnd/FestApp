import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SectionCta from "../../../src/components/SectionCta";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("SectionCta", () => {
  afterEach(() => {
    cleanup();
  });

  it("affiche le label par défaut 'Voir plus' si label n'est pas fourni", () => {
    render(<SectionCta href="/lineup" />);
    expect(screen.getByRole("link", { name: /voir plus/i })).toBeInTheDocument();
  });

  it("affiche le label passé en prop", () => {
    render(<SectionCta href="/practical-info" label="Savoir plus" />);
    expect(screen.getByRole("link", { name: /savoir plus/i })).toBeInTheDocument();
  });

  it("le lien pointe vers le href passé en prop", () => {
    render(<SectionCta href="/news" label="Voir plus" />);
    expect(screen.getByRole("link", { name: /voir plus/i })).toHaveAttribute("href", "/news");
  });
});
