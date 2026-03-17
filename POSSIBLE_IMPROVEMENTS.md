# Ameliorations Possibles

## 1. Supprimer les routes de debug en production

La route `/debug/db` expose des informations sur l'infrastructure. Elle est marquee comme TODO mais n'a pas encore ete supprimee.

Retirer cette route (et toute autre route de debug) avant tout deploiement en production, ou la conditionner a `NODE_ENV !== "production"`.

## 2. Valider les variables d'environnement au demarrage

Les variables `.env` sont lues a la demande via `getEnv()` dans `functions.ts`. Une variable manquante ne sera detectee qu'au moment d'une requete, pas au boot.

Creer un fichier `env.ts` qui liste et valide toutes les variables obligatoires (`JWT_ACCESS_SECRET`, `DB_HOST`, etc.) avec Zod ou une fonction dedee, et l'executer dans `index.ts` juste apres `dotenv.config()`. Si la validation echoue, ne pas lancer `app.listen`.

- Avant : le serveur demarre, puis `/admin/auth/login` echoue car `JWT_ACCESS_SECRET` est manquant.
- Apres : le serveur refuse de demarrer avec un message clair, ex. `Missing env var: JWT_ACCESS_SECRET`.

## 3. Configurer `trust proxy` pour le rate limiting

Sans `app.set("trust proxy", 1)`, `express-rate-limit` voit l'IP du proxy (Nginx, Docker, etc.) au lieu de la vraie IP client. Plusieurs utilisateurs peuvent alors partager la meme IP, rendant le rate limit inefficace.

```ts
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
```

Utiliser `1` pour un seul proxy devant l'app (cas le plus courant).

## 4. Gerer les erreurs reseau cote frontend

Les pages qui consomment l'API publique (ex. lineup) n'affichent pas toujours un etat de chargement ou un message d'erreur visible si la requete echoue. Ajouter un loading state et un fallback d'erreur dans les composants client pour eviter un ecran vide en cas de probleme reseau.
