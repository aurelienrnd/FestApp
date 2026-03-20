import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChangePasswordModal from "../../../src/app/admin/dashboard/ChangePasswordModal";
import { ApiRequestError } from "../../../src/functions/apiRequest";

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

// Mock de apiRequest pour isoler les appels reseau
const mockApiRequest = vi.fn();
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return {
    ...actual,
    apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  };
});

describe("ChangePasswordModal", () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the form when open", () => {
    render(<ChangePasswordModal isOpen onClose={() => {}} />);

    expect(
      screen.getByPlaceholderText("Ancien mot de passe"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Nouveau mot de passe"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirmer le nouveau mot de passe"),
    ).toBeInTheDocument();
  });

  it("submit button is disabled when fields are empty", () => {
    render(<ChangePasswordModal isOpen onClose={() => {}} />);

    expect(screen.getByRole("button", { name: "Modifier" })).toBeDisabled();
  });

  it("shows error when new passwords do not match", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordModal isOpen onClose={() => {}} />);

    await user.type(
      screen.getByPlaceholderText("Ancien mot de passe"),
      "OldPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Nouveau mot de passe"),
      "NewPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Confirmer le nouveau mot de passe"),
      "Different1!",
    );
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(
      screen.getByText("Les nouveaux mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it("shows success message on successful submit", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Mot de passe modifie" },
      error: null,
    });

    render(<ChangePasswordModal isOpen onClose={() => {}} />);

    await user.type(
      screen.getByPlaceholderText("Ancien mot de passe"),
      "OldPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Nouveau mot de passe"),
      "NewPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Confirmer le nouveau mot de passe"),
      "NewPass1!",
    );
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(
      await screen.findByText("Votre mot de passe a ete modifie avec succes."),
    ).toBeInTheDocument();
  });

  it("shows API error message on failed submit", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 401),
    });

    render(<ChangePasswordModal isOpen onClose={() => {}} />);

    await user.type(
      screen.getByPlaceholderText("Ancien mot de passe"),
      "WrongPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Nouveau mot de passe"),
      "NewPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Confirmer le nouveau mot de passe"),
      "NewPass1!",
    );
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(
      await screen.findByText("Session expiree, merci de vous reconnecter."),
    ).toBeInTheDocument();
  });

  it("shows close button in normal mode", () => {
    render(<ChangePasswordModal isOpen onClose={() => {}} />);

    expect(screen.getByLabelText("Fermer la modal")).toBeInTheDocument();
  });

  it("hides close button in forced mode", () => {
    render(<ChangePasswordModal isOpen forced onClose={() => {}} />);

    expect(screen.queryByLabelText("Fermer la modal")).not.toBeInTheDocument();
  });

  it("shows Continuer button after success in forced mode", async () => {
    const user = userEvent.setup();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Mot de passe modifie" },
      error: null,
    });

    render(<ChangePasswordModal isOpen forced onClose={() => {}} />);

    await user.type(
      screen.getByPlaceholderText("Ancien mot de passe"),
      "OldPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Nouveau mot de passe"),
      "NewPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Confirmer le nouveau mot de passe"),
      "NewPass1!",
    );
    await user.click(screen.getByRole("button", { name: "Modifier" }));

    expect(
      await screen.findByRole("button", { name: "Continuer" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when Continuer is clicked after success in forced mode", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mockApiRequest.mockResolvedValueOnce({
      data: { message: "Mot de passe modifie" },
      error: null,
    });

    render(<ChangePasswordModal isOpen forced onClose={onClose} />);

    await user.type(
      screen.getByPlaceholderText("Ancien mot de passe"),
      "OldPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Nouveau mot de passe"),
      "NewPass1!",
    );
    await user.type(
      screen.getByPlaceholderText("Confirmer le nouveau mot de passe"),
      "NewPass1!",
    );
    await user.click(screen.getByRole("button", { name: "Modifier" }));
    await user.click(await screen.findByRole("button", { name: "Continuer" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
