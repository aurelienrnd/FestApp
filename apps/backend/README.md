# Backend — Projet Vindhellfest

## Scripts Docker

- `docker compose up -d db backend` : Démarrer la base de données et le backend
- `docker compose restart backend` : Redémarrer uniquement le backend
- `docker compose logs -f backend` : Consulter les logs

Pour exécuter une commande npm dans le conteneur :

```bash
docker exec -it vindhellfest-backend npm run lint
docker exec -it vindhellfest-backend npm run lint:fix
docker exec -it vindhellfest-backend npm run format
docker exec -it vindhellfest-backend npm test
```

---

## Variables d'environnement

- `PORT=4000` : port sur lequel l'API backend écoute les requêtes HTTP.
- `DB_HOST=db` : nom du service Docker correspondant au serveur PostgreSQL.
- `DB_PORT=5432` : port d'écoute PostgreSQL.
- `DB_USER=postgres` : utilisateur pour se connecter à la base.
- `DB_PASSWORD=postgres` : mot de passe de l'utilisateur PostgreSQL.
- `DB_NAME=vindhellfest` : nom de la base utilisée par le backend.
- `JWT_ACCESS_SECRET=un-super-secret-a-changer` : clé secrète pour signer les tokens JWT.
- `JWT_ACCESS_EXPIRES_IN=1h` : durée de validité du token JWT d'accès.
- `COOKIE_ACCESS_TOKEN_NAME=vindhellfest_access_token` : nom du cookie qui stocke le token d'accès.
- `COOKIE_ACCESS_TOKEN_SECURE=true` : envoie le cookie uniquement en HTTPS.
- `COOKIE_ACCESS_TOKEN_SAME_SITE=lax` : limite l'envoi du cookie sur les requêtes cross-site (protection CSRF de base).
- `SESSION_EXPIRES_IN=12h` : durée de vie d'une session en base de données.
- `FRONTEND_ORIGIN=http://localhost:3000` : origine autorisée par le middleware CORS.
- `SMTP_HOST=smtp.gmail.com` : serveur SMTP utilisé pour l'envoi d'emails.
- `SMTP_PORT=587` : port SMTP (587 pour TLS, standard Gmail et Resend).
- `SMTP_USER=toncompte@gmail.com` : adresse email utilisée comme expéditeur.
- `SMTP_PASS=xxxx xxxx xxxx xxxx` : mot de passe d'application SMTP (ne jamais utiliser le mot de passe du compte, générer un mot de passe d'application dédié).

---

## Stack technique

**Dependencies**

- `express` : Framework web.
- `bcrypt` : Hash des mots de passe avant stockage en base.
- `jsonwebtoken` : Création et vérification des JSON Web Tokens.
- `nodemailer` : Envoi d'emails via SMTP (création d'utilisateur, récupération de mot de passe, formulaire de contact).
- `pg` : Client PostgreSQL pour Node.js.
- `cookie` : Parse et sérialise les cookies HTTP côté serveur.
- `dotenv` : Charge les variables d'environnement depuis les fichiers `.env`.
- `express-rate-limit` : Middleware de limitation du nombre de requêtes par IP.
- `zod` : Validation et typage des données entrantes.

**DevDependencies**

- `typescript` : Compilateur TypeScript.
- `ts-node-dev` : Rechargement à chaud pour le développement TypeScript (équivalent nodemon).
- `eslint` : Analyseur statique du code.
- `eslint-config-prettier` : Désactive les règles ESLint en conflit avec Prettier.
- `eslint-plugin-prettier` : Lance Prettier comme règle ESLint.
- `prettier` : Formateur de code automatique.
- `vitest` : Runner de tests et vérification des assertions.
- `supertest` : Simule des appels HTTP sur l'API Express dans les tests.
- `@types/bcrypt` : Définitions TypeScript pour bcrypt.
- `@types/cookie` : Définitions TypeScript pour cookie.
- `@types/express` : Définitions TypeScript pour express.
- `@types/jsonwebtoken` : Définitions TypeScript pour jsonwebtoken.
- `@types/node` : Définitions TypeScript pour Node.js.
- `@types/pg` : Définitions TypeScript pour pg.
- `@types/nodemailer` : Définitions TypeScript pour nodemailer.
- `@types/supertest` : Définitions TypeScript pour supertest.
- `@typescript-eslint/eslint-plugin` : Plugin ESLint pour analyser le TypeScript.
- `@typescript-eslint/parser` : Permet à ESLint de comprendre la syntaxe TypeScript.

---

## Architecture

```
apps/backend/
├── src/
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── auth/
│   │   │   │   ├── change_password.controller.ts
│   │   │   │   ├── forgot_password.controller.ts
│   │   │   │   ├── login.controller.ts
│   │   │   │   ├── logout.controller.ts
│   │   │   │   └── userInfo.controller.ts
│   │   │   └── users/
│   │   │       ├── create_user.controller.ts
│   │   │       ├── delete_user.controller.ts
│   │   │       ├── list_users.controller.ts
│   │   │       └── update_user.controller.ts
│   │   └── public/
│   │       └── lineup/
│   │           └── list_lineup.controller.ts
│   ├── middlewares/
│   │   ├── asyncHandler.ts
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── hashPassword.ts
│   │   ├── rateLimitLogin.ts
│   │   ├── sessionIsOpen.ts
│   │   └── validateBody.ts
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── errorMessages.ts
│   ├── routes/
│   │   ├── admin.articles.routes.ts
│   │   ├── admin.artists.routes.ts
│   │   ├── admin.auth.routes.ts
│   │   ├── admin.concerts.routes.ts
│   │   ├── admin.users.routes.ts
│   │   ├── contact.routes.ts
│   │   ├── public.articles.routes.ts
│   │   ├── public.artists.routes.ts
│   │   └── public.programming.routes.ts
│   ├── schemas/
│   │   └── schema.ts
│   ├── services/
│   │   └── mailer.ts
│   ├── app.ts
│   ├── db.ts
│   ├── env.ts
│   ├── functions.ts
│   ├── index.ts
│   └── type.ts
├── test/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── create_user.controller.test.ts
│   │   ├── delete_user.controller.test.ts
│   │   ├── errorHandler.test.ts
│   │   ├── hashPassword.test.ts
│   │   ├── health.test.ts
│   │   ├── list_users.controller.test.ts
│   │   ├── login.controller.test.ts
│   │   ├── logout.controller.test.ts
│   │   ├── rateLimitLogin.test.ts
│   │   ├── sessionIsOpen.test.ts
│   │   ├── update_user.controller.test.ts
│   │   └── validateBody.test.ts
│   └── unitaire/
│       ├── asyncHandler.test.ts
│       └── functions.test.ts
├── .eslintrc.json
├── API.md
├── Dockerfile
├── eslint.config.cjs
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

---

## Dockerfile

Le projet utilise un Dockerfile multi-stage pour générer deux types d'images à partir du même fichier : une image de développement et une image de production.

- Base commune : `node:20-alpine`
- Stage `builder` : copie du code et compilation TypeScript
- Image de production (`runner`)
- Image de développement (`dev`)

---

## `src/`

### `app.ts`

Crée et configure l'application Express sans démarrer le serveur — ce qui permet de l'importer dans les tests sans effet de bord.

- Configure le middleware JSON (`express.json()`)
- Gère le CORS manuellement (validation de l'origine, preflight `OPTIONS`)
- Monte toutes les routes sous leurs préfixes (`/admin`, `/public`, `/contact`)
- Expose les routes de diagnostic : `/health` (toujours disponible), `/debug/db` (conditionné à `NODE_ENV !== "production"`, retourne `404` en production)
- Attache `notFoundHandler` et `errorHandler` en fin de chaîne

### `index.ts`

Point d'entrée du serveur — charge les variables d'environnement via `dotenv.config()`, appelle `validateEnv()`, puis démarre `app.listen()`.

### `env.ts`

Valide toutes les variables d'environnement obligatoires au démarrage via un schéma Zod. Si une variable est manquante, le processus s'arrête immédiatement avec un message explicite (`Missing env vars: JWT_ACCESS_SECRET, ...`) avant même que `app.listen()` soit appelé.

### `db.ts`

Centralise la connexion PostgreSQL via un pool `pg` et expose une fonction `query()` réutilisable dans tous les contrôleurs.

### `type.ts`

Centralise tous les types TypeScript partagés du backend :

- `Express.Locals` augmentation — type `res.locals` avec `userId`, `userRole`, `userDisplayName`, `sessionId`
- `DbUser` — ligne utilisateur retournée pour l'authentification (email, password_hash…)
- `SessionRow` — ligne de session retournée par la base de données
- `UserListRow` — ligne utilisateur pour les endpoints de liste/CRUD
- `ArtistListRow` — ligne artiste pour l'endpoint de programmation
- `UserInfoRow` — ligne utilisateur pour l'endpoint `/admin/auth/me` (inclut `password_changed_at` pour calculer `mustChangePassword`)

### `functions.ts`

Centralise les fonctions utilitaires réutilisables (génération de token JWT, parsing de durée, etc.).

### `controllers/`

Contient la logique métier des endpoints, organisée en deux espaces :

- `admin/` — endpoints protégés par authentification JWT + session
- `public/` — endpoints accessibles sans authentification

**Contrôleurs implémentés :**

| Fichier | Endpoint | Description |
| --- | --- | --- |
| `admin/auth/change_password.controller.ts` | PATCH `/admin/auth/password` | Vérifie l'ancien mot de passe et met à jour le hash + `password_changed_at` |
| `admin/auth/forgot_password.controller.ts` | POST `/admin/auth/forgot-password` | Génère un mot de passe temporaire, met à jour le hash, remet `password_changed_at` à `null` et envoie le nouveau mot de passe par email |
| `admin/auth/login.controller.ts` | POST `/admin/auth/login` | Vérifie les identifiants, crée une session, retourne un cookie JWT |
| `admin/auth/logout.controller.ts` | POST `/admin/auth/logout` | Révoque la session en base |
| `admin/auth/userInfo.controller.ts` | GET `/admin/auth/me` | Retourne les infos de l'utilisateur connecté, `mustChangePassword` et renouvelle le token |
| `admin/users/list_users.controller.ts` | GET `/admin/users` | Liste tous les utilisateurs admin |
| `admin/users/create_user.controller.ts` | POST `/admin/users` | Crée un utilisateur et envoie le mot de passe provisoire par email |
| `admin/users/update_user.controller.ts` | PATCH `/admin/users/:id` | Modifie les informations d'un utilisateur |
| `admin/users/delete_user.controller.ts` | DELETE `/admin/users/:id` | Supprime définitivement un utilisateur |
| `public/lineup/list_lineup.controller.ts` | GET `/public/lineup` | Liste tous les artistes du festival |

### `routes/`

Déclare les routes HTTP et connecte chaque endpoint à ses middlewares et son contrôleur.

**Routes actives :**

| Fichier | Endpoints actifs |
| --- | --- |
| `admin.auth.routes.ts` | POST `/admin/auth/login`, POST `/admin/auth/logout`, GET `/admin/auth/me`, PATCH `/admin/auth/password`, POST `/admin/auth/forgot-password` |
| `admin.users.routes.ts` | GET `/admin/users`, POST `/admin/users`, PATCH `/admin/users/:id`, DELETE `/admin/users/:id` |
| `public.programming.routes.ts` | GET `/public/lineup` |

**Routes déclarées mais non encore implémentées :**
`admin.articles.routes.ts`, `admin.artists.routes.ts`, `admin.concerts.routes.ts`, `contact.routes.ts`, `public.articles.routes.ts`, `public.artists.routes.ts`

**Ordre des middlewares sur les routes protégées :**

1. `asyncHandler(auth)` — vérifie le cookie/token et charge `userId`, `userRole` + `sessionId` dans `res.locals`
2. `asyncHandler(sessionIsOpen)` — vérifie la session en base (existe, non révoquée, non expirée) et renouvelle le token
3. `requireRole(...roles)` *(si applicable)* — vérifie que le rôle de l'utilisateur est autorisé, renvoie `403` sinon
4. `validateBody(schema)` *(si applicable)* — valide le body avec Zod
5. `asyncHandler(controller)` — logique métier

### `middlewares/`

| Fichier | Description |
| --- | --- |
| `asyncHandler.ts` | Enveloppe un handler async et transfère automatiquement les erreurs vers `next(error)` |
| `auth.ts` | Extrait et vérifie le JWT depuis le cookie — charge `userId`, `userRole` et `sessionId` dans `res.locals` |
| `sessionIsOpen.ts` | Vérifie en base que la session existe, n'est pas révoquée et n'est pas expirée — renouvelle le token |
| `requireRole.ts` | Factory middleware — vérifie que `res.locals.userRole` est dans la liste des rôles autorisés, renvoie `403` sinon |
| `hashPassword.ts` | Factory middleware — hashe le champ mot de passe spécifié dans `req.body` avec bcrypt avant de passer au handler suivant |
| `rateLimitLogin.ts` | Limite le nombre de tentatives de connexion par IP (`express-rate-limit`) |
| `validateBody.ts` | Valide `req.body` contre un schéma Zod — renvoie `400` si invalide |
| `errorHandler.ts` | Gestion globale des erreurs : `notFoundHandler` (404 pour routes inconnues) et `errorHandler` (centralise la réponse HTTP finale) |

### `errors/`

- `AppError.ts` : classe d'erreur applicative avec `message` + `status` HTTP.
- `errorMessages.ts` : dictionnaire central `ERRORS` — uniformise tous les messages d'erreur renvoyés au client.

**Pourquoi ce dossier est important :**
- Garantit un format de réponse cohérent : `{ "error": "..." }`
- Évite les messages dupliqués dans les contrôleurs et middlewares
- Facilite la maintenance (un message changé à un seul endroit)

### `services/`

- `mailer.ts` : service d'envoi d'email via SMTP (`nodemailer`). Expose les fonctions d'envoi utilisées par les contrôleurs. La configuration SMTP est chargée depuis les variables d'environnement au moment de l'envoi.

### `schemas/`

- `schema.ts` : schémas Zod utilisés pour la validation des body (`createUserSchema`, `updateUserSchema`, etc.).

---

## Traitement des erreurs

Le backend suit un flux unique :

1. **Cas métier** — les middlewares/contrôleurs lèvent une `AppError(message, status)`.
2. **`asyncHandler`** — transfère automatiquement les erreurs vers `next(error)`.
3. **Route inconnue** — `notFoundHandler` renvoie une `404`.
4. **`errorHandler`** — centralise la réponse HTTP finale :
   - `instanceof AppError` → renvoie `status` + `message`
   - sinon → renvoie `500` avec un message générique (pas de fuite interne)

**Codes HTTP utilisés :**

| Code | Cas |
| --- | --- |
| `400` | Body invalide, format de mot de passe incorrect |
| `401` | Token absent, invalide ou session expirée/révoquée |
| `404` | Route inconnue (`notFoundHandler`) |
| `409` | Conflit métier (ex : email déjà utilisé) |
| `429` | Trop de tentatives de connexion (`rateLimitLogin`) |
| `500` | Erreur interne non prévue |

---

## `test/`

Vitest exécute les tests, Supertest simule les appels HTTP sur l'API Express.

**Tests d'intégration** (`test/integration/`) — valident plusieurs couches ensemble (middleware + contrôleur + base de données) :

| Fichier | Ce qui est testé |
| --- | --- |
| `auth.test.ts` | Middleware `auth` |
| `sessionIsOpen.test.ts` | Middleware `sessionIsOpen` |
| `hashPassword.test.ts` | Middleware `hashPassword` |
| `rateLimitLogin.test.ts` | Middleware `rateLimitLogin` |
| `validateBody.test.ts` | Middleware `validateBody` |
| `errorHandler.test.ts` | Middleware `errorHandler` et `notFoundHandler` |
| `health.test.ts` | Route `/health` |
| `login.controller.test.ts` | Contrôleur `login` |
| `logout.controller.test.ts` | Contrôleur `logout` |
| `list_users.controller.test.ts` | Contrôleur `listUsers` |
| `create_user.controller.test.ts` | Contrôleur `createUser` |
| `update_user.controller.test.ts` | Contrôleur `updateUser` |
| `delete_user.controller.test.ts` | Contrôleur `deleteUser` |

**Tests unitaires** (`test/unitaire/`) — ciblent des fonctions isolées :

| Fichier | Ce qui est testé |
| --- | --- |
| `asyncHandler.test.ts` | Utilitaire `asyncHandler` |
| `functions.test.ts` | Fonctions utilitaires (`functions.ts`) |

---

## ESLint & Prettier

### ESLint — Analyseur de code

Vérifie le code TypeScript pour détecter :

- erreurs de logique
- mauvaises pratiques
- variables non utilisées
- types incorrects

### Prettier — Formateur automatique

S'occupe uniquement de la mise en forme :

- indentation
- guillemets
- trailing commas
- espaces et retours à la ligne
