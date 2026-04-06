import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../../src/middlewares/asyncHandler";

describe("asyncHandler", () => {
  it("calls the wrapped async handler on success", async () => {
    // mock une fonction asynchrone qui résout sans erreur et de la function next
    const handler = vi.fn(async () => undefined);
    const next = vi.fn();

    // appelle la fonction asyncHandler pour obtenir une fonction middleware
    const wrapped = asyncHandler(handler);

    // appelle la fonction middleware avec des objets vides pour req et res, et la fonction next
    wrapped({} as never, {} as never, next);
    await Promise.resolve();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards rejected errors to next(error)", async () => {
    // mock une fonction asynchrone qui rejette avec une erreur et de la function next
    const error = new Error("boom");
    const handler = vi.fn(async () => {
      throw error;
    });
    const next = vi.fn();

    // appelle la fonction asyncHandler pour obtenir une fonction middleware
    const wrapped = asyncHandler(handler);

    // appelle la fonction middleware avec des objets vides pour req et res, et la fonction next
    wrapped({} as never, {} as never, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
