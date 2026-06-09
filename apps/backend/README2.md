# Backend — Vindhellfest

## 1. Introduction

### 1.1. Rôle du backend dans l'architecture globale

Le backend est l'une des trois couches de l'architecture du projet Vindhellfest, aux côtés du frontend Next.js et de la base de données PostgreSQL. Il est le seul service à accéder directement à la base de données : ni le frontend, ni le navigateur ne peuvent interroger PostgreSQL directement. Toute donnée transite obligatoirement par l'API REST qu'il expose.

Dans l'architecture Docker, le backend tourne dans un conteneur dédié (`vindhellfest-backend`) accessible sur le port `4000`. Il occupe une position centrale dans le réseau interne Docker `app-net` :

| Appelant                        | Adresse utilisée          | Raison                                               |
| ------------------------------- | ------------------------- | ---------------------------------------------------- |
| Frontend (SSR, layouts serveur) | `http://backend:4000`     | Communication interne au réseau Docker `app-net`     |
| Frontend (navigateur client)    | `http://localhost:4000`   | Le navigateur ne connaît pas le réseau Docker        |
| Base de données PostgreSQL      | `postgresql://db:5432`    | Hostname `db` résolu par Docker sur le réseau `app-net` |

Le backend remplit trois responsabilités principales :

1. **API REST** — expose les endpoints consommés par le frontend, organisés en deux préfixes : `/public` pour les données accessibles sans authentification, `/admin` pour les opérations protégées.
2. **Authentification et sessions** — gère l'intégralité du cycle de vie des sessions : création du JWT à la connexion, vérification à chaque requête protégée, révocation à la déconnexion. Les sessions sont persistées en base de données, ce qui permet de les invalider côté serveur.
3. **Fichiers uploadés** — traite les images envoyées par l'administration (artistes, actualités), les convertit au format WebP via Sharp, et les sert statiquement via `/uploads/*`. Le frontend proxifie ces URLs vers le backend de manière transparente via une règle `rewrite` dans `next.config.ts`.

Le backend dépend de la base de données pour démarrer : Docker Compose configure un `healthcheck` sur le conteneur `db` et le `depends_on` du backend attend que PostgreSQL soit prêt avant de lancer le processus Node.js.

---

### 1.2. Objectifs techniques et choix d'Express.js 5

Express.js 5 a été retenu comme framework HTTP pour plusieurs raisons qui répondent directement aux besoins du projet.

**Gestion native des erreurs async**

Express 5 introduit la propagation automatique des erreurs dans les handlers asynchrones : si un `async` handler lance une exception, Express la transmet directement au middleware d'erreur sans nécessiter de `try/catch` manuel ni de wrapper `next(err)`. Cette évolution simplifie considérablement l'écriture des controllers — le projet en tire parti via son wrapper `asyncHandler` qui reste explicite et lisible pour les versions antérieures mais s'aligne sur le comportement natif d'Express 5.

**Légèreté et contrôle total**

Contrairement à des frameworks plus opinionnés (NestJS, Fastify avec plugins), Express impose peu de structure par défaut. Pour un projet de taille maîtrisée comme Vindhellfest, cette légèreté est un avantage : chaque couche (middlewares, routing, validation, services) est assemblée explicitement, ce qui facilite la lecture et l'explication du code dans un contexte pédagogique.

**Compatibilité avec l'écosystème Node.js**

Express 5 reste compatible avec l'ensemble des middlewares et bibliothèques de l'écosystème Node.js (`multer`, `express-rate-limit`, `jsonwebtoken`, `pg`…) sans couche d'abstraction supplémentaire.

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

### 2.2. Dépendances de production

### 2.3. Dépendances de développement

---

## 3. Architecture — carte du projet

### 3.1. Arbre des dossiers annoté

### 3.2. Séparation routes / controllers / services / middlewares

### 3.3. Flux d'une requête de bout en bout

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
