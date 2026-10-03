import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Cree le schema de la base de test une seule fois, avant l'import de l'app (cf. setupTestDb.ts)
    globalSetup: ["./tests/setupTestDb.ts"],
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 20000,
    include: ["tests/**/*.test.ts"],
    // Les fichiers de test partagent la meme base PostgreSQL — execution sequentielle
    // obligatoire pour eviter les deadlocks sur les migrations et le TRUNCATE.
    fileParallelism: false,
  },
});
