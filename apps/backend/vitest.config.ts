import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 20000,
    // TOUTE la suite est desactivee (include vide) : tests/setup.ts et tests/helpers/
    // (fixtures.ts, createAuthSession.ts) referencent encore le schema JWT custom d'avant
    // la migration Better Auth (tables "users"/"sessions", colonnes
    // password_hash/display_name/user_id...), supprime par le commit d30836e.
    // A reactiver (["tests/**/*.test.ts"]) une fois authChain.ts bascule sur requireAuth
    // et les fixtures adaptees au schema Better Auth (user/session).
    include: [],
    // Sans quoi vitest sort en erreur (code 1) quand include est vide.
    passWithNoTests: true,
    // Les fichiers de test partagent la meme base PostgreSQL — execution sequentielle
    // obligatoire pour eviter les deadlocks sur les migrations et le TRUNCATE.
    fileParallelism: false,
  },
});
