import express from "express";

const app = express();
const PORT = process.env.PORT || 4000;

// Définition d'une route GET sur /health pour tester si ton backend fonctionne correctement.
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Démarre l'écoute sur le port défini.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
