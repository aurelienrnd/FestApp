import dotenv from "dotenv";
import { createApp } from "./app";

// chargement des variables d’environnement
dotenv.config();

// création de l’application Express
const app = createApp();
const PORT = process.env.PORT || 4000;

// lance le serveur sur le port spécifié
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
