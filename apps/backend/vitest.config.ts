import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 20000,
    include: ["src/tests/**/*.test.ts"],
  },
});
