# Backend — Vindhellfest

## 1. Introduction

### 1.1. Rôle du backend dans l'architecture globale

Le backend est l'une des trois couches de l'architecture du projet Vindhellfest, aux côtés du frontend Next.js et de la base de données PostgreSQL. Il est le seul service à accéder directement à la base de données : ni le frontend, ni le navigateur ne peuvent interroger PostgreSQL directement. Toute donnée transite obligatoirement par l'API REST qu'il expose.

Dans l'architecture Docker, le backend tourne dans un conteneur dédié (`vindhellfest-backend`) accessible sur le port `4000`. Il occupe une position centrale dans le réseau interne Docker `app-net` :

| Appelant                        | Adresse utilisée         | Raison                                                        |
| ------------------------------- | ------------------------- | ------------------------------------------------------------- |
| Frontend (SSR, layouts serveur) | `http://backend:4000`   | Communication interne au réseau Docker `app-net`           |
| Frontend (navigateur client)    | `http://localhost:4000` | Le navigateur ne connaît pas le réseau Docker               |
| Base de données PostgreSQL     | `postgresql://db:5432`  | Hostname `db` résolu par Docker sur le réseau `app-net` |

Le backend remplit trois responsabilités principales :

1. **API REST** — expose les endpoints consommés par le frontend, organisés en deux préfixes : `/public` pour les données accessibles sans authentification, `/admin` pour les opérations protégées.
2. **Authentification et sessions** — gère l'intégralité du cycle de vie des sessions : création du JWT à la connexion, vérification à chaque requête protégée, révocation à la déconnexion. Les sessions sont persistées en base de données, ce qui permet de les invalider côté serveur.
3. **Fichiers uploadés** — traite les images envoyées par l'administration (artistes, actualités), les convertit au format WebP via Sharp, et les sert statiquement via `/uploads/*`. Le frontend proxifie ces URLs vers le backend de manière transparente via une règle `rewrite` dans `next.config.ts`.

Le backend dépend de la base de données pour démarrer : Docker Compose configure un `healthcheck` sur le conteneur `db` et le `depends_on` du backend attend que PostgreSQL soit prêt avant de lancer le processus Node.js.

---

### 1.2. Objectifs techniques et choix d'Express.js 5

**Une API REST découplée du frontend**

Le projet sépare clairement frontend et backend en deux services indépendants. Next.js gère le rendu des pages ; Express se concentre sur ce qu'il fait de mieux — exposer une API REST. Ce découplage a une conséquence concrète : les deux services ont des cycles de vie indépendants. Le frontend peut être redéployé ou tomber en panne sans que l'API cesse de répondre — une app mobile qui consomme les mêmes endpoints continue de fonctionner. Avec une API intégrée dans Next.js, une panne ou un redéploiement du frontend aurait mis l'API hors ligne en même temps.

**Une chaîne de middlewares explicite**

Express organise le traitement d'une requête comme une chaîne de fonctions exécutées dans l'ordre : CORS, authentification, validation, upload, controller. Chaque étape est déclarée explicitement dans le fichier de route — il suffit de lire la définition d'un endpoint pour comprendre tout ce qui s'y passe, sans magie implicite.

**Séparation de l'application et du serveur**

L'application Express est créée par `createApp()` dans `src/app.ts`, indépendamment du `app.listen()` dans `src/index.ts`. Cette séparation est directement exploitée dans les tests d'intégration : Supertest monte l'instance retournée par `createApp()` sans ouvrir de port réseau — les tests s'exécutent en isolation complète.

**Architecture de l'application**

L'application est exportée par la fonction `createApp()` dans `src/app.ts`, séparée du point d'entrée `src/index.ts`. Ce découpage permet d'instancier l'application dans les tests d'intégration sans démarrer de serveur HTTP réel — Supertest monte directement l'instance Express retournée par `createApp()`.

```
src/index.ts       →  valide les variables d'env, lance app.listen()
src/app.ts         →  createApp() — CORS, routes, handlers d'erreur
src/env.ts         →  validateEnv() — arrête le processus si une variable est manquante
```

Le démarrage est ainsi sécurisé : si une variable d'environnement obligatoire est absente, le processus s'arrête immédiatement avec un message explicite — avant même que la première requête ne soit reçue.

---

## 2. Stack technique

### 2.1. Tableau des technologies et versions

| Technologie        | Version     | Rôle                                                               |
| ------------------ | ----------- | ------------------------------------------------------------------- |
| Node.js            | 20 (Alpine) | Environnement d'exécution du conteneur Docker                      |
| Express.js         | ^5.1.0      | Framework HTTP — routing, middlewares, gestion des erreurs async   |
| TypeScript         | ^5.9.3      | Typage statique strict sur l'ensemble du code                       |
| PostgreSQL         | 16          | Base de données relationnelle                                      |
| pg                 | ^8.16.3     | Driver PostgreSQL natif — pool de connexions, requêtes typées    |
| Zod                | ^4.2.1      | Validation des corps de requêtes — schémas déclaratifs          |
| jsonwebtoken       | ^9.0.2      | Génération et vérification des JWT d'authentification            |
| bcrypt             | ^6.0.0      | Hashage des mots de passe                                           |
| multer             | ^2.1.1      | Réception des fichiers multipart (images uploadées)               |
| sharp              | ^0.34.5     | Traitement d'images — conversion WebP, redimensionnement           |
| nodemailer         | ^8.0.2      | Envoi d'emails (mot de passe provisoire, contact)                   |
| express-rate-limit | ^8.2.1      | Limitation du débit sur les routes sensibles                       |
| dotenv             | ^17.2.3     | Chargement des variables d'environnement depuis `.env`            |
| Vitest             | ^4.0.15     | Framework de tests unitaires et d'intégration                      |
| Supertest          | ^7.1.4      | Requêtes HTTP sur l'instance Express dans les tests d'intégration |
| ESLint             | ^9.39.1     | Analyse statique du code — règles TypeScript                      |
| Prettier           | ^3.6.2      | Formatage automatique du code                                       |

---

### 2.2. Dépendances de production

Ce sont les packages embarqués dans l'image finale et nécessaires au fonctionnement de l'API en production.

**Express.js** (`express ^5.1.0`)

Le framework HTTP. Express 5 propage automatiquement les erreurs des handlers async vers le middleware d'erreur global — ce qui simplifie l'écriture des controllers et est exploité par `asyncHandler`.

**pg** (`^8.16.3`)

Driver officiel PostgreSQL pour Node.js. Il expose un pool de connexions configuré dans `src/db.ts` et une fonction générique `query<T>()` utilisée par tous les controllers. Le pool maintient plusieurs connexions ouvertes et les distribue aux requêtes concurrentes sans en ouvrir une nouvelle à chaque appel.

**Zod** (`^4.2.1`)

Bibliothèque de validation par schémas. Chaque endpoint qui reçoit un corps JSON est protégé par un schéma Zod défini dans `src/schemas/schema.ts` et appliqué via le middleware `validateBody`. Zod retourne des erreurs de validation structurées qui sont ensuite formatées et renvoyées au client avec un statut `400`.

**jsonwebtoken** (`^9.0.2`)

Génère et vérifie les JSON Web Tokens. Le JWT est signé avec `JWT_ACCESS_SECRET` à la connexion et vérifié à chaque requête protégée par le middleware `auth`. Il transporte l'`id`, le `role` et l'`display_name` de l'utilisateur — ces valeurs sont injectées dans `res.locals` pour être accessibles dans les controllers sans aller en base.

**bcrypt** (`^6.0.0`)

Hashage sécurisé des mots de passe avec un coût (`saltRounds`) de 10. Utilisé à la création d'un utilisateur, au changement de mot de passe et à la vérification du mot de passe lors de la connexion. Le hash est stocké en base — le mot de passe en clair ne transite jamais.

**multer** (`^2.1.1`)

Middleware de réception des fichiers `multipart/form-data`. Configuré en mode `memoryStorage` : les fichiers sont conservés en mémoire (`req.file.buffer`) et transmis directement à Sharp pour traitement, sans écriture intermédiaire sur le disque. La taille maximale est limitée à 5 Mo et seuls les types MIME image sont acceptés.

**sharp** (`^0.34.5`)

Bibliothèque de traitement d'images haute performance basée sur libvips. Dans le projet, sharp reçoit le buffer de multer et effectue deux opérations : redimensionner l'image à 1600 px de large maximum (en conservant le ratio) puis la convertir en WebP à une qualité de 80. Le fichier résultant est écrit sur le disque avec un nom UUID unique.

**nodemailer** (`^8.0.2`)

Client SMTP pour l'envoi d'emails. Utilisé dans trois cas : envoi du mot de passe provisoire lors d'une réinitialisation (`forgot-password`), envoi des identifiants à un nouvel utilisateur créé par l'admin, et transfert du formulaire de contact à l'adresse de l'organisation. Le transporteur SMTP est configuré une seule fois dans `src/services/mailer.service.ts`.

**express-rate-limit** (`^8.2.1`)

Middleware de limitation du débit. Appliqué uniquement sur les routes de connexion et de mot de passe oublié : 5 tentatives autorisées par fenêtre de 10 minutes par IP. En production, `trust proxy` est activé dans `app.ts` pour que le middleware lise la vraie IP cliente derrière le reverse proxy, et non l'IP interne Docker.

**dotenv** (`^17.2.3`)

Charge les variables d'environnement depuis le fichier `.env` avant toute autre importation dans `src/index.ts`. Le chargement est la toute première instruction du point d'entrée — avant même l'import de `validateEnv` — pour garantir que les variables sont disponibles au moment de la validation.

**cookie** (`^1.1.1`)

Utilitaire de parsing et sérialisation des cookies HTTP. Utilisé ponctuellement pour lire la valeur du cookie JWT dans des contextes où `req.cookies` d'Express n'est pas disponible (par exemple dans les tests).

---

### 2.3. Dépendances de développement

Ces packages ne sont présents que pendant le développement et les tests. Ils ne sont pas inclus dans l'image de production (`npm ci --omit=dev`).

**TypeScript** (`typescript ^5.9.3`)

Le compilateur TypeScript. Configuré en mode `strict` dans `tsconfig.json` — aucun `any` implicite, nullabilité systématiquement vérifiée. En développement, `ts-node-dev` transpile à la volée sans générer de fichiers JS. En production, `tsc` compile vers `dist/` et `node dist/index.js` lance le serveur.

**Types de bibliothèques** (`@types/*`)

Les paquets de définitions de types pour les bibliothèques JavaScript qui n'en embarquent pas nativement : `@types/express`, `@types/bcrypt`, `@types/jsonwebtoken`, `@types/multer`, `@types/nodemailer`, `@types/pg`, `@types/node`, `@types/supertest`, `@types/cookie`. Sans eux, TypeScript ne connaît pas les signatures des fonctions de ces bibliothèques.

**ts-node-dev** (`^2.0.0`)

Lance le serveur Express en mode développement avec rechargement automatique à chaque modification de fichier TypeScript. Configuré avec `--transpile-only` pour ignorer la vérification de types au redémarrage (TypeScript reste disponible séparément pour le lint) et `--poll` pour la compatibilité avec les volumes Docker sur Windows et macOS.

**Vitest** (`^4.0.15`)

Framework de tests. Utilisé pour les tests unitaires (services, middlewares) et les tests d'intégration (routes HTTP via Supertest). La configuration se trouve dans `vitest.config.ts`.

**Supertest** (`^7.1.4`)

Bibliothèque de tests HTTP qui monte l'instance Express retournée par `createApp()` directement — sans démarrer de vrai serveur sur un port. Les tests d'intégration envoient de vraies requêtes HTTP à l'application et vérifient les réponses (status, body, cookies) sans passer par le réseau.

**ESLint** (`eslint ^9.39.1`) + plugins TypeScript et Prettier

Analyse statique du code. Les plugins `@typescript-eslint/eslint-plugin` et `@typescript-eslint/parser` activent les règles spécifiques TypeScript (typage strict, pas d'`any`…). `eslint-plugin-prettier` et `eslint-config-prettier` intègrent Prettier dans ESLint pour unifier le formatage et les règles de style en une seule passe.

**Prettier** (`^3.6.2`)

Formateur de code automatique. Lancé via `npm run format` qui réécrit tous les fichiers selon les règles définies dans `.prettierrc`.

---

## 3. Architecture — carte du projet

### 3.1. Arbre des dossiers annoté

```
apps/backend/
│
├── src/
│   ├── index.ts                          # Point d'entrée — charge .env, valide, lance app.listen()
│   ├── app.ts                            # createApp() — CORS, routes, handlers d'erreur
│   ├── db.ts                             # Pool de connexions PostgreSQL + query<T>()
│   ├── env.ts                            # validateEnv() — arrêt immédiat si variable manquante
│   ├── type.ts                           # Types TypeScript partagés (DB rows, res.locals)
│   ├── utils.ts                          # Fonctions utilitaires pures
│   │
│   ├── routes/                           # Déclaration des routes Express — aucune logique métier
│   │   ├── admin.artists.routes.ts       # POST/PATCH/DELETE /admin/artists
│   │   ├── admin.auth.routes.ts          # POST /admin/auth/login, logout, password…
│   │   ├── admin.news.routes.ts          # POST/PATCH/DELETE /admin/news
│   │   ├── admin.users.routes.ts         # GET/POST/PATCH/DELETE /admin/users
│   │   ├── artists.routes.ts             # GET /public/artists, /public/artists/:id
│   │   ├── contact.routes.ts             # POST /contact/submit
│   │   ├── home.routes.ts                # GET /public/home
│   │   └── news.routes.ts                # GET /public/news, /public/news/:id
│   │
│   ├── controllers/                      # Logique métier par domaine — un fichier par action
│   │   ├── admin/
│   │   │   ├── artists/
│   │   │   │   ├── create_artist.controller.ts
│   │   │   │   ├── update_artist.controller.ts
│   │   │   │   └── delete_artist.controller.ts
│   │   │   ├── auth/
│   │   │   │   ├── login.controller.ts
│   │   │   │   ├── logout.controller.ts
│   │   │   │   ├── user_info.controller.ts
│   │   │   │   ├── change_password.controller.ts
│   │   │   │   └── forgot_password.controller.ts
│   │   │   ├── news/
│   │   │   │   ├── create_news.controller.ts
│   │   │   │   ├── update_news.controller.ts
│   │   │   │   └── delete_news.controller.ts
│   │   │   └── users/
│   │   │       ├── create_user.controller.ts
│   │   │       ├── update_user.controller.ts
│   │   │       ├── delete_user.controller.ts
│   │   │       └── list_users.controller.ts
│   │   ├── contact/
│   │   │   └── submit_contact.controller.ts
│   │   └── public/
│   │       ├── artists/
│   │       │   ├── list_artists.controller.ts
│   │       │   └── get_artist.controller.ts
│   │       ├── home/
│   │       │   └── get_home.controller.ts
│   │       └── news/
│   │           ├── get_news_list.controller.ts
│   │           └── get_news.controller.ts
│   │
│   ├── middlewares/                      # Middlewares Express réutilisables
│   │   ├── asyncHandler.ts               # Wrap async → propage les erreurs vers next()
│   │   ├── auth.ts                       # Vérifie le JWT dans le cookie
│   │   ├── sessionIsOpen.ts              # Vérifie que la session en base est active
│   │   ├── requireRole.ts                # Contrôle le rôle de l'utilisateur connecté
│   │   ├── authChain.ts                  # adminAuth() — compose auth + session + role
│   │   ├── validateBody.ts               # Validation Zod du corps de requête
│   │   ├── validateUuidParam.ts          # Validation du paramètre :id en UUID
│   │   ├── upload.ts                     # Configuration Multer (memoryStorage, 5 Mo max)
│   │   ├── hashPassword.ts               # Hash bcrypt d'un champ du body
│   │   ├── rateLimitLogin.ts             # Rate limit : 5 tentatives / 10 min
│   │   └── errorHandler.ts               # notFoundHandler + errorHandler global
│   │
│   ├── errors/
│   │   ├── AppError.ts                   # Classe d'erreur métier (message + status HTTP)
│   │   └── errorMessages.ts              # Constantes ERRORS.* — source de vérité des messages
│   │
│   ├── schemas/
│   │   └── schema.ts                     # Schémas Zod pour la validation de tous les endpoints
│   │
│   └── services/                         # Logique réutilisable sans dépendance Express
│       ├── imageUpload.service.ts         # saveImage(), deleteImage() — Sharp + disque
│       ├── mailer.service.ts              # Transporteur SMTP + fonctions d'envoi d'email
│       └── user.service.ts               # Génération de mot de passe, hashing, unicité
│
├── tests/
│   ├── setup.ts                          # Configuration globale Vitest (ex: reset DB)
│   ├── health.test.ts                    # Test du endpoint /health
│   ├── helpers/
│   │   ├── testServer.ts                 # Crée l'instance Express pour les tests (Supertest)
│   │   ├── createAuthSession.ts          # Crée une session de test avec JWT
│   │   └── fixtures.ts                   # Données de test réutilisables
│   ├── integration/
│   │   ├── admin/
│   │   │   ├── auth.test.ts
│   │   │   ├── artists.test.ts
│   │   │   ├── news.test.ts
│   │   │   └── users.test.ts
│   │   └── public/
│   │       ├── public.test.ts
│   │       └── contact.test.ts
│   └── unit/
│       ├── auth.middleware.test.ts
│       ├── requireRole.middleware.test.ts
│       ├── validateBody.middleware.test.ts
│       ├── validateUuidParam.middleware.test.ts
│       ├── imageUpload.service.test.ts
│       ├── mailer.service.test.ts
│       └── user.service.test.ts
│
├── uploads/                              # Images uploadées — volume Docker persistant
│   ├── artists/
│   └── news/
│
├── Dockerfile
├── .dockerignore
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
├── .prettierrc
├── .prettierignore
├── API.md                                # Documentation de tous les endpoints de l'API
└── package.json
```

---

### 3.2. Séparation routes / controllers / services / middlewares

L'architecture suit un principe de séparation des responsabilités strict : chaque couche a un rôle unique et les dépendances ne circulent que vers le bas.

```
routes/  ──►  middlewares/  ──►  controllers/  ──►  services/  ──►  db.ts
                                      │
                               errors/ (AppError)
                                   type.ts  (transversal)
```

| Couche           | Responsabilité                                                                                   | Ce qu'elle ne fait pas                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `routes/`      | Déclare les URLs, les méthodes HTTP et la chaîne de middlewares de chaque endpoint             | Pas de logique métier — uniquement l'assemblage de la chaîne                     |
| `middlewares/` | Intercepte la requête avant le controller — auth, validation, upload, rate limit                | Pas d'accès direct à la base de données (sauf `auth` et `sessionIsOpen`)     |
| `controllers/` | Logique métier — lit `req`, interroge la base, appelle les services, retourne la réponse     | Pas de logique réutilisable extraite ici — elle monte dans `services/`          |
| `services/`    | Fonctions réutilisables sans dépendance Express (`req`, `res`) — image, email, utilisateur | Pas de lecture directe de `req` ou `res`                                        |
| `db.ts`        | Unique point d'accès à PostgreSQL — pool et fonction `query<T>()`                            | Pas de logique métier — exécute uniquement la requête SQL passée en paramètre |
| `errors/`      | `AppError` + constantes `ERRORS.*` — source de vérité des messages d'erreur                | Transversal — importé par controllers et middlewares                              |
| `schemas/`     | Schémas Zod pour la validation des corps de requête                                             | Pas de logique applicative — uniquement la forme des données attendues            |

**Convention de nommage des controllers**

Chaque controller est un fichier à export nommé unique : `create_artist.controller.ts` exporte `createArtist`. Ce découpage un-fichier-par-action évite les fichiers fourre-tout et rend la suppression ou la modification d'une action chirurgicale.

**La factory `adminAuth()`**

Toutes les routes protégées utilisent `...adminAuth("admin", "artists")` — le spread d'un tableau de middlewares retourné par la factory `authChain.ts`. Ce pattern regroupe trois middlewares (`auth`, `sessionIsOpen`, `requireRole`) en une seule déclaration lisible dans la route, sans les répéter manuellement à chaque endpoint.

---

### 3.3. Flux d'une requête de bout en bout

Exemple concret : `POST /admin/artists` — création d'un artiste avec upload d'image.

```
Requête HTTP (navigateur)
        │
        ▼
app.ts — middleware CORS
        │   Vérifie que l'origine est dans FRONTEND_ORIGIN.
        │   Si la méthode est OPTIONS → répond 204 (preflight).
        │
        ▼
app.ts — express.json()
        │   Parse le corps JSON de la requête.
        │
        ▼
admin.artists.routes.ts — router.post("/artists", ...)
        │   Assemble et exécute la chaîne dans l'ordre :
        │
        ├── asyncHandler(auth)
        │       Lit le cookie JWT. Vérifie la signature avec JWT_ACCESS_SECRET.
        │       Injecte userId, userRole, userDisplayName dans res.locals.
        │       Si le JWT est absent ou invalide → AppError 401.
        │
        ├── asyncHandler(sessionIsOpen)
        │       Cherche la session en base (SELECT ... WHERE id = sessionId).
        │       Vérifie qu'elle n'est pas révoquée ni expirée.
        │       Renouvelle le cookie JWT (sliding session).
        │       Si session invalide → AppError 401.
        │
        ├── requireRole("admin", "artists")
        │       Compare res.locals.userRole à la liste des rôles autorisés.
        │       Si le rôle ne correspond pas → AppError 403.
        │
        ├── upload.single("image")   [Multer]
        │       Lit le champ "image" du multipart/form-data.
        │       Vérifie le type MIME et la taille (≤ 5 Mo).
        │       Stocke le fichier en mémoire dans req.file.buffer.
        │
        ├── validateBody(createArtistSchema)   [Zod]
        │       Parse req.body avec le schéma Zod.
        │       Si un champ est absent ou invalide → réponse 400 avec le détail des erreurs.
        │       Remplace req.body par les données validées et transformées.
        │
        └── asyncHandler(createArtist)   [controller]
                │
                ├── Vérifie que req.file est présent.
                │
                ├── saveImage(req.file.buffer, ...)   [service]
                │       Sharp : resize 1600 px → WebP qualité 80.
                │       Écrit le fichier sur le disque avec un nom UUID.
                │       Retourne l'URL relative /uploads/artists/<uuid>.webp.
                │
                ├── query("BEGIN")   [db.ts]
                │
                ├── query<ArtistItem>("INSERT INTO artists ...")
                │       Retourne la ligne créée. Vérifie que rows[0] existe.
                │
                ├── query<ConcertRow>("INSERT INTO concerts ...")
                │       Retourne la ligne créée. Vérifie que rows[0] existe.
                │
                ├── query("COMMIT")
                │
                └── res.status(201).json({ message, artist })
                        │
                        ▼  (en cas d'erreur dans la transaction)
                    query("ROLLBACK")
                    deleteImage(...)   supprime le fichier déjà écrit
                    throw error   → propagé vers errorHandler

        ▼
errorHandler (fin de chaîne dans app.ts)
        │   Si error instanceof AppError → res.status(error.status).json({ error: error.message })
        │   Sinon → res.status(500).json({ error: "Internal Server Error" })
        ▼
Réponse HTTP (navigateur)
```

Ce flux illustre trois principes structurants du projet :

- **Fail fast** — chaque middleware rejette la requête dès que sa condition n'est pas satisfaite, sans exécuter la suite.
- **Transaction image + base** — l'image est écrite _avant_ la transaction SQL. Si la transaction échoue, le fichier est supprimé dans le `catch`. Si l'écriture de l'image échoue, la transaction n'est jamais ouverte.
- **Centralisation des erreurs** — tous les controllers lancent une `AppError` ; le handler global en bout de chaîne est le seul endroit où `res.status().json()` est appelé pour les erreurs.

---

## 4. Fichiers de configuration

### 4.1. `tsconfig.json`

### 4.2. `eslint.config.mjs`

### 4.3. `vitest.config.ts`

### 4.4. `.prettierrc` / `.prettierignore`

### 4.5. `Dockerfile`

### 4.6. `.dockerignore`

### 4.7. Variables d'environnement

---

## 5. Système de types — `src/type.ts`

### 5.1. Pourquoi centraliser les types

### 5.2. Augmentation d'`Express.Locals`

### 5.3. Types base de données (DB rows)

### 5.4. Types métier partagés

### 5.5. Convention de nommage et règle `no-any`

---

## 6. Gestion des erreurs

### 6.1. La classe `AppError`

### 6.2. Centralisation des messages — `errors/errorMessages.ts`

### 6.3. Le handler global `errorHandler`

### 6.4. `asyncHandler` — envelopper les controllers async

---

## 7. Middlewares

### 7.1. Authentification — `auth`

### 7.2. Sessions — `sessionIsOpen`

### 7.3. Autorisation — `requireRole`

### 7.4. Composition — `authChain`

### 7.5. Validation — `validateBody` et `validateUuidParam`

### 7.6. Upload — `multer` et traitement image

### 7.7. Rate limiting — `rateLimitLogin`

---

## 8. Validation des données — `src/schemas/schema.ts`

### 8.1. Pourquoi Zod

### 8.2. Schémas par domaine

---

## 9. Couche services — `src/services/`

### 9.1. `imageUpload.service` — pipeline image

### 9.2. `mailer.service` — envoi d'emails

### 9.3. `user.service` — logique métier utilisateurs

---

## 10. Routes et controllers

### 10.1. Routes publiques — `/public`

### 10.2. Routes d'authentification — `/admin/auth`

### 10.3. Routes artistes — `/admin/artists`

### 10.4. Routes actualités — `/admin/news`

### 10.5. Routes utilisateurs — `/admin/users`

### 10.6. Route contact — `/contact`

---

## 11. Base de données — connexion et requêtes

### 11.1. Le pool de connexion — `src/db.ts`

### 11.2. Convention de typage des requêtes `query<T>`

### 11.3. Vérification systématique de `rows[0]`

---

## 12. Authentification et sessions

### 12.1. Stratégie JWT + sessions en base

### 12.2. Cycle de vie d'une session

### 12.3. Cookies httpOnly — configuration et sécurité

### 12.4. Renouvellement du JWT à chaque requête

---

## 13. Tests

### 13.1. Organisation des tests

### 13.2. Tests d'intégration — routes HTTP avec Supertest

### 13.3. Tests unitaires — services et middlewares

### 13.4. Helpers et fixtures
