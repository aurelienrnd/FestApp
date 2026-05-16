import { renderHook, waitFor } from "@testing-library/react";
import { useFetch } from "@/hooks/useFetch";
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

describe("useFetch", () => {
  it("demarre en etat isLoading: true, data: null", () => {
    // simuler une promesse qui ne se resout jamais — le hook reste bloque en loading
    apiRequestMock.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useFetch("/test"));

    // etat initial avant que l'effet ne se resout
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("passe en data et isLoading: false si l'API repond avec succes", async () => {
    // simuler une reponse API reussie avec des donnees
    apiRequestMock.mockResolvedValueOnce({
      data: [{ id: "1", name: "Test" }],
      error: null,
    });

    const { result } = renderHook(() =>
      useFetch<{ id: string; name: string }[]>("/test"),
    );

    // attendre que l'effet se resout
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // les donnees doivent etre presentes et l'erreur absente
    expect(result.current.data).toEqual([{ id: "1", name: "Test" }]);
    expect(result.current.error).toBeNull();
  });

  it("passe en error et isLoading: false si l'API retourne une erreur", async () => {
    // simuler une reponse API en echec avec un code 404
    apiRequestMock.mockResolvedValueOnce({
      data: null,
      error: new ApiRequestError(undefined, 404),
    });

    const { result } = renderHook(() => useFetch("/test"));

    // attendre que l'effet se resout
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // le message d'erreur traduit doit etre present et les donnees absentes
    expect(result.current.error).toBe("Ressource introuvable.");
    expect(result.current.data).toBeNull();
  });
});
