import express from "express";
import { query } from "./db";

// Importation des routes
import adminArticles from "./routes/admin.articles.routes";
import adminArtists from "./routes/admin.artists.routes";
import adminAuth from "./routes/admin.auth.routes";
import adminConcerts from "./routes/admin.concerts.routes";
import adminUser from "./routes/admin.users.routes";
import contact from "./routes/contact.routes";
import publicArticle from "./routes/public.articles.routes";
import publicArtists from "./routes/public.artists.routes";
import publicProgramming from "./routes/public.programming.routes";

// Creation de l'application Express
export function createApp() {
  const app = express();
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

  app.use(express.json()); // Permet de lire le JSON envoye par le client dans le body des requetes HTTP.

  // Autorise le frontend a appeler l'API backend en local.
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin && requestOrigin === frontendOrigin) {
      res.header("Access-Control-Allow-Origin", requestOrigin); // Autorise cette origine a acceder a l'API.
      res.header("Vary", "Origin"); // Indique aux caches que la reponse depend de l'en-tete Origin.
      res.header("Access-Control-Allow-Credentials", "true"); // Autorise l'envoi des credentials (cookies, auth headers) cote navigateur.
    }

    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS", // Liste les methodes HTTP permises en CORS.
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Autorise les en-tetes que le front peut envoyer.

    if (req.method === "OPTIONS") {
      // Detecte la requete preflight (verification CORS avant la vraie requete).
      return res.sendStatus(204);
    }

    next();
  });

  // Test de demarrage du serveur
  app.get("/health", (req, res) => {
    console.log("Health check successful serveur backend operationnel");
    res.json({ status: "ok", message: "Backend is running" });
  });

  // Test de connexion a la base de donnees
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

  // Routes API (auth, admin, public, etc.)
  app.use("/admin", adminArticles);
  app.use("/admin", adminArtists);
  app.use("/admin", adminAuth);
  app.use("/admin", adminConcerts);
  app.use("/admin", adminUser);
  app.use("/contact", contact);
  app.use("/public", publicArticle);
  app.use("/public", publicArtists);
  app.use("/public", publicProgramming);

  return app;
}
