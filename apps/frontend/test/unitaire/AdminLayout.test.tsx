import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookies, mockRedirect } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockRedirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

import AdminLayout from "../../src/app/admin/layout";

describe("AdminLayout (server guard)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls backend auth check and renders children when session is valid", async () => {
    mockCookies.mockResolvedValue({ toString: () => "access_token=abc" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
    } as Response);

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
    mockCookies.mockResolvedValue({ toString: () => "access_token=expired" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
    } as Response);

    await expect(AdminLayout({ children: <div>Admin Content</div> })).rejects.toThrow(
      "REDIRECT:/login",
    );
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("throws a clear error when NEXT_PUBLIC_API_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    mockCookies.mockResolvedValue({ toString: () => "access_token=abc" });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(AdminLayout({ children: <div>Admin Content</div> })).rejects.toThrow(
      "Missing env var: NEXT_PUBLIC_API_URL",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
