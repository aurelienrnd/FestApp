import { betterAuth } from "better-auth";
import { pool } from "../db.js";

export const auth = betterAuth({
  // connexion BDD
  database: pool,

  // origine autorisée à envoyer des requêtes avec credentials (cookies)
  trustedOrigins: [process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"],

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
});

