import express from "express";
import dotenv from "dotenv";
import { query } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Définition d'une route GET sur /health pour tester si le backend fonctionne correctement.
app.get("/health", (req, res) => {
  console.log("Health check successful serveur backend opérationnel");
  res.json({ status: "ok", message: "Backend is running" });
});

// Définition d'une route GET sur /debug/db pour tester la connexion à la base de données.
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
    res.status(500).json({ error: "Impossible de joindre la base de données" });
  }
});

// Démarre l'écoute sur le port défini.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
