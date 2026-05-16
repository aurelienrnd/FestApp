import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeInfosPratiques from "../../../src/app/(public)/HomeInfosPratiques";

vi.mock("../../../src/config/festival", () => ({
  FESTIVAL_LOCATION: {
    name: "Salle des Fins Bois",
    address: "8 rue de la Serraide",
    city: "16400 Vindelle",
  },
}));

vi.mock("../../../src/components/SectionCta", () => ({
  default: ({ href, label }: { href: string; label: string }) => (
    <a href={href}>{label}</a>
  ),
}));

describe("HomeInfosPratiques", () => {
  afterEach(() => {
    cleanup();
  });

  it("affiche le nom du festival", () => {
    render(<HomeInfosPratiques />);
    expect(screen.getByText("Salle des Fins Bois")).toBeInTheDocument();
  });

  it("affiche l'adresse du festival", () => {
    render(<HomeInfosPratiques />);
    expect(screen.getByText("8 rue de la Serraide")).toBeInTheDocument();
  });

  it("affiche la ville du festival", () => {
    render(<HomeInfosPratiques />);
    expect(screen.getByText("16400 Vindelle")).toBeInTheDocument();
  });

  it("contient un lien vers /practical-info", () => {
    render(<HomeInfosPratiques />);
    expect(screen.getByRole("link", { name: /savoir plus/i })).toHaveAttribute(
      "href",
      "/practical-info",
    );
  });
});
