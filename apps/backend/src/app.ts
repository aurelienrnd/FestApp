import express from "express";
import path from "path";
import { query } from "./db";

// Importation des routes
import adminArtists from "./routes/admin.artists.routes";
import adminArticles from "./routes/admin.articles.routes";
import adminAuth from "./routes/admin.auth.routes";
import adminUser from "./routes/admin.users.routes";
import contact from "./routes/contact.routes";
import publicHome from "./routes/home.routes";
import publicLineup from "./routes/lineup.routes";
import publicNews from "./routes/news.routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

/** Cree et configure l'application Express — CORS, routes API, handlers d'erreur. */
export function createApp() {
  const app = express();
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

  // En production, l'app est derriere un proxy trust proxy permet a express-rate-limit de lire la vraie IP client.
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

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
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", message: "Backend is running" });
  });

  // Route de diagnostic — disponible uniquement hors production
  if (process.env.NODE_ENV !== "production") {
    app.get("/debug/db", async (_req, res) => {
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
  }

  // Sert les fichiers images uploades (artistes, etc.)
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Routes API (auth, admin, public, etc.)
  app.use("/admin", adminArtists);
  app.use("/admin", adminArticles);
  app.use("/admin", adminAuth);
  app.use("/admin", adminUser);
  app.use("/contact", contact);
  app.use("/public", publicHome);
  app.use("/public", publicLineup);
  app.use("/public", publicNews);

  // Handlers globaux de fin de chaine
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
