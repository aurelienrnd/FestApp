import { renderHook, act } from "@testing-library/react";
import { useMutation } from "@/hooks/useMutation";
import { ApiRequestError, apiRequest } from "@/functions/apiRequest";

// mock de apiRequest uniquement — ApiRequestError reste la vraie classe
vi.mock(
  "@/functions/apiRequest",
  async (importOriginal: <T>() => Promise<T>) => {
    const actual = await importOriginal<typeof import("@/functions/apiRequest")>();
    return { ...actual, apiRequest: vi.fn() };
  },
);

// recupere apiRequest sous forme typee pour le controler dans chaque test
const apiRequestMock = vi.mocked(apiRequest);

// ---------------------------------------------------------------------------

describe("useMutation", () => {
  it("appelle apiRequest avec la bonne methode et le bon body JSON", async () => {
    // simuler une reponse API reussie
    apiRequestMock.mockResolvedValueOnce({ data: { id: "1" }, error: null });

    const { result } = renderHook(() => useMutation("/admin/artists", "POST"));

    await act(async () => {
      await result.current.mutate({ name: "Artiste" }, vi.fn());
    });

    // apiRequest doit etre appele avec la methode POST et le body serialise en JSON
    expect(apiRequestMock).toHaveBeenCalledWith("/admin/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Artiste" }),
    });
  });

  it("appelle apiRequest avec un FormData sans header Content-Type", async () => {
    // simuler une reponse API reussie
    apiRequestMock.mockResolvedValueOnce({ data: { id: "1" }, error: null });

    const { result } = renderHook(() => useMutation("/admin/news", "POST"));
    const formData = new FormData();
    formData.append("title", "Ma news");

    await act(async () => {
      await result.current.mutate(formData, vi.fn());
    });

    // apiRequest doit etre appele avec le FormData directement, sans header JSON
    expect(apiRequestMock).toHaveBeenCalledWith("/admin/news", {
      method: "POST",
      body: formData,
    });
  });

  it("appelle onSuccess avec les donnees en cas de succes", async () => {
    // simuler une reponse API reussie avec des donnees
    apiRequestMock.mockResolvedValueOnce({
      data: { id: "42", name: "Artiste" },
      error: null,
    });

    const { result } = renderHook(() => useMutation("/admin/artists", "POST"));
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.mutate({ name: "Artiste" }, onSuccess);
    });

    // onSuccess doit etre appele avec les donnees retournees par l'API
    expect(onSuccess).toHaveBeenCalledWith({ id: "42", name: "Artiste" });
    expect(result.current.error).toBeNull();
  });

  it("peuple error avec le message traduit en cas d'echec", async () => {
    // simuler une reponse API en echec avec un code 403
    apiRequestMock.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 403),
    });

    const { result } = renderHook(() => useMutation("/admin/artists", "POST"));
    const onSuccess = vi.fn();

    await act(async () => {
      await result.current.mutate({ name: "Artiste" }, onSuccess);
    });

    // error doit contenir le message traduit et onSuccess ne doit pas etre appele
    expect(result.current.error).toBe("Acces refuse.");
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("reset() remet isLoading et error a leur valeur initiale", async () => {
    // simuler une reponse API en echec pour peupler error
    apiRequestMock.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 403),
    });

    const { result } = renderHook(() => useMutation("/admin/artists", "POST"));

    await act(async () => {
      await result.current.mutate({}, vi.fn());
    });

    // verifier que error est bien peuple avant le reset
    expect(result.current.error).not.toBeNull();

    // appeler reset et verifier que l'etat est reinitialise
    act(() => result.current.reset());

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
