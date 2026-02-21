# 📦 Backend Projet Vindhellfest – Architecture & Documentation
## Script :
- `docker compose up -d db backend`	: Démarrer la base de données et le backend
- `docker compose restart backend` : Redémarrer uniquement le backend
- `docker compose logs -f backend` : Consulter les logs

Pour exécuter une commande npm dans le conteneur :  `docker exec -it vindhellfest-backend`
- `npm run lint` : 	Vérifier le code (ESLint)
- `npm run lint:fix` : 	Corriger automatiquement les erreurs ESLint
- `npm run format` : 	Formater ton code auto avec Prettier
- `npm test` : Lancer les tests vitest

## Stack technique
**Dependencies**
- `bcrypt` : Permet de hasher les mots de passe avant de les stocker dans la base de données.
- `dotenv` : Charge automatiquement les variables d’environnement depuis les fichier .env.
- `express` : Framework web
- `jsonwebtoken` : Gère la création et la vérification des JSON Web Tokens
- `pg` : Client PostgreSQL pour Node.js.
- `cookie` : Parser et sérialiser les cookies HTTP côté serveur
- `express-rate-limit` : Middleware de limitation du nombre de requêtes par IP.
- `zod` : Bibliothèque de validation et de typage des données.

**DevDependencies**
- `@types/bcrypt` : Définitions TypeScript pour bcrypt.
- `@types/express` : Définitions TypeScript pour express.
- `@types/jsonwebtoken` : Définitions TypeScript pour jsonwebtoken.
- `@types/node` : Définitions TypeScript pour les fonctionnalités internes Node.js.
- `@types/pg` : Définitions TypeScript pour pg.
- `@typescript-eslint/eslint-plugin` : Plugin ESLint permettant de corriger/analyser du TypeScript.
- `@typescript-eslint/parser` : Permet à ESLint de comprendre le code TypeScript.
- `eslint` : Outil d’analyse statique du code.
- `eslint-config-prettier` : Désactive les règles ESLint qui entrent en conflit avec Prettier.
- `eslint-plugin-prettier` : Lance Prettier comme une règle ESLint.
- `prettier` : Formateur de code automatique.
- `ts-node-dev` : Comme nodemon, mais pour TypeScript.
- `typescript` : Le compilateur TypeScript.
- `vitest` : Lance les tests et vérifie les assertions.
- `supertest` : Simule un navigateur ou un client API.
- `@types/supertest` : Définitions TypeScript pour supertest.
- `@types/cookie` : Définitions TypeScript pour cookie.

## Architecture
```bash
├─ node_modules/
├─ src/
│  ├─ controllers/
│  │  ├─ admin/
│  │  │  ├─ articles/
│  │  │  │  └─ ...
│  │  │  ├─ artists/
│  │  │  │  └─ ...
│  │  │  ├─ auth/
│  │  │  │  └─ ...
│  │  │  ├─ concerts/
│  │  │  │  └─ ...
│  │  │  └─ users/
│  │  │     └─ ...
│  │  └─ public/
│  │     ├─ articles/
│  │     │  └─ ...
│  │     ├─ artists/
│  │     │  └─ ...
│  │     └─ programming/
│  │        └─ ...
│  ├─ middlewares/
│  │  └─ ...
│  ├─ routes/
│  │  └─ ...
│  ├─ schemas/
│  │  └─ ...
│  ├─ db.ts
│  ├─ app.ts
│  ├─ type.ts
│  ├─ functions.ts
│  └─ index.ts/
├─ test/
│  ├─ integration/
│  │  └─ ...
│  └─ unitaire/
│     └─ ...
├─ .eslintrc.json
├─ .prettierignore
├─ .prettierc
├─ Dockerfile
├─ eslint.config.cjs
├─ .package-lock.json
├─ .package.json
├─ README.MD
└─ tsconfig.json
```
## 📄 Dockerfile
Le projet utilise un Dockerfile multi-stage pour generer deux types d'images a partir du meme fichier :
une image de developpement et une image de production.
- Stage `builder` utilise `node:20-alpine`
- Image de production (`runner`)
- Image de developpement (`dev`)

## 📁 src /
### 📁 controllers
Contient la logique métier des endpoints et la gestion des requêtes/réponses.

### 📁 middlewares
Contient les middlewares transverses (auth, validation, logs, erreurs).

### 📁 routes
Déclare les routes HTTP et connecte chaque endpoint à son contrôleur.
POST /admin/auth/login
POST /admin/auth/logout
POST /admin/users

### 📄 db.ts
Ce fichier centralise la configuration de la connexion à la base de données PostgreSQL ainsi qu’une fonction utilitaire permettant d’exécuter facilement des requêtes SQL depuis le backend.
**Rôle du fichier**
- Charger les variables d’environnement (fichier .env) grâce à dotenv
- Créer un pool de connexions PostgreSQL via le module pg
- Exposer une fonction query() qui simplifie l’exécution de requêtes SQL
- Éviter la répétition de code lors des interactions avec la base de données

### 📄 app.ts 
Ce fichier est responsable de la création et de la configuration de l’application Express
Il permet de séparer la création de l’API de son exécution, afin de faciliter les tests automatisés et la maintenabilité du code.
**Rôle du fichier**
- Créer l’application Express
- Configurer les middlewares globaux (JSON, sécurité, etc.)
- Monter les routes de l’API
- Exporter l’application via une fonction (createApp) sans lancer le serveur

### 📄 index.ts 
Il est responsable de l’exécution du serveur HTTP, à partir de l’application Express configurée dans app.ts.
**Rôle du fichier**
- Charger les variables d’environnement (via dotenv)
- Importer l’application Express depuis app.ts
- Démarrer le serveur HTTP avec app.listen sur le port configuré

### 📄 type.ts
Définit les types et interfaces partagés du backend.

### 📄 functions.ts
Centralise les fonctions utilitaires réutilisables.

## 📁 test
Ce dossier regroupe les tests unitaires et d’intégration : Vitest exécute les tests tandis que Supertest permet de simuler des appels HTTP sur l’API. 
- Les tests unitaires ciblent les fonctions/modules isolés
- Les tests d’intégration valident plusieurs couches ensemble (middlewares + contrôleurs) utilisant plusieurs fonctions.

## ESLint & Prettier
Dans ce projet, deux outils complémentaires assurent la qualité du code :

### ESLint — Analyseur de code
ESLint est un analyseur statique qui vérifie le code TypeScript/JavaScript pour détecter :
- erreurs de logique
- mauvaises pratiques
- variables non utilisées
- types incorrects
- règles de style définies par l’équipe
- incohérences dans l’organisation du code

### Prettier — Formateur automatique (style du code uniquement)
Il ne vérifie pas les bugs, il s’occupe uniquement de :
- indentation
- guillemets
- trailing commas
- espaces
- retours à la ligne
- mise en forme des objets et fonctions



