import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminUserProvider } from "../../../src/components/AdminUserProvider";
import DashboardContent from "../../../src/app/admin/dashboard/DashboardContent";

// Mock de next/navigation pour isoler useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

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

// Mock de apiRequest pour eviter les appels reseau dans les tests de la modale
vi.mock("../../../src/functions/apiRequest", async () => {
  const actual = await vi.importActual("../../../src/functions/apiRequest");
  return { ...actual, apiRequest: vi.fn() };
});

const baseUser = {
  id: "user-1",
  email: "admin@test.fr",
  display_name: "Admin",
  role: "admin",
};

describe("DashboardContent", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not open the modal when mustChangePassword is false", () => {
    render(
      <AdminUserProvider value={{ user: baseUser, mustChangePassword: false }}>
        <DashboardContent />
      </AdminUserProvider>,
    );

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("opens the modal automatically when mustChangePassword is true", () => {
    render(
      <AdminUserProvider value={{ user: baseUser, mustChangePassword: true }}>
        <DashboardContent />
      </AdminUserProvider>,
    );

    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("hides the close button when mustChangePassword is true (forced mode)", () => {
    render(
      <AdminUserProvider value={{ user: baseUser, mustChangePassword: true }}>
        <DashboardContent />
      </AdminUserProvider>,
    );

    expect(screen.queryByLabelText("Fermer la modal")).not.toBeInTheDocument();
  });

  it("displays user info", () => {
    render(
      <AdminUserProvider value={{ user: baseUser, mustChangePassword: false }}>
        <DashboardContent />
      </AdminUserProvider>,
    );

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("admin@test.fr")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();
  });
});
