# Projet Vindhellfest — Architecture & Documentation

Ce projet est développé dans le cadre du titre professionnel Concepteur Développeur d'Applications (CDA).
Il s'appuie sur une architecture frontend / backend / base de données orchestrée via Docker et intègre une démarche DevOps (CI/CD).

---

## Stack technique

| Couche               | Technologie                                      |
| -------------------- | ------------------------------------------------ |
| **Frontend**         | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend**          | Express.js 5, TypeScript, Node.js                |
| **Base de données**  | PostgreSQL 16 (Alpine)                           |
| **Authentification** | JWT, bcrypt, cookies httpOnly                    |
| **Validation**       | Zod                                              |
| **Tests**            | Vitest, Supertest, React Testing Library         |
| **Linting**          | ESLint 9, Prettier                               |
| **DevOps**           | Docker Compose, GitHub Actions CI/CD             |

---

## Démarrer les services avec Docker Compose

Ce projet utilise Docker Compose pour build une image de développement :

**Démarrer l'ensemble du projet (base de données + backend + frontend)**

- `docker compose up -d` :
  L'option `-d` permet de lancer les services en arrière-plan.

**Démarrer uniquement la base de données**

- `docker compose up -d db` :
  Cela est utile si vous souhaitez accéder à PostgreSQL, pour diagnostiquer la base indépendamment du backend.

**Démarrer la base de données et le backend**

- `docker compose up -d db backend` :
  Cela démarre uniquement les services nécessaires au fonctionnement du backend, sans lancer le frontend.

---

## Lancer les tests localement

> Les dépendances doivent être installées localement (voir section [Dépendances Docker vs locales](#dépendances-docker-vs-dépendances-locales-important-pour-eslinttypescript)).

**Backend**

```bash
npm --prefix ./apps/backend run lint
npm --prefix ./apps/backend test
```

**Frontend**

```bash
npm --prefix ./apps/frontend run lint
npm --prefix ./apps/frontend test
```

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
├── doc/
├── .dockerignore
├── .env
├── .env.backend
├── .env.frontend
├── .gitignore
├── docker-compose.yml
└── README.md
```

---


## `.github/workflows/`

### `ci.yml`

Le workflow CI se déclenche automatiquement à chaque push sur n'importe quelle branche ainsi que lors de la création ou mise à jour d'une pull request.
Il est composé de deux jobs distincts : backend et frontend, exécutés indépendamment sur des machines virtuelles Ubuntu.

**Étapes du job Backend (CI)**

- Clonage du dépôt
- Création des fichiers d'environnement (`.env`)
- Construction de l'image de développement Docker du backend
- Démarrage de la base de données PostgreSQL
- Attente jusqu'à ce que PostgreSQL soit prêt à accepter les connexions
- Installation des dépendances
- Analyse du code (Lint)
- Exécution des tests automatisés
- Arrêt et suppression des conteneurs, réseaux et volumes Docker, même en cas d'échec

**Étapes du job Frontend (CI)**

- Clonage du dépôt
- Création des fichiers d'environnement (`.env`)
- Construction de l'image de développement Docker du frontend
- Installation des dépendances
- Analyse statique du code (Lint)
- Lancement des tests unitaires / d'intégration du frontend
- Suppression de tous les conteneurs et ressources Docker utilisés pendant le job

---

## `apps/` — Code source des applications

### `apps/frontend/`

Contient l'application frontend (Next.js + TypeScript).
Ce dossier inclut :

- pages et composants UI
- appels API vers le backend
- configuration Next.js
- scripts de build et de démarrage

**Pages publiques :**

| Route | Description |
| --- | --- |
| `/` | Page d'accueil |
| `/lineup` | Programmation — liste des artistes du festival |
| `/news` | Actualités de l'événement |
| `/practical-info` | Informations pratiques |
| `/login` | Connexion à l'interface d'administration |

**Pages d'administration (accès protégé) :**

| Route | Description |
| --- | --- |
| `/admin/dashboard` | Tableau de bord |
| `/admin/lineup` | Gestion de la programmation |
| `/admin/users` | Gestion des utilisateurs |
| `/admin/news` | Gestion des actualités |

### `apps/backend/`

Contient l'API backend (Express.js + TypeScript).
Ce dossier inclut :

- routes et contrôleurs organisés en deux espaces : `admin/` (accès authentifié) et `public/` (accès libre)
- middlewares : authentification JWT, validation Zod, gestion d'erreurs, rate limiting
- accès aux données via PostgreSQL (`pg`)
- logique de sécurité (JWT, bcrypt, cookies httpOnly, sessions)
- compilation TypeScript (`dist/`)

**Endpoints disponibles :**

| Méthode | Route | Accès | Description |
| --- | --- | --- | --- |
| GET | `/public/lineup` | Public | Liste tous les artistes du festival |
| POST | `/admin/auth/login` | Public | Connexion (rate limité) |
| POST | `/admin/auth/logout` | Authentifié | Déconnexion |
| GET | `/admin/auth/me` | Authentifié | Infos utilisateur connecté + renouvellement du token |
| PATCH | `/admin/auth/password` | Authentifié | Modifier son mot de passe |
| POST | `/admin/auth/forgot-password` | Public | Réinitialiser son mot de passe (rate limité) |
| GET | `/admin/users` | Authentifié (admin) | Liste des utilisateurs admin |
| POST | `/admin/users` | Authentifié (admin) | Créer un utilisateur admin |
| PATCH | `/admin/users/:id` | Authentifié (admin) | Modifier un utilisateur |
| DELETE | `/admin/users/:id` | Authentifié (admin) | Supprimer un utilisateur — redirige vers `/login` si l'utilisateur se supprime lui-même |
| POST | `/contact/submit` | Public | Envoyer un message de contact |

> La documentation complète des endpoints est disponible dans [`apps/backend/API.md`](apps/backend/API.md).

**Système de rôles :**

Chaque utilisateur admin possède un rôle qui détermine ses droits :

- `admin` — accès complet à toutes les fonctionnalités
- `lineup` — gestion de la programmation artistique
- `news` — gestion des actualités

---

## `bd/` — Base de données PostgreSQL

La base de données du projet repose sur PostgreSQL.
Le modèle s'articule autour de plusieurs entités principales représentant les besoins fonctionnels de l'application :

- La table `users` centralise les informations liées aux comptes utilisateurs (identité, authentification, rôles).
- La table `sessions` est liée aux utilisateurs et permet de gérer la persistance des connexions et la sécurité des accès, notamment dans le cadre de l'authentification par JWT.
- La table `articles` permet de stocker le contenu éditorial (actualités, annonces, informations liées à l'événement). Elle est reliée aux utilisateurs via `user_id` (nullable) — si un utilisateur est supprimé, `user_id` passe à `NULL` et l'article est conservé (auteur affiché comme "Auteur inconnu").
- La table `artists` représente les groupes ou artistes programmés pour le festival.
- La table `concerts` décrit les événements musicaux et est associée aux artistes, ce qui permet de modéliser la programmation et la planification des prestations.

La persistance des données est assurée par un volume Docker.

---

## `.dockerignore`

Le fichier `.dockerignore` sert à indiquer à Docker quels fichiers ou dossiers ne doivent pas être inclus dans le contexte de build.
Les éléments listés dans ce fichier ne seront donc pas envoyés au moteur Docker lors de la construction de l'image, ce qui permet d'alléger le build et de protéger les fichiers sensibles.

Il ignore notamment les fichiers suivants :

- `.env`
- `.env.backend`
- `.env.frontend`
- Les dossiers générés par les dépendances
- Les fichiers de logs NPM et Yarn
- Le dossier de build local
- Les fichiers et dossiers Git
- Les fichiers liés à la configuration Docker

---

## Fichiers d'environnement

### Exemple : `.env`

- `POSTGRES_USER=postgres` — Définit le nom d'utilisateur administrateur créé automatiquement lors de l'initialisation du conteneur
- `POSTGRES_PASSWORD=postgres` — Définit le mot de passe associé à l'utilisateur PostgreSQL pour l'accès à la base de données
- `POSTGRES_DB=vindhellfest` — Indique le nom de la base de données créée automatiquement au démarrage du conteneur

### Exemple : `.env.backend`

- `PORT=4000` — Définit le port sur lequel le serveur backend écoute les requêtes HTTP
- `DB_HOST=db` — Indique le nom du service Docker correspondant au serveur PostgreSQL utilisé par le backend
- `DB_PORT=5432` — Précise le port de connexion au serveur PostgreSQL
- `DB_USER=postgres` — Correspond au nom d'utilisateur utilisé pour se connecter à la base de données
- `DB_PASSWORD=postgres` — Correspond au mot de passe associé à l'utilisateur de la base de données
- `DB_NAME=vindhellfest` — Définit le nom de la base de données utilisée par l'application
- `JWT_ACCESS_SECRET=un-super-secret-a-changer` — Clé secrète servant à signer et vérifier les jetons JWT d'authentification
- `JWT_ACCESS_EXPIRES_IN=1h` — Durée de validité des jetons d'accès avant expiration automatique
- `COOKIE_ACCESS_TOKEN_NAME=vindhellfest_access_token` — Nom du cookie dans lequel le jeton d'authentification est stocké côté client
- `COOKIE_ACCESS_TOKEN_SECURE=true` — Indique que le cookie ne doit être transmis que via des connexions HTTPS
- `COOKIE_ACCESS_TOKEN_SAME_SITE=lax` — Limite l'envoi du cookie aux requêtes de même site
- `SESSION_EXPIRES_IN=12h` — Durée de validité maximale d'une session utilisateur avant expiration
- `FRONTEND_ORIGIN=http://localhost:3000`

### Exemple : `.env.frontend`

- `API_URL_SERVER=http://backend:4000` — URL de l'API utilisée côté serveur (SSR Next.js), via le réseau Docker interne
- `NEXT_PUBLIC_API_URL=http://localhost:4000` — URL de l'API utilisée côté client (navigateur)

---

## `.gitignore`

Le fichier `.gitignore` sert à indiquer à Git quels fichiers ou dossiers ne doivent pas être suivis.
Les éléments listés dans ce fichier ne seront donc pas inclus dans les commits, ni affichés comme modifications non suivies.

Il ignore notamment les fichiers suivants :

- `.env`
- `.env.backend`
- `.env.frontend`
- Les dossiers générés par les dépendances

---

## `docker-compose.yml` — Orchestration Docker

Le fichier `docker-compose.yml` permet d'orchestrer l'ensemble des services du projet dans des conteneurs Docker.
Grâce à ce fichier, il est possible de lancer toute l'application (base de données, backend, frontend) avec une seule commande :

```bash
docker compose up -d --build
```

### Structure générale du fichier

Le fichier contient trois services principaux :

- `db` → Base de données PostgreSQL
- `backend` → API Express.js
- `frontend` → Application Next.js

Ils sont tous connectés au même réseau Docker interne (`app-net`) afin de pouvoir communiquer entre eux.

#### **Service `db` — Base PostgreSQL**

Le service utilise l'image officielle PostgreSQL 16 (version alpine, plus légère).

- Variables d'environnement :
  - Les informations sensibles (nom de base, utilisateur, mot de passe) sont chargées depuis un fichier `.env`.
- Volumes et initialisation :
  - `pgdata` permet de conserver les données même si le conteneur est supprimé.
  - Le dossier `bd/init` contient les scripts SQL (`01_user_schema.sql`, `02_sessions_schema.sql`, `03_article_schema.sql`, `04_artist_schema.sql`, `05_concert_schema.sql`) qui seront exécutés automatiquement à la création de la base.
- Healthcheck :
  - Le healthcheck vérifie régulièrement que la base est bien opérationnelle. Cela permet au backend de démarrer uniquement lorsque PostgreSQL est prêt.

#### **Service `backend` — API Express**

Le service backend exécute l'application Node.js compilée depuis TypeScript et met l'API Express à disposition sur le port 4000.

- Construction de l'image :
  - Le service utilise le Dockerfile situé dans `apps/backend`.
  - Le stage `dev` est utilisé pour faciliter le développement (hot-reload, dépendances complètes).
- Variables d'environnement :
  - Elles sont chargées depuis les fichiers `.env` et `.env.backend`.
- Dépendances :
  - Le backend attend que PostgreSQL soit opérationnel grâce au `depends_on` avec condition `service_healthy`.
- Ports exposés :
  - Le backend expose le port 4000, utilisé pour accéder à l'API : http://localhost:4000
- Volumes (mode développement) :
  - `./apps/backend:/app` permet d'utiliser le code local dans le conteneur (hot-reload).
  - `/app/node_modules` garantit que les dépendances installées dans Docker ne sont pas écrasées par le dossier local. (oblige a relancer le build a chaque nouvelle dépendance installée)
- Réseau :
  - Le service est connecté au réseau Docker `app-net`, lui permettant de communiquer avec PostgreSQL via son nom de service (`db`).

#### **Service `frontend` — Application Next.js**

Le frontend est compilé à partir du dossier `apps/frontend`.

- Construction de l'image :
  - Le service utilise le Dockerfile situé dans `apps/frontend` (stage `dev`).
- Dépendance au backend :
  - Le frontend se lance uniquement lorsque l'API backend est opérationnelle.
- Variables d'environnement :
  - Chargées depuis `.env` et `.env.frontend`.
  - Le polling est activé pour le hot reload (`WATCHPACK_POLLING`, `CHOKIDAR_USEPOLLING`).
- Bundler en dev :
  - Webpack est forcé (`next dev --webpack`) car Turbopack, sous Docker sur Windows, ne détecte pas toujours les changements de fichiers via les volumes.
  - Webpack + polling est plus fiable dans ce contexte.
- Ports exposés :
  - Vous pouvez accéder à l'application via : http://localhost:3000
- Volumes (mode développement) :
  - `./apps/frontend:/app` pour utiliser le code local dans le conteneur.
  - `/app/node_modules` et `/app/.next` pour isoler les dépendances et le cache du conteneur. (oblige a relancer le build a chaque nouvelle dépendance installée)

**Réseau Docker interne**

Un réseau interne nommé `app-net` est créé pour permettre aux services de communiquer.
Par exemple :

- le backend contacte PostgreSQL via `db:5432`
- le frontend contacte le backend via `backend:4000`

**Volume persistant**

Ce volume stocke les données PostgreSQL de manière permanente, même en cas de redéploiement.

#### **Dépendances Docker vs dépendances locales (important pour ESLint/TypeScript)**

Quand vous lancez `docker compose up -d`, les dépendances Node.js sont installées dans les conteneurs (`/app/node_modules`).
Avec les volumes montés (`./apps/frontend:/app` et `./apps/backend:/app`), votre IDE sur Windows peut ne pas voir ces dépendances locales.

Conséquence possible :

- Erreurs TypeScript/ESLint dans VS Code, par exemple `react/jsx-runtime` introuvable, alors que l'application tourne dans Docker.

**Installation locale recommandée (Windows PowerShell)**

Depuis la racine du projet (`vindhellfest`) :

```powershell
npm.cmd --prefix .\apps\frontend ci
npm.cmd --prefix .\apps\backend ci
```
