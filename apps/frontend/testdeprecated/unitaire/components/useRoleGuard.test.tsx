import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminUserProvider } from "../../../src/components/AdminUserProvider";
import { useRoleGuard } from "../../../src/hooks/useRoleGuard";

// Pathname courant simule — modifie par chaque test selon la route a tester
let mockPathname = "/admin/dashboard";
// Spy sur router.replace pour verifier les redirections
const mockReplace = vi.fn();

// Mock de next/navigation pour isoler useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock de useNavPath pour controler le pathname dans les tests
vi.mock("../../../src/hooks/useNavPath", () => ({
  useNavPath: () => ({ pathname: mockPathname, isAdminPath: true }),
}));

// Composant consommateur qui appelle le hook
function Consumer() {
  useRoleGuard();
  return <div>rendered</div>;
}

// Utilisateur admin de base — le role est surcharge dans les tests qui verifient les restrictions
const baseUser = {
  id: "user-1",
  email: "admin@test.fr",
  display_name: "Admin",
  role: "admin",
};

describe("useRoleGuard", () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("ne redirige pas quand adminUser est null", () => {
    mockPathname = "/admin/users";
    render(<Consumer />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("ne redirige pas quand le role admin accede a /admin/users", () => {
    mockPathname = "/admin/users";
    render(
      <AdminUserProvider value={{ user: baseUser, mustChangePassword: false }}>
        <Consumer />
      </AdminUserProvider>,
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirige vers /admin/dashboard quand le role artists accede a /admin/users", () => {
    mockPathname = "/admin/users";
    render(
      <AdminUserProvider
        value={{
          user: { ...baseUser, role: "artists" },
          mustChangePassword: false,
        }}
      >
        <Consumer />
      </AdminUserProvider>,
    );
    expect(mockReplace).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("ne redirige pas quand le role news accede a /admin/news", () => {
    mockPathname = "/admin/news";
    render(
      <AdminUserProvider
        value={{
          user: { ...baseUser, role: "news" },
          mustChangePassword: false,
        }}
      >
        <Consumer />
      </AdminUserProvider>,
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirige quand le role news accede a /admin/artists", () => {
    mockPathname = "/admin/artists";
    render(
      <AdminUserProvider
        value={{
          user: { ...baseUser, role: "news" },
          mustChangePassword: false,
        }}
      >
        <Consumer />
      </AdminUserProvider>,
    );
    expect(mockReplace).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("ne redirige pas quand la route n'a pas de restriction de role", () => {
    mockPathname = "/une-route-inconnue";
    render(
      <AdminUserProvider
        value={{
          user: { ...baseUser, role: "news" },
          mustChangePassword: false,
        }}
      >
        <Consumer />
      </AdminUserProvider>,
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
