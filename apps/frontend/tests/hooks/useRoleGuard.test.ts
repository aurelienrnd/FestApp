import { renderHook } from "@testing-library/react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAdminUser } from "@/components/AdminUserProvider";
import { useNavPath } from "@/hooks/useNavPath";
import type { AdminAuthMeResponse } from "@/type";

// next/navigation : mock de useRouter pour verifier la redirection sans Next.js
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// mock de useAdminUser pour simuler differents utilisateurs connectes
vi.mock("@/components/AdminUserProvider", () => ({
  useAdminUser: vi.fn(),
}));

// mock de useNavPath pour simuler differents chemins de navigation
vi.mock("@/hooks/useNavPath", () => ({
  useNavPath: vi.fn(),
}));

// utilisateur avec le role "news" — autorise sur /admin/news mais pas sur /admin/users
const mockAdminUser: AdminAuthMeResponse = {
  user: {
    id: "uuid-1",
    email: "test@test.com",
    display_name: "Test User",
    role: "news",
  },
  mustChangePassword: false,
};

beforeEach(() => {
  mockReplace.mockClear();
  vi.mocked(useAdminUser).mockReturnValue(mockAdminUser);
  vi.mocked(useNavPath).mockReturnValue({
    isAdminPath: true,
    pathname: "/admin/news",
  });
});

// ---------------------------------------------------------------------------

describe("useRoleGuard", () => {
  it("ne redirige pas si adminUser est null", () => {
    // sans utilisateur connecte, le hook ne doit rien faire
    vi.mocked(useAdminUser).mockReturnValue(null);
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: true,
      pathname: "/admin/users",
    });

    renderHook(() => useRoleGuard());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("ne redirige pas si la route ne correspond a aucun item de navigation", () => {
    // une route inconnue n'a pas de restriction de role
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: true,
      pathname: "/admin/unknown",
    });

    renderHook(() => useRoleGuard());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("ne redirige pas si le role est autorise sur la route courante", () => {
    // role "news" est autorise sur /admin/news (role: "admin, news")
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: true,
      pathname: "/admin/news",
    });

    renderHook(() => useRoleGuard());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirige vers /admin/dashboard si le role n'est pas autorise sur la route", () => {
    // role "news" n'est pas autorise sur /admin/users (role: "admin" uniquement)
    vi.mocked(useNavPath).mockReturnValue({
      isAdminPath: true,
      pathname: "/admin/users",
    });

    renderHook(() => useRoleGuard());

    expect(mockReplace).toHaveBeenCalledWith("/admin/dashboard");
  });
});
