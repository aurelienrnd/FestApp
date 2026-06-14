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
- `SMTP_SECURE=false` : `true` pour SSL/TLS natif (port 465), `false` pour STARTTLS.
- `SMTP_USER=toncompte@gmail.com` : adresse email utilisée comme expéditeur.
- `SMTP_PASS=xxxx xxxx xxxx xxxx` : mot de passe d'application SMTP (ne jamais utiliser le mot de passe du compte, générer un mot de passe d'application dédié).
- `CONTACT_EMAIL=contact@vindhellfest.fr` : adresse de destination des messages du formulaire de contact.

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
- `multer` : Middleware de gestion des uploads de fichiers (multipart/form-data).
- `sharp` : Traitement et conversion des images uploadées en WebP.

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
- `@types/multer` : Définitions TypeScript pour multer.
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
│   │   │   ├── artists/
│   │   │   │   ├── create_artist.controller.ts
│   │   │   │   ├── delete_artist.controller.ts
│   │   │   │   └── update_artist.controller.ts
│   │   │   ├── auth/
│   │   │   │   ├── change_password.controller.ts
│   │   │   │   ├── forgot_password.controller.ts
│   │   │   │   ├── login.controller.ts
│   │   │   │   ├── logout.controller.ts
│   │   │   │   └── user_info.controller.ts
│   │   │   ├── news/
│   │   │   │   ├── create_news.controller.ts
│   │   │   │   ├── delete_news.controller.ts
│   │   │   │   └── update_news.controller.ts
│   │   │   └── users/
│   │   │       ├── create_user.controller.ts
│   │   │       ├── delete_user.controller.ts
│   │   │       ├── list_users.controller.ts
│   │   │       └── update_user.controller.ts
│   │   ├── contact/
│   │   │   └── submit_contact.controller.ts
│   │   └── public/
│   │       ├── home/
│   │       │   └── get_home.controller.ts
│   │       ├── artists/
│   │       │   ├── get_artist.controller.ts
│   │       │   └── list_artists.controller.ts
│   │       └── news/
│   │           ├── get_news_list.controller.ts
│   │           └── get_news.controller.ts
│   ├── middlewares/
│   │   ├── asyncHandler.ts
│   │   ├── auth.ts
│   │   ├── authChain.ts
│   │   ├── errorHandler.ts
│   │   ├── hashPassword.ts
│   │   ├── rateLimitLogin.ts
│   │   ├── requireRole.ts
│   │   ├── sessionIsOpen.ts
│   │   ├── upload.ts
│   │   ├── validateBody.ts
│   │   └── validateUuidParam.ts
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── errorMessages.ts
│   ├── routes/
│   │   ├── admin.news.routes.ts
│   │   ├── admin.artists.routes.ts
│   │   ├── admin.auth.routes.ts
│   │   ├── admin.users.routes.ts
│   │   ├── artists.routes.ts
│   │   ├── contact.routes.ts
│   │   ├── home.routes.ts
│   │   └── news.routes.ts
│   ├── schemas/
│   │   └── schema.ts
│   ├── services/
│   │   ├── imageUpload.service.ts
│   │   ├── mailer.service.ts
│   │   └── user.service.ts
│   ├── app.ts
│   ├── db.ts
│   ├── env.ts
│   ├── index.ts
│   ├── type.ts
│   └── utils.ts
├── tests/
│   ├── TEST.md
│   ├── setup.ts
│   ├── health.test.ts
│   ├── helpers/
│   │   ├── createAuthSession.ts
│   │   ├── fixtures.ts
│   │   └── testServer.ts
│   ├── integration/
│   │   ├── admin/
│   │   │   ├── auth.test.ts
│   │   │   ├── artists.test.ts
│   │   │   ├── news.test.ts
│   │   │   └── users.test.ts
│   │   └── public/
│   │       ├── contact.test.ts
│   │       └── public.test.ts
│   └── unit/
│       ├── auth.middleware.test.ts
│       ├── imageUpload.service.test.ts
│       ├── mailer.service.test.ts
│       ├── requireRole.middleware.test.ts
│       ├── user.service.test.ts
│       ├── validateBody.middleware.test.ts
│       └── validateUuidParam.middleware.test.ts
├── API.md
├── Dockerfile
├── eslint.config.cjs
├── package.json
├── package-lock.json
├── README.md
├── TEST.md
├── vitest.config.ts
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
- Attache `notFoundHandler` et `errorHandler` en fin de chaîne

### `index.ts`

Point d'entrée du serveur — charge les variables d'environnement via `dotenv.config()`, appelle `validateEnv()`, puis démarre `app.listen()`.

### `env.ts`

Valide toutes les variables d'environnement obligatoires au démarrage via un schéma Zod. Si une variable est manquante, le processus s'arrête immédiatement avec un message explicite (`Missing env vars: JWT_ACCESS_SECRET, ...`) avant même que `app.listen()` soit appelé.

### `db.ts`

Centralise la connexion PostgreSQL via un pool `pg` et expose une fonction `query()` réutilisable dans tous les contrôleurs.

### `utils.ts`

Centralise les fonctions utilitaires réutilisables partagées entre middlewares et contrôleurs :

| Fonction                                                 | Description                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `getEnv(name)`                                         | Lit une variable d'environnement, lève une erreur si absente                    |
| `envToStringValue(name)`                               | Convertit une variable env en `StringValue` (format `ms`)                    |
| `userExists(user)`                                     | Lève `401` si l'utilisateur est `undefined`                                 |
| `passwordIsValid(password, hash)`                      | Compare un mot de passe en clair avec son hash bcrypt, lève `401` si invalide |
| `initToken(userId, secret, expiresIn, sessionId)`      | Crée et signe un JWT avec `userId` et `sessionId`                           |
| `serializeCookie(name, secure, sameSite, token, time)` | Sérialise un cookie httpOnly à partir des variables d'environnement            |
| `sessionExists(session)`                               | Lève `401` si la session est `undefined`                                    |
| `sessionRevoked(session)`                              | Lève `401` si la session est révoquée ou expirée                           |
| `requireUserId(reqUserId)`                             | Extrait et valide l'`userId` depuis la requête, lève `401` si absent       |
| `requireSessionId(reqSessionId)`                       | Extrait et valide le `sessionId` depuis la requête, lève `401` si absent   |

### `controllers/`

Contient la logique métier des endpoints, organisée en deux espaces :

- `admin/` — endpoints protégés par authentification JWT + session
- `public/` — endpoints accessibles sans authentification

**Contrôleurs implémentés :**

| Fichier                                         | Endpoint                             | Description                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin/auth/change_password.controller.ts`    | PATCH `/admin/auth/password`       | Vérifie l'ancien mot de passe et met à jour le hash +`password_changed_at`                                                                  |
| `admin/auth/forgot_password.controller.ts`    | POST `/admin/auth/forgot-password` | Génère un mot de passe temporaire, met à jour le hash, remet `password_changed_at` à `null` et envoie le nouveau mot de passe par email |
| `admin/auth/login.controller.ts`              | POST `/admin/auth/login`           | Vérifie les identifiants, crée une session, retourne un cookie JWT                                                                            |
| `admin/auth/logout.controller.ts`             | POST `/admin/auth/logout`          | Révoque la session en base                                                                                                                     |
| `admin/auth/userInfo.controller.ts`           | GET `/admin/auth/me`               | Retourne les infos de l'utilisateur connecté,`mustChangePassword` et renouvelle le token                                                     |
| `admin/news/create_news.controller.ts` | POST `/admin/news`                 | Cree une news avec upload image (sharp → WebP) et insere en base avec `author_name` via CTE                                                  |
| `admin/news/delete_news.controller.ts` | DELETE `/admin/news/:id`       | Supprime une news et son image du disque                                                                                                        |
| `admin/news/update_news.controller.ts` | PATCH `/admin/news/:id`        | Modifie une news — remplace l'image (sharp → WebP) si une nouvelle est fournie                                                                |
| `admin/artists/create_artist.controller.ts`   | POST `/admin/artists`              | Cree un artiste avec upload image (sharp → WebP) et insere le concert associe en transaction                                                   |
| `admin/artists/delete_artist.controller.ts`   | DELETE `/admin/artists/:id`        | Supprime un artiste, son concert associe (CASCADE) et son image du disque                                                                       |
| `admin/artists/update_artist.controller.ts`   | PATCH `/admin/artists/:id`         | Modifie un artiste et son concert en transaction — remplace l'image (sharp → WebP) si une nouvelle est fournie                                |
| `admin/users/list_users.controller.ts`        | GET `/admin/users`                 | Liste tous les utilisateurs admin                                                                                                               |
| `admin/users/create_user.controller.ts`       | POST `/admin/users`                | Crée un utilisateur et envoie le mot de passe provisoire par email                                                                             |
| `admin/users/update_user.controller.ts`       | PATCH `/admin/users/:id`           | Modifie les informations d'un utilisateur                                                                                                       |
| `admin/users/delete_user.controller.ts`       | DELETE `/admin/users/:id`          | Supprime définitivement un utilisateur                                                                                                         |
| `public/home/get_home.controller.ts`          | GET `/public/home`                 | Retourne les artistes avec `is_featured = TRUE` et les 2 dernières news publiées (Promise.all)                                              |
| `public/artists/list_artists.controller.ts`   | GET `/public/artists`              | Liste tous les artistes avec leur concert associe (LEFT JOIN concerts)                                                                          |
| `public/artists/get_artist.controller.ts`     | GET `/public/artists/:id`          | Retourne un artiste par son id avec son concert associe — renvoie 404 si inexistant                                                             |
| `public/news/get_news_list.controller.ts`     | GET `/public/news`                 | Liste les news — toutes si admin/news, publiées uniquement sinon (via `optionalAuth`)                                                       |
| `public/news/get_news.controller.ts`          | GET `/public/news/:id`             | Retourne une news par son id — brouillons accessibles si admin/news (via `optionalAuth`)                                                    |
| `contact/submit_contact.controller.ts`        | POST `/contact/submit`             | Transmet le message du formulaire de contact par email a l'organisation                                                                         |

### `routes/`

Déclare les routes HTTP et connecte chaque endpoint à ses middlewares et son contrôleur.

**Routes actives :**

| Fichier                      | Endpoints actifs                                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin.news.routes.ts` | POST `/admin/news`, PATCH `/admin/news/:id`, DELETE `/admin/news/:id`                                                                     |
| `admin.artists.routes.ts`  | POST `/admin/artists`, PATCH `/admin/artists/:id`, DELETE `/admin/artists/:id`                                                                  |
| `admin.auth.routes.ts`     | POST `/admin/auth/login`, POST `/admin/auth/logout`, GET `/admin/auth/me`, PATCH `/admin/auth/password`, POST `/admin/auth/forgot-password` |
| `admin.users.routes.ts`    | GET `/admin/users`, POST `/admin/users`, PATCH `/admin/users/:id`, DELETE `/admin/users/:id`                                                  |
| `contact.routes.ts`        | POST `/contact/submit`                                                                                                                              |
| `home.routes.ts`           | GET `/public/home`                                                                                                                                  |
| `artists.routes.ts`         | GET `/public/artists`, GET `/public/artists/:id`                                                                                                     |
| `news.routes.ts`           | GET `/public/news`, GET `/public/news/:id`                                                                                                        |

**Ordre des middlewares sur les routes protégées :**

1. `asyncHandler(auth)` — vérifie le cookie/token et charge `userId`, `userRole` + `sessionId` dans `res.locals`
2. `asyncHandler(sessionIsOpen)` — vérifie la session en base (existe, non révoquée, non expirée) et renouvelle le token
3. `requireRole(...roles)` *(si applicable)* — vérifie que le rôle de l'utilisateur est autorisé, renvoie `403` sinon
4. `validateBody(schema)` *(si applicable)* — valide le body avec Zod
5. `asyncHandler(controller)` — logique métier

### `middlewares/`

| Fichier               | Description                                                                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `asyncHandler.ts`      | Enveloppe un handler async et transfère automatiquement les erreurs vers `next(error)`                                                                                                                                                |
| `auth.ts`              | Contient deux middlewares : `auth` (bloque si token absent/invalide) et `optionalAuth` (tente l'authentification, appelle `next()` dans tous les cas — peuple `res.locals` uniquement si token valide et session non révoquée) |
| `authChain.ts`         | Regroupe la chaîne `[asyncHandler(auth), asyncHandler(sessionIsOpen)]` en un tableau réutilisable pour éviter la répétition dans les routes                                                                                       |
| `sessionIsOpen.ts`     | Vérifie en base que la session existe, n'est pas révoquée et n'est pas expirée — renouvelle le token                                                                                                                                |
| `requireRole.ts`       | Factory middleware — vérifie que `res.locals.userRole` est dans la liste des rôles autorisés, renvoie `403` sinon                                                                                                                |
| `hashPassword.ts`      | Factory middleware — hashe le champ mot de passe spécifié dans `req.body` avec bcrypt avant de passer au handler suivant                                                                                                            |
| `rateLimitLogin.ts`    | Limite le nombre de tentatives de connexion par IP (`express-rate-limit`)                                                                                                                                                              |
| `upload.ts`            | Middleware Multer — gère l'upload d'image (`image` field, jpeg/png/webp, 5 Mo max) et expose `req.file` au contrôleur                                                                                                             |
| `validateBody.ts`      | Valide `req.body` contre un schéma Zod — renvoie `400` si invalide, remplace `req.body` par les données parsées (trim, coercion)                                                                                                  |
| `validateUuidParam.ts` | Factory middleware — valide qu'un paramètre de route est un UUID v4 valide, renvoie `400` sinon                                                                                                                                    |
| `errorHandler.ts`      | Gestion globale des erreurs : `notFoundHandler` (404 pour routes inconnues) et `errorHandler` (centralise la réponse HTTP finale)                                                                                                    |

### `errors/`

- `AppError.ts` : classe d'erreur applicative avec `message` + `status` HTTP.
- `errorMessages.ts` : dictionnaire central `ERRORS` — uniformise tous les messages d'erreur renvoyés au client.

**Pourquoi ce dossier est important :**

- Garantit un format de réponse cohérent : `{ "error": "..." }`
- Évite les messages dupliqués dans les contrôleurs et middlewares
- Facilite la maintenance (un message changé à un seul endroit)

### `services/`

| Fichier                   | Description                                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `imageUpload.service.ts`  | Sauvegarde une image uploadée en WebP via `sharp` et retourne son URL publique. Supprime silencieusement une image du disque via son URL.               |
| `mailer.service.ts`       | Envoi d'emails via SMTP (`nodemailer`). Expose `sendPasswordResetEmail`, `sendWelcomeEmail` et `sendContactEmail`. Configuration chargée depuis les variables d'environnement. |
| `user.service.ts`         | Fonctions métier liées aux utilisateurs : vérification de disponibilité email/display_name, existence d'un user, génération et hashage de mot de passe. |

### `schemas/`

- `schema.ts` : schémas Zod utilisés pour la validation des body. Chaque schéma sert à la fois à la création et à la modification (pas de schéma `update*` séparé) :

| Schéma                  | Utilisé par                         |
| ------------------------ | ------------------------------------ |
| `createUserSchema`     | POST et PATCH `/admin/users`       |
| `changePasswordSchema` | PATCH `/admin/auth/password`       |
| `loginSchema`          | POST `/admin/auth/login`           |
| `forgotPasswordSchema` | POST `/admin/auth/forgot-password` |
| `contactSchema`        | POST `/contact/submit`             |
| `createNewsSchema`     | POST et PATCH `/admin/news`        |
| `createArtistSchema`   | POST et PATCH `/admin/artists`     |

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

| Code    | Cas                                                   |
| ------- | ----------------------------------------------------- |
| `400` | Body invalide, format de mot de passe incorrect       |
| `401` | Token absent, invalide ou session expirée/révoquée |
| `404` | Route inconnue (`notFoundHandler`)                  |
| `409` | Conflit métier (ex : email déjà utilisé)          |
| `429` | Trop de tentatives de connexion (`rateLimitLogin`)  |
| `500` | Erreur interne non prévue                            |

---

## `tests/`

Vitest exécute les tests. Supertest simule les appels HTTP sur l'API Express pour les tests d'intégration.

**Helpers** (`tests/helpers/`) :

| Fichier                  | Description                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `testServer.ts`          | Crée une instance Supertest prête à l'emploi à partir de `app`                                      |
| `createAuthSession.ts`   | Insère un user + une session en base et retourne un cookie JWT valide pour Supertest                 |
| `fixtures.ts`            | Helpers d'insertion rapide en base : `insertUser`, `insertArtist`, `insertNews`, constante `MINIMAL_PNG` |

**Tests d'intégration** (`tests/integration/`) — valident routes, middlewares et contrôleurs contre une vraie base PostgreSQL de test :

| Fichier                                  | Ce qui est testé                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `integration/admin/auth.test.ts`         | POST login, POST logout, GET me, POST forgot-password, PATCH password                                        |
| `integration/admin/artists.test.ts`      | POST, PATCH, DELETE `/admin/artists` — upload image, UUID invalide, rôles                                  |
| `integration/admin/news.test.ts`         | POST, PATCH, DELETE `/admin/news` — upload image, UUID invalide, rôles                                     |
| `integration/admin/users.test.ts`        | GET, POST, PATCH, DELETE `/admin/users` — conflits email/display_name, rôles                               |
| `integration/public/public.test.ts`      | GET `/public/artists`, GET `/public/artists/:id`, GET `/public/news`, GET `/public/news/:id` + optionalAuth |
| `integration/public/contact.test.ts`     | POST `/contact/submit` — validation du formulaire                                                            |

**Tests unitaires** (`tests/unit/`) — ciblent des fonctions isolées sans base de données ni serveur :

| Fichier                               | Ce qui est testé                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `imageUpload.service.test.ts`         | `saveImage` (sharp + mkdir + chemin WebP) et `deleteImage` (unlink silencieux)             |
| `user.service.test.ts`                | `checkEmailAvailable`, `checkDisplayNameAvailable`, `checkUserExists`, `generateTemporaryPassword`, `hashPassword` |
| `mailer.service.test.ts`              | `sendPasswordResetEmail`, `sendWelcomeEmail`, `sendContactEmail`                            |
| `validateBody.middleware.test.ts`     | Validation Zod, remplacement `req.body`, erreur 400                                         |
| `validateUuidParam.middleware.test.ts`| UUID valide → next(), invalide/absent → AppError 400, paramètre personnalisé               |
| `requireRole.middleware.test.ts`      | Rôle autorisé → next(), rôle interdit ou absent → AppError 403                             |
| `auth.middleware.test.ts`             | `auth` (cookie absent, token invalide, user inexistant, happy path) et `optionalAuth`      |

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
