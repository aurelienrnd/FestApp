# 📦 Backend Projet Vindhellfest – Architecture & Documentation
## Sript :
- `docker compose up -d db backend`	: Démarrer la base de données et le backend
- `docker compose restart backend` : Redémarrer uniquement le backend
- `docker compose logs -f backend` : Consulter les logs

Pour exécuter une commande npm dans le conteneur :  `docker exec -it vindhellfest-backend`
- `npm test	Placeholder` :  (aucun test configuré)
- `npm run lint` : 	Vérifier le code (ESLint)
- `npm run lint:fix` : 	Corriger automatiquement les erreurs ESLint
- `npm run format` : 	Formater ton code auto avec Prettier
- `npm test` : Lancer les tests vitetest

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
│  │  └─ auth/
│  ├─ middlewares/
│  │  └─ ...
│  ├─ routes/
│  │  └─ ...
│  ├─ db.ts
│  ├─ app.ts
│  └─ index.ts/
│
├─ test/
│  └─ integration/
│     └─ ...
│
├─ .eslintrc.json
├─ .prettierignore
├─ .prettierc
├─ Dockerfile
├─ .package-lock.json
├─ README.MD
└─ tsconfig.json
```
## 📄 Dockerfile
Ce Dockerfile définit la manière dont l’application backend TypeScript est compilée, puis packagée dans une image Docker.

## 📁 src / 
### 📁 controllers
On y retrouve les controllers, divises en plusieurs sections pour chaque route créée
#### 📁 auth
On y retrouve les Controllers en charge de l'authentification d'un utilisateur à l'application

- 📄 login.controller.ts : Controller utilisée à la connexion d'un utilisateur
  - Il verifie que l'utilisateur existe, que le mot de passe est correct et que l'utilisateur est actif dans la BDD
  - Créer la session dans la BDD et creer un refrech token
  - Créer un Jwt comportant l'id de l'utilisateur et son "role"
  - Les ajoutes au sien de cookies dans le header et renvoie la réponse

### 📁 middlewares
On y retrouve les Middlewares partagés par l'ensemble de l'application

- 📄 rateLimitLogin.ts : est une fonction init avec express-rate-limit qui retourne un middleware express limitant le nombre de requetes possibles depuis la meme adresse ip
- 📄 validateBody.ts : est une fonction avec un schema en paramètre permerttant grace au package Zod de valider si les donnée envoyées par le front respectent des regles (exemple type de la donnée, taille de la string ou regEx)

### 📁 routes
On y retrouve les Routes partagés par l'ensemble de l'application
### 📄 On y retrouve les Route en charge de l'authentification d'un utilisateur à l'application
    api/auth/login
- Routes en charge de l’authentification d’un utilisateur.

| Méthode | Chemin | Fichier | Contrôleur | Middlewares |
|---|---|---|---|---|
| POST | /api/auth/login | `apps/backend/src/routes/auth.routes.ts` | `apps/backend/src/controllers/auth/login.controller.ts` | `validateBody`, `rateLimitLogin` |

| Élément | Description |
|---|---|
| Body attendu | `{ email: string, password: string }` |
| 200 OK | token/session |
| 400 Bad Request | validation |
| 401 Unauthorized | identifiants invalides |
  

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

### 📄 functions.ts

### 📄 types.ts 

## 📁 test
Ce dossier regroupe les tests automatisés du backend. 
Les tests d’intégration utilisent Vitest et Supertest pour vérifier le bon fonctionnement des endpoints Express sans lancer un serveur réel (l’application est importée depuis app.ts).

### 📄 health.test.ts

### 📄 debug_db.test.ts

### 📄 auh.test.ts 

## ESLint & Prettier
Dans ce projet, deux outils complémentaires assurent la qualité du code :

### ESLint — Analyseur de code
ESLint est un analyseur statique qui vérifie ton code TypeScript/JavaScript pour détecter :
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

## List des routes API
