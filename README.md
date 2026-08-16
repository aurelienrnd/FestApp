# FestApp — Architecture & Documentation

FestApp s'appuie sur une architecture frontend / backend / base de données orchestrée via Docker et intègre une démarche DevOps (CI/CD).

## Stack technique

| Couche                     | Technologie                                      |
| -------------------------- | ------------------------------------------------ |
| **Frontend**         | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend**          | Express.js 5, TypeScript, Node.js 20             |
| **Base de données** | PostgreSQL 16 (Alpine)                           |
| **DevOps**           | Docker Compose, GitHub Actions CI/CD             |

---

## 🗂 Structure du Projet

Voici l'architecture globale du projet avec l'explication du rôle de chaque dossier :

```
vindhellfest/
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── frontend/
│   └── backend/
├── bd/
├── .dockerignore
├── .env
├── .env.backend
├── .env.frontend
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Architecture Docker

Le projet repose sur **Docker Compose** pour orchestrer l'ensemble des services en développement.
Il est composé de **3 services**, connectés par **1 réseau interne** et utilisant **2 volumes persistants**.

### Services

#### `db` — Base de données PostgreSQL

| Propriété      | Valeur                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Image            | `postgres:16-alpine`                                                                                    |
| Nom du conteneur | `vindhellfest-db`                                                                                       |
| Port             | Interne uniquement (non exposé à l'hôte)                                                               |
| Variables d'env  | Chargées depuis`.env`                                                                                  |
| Réseau          | `app-net`                                                                                               |
| Healthcheck      | `pg_isready` toutes les 10 s — garantit que le backend ne démarre pas avant que PostgreSQL soit prêt |

Volumes montés :

| Volume                                    | Rôle                                                             |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `pgdata`                                | Stockage persistant des données PostgreSQL                       |
| `./bd/init:/docker-entrypoint-initdb.d` | Scripts SQL exécutés automatiquement à la création de la base |

---

#### `backend` — API Express.js

| Propriété      | Valeur                                                       |
| ---------------- | ------------------------------------------------------------ |
| Image            | Construite depuis`apps/backend/Dockerfile` (stage `dev`) |
| Nom du conteneur | `vindhellfest-backend`                                     |
| Port exposé     | `4000` → accessible sur http://localhost:4000             |
| Variables d'env  | Chargées depuis`.env` et `.env.backend`                 |
| Dépendance      | Attend que`db` soit `healthy` avant de démarrer         |
| Réseau          | `app-net`                                                  |

Volumes montés :

| Volume                                  | Rôle                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `./apps/backend:/app`                 | Code source local monté dans le conteneur — permet le hot-reload                           |
| `/app/node_modules`                   | Isole les dépendances Docker des dépendances locales                                       |
| `./apps/backend/uploads:/app/uploads` | Les images uploadées sont stockées directement sur la machine hôte (pas un volume Docker) |
| `./bd/init:/app/bd/init`              | Scripts SQL accessibles depuis le conteneur backend (utilisés par les tests)                |

---

#### `frontend` — Application Next.js

| Propriété      | Valeur                                                        |
| ---------------- | ------------------------------------------------------------- |
| Image            | Construite depuis`apps/frontend/Dockerfile` (stage `dev`) |
| Nom du conteneur | `vindhellfest-frontend`                                     |
| Port exposé     | `3000` → accessible sur http://localhost:3000              |
| Variables d'env  | Chargées depuis`.env` et `.env.frontend`                 |
| Dépendance      | Attend que`backend` soit démarré                          |
| Réseau          | `app-net`                                                   |

Volumes montés :

| Volume                   | Rôle                                                              |
| ------------------------ | ------------------------------------------------------------------ |
| `./apps/frontend:/app` | Code source local monté dans le conteneur — permet le hot-reload |
| `/app/node_modules`    | Isole les dépendances Docker des dépendances locales             |
| `/app/.next`           | Isole le cache de build Next.js dans le conteneur                  |

> **Note Webpack** : Turbopack est désactivé en développement sous Docker sur Windows (`NEXT_DISABLE_TURBOPACK=1`, commande `next dev --webpack`). Turbopack a son propre système de surveillance de fichiers, indépendant de Watchpack/Chokidar, qui **ignore silencieusement** les variables de polling ci-dessous — sous Docker sur Windows, ça se traduit par un hot reload qui ne se déclenche jamais, sans aucune erreur visible. Revenir à Webpack (plus lent, mais dont le watcher respecte ces variables) est donc nécessaire pour que le polling ait un effet.
>
> **Note polling** : Les variables d'environnement `WATCHPACK_POLLING`, `WATCHPACK_POLLING_INTERVAL`, `CHOKIDAR_USEPOLLING` et `CHOKIDAR_INTERVAL` sont nécessaires au **hot reload en développement**.
> Sous Windows et macOS, Docker tourne dans une VM Linux qui ne reçoit pas les événements de fichiers du système hôte. Sans ces variables, Next.js et le backend ne détectent pas les modifications de fichiers et ne se rechargent pas automatiquement.
> Le polling force une vérification périodique du système de fichiers en remplacement des événements natifs. **Ne pas supprimer ces variables si vous développez sous Windows ou macOS.**

---

### Stages Docker — dev vs production

Chaque Dockerfile est organisé en **stages multi-étapes**. Le `docker-compose.yml` cible le stage `dev` par défaut via `target: dev`.

#### Différences entre les stages

| Aspect               | `dev`                                            | `runner` (production)                              |
| -------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| Code source          | Monté depuis l'hôte (volume`./apps/xxx:/app`)  | Copié dans l'image au moment du build               |
| Hot reload           | Activé (`tsx watch`, `next dev` + polling)    | Désactivé (`node dist/index.js`, `next start`) |
| Dépendances         | Toutes (dev incluses)                              | Production uniquement (`--omit=dev`)               |
| Variables de polling | Présentes (`WATCHPACK_POLLING`, `CHOKIDAR_*`) | Absentes (inutiles)                                  |
| Taille de l'image    | Plus lourde                                        | Optimisée                                           |

#### Passer en production

Pour builder et lancer les images de production, deux modifications sont nécessaires dans `docker-compose.yml` :

**1. Changer le `target` des services `backend` et `frontend` :**

```yaml
build:
  target: runner # remplace : dev
```

**2. Retirer les volumes de code source et les variables de polling :**

En production, le code est embarqué dans l'image — les volumes qui montaient le code local deviennent inutiles voire dangereux (ils écraseraient le contenu de l'image).

| Service      | Volumes à retirer                                              |
| ------------ | --------------------------------------------------------------- |
| `backend`  | `./apps/backend:/app`, `/app/node_modules`                  |
| `frontend` | `./apps/frontend:/app`, `/app/node_modules`, `/app/.next` |

Supprimer également le bloc `environment` de polling et la directive `command` du service `frontend`.

> **Bonne pratique** : créer un fichier `docker-compose.prod.yml` qui surcharge uniquement ces différences, et lancer avec `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`.

---

### Réseau — `app-net`

`app-net` est un **réseau Docker bridge interne** créé automatiquement par Compose.
Il permet aux conteneurs de se joindre entre eux par leur **nom de service**, sans passer par l'hôte.

Exemples de communication interne :

| De           | Vers        | Adresse utilisée |
| ------------ | ----------- | ----------------- |
| `backend`  | `db`      | `db:5432`       |
| `frontend` | `backend` | `backend:4000`  |

Depuis l'extérieur (navigateur ou outil), seuls les ports explicitement exposés (`3000`, `4000`) sont accessibles.

---

### Volume persistant — `pgdata`

`pgdata` est un **volume Docker nommé** géré par Docker Engine.
Il stocke les fichiers de données PostgreSQL dans un emplacement isolé sur la machine hôte.

Sans ce volume, **toutes les données seraient perdues** à chaque suppression ou recréation du conteneur `db`.
Avec ce volume, les données survivent aux `docker compose down` et aux rebuilds d'image.

---

### Démarrer les services

**Démarrer l'ensemble du projet (base de données + backend + frontend)**

```bash
docker compose up -d
```

L'option `-d` lance les services en arrière-plan.

**Démarrer uniquement la base de données**

```bash
docker compose up -d db
```

Utile pour accéder directement à PostgreSQL et diagnostiquer la base indépendamment du backend.

**Démarrer la base de données et le backend**

```bash
docker compose up -d db backend
```

Démarre uniquement les services nécessaires au fonctionnement de l'API, sans lancer le frontend.

**Rebuilder les images après un changement de dépendances**

```bash
docker compose up -d --build
```

À utiliser après l'installation d'un nouveau package npm — les dépendances étant isolées dans `/app/node_modules` du conteneur, elles ne se mettent pas à jour automatiquement.

---

### Dépendances Docker vs dépendances locales

Quand vous lancez `docker compose up -d`, les dépendances Node.js sont installées **dans les conteneurs** (`/app/node_modules`), pas sur la machine hôte.

Avec les volumes montés (`./apps/frontend:/app` et `./apps/backend:/app`), votre IDE sur Windows ne voit pas ces dépendances et peut afficher des erreurs TypeScript/ESLint — par exemple `react/jsx-runtime` introuvable — alors que l'application tourne correctement dans Docker.

**Solution : installer les dépendances localement**

Depuis la racine du projet (`vindhellfest`) :

```powershell
npm.cmd --prefix .\apps\frontend ci
npm.cmd --prefix .\apps\backend ci
```

---

### `.dockerignore`

Le fichier `.dockerignore` sert à indiquer à Docker quels fichiers ou dossiers ne doivent pas être inclus dans le contexte de build.
Les éléments listés dans ce fichier ne seront donc pas envoyés au moteur Docker lors de la construction de l'image, ce qui permet d'alléger le build et de protéger les fichiers sensibles.

Il ignore les fichiers suivants :

- `.env`, `.env.backend`, `.env.frontend` — variables d'environnement sensibles (injectées au runtime, pas au build)
- `node_modules` — dépendances réinstallées dans le conteneur
- `npm-debug.log`, `yarn-error.log` — fichiers de logs
- `dist` — dossier de build TypeScript local
- `.git`, `.gitignore` — fichiers et historique Git
- `Dockerfile`, `docker-compose.yml` — fichiers de configuration Docker
- `.vscode/` — configuration locale de l'éditeur

---

## Git

### `.gitignore`

Le fichier `.gitignore` sert à indiquer à Git quels fichiers ou dossiers ne doivent pas être suivis.
Les éléments listés dans ce fichier ne seront donc pas inclus dans les commits, ni affichés comme modifications non suivies.

Il ignore notamment les fichiers suivants :

- `.env`, `.env.backend`, `.env.frontend` — fichiers de variables d'environnement (secrets)
- `**/node_modules/` — dépendances Node.js générées
- `**/dist/` — fichiers compilés TypeScript
- `.vscode/` — configuration locale de l'éditeur

---

## Pipeline CI/CD

Le pipeline est défini dans [`.github/workflows/ci.yml`](.github/workflows/ci.yml) et géré par **GitHub Actions**.

### Vue d'ensemble

```
push / pull_request (toutes branches)
            │
            ├─── Job: backend  (ubuntu-latest)
            │        │
            │        ├─ 1. Checkout
            │        ├─ 2. Prépare les fichiers .env
            │        ├─ 3. Build image Docker (stage dev)
            │        ├─ 4. Démarre PostgreSQL
            │        ├─ 5. Attend que la BDD soit prête (pg_isready)
            │        ├─ 6. Crée la base de test (vindhellfest_test)
            │        ├─ 7. npm ci
            │        ├─ 8. Lint (ESLint)
            │        ├─ 9. Tests (Vitest + Supertest)
            │        └─ 10. Shutdown (toujours exécuté)
            │
            └─── Job: frontend (ubuntu-latest)
                     │
                     ├─ 1. Checkout
                     ├─ 2. Prépare les fichiers .env
                     ├─ 3. Build image Docker (stage dev)
                     ├─ 4. npm ci (--no-deps)
                     ├─ 5. Lint (ESLint + Next.js)
                     ├─ 6. Tests (Vitest, mode one-shot)
                     └─ 7. Shutdown (toujours exécuté)
```

Les deux jobs s'exécutent **en parallèle** sur des VM Ubuntu fraîches — ils sont totalement indépendants.

---

### Déclencheurs

| Événement      | Condition                | Description                                                           |
| ---------------- | ------------------------ | --------------------------------------------------------------------- |
| `push`         | Sur toutes les branches  | À chaque fois qu'un commit est poussé sur le dépôt                |
| `pull_request` | Vers toutes les branches | À l'ouverture, la mise à jour ou la réouverture d'une pull request |

---

### Job `backend`

| #  | Étape                         | Commande / Action                                   | Description                                                                                                                                                   |
| -- | ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | **Checkout**             | `actions/checkout@v4`                             | Clone le dépôt Git sur la VM                                                                                                                                |
| 2  | **Prepare env files**    | `cat > .env / .env.backend / .env.frontend`       | Crée les trois fichiers d'environnement requis par Docker Compose —`.env.backend` contient toutes les variables nécessaires aux tests (DB, JWT, SMTP...) |
| 3  | **Build backend image**  | `docker compose build backend`                    | Construit l'image Docker du backend (stage`dev`)                                                                                                            |
| 4  | **Start database**       | `docker compose up -d db`                         | Lance le conteneur PostgreSQL en arrière-plan                                                                                                                |
| 5  | **Wait for database**    | `pg_isready` en boucle (20 tentatives, pause 3 s) | Attend que PostgreSQL soit prêt à accepter les connexions avant de continuer                                                                                |
| 6  | **Create test database** | `psql -c "CREATE DATABASE vindhellfest_test"`     | Crée la base de données dédiée aux tests d'intégration                                                                                                   |
| 7  | **Install dependencies** | `npm ci`                                          | Installe les dépendances npm de façon déterministe depuis`package-lock.json`                                                                             |
| 8  | **Lint**                 | `npm run lint`                                    | Analyse statique du code — vérifie les règles ESLint                                                                                                       |
| 9  | **Test**                 | `npm test`                                        | Exécute tous les tests (unitaires + intégration) via Vitest                                                                                                 |
| 10 | **Shutdown**             | `docker compose down -v`                          | Arrête et supprime les conteneurs, réseaux et volumes —**toujours exécuté**, même en cas d'échec                                                 |

> Le job backend démarre un vrai PostgreSQL via Docker pour que les tests d'intégration (Supertest) s'exécutent contre une base réelle, pas des mocks.

---

### Job `frontend`

| # | Étape                         | Commande / Action                             | Description                                                                                           |
| - | ------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1 | **Checkout**             | `actions/checkout@v4`                       | Clone le dépôt Git sur la VM                                                                        |
| 2 | **Prepare env files**    | `cat > .env / .env.backend / .env.frontend` | Crée les trois fichiers d'environnement vides pour éviter les erreurs Docker Compose au build       |
| 3 | **Build frontend image** | `docker compose build frontend`             | Construit l'image Docker du frontend (stage`dev`)                                                   |
| 4 | **Install dependencies** | `npm ci` (`--no-deps`)                    | Installe les dépendances npm sans démarrer les services liés (backend, db)                         |
| 5 | **Lint**                 | `npm run lint` (`--no-deps`)              | Analyse statique du code — vérifie les règles ESLint et Next.js                                    |
| 6 | **Test**                 | `npm run test:run` (`--no-deps`)          | Exécute tous les tests en mode one-shot via Vitest (`test:run` = pas de watch mode, adapté au CI) |
| 7 | **Shutdown**             | `docker compose down -v`                    | Supprime les conteneurs et ressources Docker —**toujours exécuté**, même en cas d'échec    |

> **`--no-deps`** : indique à Docker Compose de ne pas démarrer les services dont le frontend dépend (`backend`, `db`). Les tests frontend sont purement unitaires et n'ont pas besoin d'une API active.

---

## Fichiers d'environnement

> Ces trois fichiers sont à créer **à la racine du projet** avant le premier `docker compose up`. Ils ne sont pas versionnés (`.gitignore`).

### Contenu à copier-coller

**`.env`**

```env
POSTGRES_DB=vindhellfest
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

**`.env.backend`**

```env
PORT=4000
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=vindhellfest
JWT_ACCESS_SECRET=un-super-secret-a-changer
JWT_ACCESS_EXPIRES_IN=1h
COOKIE_ACCESS_TOKEN_NAME=vindhellfest_access_token
COOKIE_ACCESS_TOKEN_SECURE=false
COOKIE_ACCESS_TOKEN_SAME_SITE=lax
SESSION_EXPIRES_IN=12h
FRONTEND_ORIGIN=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ton-email@gmail.com
SMTP_PASS=ton-mot-de-passe-application
CONTACT_EMAIL=ton-email@gmail.com
```

> `DB_USER`, `DB_PASSWORD` et `DB_NAME` doivent correspondre exactement aux valeurs de `.env`.

**`.env.frontend`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL_SERVER=http://backend:4000
```

---

### `.env`

Chargé par Docker Compose pour configurer le service `db`.

| Variable              | Exemple          | Description                                                          |
| --------------------- | ---------------- | -------------------------------------------------------------------- |
| `POSTGRES_USER`     | `postgres`     | Nom d'utilisateur PostgreSQL créé à l'initialisation du conteneur |
| `POSTGRES_PASSWORD` | `postgres`     | Mot de passe associé à l'utilisateur PostgreSQL                    |
| `POSTGRES_DB`       | `vindhellfest` | Nom de la base de données créée automatiquement au démarrage     |

---

### `.env.backend`

Chargé par le service `backend`. Toutes les variables sont validées au démarrage via Zod (`src/env.ts`).

**Base de données**

| Variable        | Exemple          | Description                                        |
| --------------- | ---------------- | -------------------------------------------------- |
| `PORT`        | `4000`         | Port d'écoute du serveur Express                  |
| `DB_HOST`     | `db`           | Nom du service Docker PostgreSQL (réseau interne) |
| `DB_PORT`     | `5432`         | Port PostgreSQL                                    |
| `DB_USER`     | `postgres`     | Utilisateur de la base de données                 |
| `DB_PASSWORD` | `postgres`     | Mot de passe de la base de données                |
| `DB_NAME`     | `vindhellfest` | Nom de la base de données                         |

**Authentification & sessions**

| Variable                          | Exemple                       | Description                                                        |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `JWT_ACCESS_SECRET`             | `un-super-secret-a-changer` | Clé secrète pour signer et vérifier les tokens JWT              |
| `JWT_ACCESS_EXPIRES_IN`         | `1h`                        | Durée de validité du token JWT                                   |
| `COOKIE_ACCESS_TOKEN_NAME`      | `vindhellfest_access_token` | Nom du cookie httpOnly stockant le token                           |
| `COOKIE_ACCESS_TOKEN_SECURE`    | `true`                      | `true` = cookie HTTPS uniquement (mettre `false` en dev local) |
| `COOKIE_ACCESS_TOKEN_SAME_SITE` | `lax`                       | Politique SameSite du cookie                                       |
| `SESSION_EXPIRES_IN`            | `12h`                       | Durée de validité maximale d'une session en base                 |

**SMTP — envoi d'emails**

| Variable          | Exemple              | Description                                                     |
| ----------------- | -------------------- | --------------------------------------------------------------- |
| `SMTP_HOST`     | `smtp.example.com` | Adresse du serveur SMTP                                         |
| `SMTP_PORT`     | `587`              | Port SMTP (587 pour STARTTLS, 465 pour SSL natif)               |
| `SMTP_SECURE`   | `false`            | `true` pour SSL/TLS natif (port 465), `false` pour STARTTLS |
| `SMTP_USER`     | `...`              | Identifiant de connexion au serveur SMTP                        |
| `SMTP_PASS`     | `...`              | Mot de passe du compte SMTP                                     |
| `CONTACT_EMAIL` | `contact@...`      | Adresse de destination des messages du formulaire               |

**Divers**

| Variable            | Exemple                   | Description                                                        |
| ------------------- | ------------------------- | ------------------------------------------------------------------ |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | Origine autorisée par CORS — en production, mettre l'URL du site |

---

### `.env.frontend`

Chargé par le service `frontend`.

| Variable                | Exemple                   | Description                                                                |
| ----------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `API_URL_SERVER`      | `http://backend:4000`   | URL de l'API côté serveur (SSR Next.js) — via le réseau Docker interne |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL de l'API côté client (navigateur)                                    |

---

## `bd/` — Base de données PostgreSQL

La base de données du projet repose sur PostgreSQL.
Le dossier `bd/init/` contient trois types de fichiers exécutés automatiquement par Docker à la création du conteneur `db` :

- **Scripts de schéma** — création des tables (`users`, `sessions`, `news`, `artists`, `concerts`)
- **Scripts de seed** — données initiales insérées au démarrage
- **Diagramme Draw.io** — modèle conceptuel de données (MCD)

La persistance des données est assurée par le volume Docker `pgdata` (voir section [Architecture Docker](#architecture-docker)).

> Pour plus de détails sur le schéma complet, voir [`bd/README.md`](bd/README.md).

---

## `apps/` — Code source des applications

### `apps/frontend/`

Application Next.js + TypeScript (App Router).

- Pages publiques et pages d'administration protégées
- Composants UI, styles Tailwind CSS 4 avec tokens CSS
- Appels API vers le backend
- Tests unitaires et d'intégration (Vitest + React Testing Library)
- Configuration Next.js, ESLint, TypeScript

> Pour plus de détails, voir [`apps/frontend/README.md`](apps/frontend/README.md).

### `apps/backend/`

API REST Express.js + TypeScript.

- Routes et contrôleurs organisés en deux espaces : `admin/` (accès authentifié) et `public/` (accès libre)
- Middlewares : authentification JWT, validation Zod, gestion d'erreurs, rate limiting
- Logique de sécurité : JWT, bcrypt, cookies httpOnly, sessions en base
- Upload de fichiers images (multer)
- Envoi d'emails transactionnels (nodemailer / SMTP)
- Tests unitaires et d'intégration (Vitest + Supertest)

> Pour plus de détails sur les endpoints, voir [`apps/backend/API.md`](apps/backend/API.md).
> Pour plus de détails sur l'architecture, voir [`apps/backend/README.md`](apps/backend/README.md).
