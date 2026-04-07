import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePartenaires from "../../../src/app/(public)/HomePartenaires";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("../../../src/components/SectionCta", () => ({
  default: ({ href, label }: { href: string; label: string }) => (
    <a href={href}>{label}</a>
  ),
}));

describe("HomePartenaires", () => {
  afterEach(() => {
    cleanup();
  });

  it("affiche un logo par partenaire", () => {
    render(<HomePartenaires />);
    const logos = screen.getAllByRole("img");
    expect(logos.length).toBe(5);
  });

  it("chaque logo a un alt non vide", () => {
    render(<HomePartenaires />);
    const logos = screen.getAllByRole("img");
    logos.forEach((logo) => {
      expect(logo).toHaveAttribute("alt");
      expect(logo.getAttribute("alt")).not.toBe("");
    });
  });

  it("contient un lien vers /practical-info", () => {
    render(<HomePartenaires />);
    expect(screen.getByRole("link", { name: /voir plus/i })).toHaveAttribute(
      "href",
      "/practical-info",
    );
  });
});
