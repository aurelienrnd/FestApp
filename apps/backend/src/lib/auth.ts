import { betterAuth } from "better-auth";
import { z } from "zod";
import { pool } from "../db.js";

export const auth = betterAuth({
  // connexion BDD
  database: pool,

  // origine autorisée à envoyer des requêtes avec credentials (cookies)
  trustedOrigins: [process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"],

  // rate limiting — active meme hors production (defaut : uniquement en prod)
  // pour tester/valider le comportement en dev. Regle speciale integree sur
  // /sign-in* : 3 tentatives / 10s (cf. rate-limiter/index.mjs getDefaultSpecialRules).
  rateLimit: {
    enabled: true,
  },

  // options avancées
  advanced: {
    database: {
      generateId: "uuid", // génération d'ID aléatoire pour les utilisateurs
    },
  },

  // options d'authentification
  emailAndPassword: {
    enabled: true,
  },

  // champs additionnels sur la table "user"
  user: {
    additionalFields: {
      role: {
        type: ["admin", "artists", "news"], // reflete UserRole, pour l'autocompletion/typage TypeScript uniquement
        required: false,
        input: false, // empeche l'utilisateur de definir son propre role a l'inscription
        validator: {
          input: z.enum(["admin", "artists", "news"]), // validation reelle au runtime (type: [...] seul ne valide rien)
        },
      },
    },
  },
});
