import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MobilNav } from "../../src/components/Banner";
import { navVisitorItems } from "../../src/config/navigation";

// Mock du composant Link, le par une simple balise <a>
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock de react-modal car elle utilise un vrais DOM, rend une fnction qui affiche une div ci la modal est ouverte
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

describe("MobilNav", () => {
  it("opens and closes the mobile modal", async () => {
    // Initialise un utilisateur et Rend le composant
    const user = userEvent.setup();
    render(
      <MobilNav items={navVisitorItems} pathname="/" isAdminPath={false} />,
    );

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    await user.click(screen.getAllByRole("button")[0]);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button")[1]);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
