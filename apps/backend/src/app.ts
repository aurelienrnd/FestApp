import express from "express";
import { query } from "./db";

// Importation des routes
import authRoutes from "./routes/auth.routes";

// Création de l’application Express
export function createApp() {
  const app = express();

  app.use(express.json()); // permet de lire le JSON envoyé par le client dans le body des requêtes HTTP.

  // test de demmarrage du serveur
  app.get("/health", (req, res) => {
    console.log("Health check successful serveur backend operationnel");
    res.json({ status: "ok", message: "Backend is running" });
  });

  // test de connexion à la base de données
  app.get("/debug/db", async (req, res) => {
    try {
      const rows = await query("SELECT NOW() as now");
      console.log("Connexion to the DB successful at:", rows[0].now);
      res.json({
        db: "ok",
        now: rows[0].now,
      });
    } catch (err) {
      console.error("Erreur de connexion DB :", err);
      res
        .status(500)
        .json({ error: "Impossible de joindre la base de donnees" });
    }
  });

  //routes API (auth, admin, public, etc.)
  app.use("/api/auth", authRoutes);

  return app;
}
