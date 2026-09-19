import dotenv from "dotenv";

// chargement des variables d’environnement avant toute validation
dotenv.config();

import { validateEnv } from "./env.js";
import { createApp } from "./app.js";

// validation des variables d’environnement — arrete le processus si une variable est manquante
validateEnv();

// création de l’application Express
const app = createApp();
const PORT: number = Number(process.env.PORT) || 4000;

// lance le serveur sur le port spécifié
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
