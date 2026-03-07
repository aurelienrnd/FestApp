import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminLayout from "../../src/app/admin/layout";

// Déclare des mocks pour les cookies et la redirection
const { mockCookies, mockRedirect } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockRedirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

// Mock du module next/headers pour remplacer la fonction cookies
vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

// Mock du module next/navigation pour intercepter les redirections
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

describe("AdminLayout (server guard)", () => {
  // Réinitialise les variables d’environnement et les mocks avant chaque test
  beforeEach(() => {
    delete process.env.API_URL_SERVER;
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
    vi.clearAllMocks();
  });

  // Restaure les implémentations originales après chaque test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls backend auth check and renders children when session is valid", async () => {
    // Simule la présence d’un cookie access_token
    mockCookies.mockResolvedValue({ toString: () => "access_token=abc" });

    // Mock de fetch pour simuler une réponse API valide (admin authentifié)
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "admin-1",
          email: "admin@test.fr",
          role: "admin",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    // Définit un composant enfant fictif et exécute le layout Admin
    const child = <div>Admin Content</div>;
    const result = await AdminLayout({ children: child });

    expect(fetch).toHaveBeenCalledWith("http://localhost:4000/admin/auth/me", {
      method: "GET",
      headers: { cookie: "access_token=abc" },
      cache: "no-store",
    });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("redirects to /login when session is invalid", async () => {
    // Simule un token expiré dans les cookies
    mockCookies.mockResolvedValue({ toString: () => "access_token=expired" });

    // Mock de fetch retournant une réponse 401 (non autorisé)
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    // Vérifie que l’utilisateur est redirigé vers /login
    await expect(
      AdminLayout({ children: <div>Admin Content</div> }),
    ).rejects.toThrow("REDIRECT:/login");

    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("throws a clear error when NEXT_PUBLIC_API_URL is missing", async () => {
    // Supprime les variables d’environnement nécessaires
    delete process.env.API_URL_SERVER;
    delete process.env.NEXT_PUBLIC_API_URL;

    // Simule la présence d’un access_token valide
    mockCookies.mockResolvedValue({ toString: () => "access_token=abc" });

    // Espionne fetch pour vérifier qu’il ne sera pas appelé
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // Vérifie qu’une erreur est levée si les variables d’environnement sont manquantes
    await expect(
      AdminLayout({ children: <div>Admin Content</div> }),
    ).rejects.toThrow("Missing env var: API_URL_SERVER or NEXT_PUBLIC_API_URL");

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
