import express from "express";
import { query } from "./db";

// Création de l’application Express
export function createApp() {
  const app = express();

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

  return app;
}
