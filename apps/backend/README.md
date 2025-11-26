# 📦 Backend Projet Vindhellfest – Architecture & Documentation

## Sript :
- `npm run dev`	: Lancer TS + auto-reload (développement)
- `npm run build` : 	Compiler TS → JS
- `npm start	Démarrer` :  l’app compilée (production)
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
│  ├─ dbts
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
## 📁 src / 
### 📁 Controllers
### 📁 Middlewares
### 📁 Routes



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


## ↕️ List des routes API