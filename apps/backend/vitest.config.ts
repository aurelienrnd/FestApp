import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 20000,
    include: ["tests/**/*.test.ts"],
    // Les fichiers de test partagent la meme base PostgreSQL — execution sequentielle
    // obligatoire pour eviter les deadlocks sur les migrations et le TRUNCATE.
    fileParallelism: false,
  },
});
