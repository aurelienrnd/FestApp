import express from "express";
import path from "path";
import adminArtists from "./routes/admin.artists.routes";
import adminNews from "./routes/admin.news.routes";
import adminAuth from "./routes/admin.auth.routes";
import adminUsers from "./routes/admin.users.routes";
import contact from "./routes/contact.routes";
import publicHome from "./routes/home.routes";
import publicArtists from "./routes/artists.routes";
import publicNews from "./routes/news.routes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

/** Cree et configure l'application Express — CORS, routes API, handlers d'erreur. */
export function createApp() {
  const app = express();
  const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

  // En production, l'app est derriere un proxy trust proxy permet a express-rate-limit de lire la vraie IP client.
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  /** Permet de lire le JSON envoye par le client dans le body des requetes HTTP. */
  app.use(express.json());

  /** Autorise le frontend a appeler l'API backend en local.
   * initialise l'en-tete de la requete HTTP
   * Autorise les methodes HTTP
   * Autorise les en-tetes que le front peut envoyer
   * Renvoie un status 204 pour les requetes preflight (OPTIONS)
   */
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;

    // Si l'origine de la requete est autorisee, on lui renvoie l'en-tete Access-Control-Allow-Origin pour lui permettre d'acceder a l'API.
    if (requestOrigin && requestOrigin === allowedOrigin) {
      res.header("Access-Control-Allow-Origin", requestOrigin); // Autorise cette origine a acceder a l'API.
      res.header("Vary", "Origin"); // Indique aux caches que la reponse depend de l'en-tete Origin.
      res.header("Access-Control-Allow-Credentials", "true"); // Autorise l'envoi des credentials (cookies, auth headers) cote navigateur.
    }

    // Autorise les methodes HTTP.
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS", // Liste les methodes HTTP permises en CORS.
    );

    // Autorise les en-tetes que le front peut envoyer.
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Detecte la requete preflight (verification CORS avant la vraie requete).
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  /** Sert les fichiers images uploades (artistes, etc.) */
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  /** Routes API (auth, admin, public, etc.)
   * admin : routes pour l'interface d'administration (CRUD artistes, news, etc.)
   * public : routes pour l'interface publique (affichage artistes, news, etc.)
   * contact : route pour le formulaire de contact
   */
  app.use("/admin", adminArtists);
  app.use("/admin", adminNews);
  app.use("/admin", adminAuth);
  app.use("/admin", adminUsers);
  app.use("/contact", contact);
  app.use("/public", publicHome);
  app.use("/public", publicArtists);
  app.use("/public", publicNews);

  /** Handlers globaux de fin de chaine
   *  notFoundHandler : renvoie une erreur 404 si aucune route n'a ete trouvee
   *  errorHandler : renvoie une erreur 500 si une erreur est survenue dans le traitement de la requete
   */
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
