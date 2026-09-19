# Backend — Vindhellfest

## 1. Introduction

### 1.1. Rôle du backend dans l'architecture globale

Le backend est l'une des trois couches de l'architecture du projet Vindhellfest, aux côtés du frontend Next.js et de la base de données PostgreSQL. Il est le seul service à accéder directement à la base de données : ni le frontend, ni le navigateur ne peuvent interroger PostgreSQL directement. Toute donnée transite obligatoirement par l'API REST qu'il expose.

Dans l'architecture Docker, le backend tourne dans un conteneur dédié (`vindhellfest-backend`) accessible sur le port `4000`. Il occupe une position centrale dans le réseau interne Docker `app-net` :

| Appelant                        | Adresse utilisée        | Raison                                                  |
| -------------------------------- | ------------------------ | --------------------------------------------------------- |
| Frontend (SSR, layouts serveur) | `http://backend:4000`   | Communication interne au réseau Docker `app-net`        |
| Frontend (navigateur client)    | `http://localhost:4000` | Le navigateur ne connaît pas le réseau Docker           |
| Base de données PostgreSQL      | `postgresql://db:5432`  | Hostname `db` résolu par Docker sur le réseau `app-net` |

Le backend remplit trois responsabilités principales :

1. **API REST** — expose les endpoints consommés par le frontend, organisés en deux préfixes : `/public` pour les données accessibles sans authentification, `/admin` pour les opérations protégées.
2. **Authentification et sessions** — déléguées entièrement à Better Auth (`src/lib/auth.ts`), montée sur `/api/auth/*`. Connexion, déconnexion, session, réinitialisation de mot de passe et CRUD utilisateurs (plugin admin) sont gérés par la librairie ; le backend ne fait que lire la session courante (`requireAuth`) pour protéger ses propres routes.
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

```
src/index.ts       →  charge le .env, valide les variables d'env, lance app.listen()
src/app.ts         →  createApp() — CORS, montage de Better Auth, routes, handlers d'erreur
src/env.ts         →  validateEnv() — arrête le processus si une variable est manquante
```

Le démarrage est ainsi sécurisé : si une variable d'environnement obligatoire est absente, le processus s'arrête immédiatement avec un message explicite — avant même que la première requête ne soit reçue.

---

## 2. Stack technique

### 2.1. Tableau des technologies et versions

| Technologie | Version     | Rôle                                                             |
| ------------ | ----------- | ------------------------------------------------------------------ |
| Node.js      | 20 (Alpine) | Environnement d'exécution du conteneur Docker                    |
| Express.js   | ^5.1.0      | Framework HTTP — routing, middlewares, gestion des erreurs async |
| TypeScript   | ^5.9.3      | Typage statique strict sur l'ensemble du code                    |
| PostgreSQL   | 16          | Base de données relationnelle                                    |
| Better Auth  | ^1.7.2      | Authentification, sessions et CRUD utilisateurs (plugin admin)   |
| pg           | ^8.16.3     | Driver PostgreSQL natif — pool de connexions, requêtes typées    |
| Zod          | ^4.2.1      | Validation des corps de requêtes — schémas déclaratifs           |
| multer       | ^2.1.1      | Réception des fichiers multipart (images uploadées)              |
| sharp        | ^0.35.3     | Traitement d'images — conversion WebP, redimensionnement         |
| nodemailer   | ^9.0.3      | Envoi d'emails (reset de mot de passe, invitation, contact)      |
| dotenv       | ^17.2.3     | Chargement des variables d'environnement depuis `.env`           |
| tsx          | ^4.20.6     | Exécution TypeScript à la volée en développement (watch mode)    |
| Vitest       | ^4.0.15     | Framework de tests unitaires et d'intégration                    |
| Supertest    | ^7.1.4      | Requêtes HTTP sur l'instance Express dans les tests d'intégration |
| ESLint       | ^9.39.1     | Analyse statique du code — règles TypeScript                     |
| Prettier     | ^3.6.2      | Formatage automatique du code                                    |

---

### 2.2. Dépendances de production

Ce sont les packages embarqués dans l'image finale et nécessaires au fonctionnement de l'API en production.

**Express.js** (`express ^5.1.0`)

Le framework HTTP. Express 5 propage automatiquement les erreurs des handlers async vers le middleware d'erreur global — ce qui simplifie l'écriture des controllers et est exploité par `asyncHandler`.

**Better Auth** (`better-auth ^1.7.2`)

Gère l'intégralité de l'authentification : hachage des mots de passe (scrypt), création et vérification des sessions, cookies signés, réinitialisation de mot de passe, et CRUD utilisateurs via son plugin admin. Configurée dans `src/lib/auth.ts` et montée sur `/api/auth/*` (`toNodeHandler(auth)` dans `app.ts`). Le backend n'implémente aucune logique d'authentification lui-même — voir la section [13. Authentification et sessions](#13-authentification-et-sessions).

**pg** (`^8.16.3`)

Driver officiel PostgreSQL pour Node.js. Il expose un pool de connexions configuré dans `src/db.ts` et une fonction générique `query<T>()` utilisée par tous les controllers. Le pool maintient plusieurs connexions ouvertes et les distribue aux requêtes concurrentes sans en ouvrir une nouvelle à chaque appel.

**Zod** (`^4.2.1`)

Bibliothèque de validation par schémas. Chaque endpoint qui reçoit un corps JSON est protégé par un schéma Zod défini dans `src/schemas/schema.ts` et appliqué via le middleware `validateBody`. Zod retourne des erreurs de validation structurées qui sont ensuite formatées et renvoyées au client avec un statut `400`.

**multer** (`^2.1.1`)

Middleware de réception des fichiers `multipart/form-data`. Configuré en mode `memoryStorage` : les fichiers sont conservés en mémoire (`req.file.buffer`) et transmis directement à Sharp pour traitement, sans écriture intermédiaire sur le disque. La taille maximale est limitée à 5 Mo et seuls les types MIME image sont acceptés.

**sharp** (`^0.35.3`)

Bibliothèque de traitement d'images haute performance basée sur libvips. Dans le projet, sharp reçoit le buffer de multer et effectue deux opérations : redimensionner l'image à 1600 px de large maximum (en conservant le ratio) puis la convertir en WebP à une qualité de 80. Le fichier résultant est écrit sur le disque avec un nom UUID unique.

**nodemailer** (`^9.0.3`)

Client SMTP pour l'envoi d'emails. Utilisé dans trois cas : envoi du lien de réinitialisation de mot de passe (`sendPasswordResetEmail`, déclenché par Better Auth via `sendResetPassword`), envoi du lien d'invitation à un utilisateur créé par un admin (`sendInviteEmail`, même mécanisme avec un `context=invite` dans l'URL), et transfert du formulaire de contact à l'adresse de l'organisation (`sendContactEmail`). Le transporteur SMTP est configuré une seule fois dans `src/services/mailer.service.ts`.

**dotenv** (`^17.2.3`)

Charge les variables d'environnement depuis le fichier `.env` avant toute autre importation dans `src/index.ts`. Le chargement est la toute première instruction du point d'entrée — avant même l'import de `validateEnv` — pour garantir que les variables sont disponibles au moment de la validation.

---

### 2.3. Dépendances de développement

Ces packages ne sont présents que pendant le développement et les tests. Ils ne sont pas inclus dans l'image de production (`npm install --only=production`).

**TypeScript** (`typescript ^5.9.3`)

Le compilateur TypeScript. Configuré en mode `strict` dans `tsconfig.json` — aucun `any` implicite, nullabilité systématiquement vérifiée. En production, `tsc` compile vers `dist/` et `node dist/index.js` lance le serveur.

**tsx** (`^4.20.6`)

Exécute `src/index.ts` directement en TypeScript en développement, avec rechargement automatique à chaque modification de fichier (`tsx watch`). Remplace un couple bundler + watcher séparé : aucune étape de compilation intermédiaire n'est nécessaire pour lancer le serveur en local.

**Types de bibliothèques** (`@types/*`)

Les paquets de définitions de types pour les bibliothèques JavaScript qui n'en embarquent pas nativement : `@types/express`, `@types/multer`, `@types/nodemailer`, `@types/pg`, `@types/node`, `@types/supertest`. Sans eux, TypeScript ne connaît pas les signatures des fonctions de ces bibliothèques. Better Auth, comme la plupart des libs récentes, embarque directement ses propres types — pas de paquet `@types/better-auth` séparé.

**Vitest** (`^4.0.15`)

Framework de tests. Utilisé pour les tests unitaires (services, middlewares) et les tests d'intégration (routes HTTP via Supertest). La configuration se trouve dans `vitest.config.ts` — détail complet en section [14. Tests](#14-tests).

**Supertest** (`^7.1.4`)

Bibliothèque de tests HTTP qui monte l'instance Express retournée par `createApp()` directement — sans démarrer de vrai serveur sur un port. Les tests d'intégration envoient de vraies requêtes HTTP à l'application et vérifient les réponses (status, body, cookies) sans passer par le réseau.

**ESLint** (`eslint ^9.39.1`) + plugins TypeScript et Prettier

Analyse statique du code. `@typescript-eslint/eslint-plugin` et `@typescript-eslint/parser` activent les règles spécifiques TypeScript. `@eslint/eslintrc` et `@eslint/js` fournissent la compatibilité avec le style de configuration `extends: [...]` utilisé dans `eslint.config.cjs` — détail en section [5.2](#52-eslintconfigcjs). `eslint-plugin-prettier` et `eslint-config-prettier` intègrent Prettier dans ESLint pour unifier le formatage et les règles de style en une seule passe.

**Prettier** (`^3.6.2`)

Formateur de code automatique. Lancé via `npm run format` qui réécrit tous les fichiers selon les règles définies dans `.prettierrc`.

**knip** (`^6.37.0`)

Détecte les fichiers, exports et dépendances déclarées dans `package.json` mais jamais réellement utilisés dans le code (`npx knip`). Utile après une suppression de fonctionnalité — les imports orphelins et les dépendances devenues inutiles ne sont pas toujours évidents à repérer à l'œil.

---

## 3. Architecture — carte du projet

### 3.1. Arbre des dossiers annoté

```
apps/backend/
│
├── src/
│   ├── index.ts                          # Point d'entrée — charge .env, valide, lance app.listen()
│   ├── app.ts                            # createApp() — CORS, montage Better Auth, routes, handlers d'erreur
│   ├── db.ts                             # Pool de connexions PostgreSQL + query<T>()
│   ├── env.ts                            # validateEnv() — arrêt immédiat si variable manquante
│   ├── type.ts                           # Types TypeScript partagés (DB rows, res.locals) — voir TYPE.md
│   ├── utils.ts                          # getEnv() — seule fonction utilitaire du projet
│   │
│   ├── lib/
│   │   └── auth.ts                       # Configuration Better Auth (emailAndPassword, plugin admin, role)
│   │
│   ├── routes/                           # Déclaration des routes Express — aucune logique métier
│   │   ├── admin.artists.routes.ts       # POST/PATCH/DELETE /admin/artists
│   │   ├── admin.news.routes.ts          # POST/PATCH/DELETE /admin/news
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
│   │   │   └── news/
│   │   │       ├── create_news.controller.ts
│   │   │       ├── update_news.controller.ts
│   │   │       └── delete_news.controller.ts
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
│   │   ├── requireAuth.ts                # requireAuth + optionalAuth — lit la session Better Auth
│   │   ├── requireRole.ts                # Contrôle le rôle de l'utilisateur connecté
│   │   ├── authChain.ts                  # adminAuth() — compose requireAuth + requireRole
│   │   ├── validateBody.ts               # Validation Zod du corps de requête
│   │   ├── validateUuidParam.ts          # Validation du paramètre :id en UUID
│   │   ├── upload.ts                     # Configuration Multer (memoryStorage, 5 Mo max)
│   │   └── errorHandler.ts               # notFoundHandler + errorHandler global
│   │
│   ├── errors/
│   │   ├── AppError.ts                   # Classe d'erreur métier (message + status HTTP)
│   │   └── errorMessages.ts              # Constantes ERRORS.* — source de vérité des messages
│   │
│   ├── schemas/
│   │   └── schema.ts                     # Schémas Zod : contact, news, artiste
│   │
│   └── services/                         # Logique réutilisable sans dépendance Express
│       ├── imageUpload.service.ts         # saveImage(), deleteImage() — Sharp + disque
│       ├── mailer.service.ts              # Transporteur SMTP + fonctions d'envoi d'email
│       └── user.service.ts               # isNewsPrivileged() — seule fonction du service
│
├── tests/                                # Voir TEST.md pour le détail fichier par fichier
│   ├── setup.ts                          # Mocks globaux, reset DB entre les tests
│   ├── tsconfig.json                     # Etend tsconfig.json, ajoute tests/ a l'inclusion
│   ├── helpers/
│   │   ├── testServer.ts                 # Crée l'instance Express pour les tests (Supertest)
│   │   ├── createAuthSession.ts          # Crée une session Better Auth reelle + cookie signe
│   │   └── fixtures.ts                   # insertUser (via auth.api.createUser), insertArtist, insertNews
│   ├── integration/
│   │   ├── admin/
│   │   │   ├── artists.test.ts
│   │   │   ├── news.test.ts
│   │   │   └── betterAuth.test.ts        # Sign-in, sign-out, session, reset, plugin admin
│   │   └── public/
│   │       ├── public.test.ts
│   │       └── contact.test.ts
│   └── unit/
│       ├── auth.sendResetPassword.test.ts
│       ├── requireRole.middleware.test.ts
│       ├── validateBody.middleware.test.ts
│       ├── validateUuidParam.middleware.test.ts
│       ├── imageUpload.service.test.ts
│       └── mailer.service.test.ts
│
├── uploads/                              # Les images uploadées sont stockées directement sur la machine hôte (pas un volume Docker)
│   ├── artists/
│   └── news/
│
├── Dockerfile
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.cjs
├── .prettierrc
├── .prettierignore
├── API.md                                # Documentation de tous les endpoints de l'API
├── TYPE.md                                # Règles et catalogue des types partagés
├── TEST.md                                # Détail fichier par fichier de la suite de tests
└── package.json
```

> Il n'y a pas de `.dockerignore` dans ce dossier. Le `Dockerfile` copie explicitement `package*.json`, `tsconfig.json` et `src/` plutôt que le contexte entier (pas de `COPY . .`), ce qui limite l'impact concret de son absence — mais le contexte envoyé au démon Docker au moment du build reste tout de même le dossier complet (`node_modules/`, `uploads/`... inclus) tant qu'aucun `.dockerignore` ne le filtre.

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
| --------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `routes/`      | Déclare les URLs, les méthodes HTTP et la chaîne de middlewares de chaque endpoint         | Pas de logique métier — uniquement l'assemblage de la chaîne                  |
| `middlewares/` | Intercepte la requête avant le controller — session (Better Auth), rôle, validation, upload | Aucun ne touche `db.ts` directement — `requireAuth` délègue à Better Auth   |
| `controllers/` | Logique métier — lit `req`, interroge la base, appelle les services, retourne la réponse   | Pas de logique réutilisable extraite ici — elle monte dans `services/`        |
| `services/`    | Fonctions réutilisables sans dépendance Express (`req`, `res`) — image, email, rôle news   | Pas de lecture directe de `req` ou `res`                                      |
| `db.ts`        | Unique point d'accès à PostgreSQL pour **notre** code — pool et fonction `query<T>()`     | Pas de logique métier — exécute uniquement la requête SQL passée en paramètre. Better Auth gère son propre accès à la base (tables `user`, `session`, `account`, `verification`) via son propre adapter, indépendamment de `query<T>()`. |
| `errors/`      | `AppError` + constantes `ERRORS.*` — source de vérité des messages d'erreur                | Transversal — importé par controllers et middlewares                          |
| `schemas/`     | Schémas Zod pour la validation des corps de requête                                        | Pas de logique applicative — uniquement la forme des données attendues        |

**Convention de nommage des controllers**

Chaque controller est un fichier à export nommé unique : `create_artist.controller.ts` exporte `createArtist`.

**La factory `adminAuth()`**

Toutes les routes protégées utilisent `...adminAuth("admin", "artists")` — le spread d'un tableau de middlewares retourné par la factory `authChain.ts`. Ce pattern regroupe deux middlewares (`requireAuth`, `requireRole`) en une seule déclaration lisible dans la route, sans les répéter manuellement à chaque endpoint.

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
        │   Parse le corps JSON de la requête (n'affecte pas cette route multipart,
        │   mais s'applique avant tout routeur — voir 4.2 pour la position vis-à-vis de Better Auth).
        │
        ▼
admin.artists.routes.ts — router.post("/artists", ...)
        │   Assemble et exécute la chaîne dans l'ordre :
        │
        ├── asyncHandler(requireAuth)
        │       Appelle auth.api.getSession() (Better Auth) avec les headers de la requête.
        │       Injecte userId, userRole, sessionId dans res.locals.
        │       Si aucune session valide → AppError 401 (AUTH_MISSING_SESSION).
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
        │   Sinon → res.status(500).json({ error: "Erreur interne du serveur" })
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
dotenv.config(); // 1. charge le .env

import { validateEnv } from "./env.js";
import { createApp } from "./app.js";

validateEnv(); // 2. vérifie que toutes les variables sont présentes
const app = createApp(); // 3. construit l'application Express
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, ...); // 4. démarre le serveur
```

L'ordre des trois premières étapes est intentionnel et non interchangeable :

- `dotenv.config()` doit être la toute première instruction — avant même les imports qui suivent — pour que `process.env` soit peuplé au moment où les autres modules sont chargés.
- `validateEnv()` s'exécute avant `createApp()` : si une variable manque, le processus s'arrête immédiatement avec un message explicite, sans qu'un serveur à moitié configuré ne démarre.
- `createApp()` n'est appelé qu'une fois l'environnement validé — l'application Express est construite avec la garantie que toutes ses dépendances de configuration sont disponibles.

Ce fichier n'est jamais importé dans les tests — ceux-ci appellent `createApp()` directement depuis `app.ts`, sans passer par `app.listen()`.

Le projet est en ESM natif (`"type": "module"` dans `package.json`) : les imports entre fichiers `src/` utilisent l'extension `.js` (`from "./env.js"`) même si le fichier source est un `.ts` — c'est la convention Node.js pour la résolution de modules ESM, TypeScript ne réécrit pas les chemins d'import à la compilation.

### 4.2. `src/app.ts`

Ce fichier exporte la fonction `createApp()` qui construit et retourne l'instance Express configurée. Il est séparé de `index.ts` précisément pour que les tests puissent instancier l'application sans démarrer de serveur.

`createApp()` configure l'application dans un ordre précis :

**1. CORS**

Un middleware manuel lit l'en-tête `Origin` de chaque requête et le compare à `FRONTEND_ORIGIN`. Si l'origine est autorisée, les headers `Access-Control-Allow-*` sont ajoutés à la réponse. Les requêtes `OPTIONS` (preflight) reçoivent une réponse `204` immédiate — sans passer par les routes.

**2. Trust proxy**

```ts
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
```

En production, le backend est derrière un reverse proxy. Sans cette option, Express lit l'IP cliente depuis `req.ip`, qui retourne l'IP du proxy — toujours la même. Avec `trust proxy: 1`, Express lit l'IP réelle du client depuis l'en-tête `X-Forwarded-For`. Cette IP est utilisée par le rate limiting interne de Better Auth (voir [13.3](#133-rate-limiting-interne-de-better-auth)).

**3. Montage de Better Auth — avant `express.json()`**

```ts
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());
```

`toNodeHandler(auth)` transforme la configuration Better Auth en un handler compatible Express et prend en charge toutes les routes `/api/auth/*`. Il est monté **avant** `express.json()` — Better Auth lit lui-même le corps brut de la requête ; si `express.json()` l'avait déjà consommé, Better Auth ne pourrait plus le lire.

**4. Fichiers statiques et routes API**

```ts
app.use("/uploads", express.static(...)); // sert les images uploadées
app.use("/admin", adminArtists);
app.use("/admin", adminNews);
app.use("/contact", contact);
app.use("/public", publicHome);
app.use("/public", publicArtists);
app.use("/public", publicNews);
```

Les images uploadées sont servies statiquement depuis le dossier `uploads/` — le frontend les atteint via `/uploads/artists/<uuid>.webp` sans passer par un controller.

**5. Handlers de fin de chaîne**

```ts
app.use(notFoundHandler); // 404 si aucune route ne correspond
app.use(errorHandler); // gère toutes les AppError et erreurs inattendues
```

Ces deux middlewares sont enregistrés en dernier — `notFoundHandler` intercepte toute requête qui n'a pas trouvé de route, `errorHandler` reçoit toutes les erreurs propagées via `next(error)` ou lancées dans un handler async.

### 4.3. `src/db.ts`

Ce fichier est l'unique point d'accès de **notre** code à la base de données PostgreSQL — Better Auth gère séparément son propre accès aux tables `user`, `session`, `account` et `verification` via son adapter interne. Aucun controller ne crée de connexion directement — tous passent par les deux exports de ce fichier : `pool` et `query`.

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

Un `Pool` maintient un ensemble de connexions PostgreSQL ouvertes en permanence. Quand un controller appelle `query()`, le pool lui attribue une connexion disponible — sans en ouvrir une nouvelle à chaque requête. Quand la requête est terminée, la connexion est remise dans le pool pour la prochaine requête.

Les valeurs de fallback (`|| "localhost"`, `|| "postgres"`…) ne sont là que pour satisfaire TypeScript — `process.env.*` étant typé `string | undefined`, TypeScript exige une valeur par défaut. En pratique elles ne sont jamais atteintes : `validateEnv()` garantit que toutes les variables sont définies avant que le pool soit créé.

`pool` est aussi exporté directement pour être utilisé dans `tests/setup.ts` — le setup de tests crée son propre pool pointant vers `vindhellfest_test` pour isoler les données de test de la base de développement.

**La fonction `query<T>()`**

```ts
export async function query<T extends QueryResultRow = QueryResultRow>(
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
  PORT: z.string().optional(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  FRONTEND_ORIGIN: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  CONTACT_EMAIL: z.string(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path[0]).join(", ");
    throw new Error(`Missing env vars: ${missing}`);
  }
}
```

`.map((i) => i.path[0])` extrait le nom de chaque variable manquante et `.join(", ")` les assemble en un message lisible, par exemple `Missing env vars: DB_PASSWORD, SMTP_HOST`.

> `BETTER_AUTH_SECRET` et `BETTER_AUTH_URL` ne font pas partie de ce schéma — Better Auth les lit lui-même directement depuis `process.env` au moment où `betterAuth({...})` est appelé dans `src/lib/auth.ts`. S'ils sont absents, l'échec se produit à l'initialisation de Better Auth plutôt que via le message clair de `validateEnv()`.

### 4.5. `src/utils.ts`

Une seule fonction utilitaire, sans dépendance à Express :

```ts
export function getEnv(name: string): string {
  const variables = process.env[name];
  if (!variables) throw new Error(`Missing env var: ${name}`);
  return variables;
}
```

`process.env[name]` est typé `string | undefined` par TypeScript ; utiliser cette valeur là où un `string` est attendu (par exemple la config du transporteur SMTP dans `mailer.service.ts`) provoquerait une erreur de compilation. `getEnv()` retourne un `string` garanti et lève une erreur explicite si la variable est absente, plutôt que de recourir à l'assertion non-null (`!`) qui masquerait silencieusement le problème.

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
    "allowSyntheticDefaultImports": true,
    "verbatimModuleSyntax": false,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

| Option                          | Valeur   | Effet                                                                                                          |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `strict`                        | `true`   | Active toutes les vérifications strictes — interdit `any` implicite, `null` non vérifié, etc.                    |
| `target`                        | `ES2020` | Code compilé compatible avec Node.js 20                                                                          |
| `module`                        | `Node16` | Format de modules natif Node.js — aligné sur `"type": "module"` du `package.json`, imports `.js` obligatoires   |
| `moduleResolution`              | `node16` | Résolution de modules alignée sur le comportement ESM de Node.js 16+                                             |
| `esModuleInterop`               | `true`   | Permet d'importer des modules CommonJS avec la syntaxe `import x from "x"`                                       |
| `allowSyntheticDefaultImports`  | `true`   | Autorise `import x from "x"` sur un module qui n'exporte pas de `default` explicite (vérification de type seule) |
| `outDir`                        | `dist`   | Dossier de sortie des fichiers JavaScript compilés par `npm run build`                                           |
| `rootDir`                       | `src`    | Dossier source — seul `src/` est compilé, `tests/` est exclu                                                    |
| `skipLibCheck`                  | `true`   | Ignore les erreurs de types dans `node_modules/` — accélère la compilation                                       |

`"include": ["src"]` exclut explicitement le dossier `tests/` de la compilation de production. Les tests ont leur propre `tests/tsconfig.json` qui étend ce fichier, ajoute `rootDir: ".."` et `tests/` à l'inclusion, et déclare les types `vitest/globals` et `node`.

### 5.2. `eslint.config.cjs`

```js
const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  { ignores: ["dist/**", "node_modules/**"] },
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

Le fichier utilise l'extension `.cjs` plutôt que `.mjs` ou `.js` précisément **parce que** le backend a `"type": "module"` dans son `package.json` : sans le `.cjs` explicite, Node.js traiterait ce fichier comme de l'ESM et les appels `require(...)` échoueraient.

Le style d'écriture (`extends: [...]` avec des chaînes comme `"eslint:recommended"`) est celui du format `.eslintrc` historique, pas le format « flat config » natif d'ESLint 9. `FlatCompat` (package `@eslint/eslintrc`) traduit ces chaînes en config flat à la volée ; pour résoudre `"eslint:recommended"` spécifiquement, elle a besoin qu'on lui fournisse `js.configs.recommended` (package `@eslint/js`) en référence — d'où la dépendance conjointe aux deux packages. Les deux sont déclarés explicitement en devDependency plutôt que de dépendre de leur simple présence transitive via `eslint` (signalé par `knip`).

Trois préréglages sont activés :

- **`eslint:recommended`** — règles JavaScript de base (variables non déclarées, code mort…)
- **`plugin:@typescript-eslint/recommended`** — règles TypeScript strictes (`no-explicit-any`, typage correct des fonctions…)
- **`plugin:prettier/recommended`** — intègre Prettier dans ESLint : les violations de formatage sont signalées comme des erreurs ESLint, ce qui permet de tout corriger en une seule passe avec `npm run lint:fix`

Le dernier bloc configure une exception pour le fichier `eslint.config.cjs` lui-même — il utilise `require` et `module.exports`, des globals CommonJS normalement interdits par les règles TypeScript.

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

**`environment: "node"`** — Contrairement au frontend qui utilise `jsdom` pour simuler un navigateur, le backend tourne dans un environnement Node.js pur. Pas de DOM nécessaire — les tests envoient des requêtes HTTP à l'instance Express via Supertest.

**`globals: true`** — Active les globals de test (`describe`, `it`, `expect`, `vi`…) sans avoir à les importer dans chaque fichier de test.

**`setupFiles`** — Exécute `tests/setup.ts` avant la suite de tests : mock de `sharp`, `fs/promises` et `nodemailer`, chargement des variables d'environnement, réinitialisation du schéma PostgreSQL (`DROP SCHEMA public CASCADE` puis rejeu des migrations SQL — dont le schéma Better Auth généré par sa CLI) et `TRUNCATE` de toutes les tables entre chaque test. Détail complet en section [14. Tests](#14-tests).

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

| Règle         | Valeur  | Signification                                                      |
| -------------- | ------- | ---------------------------------------------------------------------- |
| `semi`        | `true`  | Point-virgule obligatoire en fin d'instruction                     |
| `singleQuote` | `false` | Guillemets doubles pour les chaînes de caractères                  |
| `tabWidth`    | `2`     | Indentation à 2 espaces                                            |
| `endOfLine`   | `auto`  | Fin de ligne adaptée à l'OS (LF sur Linux/macOS, CRLF sur Windows) |

`.prettierignore` exclut du formatage `node_modules/`, `dist/` (fichiers compilés) et `README.md`.

### 5.5. `Dockerfile`

Le Dockerfile du backend est organisé en **trois stages multi-étapes** :

**Stage `builder`** — Compilation TypeScript

Installe toutes les dépendances (y compris `devDependencies` nécessaires à `tsc`), copie le code source et exécute `npm run build`. TypeScript compile `src/` vers `dist/` — seuls les fichiers JavaScript générés sont conservés pour la suite.

**Stage `runner`** — Image de production

Repart d'une image Node.js propre, installe uniquement les dépendances de production (`npm install --only=production`), puis copie depuis `builder` uniquement le dossier `dist/`. L'image finale ne contient ni le code TypeScript source, ni les `devDependencies`. Elle démarre avec `node dist/index.js`.

**Stage `dev`** — Image de développement

N'exécute pas de compilation — le code source TypeScript est monté depuis l'hôte via un volume Docker (`docker-compose.yml`) et exécuté directement par `tsx watch` (`npm run dev`). Toute modification d'un fichier `.ts` déclenche un rechargement automatique du serveur sans reconstruire l'image.

### 5.6. Variables d'environnement

Les variables d'environnement sont définies dans `.env` et `.env.backend` à la racine du projet, injectées au conteneur via `env_file` dans `docker-compose.yml`, et chargées par `dotenv` au démarrage. Les variables listées dans `validateEnv()` (section [4.4](#44-srcenvts)) sont obligatoires — le serveur ne démarre pas si l'une d'elles est absente ; `BETTER_AUTH_SECRET` et `BETTER_AUTH_URL` sont lues directement par Better Auth et ne passent pas par cette validation.

| Variable           | Exemple                     | Rôle                                                                       |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `PORT`             | `4000`                      | Port d'écoute du serveur Express (optionnel — `4000` par défaut)             |
| `DB_HOST`          | `db`                        | Hostname PostgreSQL — `db` dans Docker, `localhost` hors Docker              |
| `DB_PORT`          | `5432`                      | Port PostgreSQL                                                             |
| `DB_USER`          | `postgres`                  | Utilisateur PostgreSQL                                                      |
| `DB_PASSWORD`      | `postgres`                  | Mot de passe PostgreSQL                                                     |
| `DB_NAME`          | `vindhellfest`              | Nom de la base de données                                                  |
| `FRONTEND_ORIGIN`  | `http://localhost:3000`     | Origine autorisée par le CORS et par `trustedOrigins` de Better Auth        |
| `BETTER_AUTH_SECRET` | `une-valeur-longue-et-aleatoire` | Clé de signature des sessions Better Auth — lue directement par la lib, pas via `validateEnv()` |
| `BETTER_AUTH_URL`  | `http://localhost:4000`     | URL de base utilisée par Better Auth pour construire ses liens (reset, invitation) |
| `SMTP_HOST`        | `smtp.gmail.com`            | Serveur SMTP pour l'envoi d'emails                                          |
| `SMTP_PORT`        | `587`                       | Port SMTP                                                                   |
| `SMTP_SECURE`      | `false`                     | `true` si le port SMTP utilise TLS directement (port 465)                  |
| `SMTP_USER`        | `email@gmail.com`           | Identifiant SMTP                                                            |
| `SMTP_PASS`        | `xxxx`                      | Mot de passe SMTP — utiliser un mot de passe d'application Gmail           |
| `CONTACT_EMAIL`    | `email@gmail.com`           | Adresse destinataire des formulaires de contact                            |

> Les fichiers `.env` ne sont pas versionnés — ils sont exclus par `.gitignore`. Ne jamais commiter des secrets en clair dans le dépôt.

---

## 6. Système de types — `src/type.ts`

Tous les types TypeScript partagés entre plusieurs fichiers sont regroupés dans `src/type.ts`. Le catalogue complet (champs, provenance, règles de nommage) est documenté dans **[TYPE.md](./TYPE.md)** — cette section n'en résume que la logique.

### 6.1. Pourquoi centraliser les types

Sans fichier central, chaque controller redéfinirait localement le même type `NewsItem` ou `ArtistItem`. Si la structure d'une réponse API évolue (ajout d'un champ, changement d'un type nullable), il faut retrouver et corriger toutes les définitions dispersées. Avec un fichier unique, une seule modification se propage à l'ensemble des controllers.

`NewsItem` et `ArtistItem` sont reproduits à l'identique dans `apps/frontend/src/type.ts`. Ce contrat explicite évite les désynchronisations silencieuses entre ce que l'API envoie et ce que le frontend consomme.

> Règle de placement (détaillée dans TYPE.md) : un type utilisé dans un seul fichier reste déclaré localement dans ce fichier ; seuls les types réutilisés dans 2+ fichiers remontent dans `src/type.ts`.

### 6.2. Augmentation d'`Express.Locals`

Express expose un objet `res.locals` pour transmettre des données entre middlewares et controllers. L'augmentation de module TypeScript permet de le typer sans casser le contrat Express :

```ts
declare global {
  namespace Express {
    interface Locals {
      userId?: string;
      userRole?: UserRole;
      sessionId?: string;
    }
  }
}
```

`requireAuth` écrit dans `res.locals` après avoir lu la session Better Auth ; les controllers lisent ces valeurs sans aucun cast. Le compte connecté lui-même (email, nom, mot de passe) reste entièrement géré par Better Auth — seul le strict nécessaire au contrôle d'accès (`userId`, `userRole`, `sessionId`) transite par `res.locals`.

### 6.3. Convention de nommage

| Convention | Explication                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `*Row`     | Type qui représente une ligne brute retournée par `pg` — noms de colonnes en `snake_case` (`NewsMediaRow`, `ConcertRow`…) |
| `*Item`    | Type métier exposé par l'API — partagé avec le frontend (`NewsItem`, `ArtistItem`)                                       |
| `*Role`    | Union littérale miroir d'un ENUM PostgreSQL (`UserRole`)                                                                  |

La règle ESLint `@typescript-eslint/no-explicit-any` est activée dans `eslint.config.cjs`. L'augmentation de `Express.Locals` et le typage explicite de `query<T>(...)` sont les deux mécanismes qui permettent d'éliminer les `any` dans les controllers et middlewares.

---

## 7. Gestion des erreurs

La gestion des erreurs repose sur quatre éléments qui travaillent ensemble : une classe `AppError` pour lever des erreurs métier typées, un fichier central qui regroupe tous les messages, un handler global Express qui intercepte toutes les erreurs non catchées, et un wrapper `asyncHandler` qui évite de répéter `try/catch` dans chaque controller.

### 7.1. La classe `AppError`

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

Avec `AppError`, le controller se contente de lever l'erreur — c'est le `errorHandler` global qui construit la réponse. Si la structure des réponses d'erreur change, il n'y a qu'un seul endroit à modifier. Étendre `Error` plutôt que de lancer un objet brut permet en plus d'utiliser `instanceof AppError` dans le handler pour distinguer une erreur métier intentionnelle d'une erreur JavaScript inattendue.

**Pourquoi `Object.setPrototypeOf` ?**

Cette ligne garantit que la chaîne de prototypes reste correcte après l'appel à `super()`, quel que soit le mode de compilation — sans elle, `instanceof AppError` peut échouer sur une instance pourtant construite via `new AppError(...)` dans certaines configurations de compilation JS/TS ciblant des runtimes plus anciens.

Dans un controller, l'usage est systématique :

```ts
throw new AppError(ERRORS.USER_NOT_FOUND, 404);
```

Le code HTTP voyage avec l'erreur jusqu'au handler global, sans avoir à le re-préciser à chaque niveau.

### 7.2. Centralisation des messages — `errors/errorMessages.ts`

Tous les messages d'erreur sont regroupés dans un objet `ERRORS` exporté depuis `errors/errorMessages.ts`. Dans les controllers, on n'écrit jamais de chaîne en dur — on référence toujours une clé :

```ts
throw new AppError(ERRORS.USER_NOT_FOUND, 404);
```

Le `as const` en fin de fichier est important : il indique à TypeScript que les valeurs sont des littéraux immuables. Sans lui, TypeScript inférerait `string` pour chaque valeur, et tu perdrais l'autocomplétion et la vérification de typage sur les messages.

Les clés sont organisées par domaine métier :

| Préfixe                                                    | Domaine                                             |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| `AUTH_` / `SESSION_`                                        | Session Better Auth manquante ou état de session      |
| `VALIDATION_`                                                | Corps de requête invalide                           |
| `USER_`                                                      | Contrôles utilisateurs restants côté backend         |
| `ARTIST_`                                                    | CRUD artistes                                       |
| `NEWS_`                                                      | CRUD actualités                                     |
| `MAIL_`                                                      | Envoi d'email                                        |
| `FORBIDDEN` / `ROUTE_NOT_FOUND` / `INTERNAL_SERVER_ERROR`   | Erreurs génériques HTTP                             |

### 7.3. Le handler global `errorHandler`

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

Middleware Express à quatre paramètres — c'est cette signature `(err, req, res, next)` qui indique à Express qu'il s'agit d'un gestionnaire d'erreurs.

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

Le `console.error` n'est actif qu'en dehors de la production.

> Cette gestion d'erreurs est propre à nos propres routes (`/admin/*`, `/public/*`, `/contact/*`). Les routes `/api/auth/*` sont entièrement gérées par Better Auth, avec son propre format d'erreur — voir [API.md](./API.md).

### 7.4. `asyncHandler` — envelopper les controllers async

Express reconnaît deux types de middlewares selon leur signature :

- **3 paramètres** `(req, res, next)` → middleware normal
- **4 paramètres** `(err, req, res, next)` → gestionnaire d'erreurs

Quand `next(err)` est appelé avec une valeur, Express saute tous les middlewares à 3 paramètres et transmet directement l'erreur au premier middleware à 4 paramètres qu'il trouve — c'est `errorHandler`.

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
router.get("/", asyncHandler(getArtist));
router.post("/", asyncHandler(createArtist));
```

---

## 8. Middlewares

Les middlewares sont des fonctions qui s'intercalent entre la réception de la requête et le controller. Chacun a une responsabilité unique et s'exécute dans l'ordre où il est déclaré dans la route. Si un middleware lève une `AppError`, la chaîne s'interrompt et `errorHandler` prend la main — le controller n'est jamais atteint.

```
requête → requireAuth → requireRole → validateBody / upload → controller
```

### 8.1. Session — `requireAuth` / `optionalAuth`

`requireAuth.ts` exporte deux middlewares, tous deux basés sur `auth.api.getSession()` (Better Auth) :

```ts
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const result = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!result) {
    throw new AppError(ERRORS.AUTH_MISSING_SESSION, 401);
  }

  res.locals.userId = result.user.id;
  res.locals.sessionId = result.session.id;
  res.locals.userRole = result.user.role ?? undefined;

  next();
}
```

`fromNodeHeaders` convertit les en-têtes Express au format attendu par Better Auth. `auth.api.getSession()` décode et valide lui-même le cookie de session (signature, expiration, révocation) — le backend n'a aucune logique de vérification à écrire. Si aucune session valide n'existe, `requireAuth` lève une seule et unique erreur : `AppError(AUTH_MISSING_SESSION, 401)` — Better Auth ne distingue pas, côté appelant, un cookie absent d'un token expiré ou invalide.

**`optionalAuth`** — même appel à `auth.api.getSession()`, mais n'interrompt jamais la requête : elle peuple `res.locals` si une session valide existe, et appelle `next()` dans tous les cas. Utilisée sur les routes semi-publiques (`GET /public/news`, `GET /public/news/:id`) où un visiteur anonyme et un utilisateur `admin`/`news` reçoivent des résultats différents (brouillons inclus ou non) sans que l'authentification soit obligatoire.

### 8.2. Autorisation — `requireRole`

`requireRole` est une factory de middleware — elle ne retourne pas directement un middleware, elle retourne une fonction qui en est un :

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

`res.locals.userRole` est peuplé par `requireAuth` en amont. `requireRole` lit cette valeur et vérifie qu'elle fait partie de la liste des rôles autorisés passés en argument :

```ts
requireRole("admin"); // admin uniquement
requireRole("admin", "news"); // admin ou news
```

### 8.3. Composition — `authChain`

Plutôt que de répéter `asyncHandler(requireAuth), requireRole(...)` dans chaque route protégée, `authChain.ts` expose une factory `adminAuth` qui compose les deux middlewares en un seul tableau :

```ts
export function adminAuth(...roles: UserRole[]): RequestHandler[] {
  return [asyncHandler(requireAuth), requireRole(...roles)];
}
```

Dans les routes, le tableau est spreadé directement :

```ts
router.post("/artists", ...adminAuth("admin", "artists"), asyncHandler(createArtist));
router.delete("/artists/:id", ...adminAuth("admin", "artists"), asyncHandler(deleteArtist));
```

### 8.4. Validation — `validateBody` et `validateUuidParam`

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

Prend un schéma Zod en argument et valide `req.body`. Si la validation échoue, une `AppError` 400 est transmise à `errorHandler`. Si elle réussit, `req.body` est remplacé par `parsed.data` — les données sont alors typées et nettoyées (trim, coercions Zod).

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

Valide qu'un paramètre de route est un UUID valide. Par défaut valide `req.params.id`, mais le nom du paramètre est configurable : `validateUuidParam("artistId")`.

### 8.5. Upload — `multer` et traitement image

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

**`memoryStorage`** — le fichier n'est pas écrit sur le disque, il est conservé en mémoire sous forme de `Buffer` dans `req.file.buffer`. C'est ce buffer qui est ensuite passé à `sharp` dans `imageUpload.service` pour redimensionner et convertir l'image avant de l'écrire dans `uploads/`.

**`fileFilter`** — vérifie le type MIME du fichier avant de l'accepter. Seuls `image/jpeg`, `image/png` et `image/webp` sont autorisés.

```ts
router.post("/", ...adminAuth("admin"), upload.single("image"), asyncHandler(createArtist));
```

`upload.single("image")` indique que la requête contient un seul fichier dans le champ `image`.

> Ce backend n'a plus de middleware de rate limiting propre (`express-rate-limit` n'est pas une dépendance) : aucune de ses routes ne le justifie encore. Better Auth applique son propre rate limiting interne sur `/api/auth/*` — voir [13.3](#133-rate-limiting-interne-de-better-auth).

---

## 9. Validation des données — `src/schemas/schema.ts`

Tous les schémas Zod utilisés pour valider les corps de requête de **nos** routes sont centralisés dans `src/schemas/schema.ts`. Ils sont passés en argument à `validateBody` dans les routes. Les corps de requête des routes `/api/auth/*` sont validés par Better Auth lui-même, pas par ces schémas.

### 9.1. Pourquoi Zod

Sans validation, un controller qui reçoit `req.body` ne peut pas faire confiance aux données. Zod permet de définir la forme exacte attendue et de rejeter la requête avec un 400 avant d'atteindre la base de données. `parsed.data` est automatiquement typé selon le schéma — le controller n'a pas besoin de caster ou de vérifier manuellement chaque champ.

### 9.2. Les trois schémas

**Contact**

```ts
export const contactSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(100).trim(),
  subject: z.string().min(2).max(150).trim(),
  message: z.string().min(10).max(2000).trim(),
});
```

**Actualités**

```ts
export const createNewsSchema = z.object({
  title: z.string().min(2).max(150).trim(),
  content: z.string().trim().optional().or(z.literal("")),
  is_published: z.enum(["true", "false"]).optional(),
  description_media: z.string().min(1).max(255).trim(),
});
```

`is_published` est une chaîne `"true"` / `"false"` et non un booléen : les formulaires `multipart/form-data` envoient tous les champs en texte. La conversion en booléen est effectuée dans le controller. Utilisé pour la création (`POST`) et la modification (`PATCH`).

**Artistes**

```ts
export const createArtistSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  genre: z.string().min(1).max(60).trim(),
  origin: z.string().min(1).max(80).trim(),
  bio: z.string().min(1).trim(),
  description_media: z.string().min(1).max(255).trim(),
  youtube_url: z
    .url()
    .max(255)
    .refine((val) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(val), { message: "..." })
    .optional()
    .or(z.literal("")),
  spotify_url: z
    .url()
    .max(255)
    .refine((val) => /^https?:\/\/open\.spotify\.com\//.test(val), { message: "..." })
    .optional()
    .or(z.literal("")),
  stage: z.enum(["MainStage", "Tremplin"]),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
  is_featured: z.enum(["true", "false"]).optional(),
});
```

Les URLs YouTube et Spotify utilisent `.refine()` pour vérifier le domaine avec une regex — `z.url()` seul accepterait n'importe quelle URL valide. Le `.optional().or(z.literal(""))` permet d'accepter une chaîne vide quand le champ est laissé vide dans le formulaire.

---

## 10. Couche services — `src/services/`

Les services regroupent la logique métier réutilisable entre plusieurs controllers. Un controller délègue aux services les opérations qui dépassent la simple lecture/écriture en base — traitement d'image, envoi d'email, vérification de rôle.

### 10.1. `imageUpload.service` — pipeline image

**`saveImage(buffer, uploadsDir, urlPrefix)`**

Reçoit le `Buffer` de `req.file.buffer` (fourni par multer), génère un nom de fichier UUID unique, crée le dossier de destination si absent, redimensionne l'image à 1600 px max en conservant les proportions, convertit en WebP qualité 80 avec `sharp`, écrit le fichier sur le disque et retourne l'URL publique.

**`deleteImage(uploadsDir, urlMedia)`**

Supprime silencieusement un fichier image à partir de son URL publique (`.catch(() => undefined)` — pas d'erreur si le fichier est déjà absent). Appelée **après** le commit en base pour les mises à jour — si la requête SQL échoue, l'ancienne image est conservée.

### 10.2. `mailer.service` — envoi d'emails

Le transporteur SMTP est configuré une seule fois au démarrage depuis les variables d'environnement :

```ts
const transporter = nodemailer.createTransport({
  host: getEnv("SMTP_HOST"),
  port: Number(getEnv("SMTP_PORT")),
  secure: getEnv("SMTP_SECURE") === "true",
  auth: { user: getEnv("SMTP_USER"), pass: getEnv("SMTP_PASS") },
});
```

Trois fonctions sont exportées :

| Fonction                 | Déclencheur                                                               |
| ------------------------- | ---------------------------------------------------------------------------- |
| `sendPasswordResetEmail` | Appelée par le callback `sendResetPassword` de Better Auth (reset classique) |
| `sendInviteEmail`        | Même callback, quand l'URL de redirection contient `context=invite`         |
| `sendContactEmail`       | Soumission du formulaire de contact public                                 |

Toutes passent par la fonction interne `sendMail` qui convertit toute erreur nodemailer en `AppError(ERRORS.MAIL_SEND_ERROR, 500)`. Le choix entre `sendPasswordResetEmail` et `sendInviteEmail` est fait dans `src/lib/auth.ts`, pas dans ce service — voir [13.2](#132-invitation-vs-reinitialisation--sendresetpassword).

### 10.3. `user.service` — rôle news

Une seule fonction :

```ts
export function isNewsPrivileged(userRole?: UserRole): boolean {
  return userRole === "admin" || userRole === "news";
}
```

Utilisée par `get_news_list.controller.ts` et `get_news.controller.ts` pour décider si les brouillons (`is_published = FALSE`) doivent être inclus dans la réponse.

---

## 11. Controllers — `src/controllers/`

Chaque controller est un handler async enveloppé dans `asyncHandler`. Il lit les données validées depuis `req.body`, `req.params` ou `res.locals`, effectue les opérations en base, appelle les services si nécessaire, et renvoie la réponse JSON. Le détail des requêtes/réponses de chaque endpoint est dans [API.md](./API.md) — cette section se concentre sur la logique interne.

### 11.1. `get_home.controller.ts`

Retourne les artistes mis en avant et les deux dernières news publiées, en une seule paire de requêtes parallèles (`Promise.all`) — indépendantes l'une de l'autre. La jointure `LEFT JOIN concerts` récupère scène et horaires directement avec les données artiste.

### 11.2. `list_artists.controller.ts`

Retourne tous les artistes triés alphabétiquement. `Omit` exclut les champs lourds ou inutiles pour une liste (`bio`, `genre`, `origin`, liens externes, `end_time`). Le `LEFT JOIN concerts` garantit qu'un artiste sans concert programmé apparaît quand même, avec `stage`/`start_time` à `null`.

### 11.3. `get_artist.controller.ts`

Retourne le détail complet d'un artiste par son UUID, tous les champs d'`ArtistItem` inclus. Lève `AppError(ARTIST_NOT_FOUND, 404)` si l'UUID ne correspond à rien.

### 11.4. `get_news_list.controller.ts`

Retourne les news triées par date décroissante. `isNewsPrivileged(res.locals.userRole)` détermine si la clause `WHERE is_published = TRUE` est appliquée. L'auteur est récupéré via `LEFT JOIN "user" u ON u.id = a.user_id` (table Better Auth) — `author_name` reste `null` si l'utilisateur a été supprimé depuis. `content` est exclu (`Omit<NewsItem, "content">`) : pas nécessaire pour une liste.

### 11.5. `get_news.controller.ts`

Retourne le détail complet d'une news. Vérification en deux temps : la news existe (`404` sinon), puis l'utilisateur y a accès (`404` — pas `403` — si brouillon non accessible, pour ne pas révéler l'existence d'un contenu non publié à un visiteur non privilégié).

### 11.6. `create_artist.controller.ts`

Crée un artiste et son concert associé dans une transaction SQL. L'image est écrite **avant** la transaction — si l'écriture disque échoue, aucune ligne SQL n'est insérée ; si la transaction échoue, `ROLLBACK` puis `deleteImage` du fichier déjà écrit. La limite des artistes mis en avant est contrôlée par un trigger PostgreSQL qui lève `featured_limit_reached` ; le `catch` intercepte ce message et renvoie `AppError(ARTIST_FEATURED_LIMIT, 409)`.

### 11.7. `update_artist.controller.ts`

Modifie un artiste et son concert. Différence clé avec la création : si une nouvelle image est fournie, l'**ancienne** n'est supprimée qu'**après** le `COMMIT` — en cas d'échec SQL, le `ROLLBACK` remet la base dans l'état précédent et seule la nouvelle image (si déjà écrite) est supprimée. L'artiste ne se retrouve jamais sans image.

### 11.8. `delete_artist.controller.ts`

`DELETE ... RETURNING id, url_media` en une seule requête. Le concert associé est supprimé en cascade par la contrainte `ON DELETE CASCADE`. Le fichier image est supprimé après le `DELETE` SQL (échec silencieux si absent).

### 11.9. `create_news.controller.ts`

Même logique image/transaction que `create_artist`. La requête utilise un CTE (`WITH inserted AS (INSERT ... RETURNING *)`) pour insérer la news et récupérer immédiatement `author_name` via `LEFT JOIN "user"` en une seule requête SQL. `res.locals.userId` est injecté comme `user_id`.

### 11.10. `update_news.controller.ts`

Logique image identique à `update_artist` (nouvelle image avant la transaction, ancienne supprimée après le `COMMIT`). Contrairement à `create_news`, le `UPDATE ... RETURNING *` ne peut pas remonter `author_name` (colonne d'une autre table) — un second `SELECT ... LEFT JOIN "user"` est nécessaire après l'`UPDATE`.

### 11.11. `delete_news.controller.ts`

Structure identique à `delete_artist` — `DELETE ... RETURNING`, suppression du fichier image après.

### 11.12. `submit_contact.controller.ts`

Le controller le plus simple du projet — les champs sont déjà validés par `validateBody(contactSchema)` en amont, il ne reste qu'à déléguer l'envoi à `sendContactEmail`. Aucune écriture en base.

---

## 12. Routes — `src/routes/`

Chaque fichier de routes déclare les endpoints d'un domaine, compose la chaîne de middlewares et délègue au controller. Les routes ne contiennent aucune logique métier.

### 12.1. `home.routes.ts`

| Méthode | Endpoint       | Middlewares | Controller |
| -------- | --------------- | ------------ | ----------- |
| `GET`   | `/public/home` | —           | `getHome`  |

### 12.2. `artists.routes.ts`

| Méthode | Endpoint              | Middlewares | Controller    |
| -------- | ---------------------- | ------------ | -------------- |
| `GET`   | `/public/artists`     | —           | `listArtists` |
| `GET`   | `/public/artists/:id` | —           | `getArtist`   |

### 12.3. `news.routes.ts`

| Méthode | Endpoint           | Middlewares    | Controller    |
| -------- | ------------------- | --------------- | -------------- |
| `GET`   | `/public/news`     | `optionalAuth` | `getNewsList` |
| `GET`   | `/public/news/:id` | `optionalAuth` | `getNews`     |

### 12.4. `admin.artists.routes.ts`

| Méthode  | Endpoint             | Middlewares                                                                   | Controller     |
| --------- | --------------------- | ----------------------------------------------------------------------------- | -------------- |
| `POST`   | `/admin/artists`     | `adminAuth("admin","artists")`, `upload`, `validateBody`                      | `createArtist` |
| `PATCH`  | `/admin/artists/:id` | `adminAuth("admin","artists")`, `validateUuidParam`, `upload`, `validateBody` | `updateArtist` |
| `DELETE` | `/admin/artists/:id` | `adminAuth("admin","artists")`, `validateUuidParam`                           | `deleteArtist` |

### 12.5. `admin.news.routes.ts`

| Méthode  | Endpoint          | Middlewares                                                                | Controller   |
| --------- | ------------------ | --------------------------------------------------------------------------- | ------------ |
| `POST`   | `/admin/news`     | `adminAuth("admin","news")`, `upload`, `validateBody`                      | `createNews` |
| `PATCH`  | `/admin/news/:id` | `adminAuth("admin","news")`, `validateUuidParam`, `upload`, `validateBody` | `updateNews` |
| `DELETE` | `/admin/news/:id` | `adminAuth("admin","news")`, `validateUuidParam`                           | `deleteNews` |

### 12.6. `contact.routes.ts`

| Méthode | Endpoint          | Middlewares    | Controller      |
| -------- | ------------------ | --------------- | ---------------- |
| `POST`  | `/contact/submit` | `validateBody` | `submitContact` |

Route publique — aucune authentification requise.

> Les routes `/api/auth/*` (sign-in, sign-out, session, reset de mot de passe, CRUD utilisateurs) ne sont pas déclarées dans `src/routes/` : elles sont entièrement prises en charge par `toNodeHandler(auth)` dans `app.ts`. Détail en section suivante.

---

## 13. Authentification et sessions

### 13.1. Tout est délégué à Better Auth

Ce backend n'implémente ni hachage de mot de passe, ni génération de token, ni table de sessions custom. `src/lib/auth.ts` configure une instance Better Auth :

```ts
export const auth = betterAuth({
  database: pool,
  trustedOrigins: [process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"],
  rateLimit: { enabled: true },
  advanced: { database: { generateId: "uuid" } },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => { /* voir 13.2 */ },
  },
  user: {
    additionalFields: {
      role: { type: ["admin", "artists", "news"], required: false, input: false },
    },
  },
  plugins: [admin()],
});
```

Points clés :

- **`database: pool`** — Better Auth réutilise le même pool `pg` que le reste du backend (`src/db.ts`), mais gère ses propres tables (`user`, `session`, `account`, `verification`) via son adapter interne, indépendamment de `query<T>()`.
- **`generateId: "uuid"`** — force des identifiants UUID plutôt que le format par défaut de Better Auth, pour rester cohérent avec le reste du schéma PostgreSQL du projet.
- **`role` en `additionalFields`** — le seul champ métier ajouté à l'utilisateur Better Auth. `input: false` empêche un utilisateur de définir son propre rôle à l'inscription ; il n'est modifiable que via le plugin admin.
- **`plugins: [admin()]`** — délègue tout le CRUD utilisateurs (créer, lister, modifier, changer le mot de passe, supprimer) au plugin admin de Better Auth, exposé sur `/api/auth/admin/*`. Par défaut, seul le rôle `admin` y a accès (`adminRoles: ["admin"]`, non surchargé ici — il correspond exactement à notre valeur de `role`).
- **`revokeSessionsOnPasswordReset: true`** — un reset de mot de passe réussi invalide toutes les autres sessions ouvertes de l'utilisateur.

Le contrat HTTP complet (endpoints, corps de requête, codes d'erreur) est documenté dans [API.md](./API.md#authentification--utilisateurs).

### 13.2. Invitation vs réinitialisation — `sendResetPassword`

Better Auth appelle le même callback `sendResetPassword({ user, url })` que ce soit pour un reset classique (« mot de passe oublié ») ou pour l'email envoyé à un utilisateur qu'un admin vient de créer (« choisissez votre mot de passe »). Le projet distingue les deux cas en inspectant le paramètre `callbackURL` encodé dans l'URL générée par Better Auth :

```ts
sendResetPassword: async ({ user, url }) => {
  const callbackURL = new URL(url).searchParams.get("callbackURL");
  const isInvite =
    !!callbackURL &&
    new URL(callbackURL).searchParams.get("context") === "invite";

  if (isInvite) {
    await sendInviteEmail(user.email, user.name, url);
  } else {
    await sendPasswordResetEmail(user.email, user.name, url);
  }
},
```

Le frontend est responsable de fabriquer ce `context=invite` : `AddUserModal.tsx` appelle `authClient.requestPasswordReset({ email, redirectTo: "<origin>/reset-password?context=invite" })` après avoir créé le compte, tandis que `ForgotPassword.tsx` appelle la même méthode avec `redirectTo: "<origin>/reset-password"` (sans context). Cette logique — la seule partie du flux d'authentification écrite par ce projet plutôt que par Better Auth — est testée en isolation dans `tests/unit/auth.sendResetPassword.test.ts` (voir [14. Tests](#14-tests)), en appelant directement `auth.options.emailAndPassword.sendResetPassword(...)` : `betterAuth()` renvoie l'objet `options` tel quel, donc c'est littéralement cette fonction qui est invoquée, sans DB ni HTTP.

### 13.3. Rate limiting interne de Better Auth

Better Auth applique son propre rate limiting (`rateLimit: { enabled: true }` — actif même hors production, pour pouvoir le valider manuellement en développement), indépendant de tout package `express-rate-limit`. Deux règles spéciales, définies par Better Auth lui-même, s'appliquent par IP :

| Chemins concernés                                                | Fenêtre | Max |
| -------------------------------------------------------------------- | -------- | --- |
| `/sign-in*`, `/sign-up`, `/change-password`, `/change-email`        | 10 s     | 3   |
| `/request-password-reset`, `/forget-password*`                      | 60 s     | 3   |

`trust proxy` (section [4.2](#42-srcappts)) est ce qui permet à Better Auth de lire la vraie IP cliente derrière un reverse proxy en production, comme pour tout mécanisme basé sur l'IP.

### 13.4. Ce que lisent `requireAuth` et `requireRole`

Une fois la session validée par Better Auth, le backend n'a besoin de rien de plus que `userId`, `sessionId` et `userRole` pour protéger ses propres routes (`/admin/*`) — voir [8.1](#81-session--requireauth--optionalauth) et [8.2](#82-autorisation--requirerole). Aucune notion de « token » ou de « cookie » n'apparaît dans ce code : c'est entièrement la responsabilité de Better Auth.

---

## 14. Tests

Le détail fichier par fichier — chaque cas de test, sa description et son `it(...)` exact — est documenté dans **[TEST.md](./TEST.md)**. Cette section résume l'organisation et les mécanismes partagés.

### 14.1. Organisation

```
tests/
├── setup.ts                          — mocks globaux, reset DB
├── helpers/
│   ├── testServer.ts                 — instance Express pour Supertest
│   ├── createAuthSession.ts          — cree un user + une vraie session Better Auth (cookie signe)
│   └── fixtures.ts                   — insertUser (auth.api.createUser), insertArtist, insertNews
├── integration/
│   ├── admin/
│   │   ├── artists.test.ts           — CRUD artistes
│   │   ├── news.test.ts              — CRUD news
│   │   └── betterAuth.test.ts        — sign-in, sign-out, session, reset, plugin admin (HTTP reel sur /api/auth/*)
│   └── public/
│       ├── public.test.ts            — GET /public/home, /artists, /news
│       └── contact.test.ts           — POST /contact/submit
└── unit/
    ├── auth.sendResetPassword.test.ts
    ├── requireRole.middleware.test.ts
    ├── validateBody.middleware.test.ts
    ├── validateUuidParam.middleware.test.ts
    ├── imageUpload.service.test.ts
    └── mailer.service.test.ts
```

11 fichiers, couvrant à la fois nos propres routes et — pour `betterAuth.test.ts` et `auth.sendResetPassword.test.ts` — la configuration Better Auth elle-même, plutôt que de se reposer uniquement sur le fait que Better Auth est une librairie déjà testée en amont.

### 14.2. Lancer les tests en local

Les tests d'intégration ont besoin d'une vraie base PostgreSQL nommée `vindhellfest_test`, distincte de la base de développement `vindhellfest`.

**1. Démarrer PostgreSQL**

```bash
docker compose up -d db
```

**2. Créer la base de test** (une seule fois — persiste dans le volume `pgdata`)

```bash
docker exec -it vindhellfest-db psql -U postgres -c "CREATE DATABASE vindhellfest_test"
```

**3. Lancer les tests**

```bash
npm test
```

À l'intérieur du conteneur backend, si celui-ci tourne déjà via `docker compose up` :

```bash
docker exec vindhellfest-backend npm test
```

### 14.3. Réinitialisation de la base entre les tests

`tests/setup.ts` réinitialise entièrement le schéma avant la suite (`beforeAll`) plutôt que de se contenter d'un `TRUNCATE` :

```ts
beforeAll(async () => {
  await testPool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  for (const file of MIGRATION_FILES) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await testPool.query(sql);
  }
});

afterEach(async () => {
  await testPool.query(
    'TRUNCATE "user", session, account, verification, news, concerts, artists RESTART IDENTITY CASCADE;',
  );
});
```

Le `DROP SCHEMA` est nécessaire car `01_auth_schema.sql` (généré une fois par `npx @better-auth/cli generate` pour un volume Postgres neuf) n'a pas de `DROP TABLE IF EXISTS` contrairement aux autres fichiers de migration — il n'est pas conçu pour être rejoué sur un schéma déjà peuplé. Repartir d'un schéma `public` vide à chaque lancement de la suite évite ce problème.

`setup.ts` mocke aussi les dépendances externes :

| Mock          | Raison                                    |
| -------------- | -------------------------------------------- |
| `sharp`       | Ne pas traiter de vraies images             |
| `fs/promises` (`mkdir`, `unlink`, `writeFile`) | Ne pas écrire sur le disque |
| `nodemailer`  | Ne pas envoyer de vrais emails              |

Better Auth lui-même n'est jamais mocké : `createAuthSession` et `betterAuth.test.ts` créent de vrais utilisateurs et de vraies sessions contre la base de test.

### 14.4. Helpers

**`createAuthSession(role)`**

Crée un utilisateur via `auth.api.createUser` (plugin admin) puis se connecte via `auth.api.signInEmail({ asResponse: true })` pour extraire un cookie de session Better Auth réel et signé — impossible à reconstruire à la main :

```ts
const { cookie, userId } = await createAuthSession("admin");
await request(app).delete(`/admin/artists/${artistId}`).set("Cookie", cookie).expect(200);
```

Appeler `auth.api.signInEmail` directement (sans passer par une requête HTTP) n'est pas soumis au rate limiting interne de Better Auth (section [13.3](#133-rate-limiting-interne-de-better-auth)) — ce qui permet à `createAuthSession` d'être appelée dans quasiment chaque test sans jamais déclencher de `429`. Ce n'est pas une garantie générale pour tous les endpoints Better Auth : `requestPasswordReset`/`resetPassword` appelés de la même façon (hors HTTP) se sont révélés peu fiables en CI, pour une raison différente (leur middleware `originCheck` attend un vrai contexte de requête) — `betterAuth.test.ts` les appelle donc exclusivement en HTTP réel, dans la limite du budget de la section 13.3 (détail dans TEST.md).

**`insertArtist` / `insertNews`**

Insèrent des données de test directement en base sans passer par l'API, pour préparer l'état initial avant de tester un endpoint de lecture, modification ou suppression.

**`MINIMAL_PNG`**

Buffer d'une image PNG 1×1 px en base64, utilisé comme fichier de test pour les routes multipart qui attendent `req.file`.
