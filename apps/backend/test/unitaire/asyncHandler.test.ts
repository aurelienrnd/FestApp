import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "../../src/middlewares/asyncHandler";

describe("asyncHandler", () => {
  it("calls the wrapped async handler on success", async () => {
    const handler = vi.fn(async () => undefined);
    const next = vi.fn();

    const wrapped = asyncHandler(handler);
    wrapped({} as never, {} as never, next);
    await Promise.resolve();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards rejected errors to next(error)", async () => {
    const error = new Error("boom");
    const handler = vi.fn(async () => {
      throw error;
    });
    const next = vi.fn();

    const wrapped = asyncHandler(handler);
    wrapped({} as never, {} as never, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
