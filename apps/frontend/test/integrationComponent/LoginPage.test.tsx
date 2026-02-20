import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Page from "../../src/app/login/page";

const mockPush = vi.fn();
const mockApiRequest = vi.fn();

// Mock du router Next.js pour verifier les redirections.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock du helper API pour piloter les reponses success/erreur.
vi.mock("../../src/functions/apiRequest", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Mock de react-modal, rend une div uniquement quand la modal est ouverte.
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

// Mock du composant forgot password pour simplifier le test de la modal.
vi.mock("../../src/components/ForgotPassword", () => ({
  default: () => <div>ForgotPassword form</div>,
}));

describe("Login Page", () => {
  // Reinitialise DOM et mocks entre chaque test.
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    mockPush.mockReset();
    mockApiRequest.mockReset();
  });

  it("renders login form with submit button disabled by default", () => {
    render(<Page />);

    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Votre mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
  });

  it("shows api error message and does not redirect", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValue({
      data: null,
      error: { message: "Email ou mot de passe incorrect" },
    });

    render(<Page />);

    await user.type(screen.getByPlaceholderText("Votre email"), "test@mail.com");
    await user.type(screen.getByPlaceholderText("Votre mot de passe"), "wrong-pass");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(screen.getByText("Email ou mot de passe incorrect")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to dashboard on successful login", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValue({
      data: { userSession: {} },
      error: null,
    });

    render(<Page />);

    await user.type(screen.getByPlaceholderText("Votre email"), "test@mail.com");
    await user.type(screen.getByPlaceholderText("Votre mot de passe"), "good-pass");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("opens forgot password modal when button is clicked", async () => {
    const user = userEvent.setup();
    render(<Page />);

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mot de passe oublie" }));

    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mot de passe oublie" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ForgotPassword form")).toBeInTheDocument();
  });
});
