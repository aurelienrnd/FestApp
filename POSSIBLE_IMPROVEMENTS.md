# Ameliorations Possibles

## Valider la Configuration d'Environnement au Demarrage

### Situation actuelle

Dans le backend, certaines variables `.env` sont validees "a la demande" lorsqu'une route specifique est appelee (par exemple via `getEnv()` dans `functions.ts`).

A cause de cela, une variable manquante peut n'etre detectee qu'en runtime, pendant une requete utilisateur.

### Amelioration proposee

1. Creer un fichier unique de configuration (par exemple `env.ts`).
2. Y lister toutes les variables d'environnement obligatoires (par exemple `JWT_ACCESS_SECRET`, `DB_HOST`, etc.) et valider leurs formats attendus.
3. Executer cette validation au demarrage dans `index.ts`, juste apres `dotenv.config()`.
4. Si la validation echoue, lever une erreur et ne pas lancer `app.listen`.

### Resultat attendu

- Les problemes de configuration sont detectes immediatement au demarrage.
- Pas d'API "semi-demarree" qui echoue plus tard pendant les requetes.
- Un seul endroit central pour gerer et valider la configuration d'environnement.

### Exemple

- Avant : le serveur demarre, puis `/admin/auth/login` echoue car `JWT_ACCESS_SECRET` est manquant.
- Apres : le serveur refuse de demarrer et affiche une erreur claire, par exemple `Missing env var: JWT_ACCESS_SECRET`.

## Configurer `trust proxy` pour que le Rate Limit Utilise la Vraie IP Client

### Pourquoi c'est important

`express-rate-limit` se base sur l'IP vue par Express (`req.ip`).

Sans `trust proxy`, si ton application est derriere Nginx, Traefik, Render ou Heroku, Express peut voir l'IP du proxy au lieu de la vraie IP client.

Resultat : plusieurs utilisateurs peuvent apparaitre avec la meme IP, et le rate limit devient inexact.

### Ce qu'il faut configurer

```ts
app.set("trust proxy", 1);
```

Cela indique a Express qu'il y a un proxy de confiance devant l'application, et qu'il doit utiliser `X-Forwarded-For` pour retrouver la vraie IP client.

### Quelle valeur utiliser

1. `1` s'il y a exactement un proxy devant ton application (cas le plus courant).
2. `2` s'il y a deux proxies en chaine.
3. `true` si tu fais confiance a toute la chaine de proxies (plus permissif, a utiliser avec prudence).

### Exemple dans `app.ts`

```ts
const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
```

### Objectif

Faire en sorte que `express-rate-limit` applique les limites a partir de la vraie IP utilisateur, et non l'IP du proxy.
