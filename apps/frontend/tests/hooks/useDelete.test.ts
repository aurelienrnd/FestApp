import { renderHook, act } from "@testing-library/react";
import { useDelete } from "@/hooks/useDelete";
import { ApiRequestError, apiRequest } from "@/functions/apiRequest";

// mock de apiRequest uniquement — ApiRequestError reste la vraie classe
vi.mock(
  "@/functions/apiRequest",
  async (importOriginal: <T>() => Promise<T>) => {
    const actual =
      await importOriginal<typeof import("@/functions/apiRequest")>();
    return { ...actual, apiRequest: vi.fn() };
  },
);

// recupere apiRequest sous forme typee pour le controler dans chaque test
const apiRequestMock = vi.mocked(apiRequest);

// ---------------------------------------------------------------------------

describe("useDelete", () => {
  it("appelle apiRequest avec DELETE sur endpoint/:id", async () => {
    // simuler une reponse API reussie
    apiRequestMock.mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => useDelete("/admin/artists"));

    await act(async () => {
      await result.current.handleDelete("uuid-123", vi.fn());
    });

    // apiRequest doit etre appele avec la methode DELETE et l'id dans l'URL
    expect(apiRequestMock).toHaveBeenCalledWith("/admin/artists/uuid-123", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("met isDeleted a true et appelle onSuccess(id) en cas de succes", async () => {
    // simuler une reponse API reussie
    apiRequestMock.mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => useDelete("/admin/artists"));
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.handleDelete("uuid-123", onSuccess);
    });

    // isDeleted doit etre true et onSuccess appele avec l'id supprime
    expect(result.current.isDeleted).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith("uuid-123");
    expect(result.current.error).toBeNull();
  });

  it("peuple error avec le message traduit en cas d'echec", async () => {
    // simuler une reponse API en echec avec un code 404
    apiRequestMock.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 404),
    });

    const { result } = renderHook(() => useDelete("/admin/artists"));
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.handleDelete("uuid-inconnu", onSuccess);
    });

    // error doit contenir le message traduit et onSuccess ne doit pas etre appele
    expect(result.current.error).toBe("Ressource introuvable.");
    expect(result.current.isDeleted).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("reset() remet isDeleted et error a leur valeur initiale", async () => {
    // simuler une suppression reussie pour peupler isDeleted
    apiRequestMock.mockResolvedValueOnce({ data: null, error: null });

    const { result } = renderHook(() => useDelete("/admin/artists"));

    await act(async () => {
      await result.current.handleDelete("uuid-123", vi.fn());
    });

    // verifier que isDeleted est bien true avant le reset
    expect(result.current.isDeleted).toBe(true);

    // appeler reset et verifier que l'etat est reinitialise
    act(() => result.current.reset());

    expect(result.current.isDeleted).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
