import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeHero from "../../../src/app/(public)/HomeHero";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("HomeHero", () => {
  afterEach(() => {
    cleanup();
  });

  it("affiche le logo avec le bon alt", () => {
    render(<HomeHero />);
    expect(screen.getByAltText("Vind'Hell Fest")).toBeInTheDocument();
  });

});
