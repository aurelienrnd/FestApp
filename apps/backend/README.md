# Backend — Vindhellfest

## 1. Introduction

### 1.1. Rôle du backend dans l'architecture globale

Le backend est l'une des trois couches de l'architecture du projet Vindhellfest, aux côtés du frontend Next.js et de la base de données PostgreSQL. Il est le seul service à accéder directement à la base de données : ni le frontend, ni le navigateur ne peuvent interroger PostgreSQL directement. Toute donnée transite obligatoirement par l'API REST qu'il expose.

Dans l'architecture Docker, le backend tourne dans un conteneur dédié (`vindhellfest-backend`) accessible sur le port `4000`. Il occupe une position centrale dans le réseau interne Docker `app-net` :

| Appelant                        | Adresse utilisée        | Raison                                                  |
| ------------------------------- | ----------------------- | ------------------------------------------------------- |
| Frontend (SSR, layouts serveur) | `http://backend:4000`   | Communication interne au réseau Docker `app-net`        |
| Frontend (navigateur client)    | `http://localhost:4000` | Le navigateur ne connaît pas le réseau Docker           |
| Base de données PostgreSQL      | `postgresql://db:5432`  | Hostname `db` résolu par Docker sur le réseau `app-net` |

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

| Technologie        | Version     | Rôle                                                              |
| ------------------ | ----------- | ----------------------------------------------------------------- |
| Node.js            | 20 (Alpine) | Environnement d'exécution du conteneur Docker                     |
| Express.js         | ^5.1.0      | Framework HTTP — routing, middlewares, gestion des erreurs async  |
| TypeScript         | ^5.9.3      | Typage statique strict sur l'ensemble du code                     |
| PostgreSQL         | 16          | Base de données relationnelle                                     |
| pg                 | ^8.16.3     | Driver PostgreSQL natif — pool de connexions, requêtes typées     |
| Zod                | ^4.2.1      | Validation des corps de requêtes — schémas déclaratifs            |
| jsonwebtoken       | ^9.0.2      | Génération et vérification des JWT d'authentification             |
| bcrypt             | ^6.0.0      | Hashage des mots de passe                                         |
| multer             | ^2.1.1      | Réception des fichiers multipart (images uploadées)               |
| sharp              | ^0.34.5     | Traitement d'images — conversion WebP, redimensionnement          |
| nodemailer         | ^8.0.2      | Envoi d'emails (mot de passe provisoire, contact)                 |
| express-rate-limit | ^8.2.1      | Limitation du débit sur les routes sensibles                      |
| dotenv             | ^17.2.3     | Chargement des variables d'environnement depuis `.env`            |
| Vitest             | ^4.0.15     | Framework de tests unitaires et d'intégration                     |
| Supertest          | ^7.1.4      | Requêtes HTTP sur l'instance Express dans les tests d'intégration |
| ESLint             | ^9.39.1     | Analyse statique du code — règles TypeScript                      |
| Prettier           | ^3.6.2      | Formatage automatique du code                                     |

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
├── uploads/                              # Les images uploadées sont stockées directement sur la machine hôte (pas un volume Docker)
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

| Couche         | Responsabilité                                                                             | Ce qu'elle ne fait pas                                                        |
| -------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `routes/`      | Déclare les URLs, les méthodes HTTP et la chaîne de middlewares de chaque endpoint         | Pas de logique métier — uniquement l'assemblage de la chaîne                  |
| `middlewares/` | Intercepte la requête avant le controller — auth, validation, upload, rate limit           | Pas d'accès direct à la base de données (sauf `auth` et `sessionIsOpen`)      |
| `controllers/` | Logique métier — lit `req`, interroge la base, appelle les services, retourne la réponse   | Pas de logique réutilisable extraite ici — elle monte dans `services/`        |
| `services/`    | Fonctions réutilisables sans dépendance Express (`req`, `res`) — image, email, utilisateur | Pas de lecture directe de `req` ou `res`                                      |
| `db.ts`        | Unique point d'accès à PostgreSQL — pool et fonction `query<T>()`                          | Pas de logique métier — exécute uniquement la requête SQL passée en paramètre |
| `errors/`      | `AppError` + constantes `ERRORS.*` — source de vérité des messages d'erreur                | Transversal — importé par controllers et middlewares                          |
| `schemas/`     | Schémas Zod pour la validation des corps de requête                                        | Pas de logique applicative — uniquement la forme des données attendues        |

**Convention de nommage des controllers**

Chaque controller est un fichier à export nommé unique : `create_artist.controller.ts` exporte `createArtist`.

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

## 4. Fichiers racine — `src/`

À la racine de `src/` se trouvent les fichiers qui constituent le socle de l'application : point d'entrée, configuration Express, connexion à la base de données et validation de l'environnement. Ils ne contiennent pas de logique métier — ils assemblent et initialisent les briques sur lesquelles repose tout le reste.

### 4.1. `src/index.ts`

C'est le point d'entrée du serveur — le seul fichier exécuté directement par Node.js. Il ne contient aucune logique métier : son unique rôle est d'orchestrer le démarrage dans le bon ordre.

```ts
import dotenv from "dotenv";
dotenv.config();           // 1. charge le .env

import { validateEnv } from "./env";
import { createApp } from "./app";

validateEnv();             // 2. vérifie que toutes les variables sont présentes
const app = createApp();   // 3. construit l'application Express
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, ...);     // 4. démarre le serveur
```

L'ordre des trois premières étapes est intentionnel et non interchangeable :

- `dotenv.config()` doit être la toute première instruction — avant même les imports qui suivent — pour que `process.env` soit peuplé au moment où les autres modules sont chargés.
- `validateEnv()` s'exécute avant `createApp()` : si une variable manque, le processus s'arrête immédiatement avec un message explicite, sans qu'un serveur à moitié configuré ne démarre.
- `createApp()` n'est appelé qu'une fois l'environnement validé — l'application Express est construite avec la garantie que toutes ses dépendances de configuration sont disponibles.

Ce fichier n'est jamais importé dans les tests — ceux-ci appellent `createApp()` directement depuis `app.ts`, sans passer par `app.listen()`.

### 4.2. `src/app.ts`

Ce fichier exporte la fonction `createApp()` qui construit et retourne l'instance Express configurée. Il est séparé de `index.ts` précisément pour que les tests puissent instancier l'application sans démarrer de serveur.

`createApp()` configure l'application en cinq étapes dans l'ordre :

**1. CORS**

Un middleware manuel lit l'en-tête `Origin` de chaque requête et le compare à `FRONTEND_ORIGIN`. Si l'origine est autorisée, les headers `Access-Control-Allow-*` sont ajoutés à la réponse. Les requêtes `OPTIONS` (preflight) reçoivent une réponse `204` immédiate — sans passer par les routes.

**2. Trust proxy**

```ts
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
```

En production, le backend est derrière un reverse proxy (nginx, load balancer…). Sans cette option, Express lit l'IP cliente depuis `req.ip` qui retourne l'IP du proxy — toujours la même. `express-rate-limit` utilise `req.ip` pour compter les tentatives par IP : sans `trust proxy`, toutes les requêtes semblent venir de la même adresse et le rate limiting ne fonctionne pas correctement. Avec `trust proxy: 1`, Express lit l'IP réelle du client depuis l'en-tête `X-Forwarded-For` ajouté par le proxy.

Ce bloc est conditionnel — en développement, il n'y a pas de proxy et `req.ip` est déjà l'IP correcte.

**3. Parsing du body**

`express.json()` parse automatiquement le corps des requêtes `Content-Type: application/json` et le rend disponible dans `req.body`.

**3. Fichiers statiques et routes API**

```ts
app.use("/uploads", express.static(...)); // sert les images uploadées
app.use("/admin", adminArtists);
app.use("/admin", adminNews);
// ...
app.use("/public", publicHome);
// ...
```

Les images uploadées sont servies statiquement depuis le dossier `uploads/` — le frontend les atteint via `/uploads/artists/<uuid>.webp` sans passer par un controller.

**4. Handlers de fin de chaîne**

```ts
app.use(notFoundHandler); // 404 si aucune route ne correspond
app.use(errorHandler); // gère toutes les AppError et erreurs inattendues
```

Ces deux middlewares sont enregistrés en dernier — `notFoundHandler` intercepte toute requête qui n'a pas trouvé de route, `errorHandler` reçoit toutes les erreurs propagées via `next(error)` ou lancées dans un handler async.

### 4.3. `src/db.ts`

Ce fichier est l'unique point d'accès à la base de données PostgreSQL. Aucun controller ne crée de connexion directement — tous passent par les deux exports de ce fichier : `pool` et `query`.

**Le pool de connexions**

```ts
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
```

Un `Pool` maintient un ensemble de connexions PostgreSQL ouvertes en permanence. Quand un controller appelle `query()`, le pool lui attribue une connexion disponible — sans en ouvrir une nouvelle à chaque requête. Quand la requête est terminée, la connexion est remise dans le pool pour la prochaine requête. Ce mécanisme évite le coût d'ouverture d'une connexion TCP à chaque appel et permet de gérer plusieurs requêtes simultanées.

Les valeurs de fallback (`|| "localhost"`, `|| "postgres"`…) ne sont là que pour satisfaire TypeScript — `process.env.*` étant typé `string | undefined`, TypeScript exige une valeur par défaut. En pratique elles ne sont jamais atteintes : `validateEnv()` garantit que toutes les variables sont définies avant que le pool soit créé. En production, ces variables seraient injectées par la plateforme d'hébergement avec les vraies valeurs de l'infrastructure — `"postgres"` comme mot de passe ou `"localhost"` comme host ne seraient pas des valeurs viables.

`pool` est aussi exporté directement pour être utilisé dans `tests/setup.ts` — le setup de tests crée son propre pool pointant vers `vindhellfest_test` pour isoler les données de test de la base de développement.

**La fonction `query<T>()`**

```ts
export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]>;
```

Wrapper autour de `pool.query()` qui retourne directement `result.rows` — le tableau des lignes retournées par PostgreSQL. Le paramètre générique `T` permet de typer précisément les lignes retournées :

```ts
const rows = await query<ArtistItem>("SELECT * FROM artists WHERE id = $1", [
  id,
]);
```

TypeScript sait alors que `rows` est de type `ArtistItem[]` — sans casting manuel.

`params` utilise les **requêtes paramétrées** (`$1`, `$2`…) : les valeurs sont transmises séparément du texte SQL, ce qui empêche les injections SQL — PostgreSQL traite les paramètres comme des valeurs pures, jamais comme du SQL à exécuter.

### 4.4. `src/env.ts`

Ce fichier exporte une seule fonction : `validateEnv()`. Elle est appelée dans `src/index.ts` juste après `dotenv.config()` et avant `createApp()` — si une variable manque, le processus s'arrête immédiatement avec un message explicite listant les variables absentes.

```ts
const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  // ...toutes les variables obligatoires
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path[0]).join(", ");
    throw new Error(`Missing env vars: ${missing}`);
  }
}
```

Zod est utilisé ici de la même façon que pour la validation des corps de requête — `safeParse` tente de valider `process.env` contre le schéma. Si une variable est absente, Zod produit une issue par variable manquante. `.map((i) => i.path[0])` extrait le nom de chaque variable et `.join(", ")` les assemble en un message lisible :

```
Error: Missing env vars: DB_PASSWORD, JWT_ACCESS_SECRET
```

### 4.5. `src/utils.ts`

Ce fichier regroupe les fonctions utilitaires partagées entre plusieurs middlewares et controllers — principalement liées à l'authentification, aux sessions et aux cookies. Elles n'ont pas de dépendance Express (`req`, `res`) et peuvent être appelées depuis n'importe quelle couche.

| Fonction                          | Rôle                                                                                                                                                                                                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getEnv(name)`                    | Lit une variable d'environnement et lance une erreur si elle est absente —`process.env[name]` étant typé `string \| undefined`, TypeScript refuse de l'utiliser là où un `string` est attendu. `getEnv()` retourne `string` garanti et prévient l'erreur de compilation sans recourir au `!` |
| `envToStringValue(name)`          | Lit une variable d'environnement et la caste en `StringValue` (type attendu par `jsonwebtoken` pour les durées comme `"1h"`, `"12h"`)                                                                                                                                                        |
| `initToken(...)`                  | Crée et signe un JWT avec `userId` et `sessionId` comme payload                                                                                                                                                                                                                              |
| `serializeCookie(...)`            | Sérialise le JWT dans un cookie `httpOnly`, `secure`, `sameSite` — les options sont lues depuis les variables d'environnement                                                                                                                                                                |
| `userExists(user)`                | Vérifie qu'un utilisateur a été trouvé en base — lance `AppError 401` sinon                                                                                                                                                                                                                  |
| `passwordIsValid(password, hash)` | Compare le mot de passe en clair avec le hash bcrypt — lance `AppError 401` si invalide                                                                                                                                                                                                      |
| `sessionExists(session)`          | Vérifie qu'une session a été trouvée en base — lance `AppError 401` sinon                                                                                                                                                                                                                    |
| `sessionRevoked(session)`         | Vérifie que la session n'est pas révoquée ni expirée — lance `AppError 401` sinon                                                                                                                                                                                                            |
| `requireUserId(reqUserId)`        | Extrait et valide le `userId` depuis `res.locals` — lance `AppError 401` si absent                                                                                                                                                                                                           |
| `requireSessionId(reqSessionId)`  | Extrait et valide le `sessionId` depuis `res.locals` — lance `AppError 401` si absent                                                                                                                                                                                                        |

Ces fonctions centralisent des vérifications répétées dans plusieurs controllers et middlewares. Sans elles, chaque controller devrait réécrire la même logique de vérification — avec le risque d'oublier un cas ou de retourner des codes d'erreur différents pour la même situation.

---

## 5. Fichiers de configuration

Ces fichiers contrôlent le comportement des outils de développement : compilation TypeScript, analyse statique, formatage, tests et conteneurisation. Ils ne contiennent pas de logique applicative — ils définissent les règles et les contraintes qui s'appliquent à l'ensemble du projet.

### 5.1. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",
    "moduleResolution": "node16",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Ce fichier contrôle le comportement du compilateur TypeScript. Les options clés du projet :

| Option             | Valeur   | Effet                                                                                                                                                        |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `strict`           | `true`   | Active toutes les vérifications strictes — interdit `any` implicite, `null` non vérifié, etc.                                                                |
| `target`           | `ES2020` | Code compilé compatible avec Node.js 20                                                                                                                      |
| `module`           | `Node16` | Format de modules natif Node.js — supporte les imports ES et CommonJS                                                                                        |
| `moduleResolution` | `node16` | Résolution de modules alignée sur le comportement de Node.js 16+                                                                                             |
| `esModuleInterop`  | `true`   | Permet d'importer des modules CommonJS avec la syntaxe `import x from "x"` — nécessaire pour `bcrypt`, `dotenv`, `nodemailer` qui sont des packages CommonJS |
| `outDir`           | `dist`   | Dossier de sortie des fichiers JavaScript compilés par `npm run build`                                                                                       |
| `rootDir`          | `src`    | Dossier source — seul `src/` est compilé, `tests/` est exclu                                                                                                 |
| `skipLibCheck`     | `true`   | Ignore les erreurs de types dans `node_modules/` — accélère la compilation                                                                                   |

`"include": ["src"]` exclut explicitement le dossier `tests/` de la compilation de production. Les tests ont leur propre `tests/tsconfig.json` qui étend ce fichier en ajoutant `tests/` à l'inclusion.

### 5.2. `eslint.config.cjs`

```js
module.exports = [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ),
  ...compat.config({
    parser: "@typescript-eslint/parser",
    rules: { "prettier/prettier": "error" },
  }),
];
```

Le fichier utilise l'extension `.cjs` (CommonJS) plutôt que `.mjs` car le backend n'a pas `"type": "module"` dans son `package.json` — Node.js traite les fichiers `.js` comme CommonJS par défaut, et ESLint doit être dans le même format de modules que le projet.

Trois préréglages sont activés :

- **`eslint:recommended`** — règles JavaScript de base (variables non déclarées, code mort…)
- **`plugin:@typescript-eslint/recommended`** — règles TypeScript strictes (`no-explicit-any`, typage correct des fonctions…)
- **`plugin:prettier/recommended`** — intègre Prettier dans ESLint : les violations de formatage sont signalées comme des erreurs ESLint, ce qui permet de tout corriger en une seule passe avec `npm run lint:fix`

Le dernier bloc configure une exception pour le fichier `eslint.config.cjs` lui-même — il utilise `require` et `module.exports` qui sont des globals CommonJS, normalement interdits par les règles TypeScript.

### 5.3. `vitest.config.ts`

```ts
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 20000,
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
  },
});
```

Ce fichier configure l'environnement de test. Les paramètres clés :

**`environment: "node"`** — Contrairement au frontend qui utilise `jsdom` pour simuler un navigateur, le backend tourne dans un environnement Node.js pur. Pas de DOM nécessaire — les tests envoient des requêtes HTTP à l'instance Express via Supertest.

**`globals: true`** — Active les globals de test (`describe`, `it`, `expect`, `vi`…) sans avoir à les importer dans chaque fichier de test.

**`setupFiles`** — Exécute `tests/setup.ts` avant chaque suite de tests. Ce fichier mocke Sharp, Nodemailer, le système de fichiers et le rate limiter, charge les variables d'environnement, et configure la base de données de test.

**`fileParallelism: false`** — Les fichiers de test s'exécutent séquentiellement. Les tests d'intégration partagent la même base PostgreSQL — exécuter plusieurs fichiers en parallèle provoquerait des conflits sur les migrations et les `TRUNCATE`.

**`testTimeout` / `hookTimeout`** — Délais étendus à 10 et 20 secondes pour les opérations sur la base de données réelle, plus lentes qu'un mock.

### 5.4. `.prettierrc` / `.prettierignore`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "endOfLine": "auto"
}
```

Prettier formate automatiquement le code à chaque exécution de `npm run format`. Les règles sont identiques à celles du frontend :

| Règle         | Valeur  | Signification                                                      |
| ------------- | ------- | ------------------------------------------------------------------ |
| `semi`        | `true`  | Point-virgule obligatoire en fin d'instruction                     |
| `singleQuote` | `false` | Guillemets doubles pour les chaînes de caractères                  |
| `tabWidth`    | `2`     | Indentation à 2 espaces                                            |
| `endOfLine`   | `auto`  | Fin de ligne adaptée à l'OS (LF sur Linux/macOS, CRLF sur Windows) |

`.prettierignore` exclut du formatage les fichiers qui n'ont pas à être touchés : `node_modules/`, `dist/` (fichiers compilés) et `README.md`.

### 5.5. `Dockerfile`

Le Dockerfile du backend est organisé en **trois stages multi-étapes** :

**Stage `builder`** — Compilation TypeScript

Installe toutes les dépendances (y compris `devDependencies` nécessaires à `tsc`), copie le code source et exécute `npm run build`. TypeScript compile `src/` vers `dist/` — seuls les fichiers JavaScript générés sont conservés pour la suite.

**Stage `runner`** — Image de production

Repart d'une image Node.js propre, installe uniquement les dépendances de production (`npm install --only=production`), puis copie depuis `builder` uniquement le dossier `dist/`. L'image finale ne contient ni le code TypeScript source, ni les `devDependencies`, ni le cache de compilation. Elle démarre avec `node dist/index.js`.

**Stage `dev`** — Image de développement

N'exécute pas de compilation — le code source TypeScript est monté depuis l'hôte via un volume Docker et exécuté directement par `ts-node-dev`. Toute modification d'un fichier `.ts` déclenche un rechargement automatique du serveur sans reconstruire l'image.

### 5.6. `.dockerignore`

Ce fichier indique à Docker quels fichiers ne pas envoyer au daemon lors du `docker build`. Sans lui, Docker enverrait l'intégralité du dossier `backend/` — y compris `node_modules/` et `dist/` — ce qui alourdirait inutilement le contexte de build et ralentirait chaque compilation.

Les fichiers `.env` sont également exclus : les variables d'environnement sont injectées au démarrage du conteneur via `docker-compose.yml`, pas au moment du build.

### 5.7. Variables d'environnement

Les variables d'environnement sont définies dans `.env.backend` à la racine du projet et chargées par `dotenv` au démarrage. Toutes les variables marquées comme obligatoires sont validées par `validateEnv()` — le serveur ne démarre pas si l'une d'elles est absente.

| Variable                        | Exemple                     | Rôle                                                                   |
| ------------------------------- | --------------------------- | ---------------------------------------------------------------------- |
| `PORT`                          | `4000`                      | Port d'écoute du serveur Express (optionnel —`4000` par défaut)        |
| `DB_HOST`                       | `db`                        | Hostname PostgreSQL —`db` dans Docker, `localhost` hors Docker         |
| `DB_PORT`                       | `5432`                      | Port PostgreSQL                                                        |
| `DB_USER`                       | `postgres`                  | Utilisateur PostgreSQL                                                 |
| `DB_PASSWORD`                   | `postgres`                  | Mot de passe PostgreSQL                                                |
| `DB_NAME`                       | `vindhellfest`              | Nom de la base de données                                              |
| `JWT_ACCESS_SECRET`             | `un-super-secret-a-changer` | Clé de signature des JWT — doit être longue et aléatoire en production |
| `JWT_ACCESS_EXPIRES_IN`         | `1h`                        | Durée de validité du JWT                                               |
| `COOKIE_ACCESS_TOKEN_NAME`      | `vindhellfest_access_token` | Nom du cookie JWT                                                      |
| `COOKIE_ACCESS_TOKEN_SECURE`    | `false`                     | `true` en production (HTTPS uniquement), `false` en développement      |
| `COOKIE_ACCESS_TOKEN_SAME_SITE` | `lax`                       | Politique SameSite du cookie (`lax`, `strict` ou `none`)               |
| `SESSION_EXPIRES_IN`            | `12h`                       | Durée de validité d'une session en base                                |
| `FRONTEND_ORIGIN`               | `http://localhost:3000`     | Origine autorisée par le CORS                                          |
| `SMTP_HOST`                     | `smtp.gmail.com`            | Serveur SMTP pour l'envoi d'emails                                     |
| `SMTP_PORT`                     | `587`                       | Port SMTP                                                              |
| `SMTP_SECURE`                   | `false`                     | `true` si le port SMTP utilise TLS directement (port 465)              |
| `SMTP_USER`                     | `email@gmail.com`           | Identifiant SMTP                                                       |
| `SMTP_PASS`                     | `xxxx`                      | Mot de passe SMTP — utiliser un mot de passe d'application Gmail       |
| `CONTACT_EMAIL`                 | `email@gmail.com`           | Adresse destinataire des formulaires de contact                        |

> Les fichiers `.env` ne sont pas versionnés — ils sont exclus par `.gitignore` et `.dockerignore`. Ne jamais commiter des secrets en clair dans le dépôt.

---

## 5. Système de types — `src/type.ts`

Tous les types TypeScript partagés entre plusieurs fichiers sont regroupés dans un fichier unique : `src/type.ts`. Ce fichier est organisé en cinq sections : `EXPRESS`, `USERS`, `SESSIONS`, `NEWS` et `ARTISTS`/`CONCERTS`.

### 5.1. Pourquoi centraliser les types

Sans fichier central, chaque controller redéfinit localement le même type `NewsItem` ou `ArtistItem`. Si la structure d'une réponse API évolue (ajout d'un champ, changement d'un type nullable), il faut retrouver et corriger toutes les définitions dispersées. Avec un fichier unique, une seule modification se propage à l'ensemble des controllers et middlewares.

Le frontend aligne ses propres types sur ceux du backend : `UserItem`, `NewsItem` et `ArtistItem` sont définis ici et reproduits à l'identique dans `apps/frontend/src/type.ts`. Ce contrat explicite évite les désynchronisations silencieuses entre ce que l'API envoie et ce que le frontend consomme.

> Les types propres à un seul fichier restent locaux à ce fichier avec une déclaration `type` locale — seuls les types réutilisés dans 2+ fichiers remontent dans `src/type.ts`.

---

### 5.2. Augmentation d'`Express.Locals`

Express expose un objet `res.locals` pour transmettre des données entre middlewares et controllers. Sans typage, cet objet est `Record<string, any>`. L'augmentation de module TypeScript permet de typer ce passage sans casser le contrat Express :

```ts
declare global {
  namespace Express {
    interface Locals {
      userId?: string;
      userRole?: UserRole;
      userDisplayName?: string;
      sessionId?: string;
    }
  }
}
```

Le middleware `auth` écrit dans `res.locals` après avoir vérifié le JWT ; les controllers lisent ces valeurs sans aucun cast. TypeScript garantit que `res.locals.userRole` est bien un `UserRole` et non un `any`.

---

### 5.3. Types base de données (DB rows)

Ces types correspondent directement aux colonnes retournées par `pg`. Ils sont passés en paramètre de type à `query<T>(...)` pour typer le résultat de chaque requête SQL.

**`IdRow`**

```ts
type IdRow = { id: string };
```

Utilisé pour les requêtes de vérification d'existence (`SELECT id FROM users WHERE id = $1`). Plutôt que de définir un type local à chaque controller, `IdRow` est réutilisé partout.

**`UserCredentialsRow`**

```ts
type UserCredentialsRow = {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
};
```

Retourné par la requête de connexion (`SELECT id, email, password_hash, display_name FROM users WHERE email = $1`). Le champ `password_hash` ne sort jamais des controllers d'authentification — il n'est jamais inclus dans `UserItem`.

**`SessionRow`**

```ts
type SessionRow = {
  id: string;
  revoked_at: Date | null;
  expires_at: Date;
};
```

Retourné par le middleware `sessionIsOpen` pour vérifier l'état de la session en base. `revoked_at` est nullable : il est `null` tant que la session est active et prend une valeur `Date` lors de la révocation.

**`NewsMediaRow` / `ArtistMediaRow`**

```ts
type NewsMediaRow = Pick<NewsItem, "id" | "url_media">;
type ArtistMediaRow = Pick<ArtistItem, "id" | "url_media">;
```

Construits par composition avec `Pick` — uniquement les champs nécessaires pour retrouver et supprimer le fichier image lors d'une mise à jour ou d'une suppression.

**`ConcertRow`**

```ts
type ConcertRow = {
  id: string;
  artist_id: string;
  stage: string;
  start_time: string;
  end_time: string;
};
```

Représente une ligne de la table `concerts`. Distinct d'`ArtistItem` qui inclut déjà `stage`, `start_time` et `end_time` via une jointure — `ConcertRow` est utilisé pour les opérations directes sur la table `concerts`.

---

### 5.4. Types métier partagés

Ces types représentent les données telles qu'elles sont retournées par l'API et consommées par le frontend.

**`UserRole`**

```ts
type UserRole = "admin" | "artists" | "news";
```

Union littérale des trois rôles autorisés — miroir exact de l'ENUM PostgreSQL `user_role`. Utilisé dans `Express.Locals`, dans `UserItem` et dans le middleware `requireRole`.

**`UserItem`**

```ts
type UserItem = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
  password_changed_at: string | null;
};
```

Représente une ligne utilisateur telle que retournée par les endpoints de liste et de CRUD. `password_changed_at` est nullable : il est `null` tant que l'utilisateur n'a jamais changé son mot de passe — ce champ déclenche la modale de changement obligatoire côté frontend à la première connexion.

**`NewsItem`**

```ts
type NewsItem = {
  id: string;
  title: string;
  content: string | null;
  is_published: boolean;
  created_at: string;
  url_media: string;
  description_media: string;
  author_name: string | null;
};
```

Représente les données complètes d'une actualité. `content` et `author_name` sont nullables car optionnels à la création. Partagé avec le frontend.

**`ArtistItem`**

```ts
type ArtistItem = {
  id: string;
  name: string;
  genre: string;
  origin: string;
  bio: string;
  url_media: string;
  description_media: string;
  youtube_url: string | null;
  spotify_url: string | null;
  stage: string | null;
  start_time: string | null;
  end_time: string | null;
  is_featured: boolean;
};
```

Représente les données complètes d'un artiste, incluant les informations de concert (`stage`, `start_time`, `end_time`) obtenues via jointure avec la table `concerts`. Les champs de liens externes et de programmation sont nullables : un artiste peut exister sans être encore programmé. Partagé avec le frontend.

---

### 5.5. Convention de nommage et règle `no-any`

| Convention | Explication                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `*Row`     | Type qui représente une ligne brute retournée par `pg` — noms de colonnes en `snake_case`                                |
| `*Item`    | Type métier exposé par l'API — partagé avec le frontend, noms de champs en `snake_case` (miroir des colonnes PostgreSQL) |
| `*Role`    | Union littérale miroir d'un ENUM PostgreSQL                                                                              |

La règle ESLint `@typescript-eslint/no-any` est activée dans `eslint.config.cjs`. L'augmentation de `Express.Locals` et le typage explicite de `query<T>(...)` sont les deux mécanismes qui permettent d'éliminer tous les `any` dans les controllers et middlewares.

---

## 6. Gestion des erreurs

La gestion des erreurs repose sur quatre éléments qui travaillent ensemble : une classe `AppError` pour lever des erreurs métier typées, un fichier central qui regroupe tous les messages, un handler global Express qui intercepte toutes les erreurs non catchées, et un wrapper `asyncHandler` qui évite de répéter `try/catch` dans chaque controller.

### 6.1. La classe `AppError`

`AppError` est une classe qui étend `Error` en ajoutant un code HTTP. Elle est levée partout dans les controllers lorsqu'une erreur métier se produit (ressource introuvable, accès refusé, conflit…), et interceptée en un seul endroit par le handler global.

```ts
export class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

**Pourquoi ne pas gérer l'erreur directement dans le controller ?**

Sans `AppError`, chaque controller construirait lui-même la réponse d'erreur :

```ts
res.status(404).json({ error: "Utilisateur introuvable" });
return;
```

Avec `AppError`, le controller se contente de lever l'erreur — c'est le `errorHandler` global qui construit la réponse. Si la structure des réponses d'erreur change (ajout d'un champ, d'un timestamp…), il n'y a qu'un seul endroit à modifier. Étendre `Error` plutôt que de lancer un objet brut permet en plus d'utiliser `instanceof AppError` dans le handler pour distinguer une erreur métier intentionnelle d'une erreur JavaScript inattendue.

**Pourquoi `Object.setPrototypeOf` ?**

Quand TypeScript compile vers CommonJS (`"module": "commonjs"` dans `tsconfig.json`), l'héritage de classes natives comme `Error` peut casser `instanceof`. Cette ligne rétablit la chaîne de prototype correctement après l'appel à `super()`.

Dans un controller, l'usage est systématique :

```ts
throw new AppError(ERRORS.USER_NOT_FOUND, 404);
```

Le code HTTP voyage avec l'erreur jusqu'au handler global, sans avoir à le re-préciser à chaque niveau.

### 6.2. Centralisation des messages — `errors/errorMessages.ts`

Tous les messages d'erreur sont regroupés dans un objet `ERRORS` exporté depuis `errors/errorMessages.ts`. Dans les controllers, on n'écrit jamais de chaîne en dur — on référence toujours une clé :

```ts
throw new AppError(ERRORS.USER_NOT_FOUND, 404);
```

Le `as const` en fin de fichier est important : il indique à TypeScript que les valeurs sont des littéraux immuables. Sans lui, TypeScript infèrerait `string` pour chaque valeur, et tu perdrais l'autocomplétion et la vérification de typage sur les messages.

Les clés sont organisées par domaine métier :

| Préfixe                                                   | Domaine                    |
| --------------------------------------------------------- | -------------------------- |
| `AUTH_`                                                   | Authentification et tokens |
| `SESSION_`                                                | État des sessions          |
| `VALIDATION_`                                             | Corps de requête invalide  |
| `PASSWORD_`                                               | Format du mot de passe     |
| `USER_`                                                   | CRUD utilisateurs          |
| `ARTIST_`                                                 | CRUD artistes              |
| `NEWS_`                                                   | CRUD actualités            |
| `MAIL_`                                                   | Envoi d'email              |
| `FORBIDDEN` / `ROUTE_NOT_FOUND` / `INTERNAL_SERVER_ERROR` | Erreurs génériques HTTP    |

### 6.3. Le handler global `errorHandler`

Le fichier `middlewares/errorHandler.ts` exporte deux middlewares enregistrés en dernier dans `app.ts`.

**`notFoundHandler`**

Déclenché si aucune route n'a répondu à la requête. Renvoie un 404 avec la méthode et l'URL demandée pour faciliter le debug :

```ts
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: `${ERRORS.ROUTE_NOT_FOUND}: ${req.method} ${req.originalUrl}`,
  });
};
```

**`errorHandler`**

Middleware Express à quatre paramètres — c'est cette signature `(err, req, res, next)` qui indique à Express qu'il s'agit d'un gestionnaire d'erreurs. Il est appelé dès qu'une erreur est levée dans un controller (via `asyncHandler`) ou passée à `next(err)`.

```ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") console.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: ERRORS.INTERNAL_SERVER_ERROR });
};
```

Le `instanceof AppError` distingue deux cas :

- **Erreur métier** (`AppError`) → on renvoie le `status` et le `message` définis par le controller
- **Erreur inattendue** (bug JavaScript, crash…) → on renvoie toujours un 500 générique, sans exposer les détails internes au client

Le `console.error` n'est actif qu'en dehors de la production — en développement il affiche la trace complète dans le terminal du conteneur, en production le serveur reste silencieux.

### 6.4. `asyncHandler` — envelopper les controllers async

Express reconnaît deux types de middlewares selon leur signature :

- **3 paramètres** `(req, res, next)` → middleware normal
- **4 paramètres** `(err, req, res, next)` → gestionnaire d'erreurs

Quand `next(err)` est appelé avec une valeur, Express saute tous les middlewares à 3 paramètres et transmet directement l'erreur au premier middleware à 4 paramètres qu'il trouve — c'est `errorHandler`.

.Sans wrapper, chaque controller devrait gérer ça manuellement avec un `try/catch` et un appel à `next(err)` — ce qui se répète dans chaque route.`asyncHandler` résout ça en enveloppant chaque controller :

```ts
export function asyncHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}
```

Il exécute le controller async et enchaîne `.catch(next)` — si une erreur est levée, elle est attrapée et passée à `next(err)`, ce qui déclenche le saut direct vers `errorHandler`.

```
throw new AppError(...)
        ↓
  .catch(next)          ← asyncHandler attrape l'erreur
        ↓
    next(err)           ← appelle next avec une valeur
        ↓
  Express saute tous les middlewares à 3 params
        ↓
  errorHandler(err, req, res, next)
```

Dans les routes, l'usage est systématique :

```ts
router.get("/", asyncHandler(getUsers));
router.post("/", asyncHandler(createUser));
```

---

## 7. Middlewares

Les middlewares sont des fonctions qui s'intercalent entre la réception de la requête et le controller. Chacun a une responsabilité unique et s'exécute dans l'ordre où il est déclaré dans la route. Si un middleware lève une `AppError`, la chaîne s'interrompt et `errorHandler` prend la main — le controller n'est jamais atteint.

```
requête → auth → sessionIsOpen → requireRole → validateBody → controller
```

### 7.1. Authentification — `auth`

Le middleware `auth` vérifie que la requête provient d'un utilisateur authentifié. Il s'exécute en trois étapes :

**1. Extraction du token depuis le cookie**

```ts
function getTokenFromCookie(req: Request) {
  if (!req.headers.cookie) throw new AppError(ERRORS.AUTH_MISSING_COOKIE, 401);
  const cookies = parse(req.headers.cookie);
  const token = cookies[getEnv("COOKIE_ACCESS_TOKEN_NAME")];
  if (!token) throw new AppError(ERRORS.AUTH_MISSING_ACCESS_TOKEN, 401);
  return token;
}
```

Le token JWT est transporté dans un cookie `httpOnly` — il n'est pas accessible en JavaScript côté client. Le nom du cookie est lu depuis la variable d'environnement `COOKIE_ACCESS_TOKEN_NAME`.

**2. Décodage et vérification du JWT**

```ts
function decodedToken(token: string) {
  const decoded = jwt.verify(token, getEnv("JWT_ACCESS_SECRET")) as JwtPayload;
  return { userId: decoded.userId, sessionId: decoded.sessionId };
}
```

`jwt.verify` valide la signature et l'expiration du token. Si le token est invalide ou expiré, une `AppError` 401 est levée.

**3. Vérification en base et peuplement de `res.locals`**

```ts
const user = await query<AuthUserRow>(
  "SELECT id, display_name, role FROM users WHERE id = $1",
  [userId],
);
if (!user[0]) throw new AppError(ERRORS.AUTH_USER_NOT_FOUND, 401);

res.locals.userId = user[0].id;
res.locals.userRole = user[0].role;
res.locals.userDisplayName = user[0].display_name;
res.locals.sessionId = sessionId;
```

On vérifie que l'utilisateur existe toujours en base — un token valide ne suffit pas si le compte a été supprimé entre-temps. Les données sont stockées dans `res.locals` pour être lues par les middlewares suivants et les controllers sans avoir à refaire la requête.

**`optionalAuth`**

Variante de `auth` qui n'interrompt pas la requête si le token est absent ou invalide. Elle peuple `res.locals` si le token est valide, et appelle `next()` dans tous les cas. Utilisée sur les routes semi-publiques accessibles aux visiteurs non connectés.

Dans `auth`, si la session est révoquée ou inexistante ce n'est pas grave — `sessionIsOpen` s'en charge juste après dans la chaîne. Les deux middlewares ont des responsabilités séparées : `auth` identifie l'utilisateur, `sessionIsOpen` contrôle l'état de la session.

Dans `optionalAuth` en revanche, `sessionIsOpen` n'est jamais appelé après — la route est semi-publique, il n'y a pas de chaîne de middlewares stricte. Donc `optionalAuth` vérifie elle-même que la session est active et non expirée avant de peupler `res.locals`, sinon un utilisateur avec une session révoquée ou expirée serait quand même considéré comme connecté.

Conséquence : sur ces routes, le token n'est pas renouvelé. Le renouvellement n'a lieu que via `sessionIsOpen`, qui n'est appelé que sur les routes admin. Naviguer uniquement sur les pages publiques sans toucher à l'administration ne suffit pas à maintenir la session active.

### 7.2. Sessions — `sessionIsOpen`

`sessionIsOpen` s'exécute après `auth` sur toutes les routes protégées. Son rôle est double : vérifier que la session en base est encore valide, et renouveler le token JWT à chaque requête.

**Vérification de la session**

```ts
const rows = await query<SessionRow>(
  "SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE id = $1 AND user_id = $2",
  [reqSessionId, reqUserId],
);
sessionExists(sessionBdd);
sessionRevoked(sessionBdd);
```

`sessionExists` lève une `AppError` 401 si la session est introuvable en base. `sessionRevoked` lève une `AppError` 401 si `revoked_at` n'est pas `null` (session fermée par un logout) ou si `expires_at` est dépassé. Ces deux fonctions sont centralisées dans `utils.ts`.

**Renouvellement du token**

```ts
const accessToken = initToken(reqUserId, "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES_IN", reqSessionId);
const accessCookie = serializeCookie("COOKIE_ACCESS_TOKEN_NAME", ...);
res.setHeader("Set-Cookie", accessCookie);
```

À chaque requête authentifiée réussie, un nouveau token JWT est généré et renvoyé dans le cookie. Cela permet de maintenir la session active tant que l'utilisateur navigue — le token expire seulement si l'utilisateur reste inactif plus longtemps que `JWT_ACCESS_EXPIRES_IN`.

### 7.3. Autorisation — `requireRole`

`requireRole` est une factory de middleware — elle ne retourne pas directement un middleware, elle retourne une fonction qui en est un. Cela permet de passer des arguments lors de la déclaration dans la route :

```ts
export function requireRole(...roles: UserRole[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const userRole: UserRole | undefined = res.locals.userRole;
    if (!userRole || !roles.includes(userRole)) {
      throw new AppError(ERRORS.FORBIDDEN, 403);
    }
    next();
  };
}
```

`res.locals.userRole` est peuplé par `auth` en amont. `requireRole` lit cette valeur et vérifie qu'elle fait partie de la liste des rôles autorisés passés en argument. Si ce n'est pas le cas, une `AppError` 403 est levée.

L'opérateur `...roles` permet de passer un ou plusieurs rôles autorisés :

```ts
requireRole("admin"); // admin uniquement
requireRole("admin", "news"); // admin ou news
```

### 7.4. Composition — `authChain`

Plutôt que de répéter `asyncHandler(auth), asyncHandler(sessionIsOpen), requireRole(...)` dans chaque route protégée, `authChain.ts` expose une factory `adminAuth` qui compose les trois middlewares en un seul tableau :

```ts
export function adminAuth(...roles: UserRole[]): RequestHandler[] {
  return [
    asyncHandler(auth),
    asyncHandler(sessionIsOpen),
    requireRole(...roles),
  ];
}
```

Dans les routes, le tableau est spreadé directement :

```ts
router.get("/", ...adminAuth("admin"), asyncHandler(getUsers));
router.delete("/:id", ...adminAuth("admin"), asyncHandler(deleteUser));
```

Le `...` (spread) déploie le tableau comme si chaque middleware était passé individuellement — Express les exécute dans l'ordre : `auth` → `sessionIsOpen` → `requireRole` → controller.

### 7.5. Validation — `validateBody` et `validateUuidParam`

Ces deux factories valident les données entrantes avant qu'elles n'atteignent le controller. Comme `requireRole`, elles sont synchrones — pas besoin d'`asyncHandler`.

**`validateBody`**

```ts
export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(ERRORS.VALIDATION_INVALID_BODY, 400));
    }
    req.body = parsed.data;
    return next();
  };
}
```

Prend un schéma Zod en argument et valide `req.body`. Si la validation échoue, une `AppError` 400 est transmise à `errorHandler`. Si elle réussit, `req.body` est remplacé par `parsed.data` — les données sont alors typées et nettoyées (champs inconnus supprimés, valeurs transformées selon le schéma).

**`validateUuidParam`**

```ts
export function validateUuidParam(paramName = "id") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const schema = z.object({ [paramName]: z.uuid() });
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new AppError(ERRORS.VALIDATION_INVALID_BODY, 400));
    }
    return next();
  };
}
```

Valide qu'un paramètre de route est un UUID valide. Évite d'atteindre la base de données avec un identifiant malformé. Par défaut valide `req.params.id`, mais le nom du paramètre est configurable : `validateUuidParam("artistId")`.

### 7.6. Upload — `multer` et traitement image

`upload.ts` configure multer pour recevoir les fichiers image envoyés par les formulaires multipart.

```ts
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(ERRORS.ARTIST_INVALID_FILE_TYPE, 400));
    }
  },
});
```

**`memoryStorage`** — le fichier n'est pas écrit sur le disque, il est conservé en mémoire sous forme de `Buffer` dans `req.file.buffer`. C'est ce buffer qui est ensuite passé à `sharp` dans le service `imageUpload.service` pour redimensionner et convertir l'image avant de l'écrire dans `uploads/`.

**`fileFilter`** — vérifie le type MIME du fichier avant de l'accepter. Seuls `image/jpeg`, `image/png` et `image/webp` sont autorisés. Si le type est refusé, une `AppError` 400 est levée directement dans le callback multer.

Dans les routes, `upload` est utilisé comme middleware avant le controller :

```ts
router.post(
  "/",
  ...adminAuth("admin"),
  upload.single("image"),
  asyncHandler(createArtist),
);
```

`upload.single("image")` indique que la requête contient un seul fichier dans le champ `image`.

### 7.7. Rate limiting — `rateLimitLogin`

`rateLimitLogin` est un middleware `express-rate-limit` configuré pour protéger la route de connexion contre les attaques par force brute :

```ts
export const rateLimitLogin = rateLimit({
  windowMs: 10 * 60 * 1000, // fenêtre de 10 minutes
  max: 5, // 5 tentatives max par IP
  standardHeaders: true, // renvoie les headers RateLimit-* au client
  legacyHeaders: false,
  message: { error: ERRORS.RATE_LIMIT_TOO_MANY_ATTEMPTS },
});
```

Au-delà de 5 tentatives depuis la même IP en 10 minutes, `express-rate-limit` renvoie automatiquement une réponse 429 avec le message d'erreur — sans atteindre le controller. Le compteur se réinitialise après la fenêtre de 10 minutes.

`standardHeaders: true` ajoute les headers `RateLimit-Limit`, `RateLimit-Remaining` et `RateLimit-Reset` à chaque réponse, ce qui permet au client de savoir combien de tentatives il lui reste avant d'être bloqué.

---

## 8. Validation des données — `src/schemas/schema.ts`

Tous les schémas Zod utilisés pour valider les corps de requête sont centralisés dans `src/schemas/schema.ts`. Ils sont passés en argument à `validateBody` dans les routes.

### 8.1. Pourquoi Zod

Sans validation, un controller qui reçoit `req.body` ne peut pas faire confiance aux données — un champ peut être absent, mal typé, ou contenir une valeur malveillante. Zod permet de définir la forme exacte attendue et de rejeter la requête avec un 400 avant d'atteindre la base de données.

Zod présente aussi un avantage TypeScript : `parsed.data` est automatiquement typé selon le schéma. Le controller n'a pas besoin de caster ou de vérifier manuellement chaque champ.

### 8.2. Schémas par domaine

**Authentification**

```ts
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(8),
  newPassword: z.string().min(8),
});
```

**Utilisateurs**

```ts
export const createUserSchema = z.object({
  email: z.email(),
  first_name: z.string().min(2).max(30).trim(),
  last_name: z.string().min(2).max(30).trim(),
  role: z.enum(["admin", "artists", "news"]),
});
```

Utilisé à la fois pour la création (`POST`) et la modification (`PATCH`) — les champs sont les mêmes dans les deux cas.

**Actualités**

```ts
export const createNewsSchema = z.object({
  title: z.string().min(2).max(150).trim(),
  content: z.string().trim().optional().or(z.literal("")),
  is_published: z.enum(["true", "false"]).optional(),
  description_media: z.string().min(1).max(255).trim(),
});
```

`is_published` est une chaîne `"true"` / `"false"` et non un booléen : les formulaires `multipart/form-data` envoient tous les champs en texte. La conversion en booléen est effectuée dans le controller.

**Artistes**

```ts
export const createArtistSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  // ...
  youtube_url: z
    .url()
    .refine((val) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(val))
    .optional()
    .or(z.literal("")),
  spotify_url: z
    .url()
    .refine((val) => /^https?:\/\/open\.spotify\.com\//.test(val))
    .optional()
    .or(z.literal("")),
  stage: z.enum(["MainStage", "Tremplin"]),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
  is_featured: z.enum(["true", "false"]).optional(),
});
```

Les URLs YouTube et Spotify utilisent `.refine()` pour vérifier le domaine avec une regex — `z.url()` seul accepterait n'importe quelle URL valide. Le `.optional().or(z.literal(""))` permet d'accepter une chaîne vide quand le champ est laissé vide dans le formulaire.

**Contact**

```ts
export const contactSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(100).trim(),
  subject: z.string().min(2).max(150).trim(),
  message: z.string().min(10).max(2000).trim(),
});
```

---

## 9. Couche services — `src/services/`

Les services regroupent la logique métier réutilisable entre plusieurs controllers. Un controller délègue aux services les opérations qui dépassent la simple lecture/écriture en base — traitement d'image, envoi d'email, vérification d'unicité. Cela allège les controllers et évite la duplication.

### 9.1. `imageUpload.service` — pipeline image

Deux fonctions exportées, utilisées par les controllers artistes et news.

**`saveImage`**

```ts
export async function saveImage(
  buffer: Buffer,
  uploadsDir: string,
  urlPrefix: string,
): Promise<string>;
```

Reçoit le `Buffer` de `req.file.buffer` (fourni par multer), génère un nom de fichier UUID unique, crée le dossier de destination si absent, redimensionne l'image à 1600px max en conservant les proportions, convertit en WebP qualité 80 avec `sharp`, écrit le fichier sur le disque et retourne l'URL publique.

**`deleteImage`**

```ts
export async function deleteImage(
  uploadsDir: string,
  urlMedia: string,
): Promise<void>;
```

Supprime silencieusement un fichier image à partir de son URL publique. Le `.catch(() => undefined)` évite de lever une erreur si le fichier est déjà absent. Elle est appelée **après** le commit en base — si la requête SQL échoue, l'ancienne image est conservée.

### 9.2. `mailer.service` — envoi d'emails

Le transporteur SMTP est configuré une seule fois au démarrage depuis les variables d'environnement :

```ts
const transporter = nodemailer.createTransport({
  host: getEnv("SMTP_HOST"),
  port: Number(getEnv("SMTP_PORT")),
  secure: getEnv("SMTP_SECURE") === "true",
  auth: { user: getEnv("SMTP_USER"), pass: getEnv("SMTP_PASS") },
});
```

Trois fonctions sont exportées, chacune pour un cas d'usage distinct :

| Fonction                 | Déclencheur                                   |
| ------------------------ | --------------------------------------------- |
| `sendWelcomeEmail`       | Création d'un compte utilisateur par un admin |
| `sendPasswordResetEmail` | Demande de réinitialisation de mot de passe   |
| `sendContactEmail`       | Soumission du formulaire de contact public    |

Toutes passent par la fonction interne `sendMail` qui convertit toute erreur nodemailer en `AppError(ERRORS.MAIL_SEND_ERROR, 500)`.

### 9.3. `user.service` — logique métier utilisateurs

Regroupe les vérifications et opérations réutilisables par les controllers utilisateurs.

| Fonction                    | Rôle                                                                       |
| --------------------------- | -------------------------------------------------------------------------- |
| `generateTemporaryPassword` | Génère un mot de passe aléatoire de 16 caractères hexadécimaux             |
| `hashPassword`              | Hash un mot de passe en clair avec bcrypt (coût 10)                        |
| `checkEmailAvailable`       | Vérifie qu'un email n'est pas déjà utilisé — lève 409 si conflit           |
| `checkDisplayNameAvailable` | Vérifie qu'un nom d'affichage n'est pas déjà utilisé — lève 409 si conflit |
| `checkUserExists`           | Vérifie qu'un utilisateur existe en base — lève 404 sinon                  |
| `isNewsPrivileged`          | Retourne `true` si le rôle est `admin` ou `news`                           |

`checkEmailAvailable` et `checkDisplayNameAvailable` acceptent un `excludeId` optionnel pour ignorer l'utilisateur courant lors d'une modification — sans ça, un utilisateur qui garde son propre email lors d'un `PATCH` déclencherait un faux conflit.

---

## 10. Controllers — `src/controllers/`

Chaque controller est un handler async enveloppé dans `asyncHandler`. Il lit les données validées depuis `req.body`, `req.params` ou `res.locals`, effectue les opérations en base, appelle les services si nécessaire, et renvoie la réponse JSON.

### 10.1. `get_home.controller.ts`

Retourne les données agrégées pour la page d'accueil : les artistes mis en avant et les deux dernières news publiées, en une seule requête parallèle.

```ts
const [artists, news] = await Promise.all([
  query<
    Pick<
      ArtistItem,
      | "id"
      | "name"
      | "stage"
      | "start_time"
      | "end_time"
      | "url_media"
      | "description_media"
    >
  >(
    `SELECT a.id, a.name, a.url_media, a.description_media,
            c.stage, c.start_time, c.end_time
     FROM artists a
     LEFT JOIN concerts c ON c.artist_id = a.id
     WHERE a.is_featured = TRUE`,
  ),
  query<
    Pick<
      NewsItem,
      "id" | "title" | "url_media" | "description_media" | "created_at"
    >
  >(
    `SELECT id, title, url_media, description_media, created_at
     FROM news
     WHERE is_published = TRUE
     ORDER BY created_at DESC
     LIMIT 2`,
  ),
]);

return res.status(200).json({ artists, news });
```

`Promise.all` exécute les deux requêtes SQL en parallèle — elles sont indépendantes l'une de l'autre et n'ont pas besoin de s'attendre. La jointure `LEFT JOIN concerts` récupère les informations de programmation (scène, horaires) directement avec les données artiste, sans second aller-retour en base.

### 10.2. `list_artists.controller.ts`

Retourne la liste de tous les artistes avec leurs informations de programmation, triés alphabétiquement.

```ts
const artists = await query<
  Omit<
    ArtistItem,
    "bio" | "genre" | "origin" | "youtube_url" | "spotify_url" | "end_time"
  >
>(
  `SELECT a.id, a.name, a.url_media, a.description_media, a.is_featured,
          c.stage, c.start_time
   FROM artists a
   LEFT JOIN concerts c ON c.artist_id = a.id
   ORDER BY a.name ASC`,
);

return res.status(200).json({ artists });
```

`Omit` exclut les champs lourds ou inutiles pour la liste (`bio`, `genre`, `origin`, liens externes, `end_time`) — seules les données nécessaires à l'affichage des cards sont retournées. La jointure `LEFT JOIN` garantit que les artistes sans concert programmé apparaissent quand même dans la liste, avec `stage` et `start_time` à `null`.

### 10.3. `get_artist.controller.ts`

Retourne le détail complet d'un artiste par son UUID, incluant tous les champs et son concert associé.

```ts
const { id } = req.params;

const rows = await query<ArtistItem>(
  `SELECT a.id, a.name, a.genre, a.origin, a.bio, a.url_media, a.description_media,
          a.youtube_url, a.spotify_url, a.is_featured,
          c.stage, c.start_time, c.end_time
   FROM artists a
   LEFT JOIN concerts c ON c.artist_id = a.id
   WHERE a.id = $1`,
  [id],
);

if (!rows[0]) throw new AppError(ERRORS.ARTIST_NOT_FOUND, 404);

return res.status(200).json({ artist: rows[0] });
```

Contrairement à `list_artists`, tous les champs d'`ArtistItem` sont retournés — `bio`, `genre`, `origin`, `youtube_url`, `spotify_url` et `end_time` sont nécessaires pour la page de détail. La vérification `if (!rows[0])` lève une `AppError` 404 si l'UUID ne correspond à aucun artiste en base.

### 10.4. `get_news_list.controller.ts`

Retourne la liste des actualités triées par date décroissante. Le filtre appliqué dépend du rôle de l'utilisateur détecté par `optionalAuth` en amont.

```ts
const isPrivileged = isNewsPrivileged(res.locals.userRole);

const news = await query<Omit<NewsItem, "content">>(
  `SELECT a.id, a.title, a.is_published, a.created_at,
          a.url_media, a.description_media,
          u.display_name AS author_name
   FROM news a
   LEFT JOIN users u ON u.id = a.user_id
   ${isPrivileged ? "" : "WHERE a.is_published = TRUE"}
   ORDER BY a.created_at DESC`,
);

return res.status(200).json({ news });
```

`isNewsPrivileged` retourne `true` si le rôle est `admin` ou `news` — dans ce cas la clause `WHERE is_published = TRUE` est omise et tous les brouillons sont inclus. Le `LEFT JOIN users` récupère le nom de l'auteur ; il reste `null` si l'utilisateur a été supprimé depuis la création de la news. Le champ `content` est exclu avec `Omit` — il n'est pas nécessaire pour l'affichage des cards de liste.

### 10.5. `get_news.controller.ts`

Retourne le détail complet d'une news par son UUID. La logique d'accès aux brouillons est gérée après la requête SQL.

```ts
const { id } = req.params;
const isPrivileged = isNewsPrivileged(res.locals.userRole);

const rows = await query<NewsItem>(
  `SELECT a.id, a.title, a.content, a.is_published, a.created_at,
          a.url_media, a.description_media,
          u.display_name AS author_name
   FROM news a
   LEFT JOIN users u ON u.id = a.user_id
   WHERE a.id = $1`,
  [id],
);

if (!rows[0]) throw new AppError(ERRORS.NEWS_NOT_FOUND, 404);
if (!isPrivileged && !rows[0].is_published)
  throw new AppError(ERRORS.NEWS_NOT_FOUND, 404);

return res.status(200).json({ news: rows[0] });
```

La vérification se fait en deux temps : d'abord on vérifie que la news existe, puis que l'utilisateur y a accès. Un utilisateur non privilégié qui tente d'accéder à un brouillon reçoit une `404` et non une `403` — pour ne pas révéler l'existence d'un contenu non publié.

### 10.6. `login.controller.ts`

Gère la connexion en quatre étapes : vérification des identifiants, création de session en base, génération du JWT et pose du cookie.

```ts
// 1. Récupère l'utilisateur en base
const email = String(req.body.email).trim().toLowerCase();
const password = String(req.body.password);
const user = (await query<UserCredentialsRow>(`SELECT id, email, password_hash, display_name FROM users WHERE email = $1 LIMIT 1`, [email]))[0];

// 2. Vérifie existence et mot de passe
userExists(user);
passwordIsValid(password, user.password_hash);

// 3. Crée une session en base et génère le JWT
const sessionId = await generateSession(user, "SESSION_EXPIRES_IN");
const accessToken = initToken(user.id, "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES_IN", sessionId);

// 4. Pose le cookie et répond
res.setHeader("Set-Cookie", serializeCookie(...));
return res.status(200).json({ message: "Authentification reussie" });
```

`generateSession` insère une ligne dans la table `sessions` avec une date d'expiration calculée depuis `SESSION_EXPIRES_IN`, et retourne l'UUID de session. Cet UUID est ensuite embarqué dans le payload JWT aux côtés du `userId` — les deux sont nécessaires pour valider chaque requête dans `auth` et `sessionIsOpen`.

`userExists` et `passwordIsValid` sont deux fonctions de `utils.ts` qui lèvent une `AppError` 401 en cas d'échec — sans préciser lequel, pour ne pas indiquer à un attaquant si l'email existe ou non.

### 10.7. `logout.controller.ts`

Révoque la session courante en base. Le cookie JWT n'est pas supprimé côté serveur — c'est le frontend qui le supprime — mais la session étant révoquée, le middleware `sessionIsOpen` bloquera toute requête ultérieure avec ce token.

```ts
const reqSessionId = requireSessionId(res.locals.sessionId);
const reqUserId = requireUserId(res.locals.userId);

const rows = await query<SessionRow>(
  "SELECT id, revoked_at, expires_at FROM sessions WHERE id = $1 AND user_id = $2",
  [reqSessionId, reqUserId],
);
sessionExists(rows[0]);
sessionRevoked(rows[0]);

await query(
  "UPDATE sessions SET revoked_at = now() WHERE id = $1 AND user_id = $2",
  [reqSessionId, reqUserId],
);

return res.status(200).json({ message: "Deconnexion reussie" });
```

`sessionExists` et `sessionRevoked` vérifient que la session est bien active avant de la révoquer — évite de mettre à jour une ligne déjà révoquée ou inexistante. L'`UPDATE` pose `revoked_at = now()` : dès lors, `sessionIsOpen` refusera tout token qui embarque cet identifiant de session.

### 10.8. `user_info.controller.ts`

Retourne les informations de l'utilisateur connecté et indique si un changement de mot de passe est obligatoire.

```ts
const reqUserId = requireUserId(res.locals.userId);
const rows = await query<Omit<UserItem, "created_at">>(
  `SELECT id, email, display_name, role, password_changed_at FROM users WHERE id = $1 LIMIT 1`,
  [reqUserId],
);
if (!rows[0]) throw new AppError(ERRORS.AUTH_USER_NOT_FOUND, 401);

return res.status(200).json({
  user: {
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    role: user.role,
  },
  mustChangePassword: user.password_changed_at === null,
});
```

`mustChangePassword` est calculé directement depuis `password_changed_at` : si le champ est `null`, l'utilisateur n'a jamais changé son mot de passe depuis la création de son compte par un admin. Le frontend utilise ce flag pour afficher la modale de changement obligatoire avant l'accès à l'administration.

### 10.9. `change_password.controller.ts`

Permet à l'utilisateur connecté de modifier son mot de passe en vérifiant d'abord l'ancien.

```ts
// 1. Récupère le hash actuel
const rows = await query<UserCredentialsRow>(
  `SELECT id, email, password_hash, display_name FROM users WHERE id = $1 LIMIT 1`,
  [userId],
);
if (!rows[0]) throw new AppError(ERRORS.AUTH_USER_NOT_FOUND, 404);

// 2. Vérifie que le mot de passe actuel est correct
const isValid = await bcrypt.compare(password, rows[0].password_hash);
if (!isValid) throw new AppError(ERRORS.AUTH_WRONG_PASSWORD, 401);

// 3. Met à jour le hash et la date de changement
await query(
  `UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2`,
  [newPassword, userId],
);
```

`newPassword` contient déjà le hash bcrypt — il est haché par le middleware `hashPassword` avant d'atteindre le controller. `password_changed_at = NOW()` est mis à jour à chaque changement — c'est ce champ que `userInfo` vérifie pour calculer `mustChangePassword`.

### 10.10. `forgot_password.controller.ts`

Réinitialise le mot de passe d'un utilisateur à partir de son email en générant un mot de passe temporaire et en le transmettant par email.

```ts
// 1. Vérifie que l'email existe en base
const user = (
  await query<{ id: string; email: string; display_name: string }>(
    `SELECT id, email, display_name FROM users WHERE email = $1 LIMIT 1`,
    [email],
  )
)[0];
if (!user) throw new AppError(ERRORS.AUTH_EMAIL_NOT_FOUND, 404);

// 2. Génère un mot de passe temporaire et le hash
const temporaryPassword = generateTemporaryPassword();
const passwordHash = await hashPassword(temporaryPassword);

// 3. Remet password_changed_at à null pour forcer le changement à la prochaine connexion
await query(
  `UPDATE users SET password_hash = $1, password_changed_at = NULL WHERE id = $2`,
  [passwordHash, user.id],
);

// 4. Envoie le mot de passe temporaire par email
await sendPasswordResetEmail(user.email, user.display_name, temporaryPassword);
```

`password_changed_at = NULL` est la clé du mécanisme : en remettant ce champ à `null`, `userInfo` calculera `mustChangePassword: true` à la prochaine connexion, forçant l'utilisateur à changer son mot de passe provisoire avant d'accéder à l'administration.

### 10.11. `create_artist.controller.ts`

Crée un artiste et son concert associé dans une transaction SQL. L'image est traitée et écrite sur le disque avant la transaction.

```ts
// 1. Vérifie la présence du fichier image
if (!req.file) throw new AppError(ERRORS.ARTIST_FILE_REQUIRED, 400);

// 2. Convertit et écrit l'image avant d'ouvrir la transaction
const url_media = await saveImage(req.file.buffer, ARTISTS_UPLOADS_DIR, "/uploads/artists");

// 3. Transaction : INSERT artiste + INSERT concert
await query("BEGIN");
try {
  const artist = (await query<ArtistItem>(`INSERT INTO artists (...) VALUES (...) RETURNING ...`, [...]))[0];
  if (!artist) throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);

  const concert = (await query<ConcertRow>(`INSERT INTO concerts (artist_id, stage, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING ...`, [artist.id, stage, start_time, end_time]))[0];
  if (!concert) throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);

  await query("COMMIT");
  return res.status(201).json({ artist: { ...artist, stage: concert.stage, start_time: concert.start_time, end_time: concert.end_time } });
} catch (error) {
  await query("ROLLBACK");
  await deleteImage(ARTISTS_UPLOADS_DIR, url_media);
  if (error instanceof Error && error.message === "featured_limit_reached") {
    throw new AppError(ERRORS.ARTIST_FEATURED_LIMIT, 409);
  }
  throw error;
}
```

L'image est écrite **avant** la transaction — si l'écriture disque échoue, aucune ligne SQL n'est insérée. En cas d'erreur SQL, le `ROLLBACK` annule les deux insertions et `deleteImage` supprime le fichier déjà écrit, laissant le système dans un état cohérent.

La limite des artistes mis en avant (`is_featured`) est contrôlée par un trigger PostgreSQL qui lève une erreur `featured_limit_reached` si deux artistes sont déjà en avant — le `catch` intercepte ce message et renvoie une `AppError` 409.

### 10.12. `update_artist.controller.ts`

Modifie un artiste existant et son concert. La gestion de l'image diffère de la création : l'ancienne image n'est supprimée qu'**après** le `COMMIT`.

```ts
// 1. Vérifie que l'artiste existe et récupère l'url_media actuelle
const existingArtist = (
  await query<ArtistMediaRow>(
    "SELECT id, url_media FROM artists WHERE id = $1 LIMIT 1",
    [artistId],
  )
)[0];
if (!existingArtist) throw new AppError(ERRORS.ARTIST_NOT_FOUND, 404);

// 2. Si une nouvelle image est fournie, l'écrit avant la transaction
let url_media = existingArtist.url_media;
if (req.file)
  url_media = await saveImage(
    req.file.buffer,
    ARTISTS_UPLOADS_DIR,
    "/uploads/artists",
  );

// 3. Transaction : UPDATE artiste + UPDATE concert
await query("BEGIN");
try {
  // UPDATE artists ... UPDATE concerts ...
  await query("COMMIT");

  // 4. Supprime l'ancienne image uniquement après le COMMIT
  if (req.file)
    await deleteImage(ARTISTS_UPLOADS_DIR, existingArtist.url_media);

  return res.status(200).json({ artist: { ...artist, ...concert } });
} catch (error) {
  await query("ROLLBACK");
  // Supprime la nouvelle image si elle a été écrite avant l'échec SQL
  if (req.file) await deleteImage(ARTISTS_UPLOADS_DIR, url_media);
  throw error;
}
```

L'ordre est important : `deleteImage` de l'ancienne image est appelé **après** le `COMMIT`. Si le `UPDATE` SQL échoue, le `ROLLBACK` remet la base dans l'état précédent et la nouvelle image (si écrite) est supprimée — l'ancienne est conservée intacte. L'artiste ne se retrouve jamais sans image.

### 10.13. `delete_artist.controller.ts`

Supprime un artiste, son concert associé et son fichier image.

```ts
const deletedArtists = await query<ArtistMediaRow>(
  "DELETE FROM artists WHERE id = $1 RETURNING id, url_media",
  [req.params.id],
);

if (!deletedArtists[0]) throw new AppError(ERRORS.ARTIST_NOT_FOUND, 404);

await deleteImage(ARTISTS_UPLOADS_DIR, deletedArtists[0].url_media);

return res.status(200).json({ message: "Artiste supprime" });
```

Le `RETURNING id, url_media` récupère les données de la ligne supprimée en une seule requête — pas besoin de faire un `SELECT` avant le `DELETE`. Le concert associé est supprimé automatiquement par la contrainte `ON DELETE CASCADE` définie en base. Le fichier image est supprimé **après** le `DELETE` SQL — si la suppression en base échoue, l'image est conservée.

### 10.14. `create_news.controller.ts`

Crée une news avec la même logique image/transaction que `create_artist` — image écrite avant la transaction, supprimée en cas d'échec SQL.

```ts
if (!req.file) throw new AppError(ERRORS.NEWS_FILE_REQUIRED, 400);

const url_media = await saveImage(
  req.file.buffer,
  NEWS_UPLOADS_DIR,
  "/uploads/news",
);

await query("BEGIN");
try {
  const news = (
    await query<NewsItem>(
      `WITH inserted AS (
       INSERT INTO news (title, content, is_published, url_media, description_media, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *
     )
     SELECT i.id, i.title, i.content, i.is_published, i.created_at,
            i.url_media, i.description_media,
            u.display_name AS author_name
     FROM inserted i
     LEFT JOIN users u ON u.id = i.user_id`,
      [
        title,
        content || null,
        isPublished,
        url_media,
        description_media,
        res.locals.userId,
      ],
    )
  )[0];
  if (!news) throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);

  await query("COMMIT");
  return res.status(201).json({ news });
} catch (error) {
  await query("ROLLBACK");
  await deleteImage(NEWS_UPLOADS_DIR, url_media);
  throw error;
}
```

La requête utilise un CTE (`WITH inserted AS`) pour insérer la news et récupérer immédiatement le `display_name` de l'auteur via `LEFT JOIN users` — en une seule requête SQL plutôt que deux. `res.locals.userId` est injecté comme `user_id` — c'est l'utilisateur connecté qui est enregistré comme auteur.

### 10.15. `update_news.controller.ts`

Modifie une news existante. La logique image est identique à `update_artist` — nouvelle image écrite avant la transaction, ancienne supprimée après le `COMMIT`.

La différence notable avec `update_artist` : le `UPDATE` ne retourne pas `author_name` car ce champ vient de la table `users`. Un second `SELECT` est donc nécessaire après le `UPDATE` pour récupérer la news complète avec le nom de l'auteur :

```ts
// UPDATE news ... RETURNING *
const updatedNews = (await query<NewsItem>(`UPDATE news SET ... WHERE id = $1 RETURNING *`, [...]))[0];

// SELECT avec JOIN users pour récupérer author_name
const news = (await query<NewsItem>(
  `SELECT a.*, u.display_name AS author_name
   FROM news a
   LEFT JOIN users u ON u.id = a.user_id
   WHERE a.id = $1`,
  [newsId],
))[0];

await query("COMMIT");
if (req.file) await deleteImage(NEWS_UPLOADS_DIR, existingNews.url_media);
```

> Ce double aller-retour pourrait être remplacé par un CTE `WITH updated AS (UPDATE ... RETURNING *) SELECT ... JOIN users` — comme dans `create_news`. C'est une simplification possible.

### 10.16. `delete_news.controller.ts`

Structure identique à `delete_artist` — `DELETE ... RETURNING` en une requête, suppression du fichier image après.

```ts
const deletedNews = await query<NewsMediaRow>(
  "DELETE FROM news WHERE id = $1 RETURNING id, url_media",
  [req.params.id],
);

if (!deletedNews[0]) throw new AppError(ERRORS.NEWS_NOT_FOUND, 404);

await deleteImage(NEWS_UPLOADS_DIR, deletedNews[0].url_media);

return res.status(200).json({ message: "News supprimee" });
```

### 10.17. `list_users.controller.ts`

Retourne la liste de tous les utilisateurs triés alphabétiquement par nom d'affichage. Seuls les champs utiles au frontend sont sélectionnés — `password_hash` n'est jamais exposé.

```ts
const users = await query<UserItem>(
  `SELECT id, email, display_name, role, created_at, password_changed_at
   FROM users
   ORDER BY display_name ASC`,
);

return res.status(200).json({ users });
```

### 10.18. `create_user.controller.ts`

Crée un compte utilisateur avec un mot de passe temporaire généré automatiquement et envoyé par email.

```ts
// 1. Construit le display_name depuis first_name + last_name
const displayName = `${first_name} ${last_name}`.trim();

// 2. Vérifie l'unicité de l'email et du nom d'affichage
await checkEmailAvailable(email);
await checkDisplayNameAvailable(displayName);

// 3. Génère et hash le mot de passe temporaire
const temporaryPassword = generateTemporaryPassword();
const passwordHash = await hashPassword(temporaryPassword);

// 4. Insère l'utilisateur en base
const createdUser = (
  await query<UserItem>(
    `INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4)
   RETURNING id, email, display_name, role, created_at, password_changed_at`,
    [email, passwordHash, displayName, role],
  )
)[0];
if (!createdUser) throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);

// 5. Envoie les identifiants provisoires par email
await sendWelcomeEmail(email, displayName, temporaryPassword);
```

`password_changed_at` est `null` à la création — ce champ non renseigné déclenchera `mustChangePassword: true` à la première connexion, forçant l'utilisateur à changer son mot de passe provisoire.

### 10.19. `update_user.controller.ts`

Modifie les informations d'un utilisateur existant — email, nom d'affichage et rôle.

```ts
const displayName = `${first_name} ${last_name}`.trim();

await checkUserExists(userId);
await checkEmailAvailable(email, userId);
await checkDisplayNameAvailable(displayName, userId);

const updatedUser = (
  await query<UserItem>(
    `UPDATE users SET email = $1, display_name = $2, role = $3 WHERE id = $4
   RETURNING id, email, display_name, role, created_at, password_changed_at`,
    [email, displayName, role, userId],
  )
)[0];
if (!updatedUser) throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
```

`checkEmailAvailable` et `checkDisplayNameAvailable` reçoivent `userId` en second argument pour exclure l'utilisateur courant de la vérification d'unicité — sans ça, un utilisateur qui garde son propre email déclencherait un faux conflit 409.

### 10.20. `delete_user.controller.ts`

Supprime définitivement un utilisateur par son UUID.

```ts
const deletedUsers = await query<IdRow>(
  "DELETE FROM users WHERE id = $1 RETURNING id",
  [req.params.id],
);
if (!deletedUsers[0]) throw new AppError(ERRORS.USER_NOT_FOUND, 404);

return res.status(200).json({ message: "Utilisateur supprime" });
```

Pas de fichier image à supprimer ici. Le `RETURNING id` sert uniquement à détecter si la suppression a concerné une ligne — si `deletedUsers[0]` est absent, l'UUID ne correspondait à aucun utilisateur.

### 10.21. `submit_contact.controller.ts`

Le controller le plus simple du projet — les champs sont déjà validés par `validateBody(contactSchema)` en amont, il ne reste qu'à déléguer l'envoi au service mailer.

```ts
const { email, name, subject, message } = req.body;
await sendContactEmail(email, name, subject, message);
return res.status(200).json({ message: "Message envoye" });
```

Aucune écriture en base — le formulaire de contact transite uniquement par email.

---

## 11. Routes — `src/routes/`

Chaque fichier de routes déclare les endpoints d'un domaine, compose la chaîne de middlewares et délègue au controller. Les routes ne contiennent aucune logique métier.

### 11.1. `home.routes.ts`

```ts
router.get("/home", asyncHandler(getHome));
```

| Méthode | Endpoint       | Middlewares | Controller |
| ------- | -------------- | ----------- | ---------- |
| `GET`   | `/public/home` | —           | `getHome`  |

### 11.2. `artists.routes.ts`

```ts
router.get("/artists", asyncHandler(listArtists));
router.get("/artists/:id", asyncHandler(getArtist));
```

| Méthode | Endpoint              | Middlewares | Controller    |
| ------- | --------------------- | ----------- | ------------- |
| `GET`   | `/public/artists`     | —           | `listArtists` |
| `GET`   | `/public/artists/:id` | —           | `getArtist`   |

### 11.3. `news.routes.ts`

```ts
router.get("/news", asyncHandler(optionalAuth), asyncHandler(getNewsList));
router.get("/news/:id", asyncHandler(optionalAuth), asyncHandler(getNews));
```

| Méthode | Endpoint           | Middlewares    | Controller    |
| ------- | ------------------ | -------------- | ------------- |
| `GET`   | `/public/news`     | `optionalAuth` | `getNewsList` |
| `GET`   | `/public/news/:id` | `optionalAuth` | `getNews`     |

### 11.4. `admin.auth.routes.ts`

```ts
router.post(
  "/auth/login",
  rateLimitLogin,
  validateBody(loginSchema),
  asyncHandler(login),
);
router.post("/auth/logout", asyncHandler(auth), asyncHandler(logout));
router.get(
  "/auth/me",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  asyncHandler(userInfo),
);
router.post(
  "/auth/forgot-password",
  rateLimitLogin,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
);
router.patch(
  "/auth/password",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  validateBody(changePasswordSchema),
  asyncHandler(hashPassword("newPassword")),
  asyncHandler(changePassword),
);
```

| Méthode | Endpoint                      | Middlewares                                             | Controller       |
| ------- | ----------------------------- | ------------------------------------------------------- | ---------------- |
| `POST`  | `/admin/auth/login`           | `rateLimitLogin`, `validateBody`                        | `login`          |
| `POST`  | `/admin/auth/logout`          | `auth`                                                  | `logout`         |
| `GET`   | `/admin/auth/me`              | `auth`, `sessionIsOpen`                                 | `userInfo`       |
| `POST`  | `/admin/auth/forgot-password` | `rateLimitLogin`, `validateBody`                        | `forgotPassword` |
| `PATCH` | `/admin/auth/password`        | `auth`, `sessionIsOpen`, `validateBody`, `hashPassword` | `changePassword` |

`/auth/me` est la seule route auth qui passe par `sessionIsOpen` — elle renouvelle le token à chaque chargement du layout admin. `/auth/logout` n'en a pas besoin : il révoque la session lui-même.

### 11.5. `admin.artists.routes.ts`

```ts
router.post(
  "/artists",
  ...adminAuth("admin", "artists"),
  upload.single("image"),
  validateBody(createArtistSchema),
  asyncHandler(createArtist),
);
router.patch(
  "/artists/:id",
  ...adminAuth("admin", "artists"),
  validateUuidParam(),
  upload.single("image"),
  validateBody(createArtistSchema),
  asyncHandler(updateArtist),
);
router.delete(
  "/artists/:id",
  ...adminAuth("admin", "artists"),
  validateUuidParam(),
  asyncHandler(deleteArtist),
);
```

| Méthode  | Endpoint             | Middlewares                                                                   | Controller     |
| -------- | -------------------- | ----------------------------------------------------------------------------- | -------------- |
| `POST`   | `/admin/artists`     | `adminAuth("admin","artists")`, `upload`, `validateBody`                      | `createArtist` |
| `PATCH`  | `/admin/artists/:id` | `adminAuth("admin","artists")`, `validateUuidParam`, `upload`, `validateBody` | `updateArtist` |
| `DELETE` | `/admin/artists/:id` | `adminAuth("admin","artists")`, `validateUuidParam`                           | `deleteArtist` |

### 11.6. `admin.news.routes.ts`

```ts
router.post(
  "/news",
  ...adminAuth("admin", "news"),
  upload.single("image"),
  validateBody(createNewsSchema),
  asyncHandler(createNews),
);
router.patch(
  "/news/:id",
  ...adminAuth("admin", "news"),
  validateUuidParam(),
  upload.single("image"),
  validateBody(createNewsSchema),
  asyncHandler(updateNews),
);
router.delete(
  "/news/:id",
  ...adminAuth("admin", "news"),
  validateUuidParam(),
  asyncHandler(deleteNews),
);
```

| Méthode  | Endpoint          | Middlewares                                                                | Controller   |
| -------- | ----------------- | -------------------------------------------------------------------------- | ------------ |
| `POST`   | `/admin/news`     | `adminAuth("admin","news")`, `upload`, `validateBody`                      | `createNews` |
| `PATCH`  | `/admin/news/:id` | `adminAuth("admin","news")`, `validateUuidParam`, `upload`, `validateBody` | `updateNews` |
| `DELETE` | `/admin/news/:id` | `adminAuth("admin","news")`, `validateUuidParam`                           | `deleteNews` |

### 11.7. `admin.users.routes.ts`

```ts
router.get("/users", ...adminAuth("admin"), asyncHandler(listUsers));
router.post(
  "/users",
  ...adminAuth("admin"),
  validateBody(createUserSchema),
  asyncHandler(createUser),
);
router.patch(
  "/users/:id",
  ...adminAuth("admin"),
  validateUuidParam(),
  validateBody(createUserSchema),
  asyncHandler(updateUser),
);
router.delete(
  "/users/:id",
  ...adminAuth("admin"),
  validateUuidParam(),
  asyncHandler(deleteUser),
);
```

| Méthode  | Endpoint           | Middlewares                                               | Controller   |
| -------- | ------------------ | --------------------------------------------------------- | ------------ |
| `GET`    | `/admin/users`     | `adminAuth("admin")`                                      | `listUsers`  |
| `POST`   | `/admin/users`     | `adminAuth("admin")`, `validateBody`                      | `createUser` |
| `PATCH`  | `/admin/users/:id` | `adminAuth("admin")`, `validateUuidParam`, `validateBody` | `updateUser` |
| `DELETE` | `/admin/users/:id` | `adminAuth("admin")`, `validateUuidParam`                 | `deleteUser` |

Seul le rôle `admin` peut gérer les utilisateurs — contrairement aux artistes et news accessibles aussi au rôle dédié.

### 11.8. `contact.routes.ts`

```ts
router.post(
  "/submit",
  validateBody(contactSchema),
  asyncHandler(submitContact),
);
```

| Méthode | Endpoint          | Middlewares    | Controller      |
| ------- | ----------------- | -------------- | --------------- |
| `POST`  | `/contact/submit` | `validateBody` | `submitContact` |

Route publique — aucune authentification requise. La validation Zod garantit que le message est complet avant l'envoi email.

---

## 12. Authentification et sessions

### 12.1. Stratégie JWT + sessions en base

L'authentification combine un JWT et une session persistée en base de données. Les deux sont nécessaires : le JWT seul ne peut pas être révoqué avant son expiration, et la session seule nécessiterait un aller-retour en base à chaque requête sans bénéfice du stateless.

Le JWT embarque `userId` et `sessionId` dans son payload. À chaque requête protégée :

1. `auth` vérifie la signature du JWT et extrait `userId` et `sessionId`
2. `sessionIsOpen` vérifie en base que la session existe, n'est pas révoquée et n'est pas expirée

Cette combinaison permet de révoquer une session côté serveur (logout, bannissement) sans attendre l'expiration naturelle du JWT.

### 12.2. Cycle de vie d'une session

```
POST /admin/auth/login
  → INSERT INTO sessions (user_id, expires_at)  — session créée
  → JWT généré avec { userId, sessionId }
  → cookie posé

Chaque requête protégée
  → sessionIsOpen vérifie sessions WHERE id = sessionId AND user_id = userId
  → nouveau JWT généré, cookie renouvelé

POST /admin/auth/logout
  → UPDATE sessions SET revoked_at = now()  — session révoquée
  → toute requête ultérieure avec ce sessionId → 401
```

La session (`SESSION_EXPIRES_IN`, 12h) définit la durée de vie maximale absolue — au-delà, `sessionIsOpen` refuse toute requête même si l'utilisateur est actif. Le JWT (`JWT_ACCESS_EXPIRES_IN`, 1h) est renouvelé à chaque requête protégée réussie — il n'expire que si l'utilisateur reste inactif plus d'une heure sans faire aucune requête admin.

### 12.3. Cookies httpOnly — configuration et sécurité

Le JWT est transmis dans un cookie `httpOnly` — il n'est pas accessible via `document.cookie` en JavaScript, ce qui le protège des attaques XSS.

La configuration du cookie est sérialisée par `serializeCookie` dans `utils.ts` à partir de trois variables d'environnement :

| Variable | Dev | Prod |
|---|---|---|
| `COOKIE_ACCESS_TOKEN_SECURE` | `false` | `true` — cookie uniquement sur HTTPS |
| `COOKIE_ACCESS_TOKEN_SAME_SITE` | `lax` | `strict` ou `lax` selon le déploiement |
| `COOKIE_ACCESS_TOKEN_NAME` | `vindhellfest_access_token` | identique |

`Secure: true` en production garantit que le cookie n'est jamais transmis en HTTP clair. `SameSite: lax` protège contre les attaques CSRF pour la majorité des cas d'usage.

### 12.4. Renouvellement du JWT à chaque requête

`sessionIsOpen` génère un nouveau JWT et le pose dans un `Set-Cookie` à chaque requête authentifiée réussie. Ce mécanisme de sliding session maintient la connexion active tant que l'utilisateur navigue — le JWT expire uniquement si aucune requête protégée n'est faite pendant toute la durée de `JWT_ACCESS_EXPIRES_IN`.

Ce renouvellement n'a lieu que sur les routes qui passent par `sessionIsOpen` — les routes publiques avec `optionalAuth` ne renouvellent pas le token.

---

## 13. Tests

### 13.1. Organisation des tests

Les tests sont répartis en deux catégories dans `tests/` :

```
tests/
├── setup.ts                          — configuration globale Vitest
├── helpers/
│   ├── testServer.ts                 — instance Express pour Supertest
│   ├── createAuthSession.ts          — helper : crée un user + session + cookie JWT
│   └── fixtures.ts                   — helpers : insertUser, insertArtist, insertNews
├── integration/
│   ├── public/
│   │   ├── public.test.ts            — GET /public/home, /artists, /news
│   │   └── contact.test.ts           — POST /contact/submit
│   └── admin/
│       ├── auth.test.ts              — login, logout, me, change-password, forgot-password
│       ├── artists.test.ts           — CRUD artistes
│       ├── news.test.ts              — CRUD news
│       └── users.test.ts             — CRUD utilisateurs
└── unit/
    ├── auth.middleware.test.ts
    ├── requireRole.middleware.test.ts
    ├── validateBody.middleware.test.ts
    ├── validateUuidParam.middleware.test.ts
    ├── imageUpload.service.test.ts
    ├── mailer.service.test.ts
    └── user.service.test.ts
```

### 13.2. Lancer les tests en local

Les tests d'intégration ont besoin d'une vraie base PostgreSQL nommée `vindhellfest_test`, distincte de la base de développement `vindhellfest`. Elle n'est pas créée automatiquement — contrairement au schéma, qui est rejoué par `tests/setup.ts` à chaque lancement (voir 13.3).

**1. Démarrer PostgreSQL**

```bash
docker compose up -d db
```

**2. Créer la base de test**

```bash
docker exec -it vindhellfest-db psql -U postgres -c "CREATE DATABASE vindhellfest_test"
```

Cette étape n'est à faire qu'une seule fois — la base persiste dans le volume `pgdata` (voir [Volume persistant — `pgdata`](../../README.md#volume-persistant--pgdata) à la racine du projet) tant qu'il n'est pas supprimé via `docker compose down -v`.

**3. Lancer les tests**

```bash
npm test
```

`tests/setup.ts` se connecte directement à `vindhellfest_test` (voir 4.3), rejoue les migrations SQL et nettoie les données entre chaque test — aucune autre préparation n'est nécessaire.

> C'est exactement la séquence reproduite par le job `backend` de la CI (voir [Pipeline CI/CD](../../README.md#pipeline-cicd) à la racine du projet), à l'étape "Create test database".

### 13.3. Tests d'intégration — routes HTTP avec Supertest

Les tests d'intégration envoient de vraies requêtes HTTP contre l'instance Express retournée par `createApp()`, sur une vraie base PostgreSQL `vindhellfest_test`.

`testServer.ts` expose l'instance sans démarrer de serveur réseau — Supertest monte directement l'application :

```ts
export const app = createApp();
// Supertest s'occupe d'ouvrir et fermer le port
```

`setup.ts` prépare la base avant les tests et nettoie après chaque test :

```ts
beforeAll(async () => {
  // rejoue les migrations SQL sur vindhellfest_test
  for (const file of MIGRATION_FILES) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await testPool.query(sql);
  }
});

afterEach(async () => {
  // efface toutes les données entre chaque test
  await testPool.query("TRUNCATE sessions, news, concerts, artists, users RESTART IDENTITY CASCADE;");
});
```

`setup.ts` mocke aussi les dépendances externes pour éviter les effets de bord :

| Mock | Raison |
|---|---|
| `sharp` | Ne pas traiter de vraies images |
| `fs/promises` (`mkdir`, `unlink`, `writeFile`) | Ne pas écrire sur le disque |
| `nodemailer` | Ne pas envoyer de vrais emails |
| `express-rate-limit` | Ne pas bloquer les tests répétés |

### 13.4. Tests unitaires — services et middlewares

Les tests unitaires isolent une fonction ou un middleware sans passer par Express. La base de données est mockée via `vi.mock` sur le module `../../src/db`.

Chaque fichier de test unitaire couvre un fichier source :

| Fichier de test | Ce qui est testé |
|---|---|
| `auth.middleware.test.ts` | `auth` et `optionalAuth` — cookie absent, token invalide, user inexistant, session révoquée |
| `requireRole.middleware.test.ts` | `requireRole` — rôle autorisé, rôle refusé, locals absent |
| `validateBody.middleware.test.ts` | `validateBody` — body valide, body invalide, champs manquants |
| `validateUuidParam.middleware.test.ts` | `validateUuidParam` — UUID valide, UUID malformé, paramètre absent |
| `imageUpload.service.test.ts` | `saveImage`, `deleteImage` — appels sharp et fs mockés |
| `mailer.service.test.ts` | `sendWelcomeEmail`, `sendPasswordResetEmail`, `sendContactEmail` — nodemailer mocké |
| `user.service.test.ts` | `checkEmailAvailable`, `checkDisplayNameAvailable`, `checkUserExists`, `isNewsPrivileged` |

### 13.5. Helpers et fixtures

**`createAuthSession`**

Insère un utilisateur et une session valide en base, génère un JWT signé et retourne un cookie prêt à passer dans Supertest :

```ts
const { cookie, userId } = await createAuthSession("admin");
await request(app).get("/admin/users").set("Cookie", cookie).expect(200);
```

**`insertUser` / `insertArtist` / `insertNews`**

Fonctions de fixtures pour insérer des données de test directement en base sans passer par l'API. Utilisées pour préparer l'état initial avant de tester un endpoint de lecture, modification ou suppression.

```ts
const artistId = await insertArtist();
await request(app).delete(`/admin/artists/${artistId}`).set("Cookie", cookie).expect(200);
```

**`MINIMAL_PNG`**

Buffer d'une image PNG 1x1px en base64, utilisé comme fichier de test pour les routes multipart qui attendent `req.file` :

```ts
await request(app)
  .post("/admin/artists")
  .set("Cookie", cookie)
  .attach("image", MINIMAL_PNG, "test.png")
  .field("name", "Artist Test")
  ...
```
