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

## Stack technique
**Dependencies**
- `bcrypt` : Permet de hasher les mots de passe avant de les stocker dans la base de données.
- `dotenv` : Charge automatiquement les variables d’environnement depuis les fichier .env.
- `express` : Framework web
- `jsonwebtoken` : Gère la création et la vérification des JSON Web Tokens
- `pg` : Client PostgreSQL pour Node.js.

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

## Architecture
```bash
├─ node_modules/
├─ src/
│  ├─ controllers/
│  │  └─ ...
│  ├─ middlewares/
│  │  └─ ...
│  ├─ routes/
│  │  └─ ...
│  ├─ db.ts
│  ├─ app.ts
│  └─ index.ts/
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

### 📁 Controllers

### 📁 Middlewares

### 📁 Routes

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
mise en forme des objets et fonctions

## List des routes API
### 1) Auth & Session (Admin)

| Feature            | Méthode | Endpoint                   | Auth | Body (req)              | Réponse (succès)                          | Erreurs / règles |
|--------------------|---------|----------------------------|------|--------------------------|-------------------------------------------|------------------|
| Connexion admin    | POST    | /api/v1/auth/login         | ❌   | `{ email, password }`    | 200 `{ user }` + Set-Cookie session       | 400 champs invalides, 401 identifiants invalides, 429 trop de tentatives (verrouillage) |
| Session courante   | GET     | /api/v1/auth/me            | ✅   | —                        | 200 `{ user }`                            | 401 si non connecté |
| Déconnexion        | POST    | /api/v1/auth/logout        | ✅   | —                        | 204 + cookie supprimé                     | 401 si non connecté |