# Frontend — Vindhellfest

## 1. Introduction

### 1.1. Rôle du frontend dans l'architecture globale

Le frontend est l'une des trois couches de l'architecture du projet Vindhellfest, aux côtés du backend Express.js et de la base de données PostgreSQL. Il est le seul point de contact entre l'utilisateur et le système : il consomme l'API REST exposée par le backend, présente les données et gère les interactions.

Dans l'architecture Docker, le frontend tourne dans un conteneur dédié (`vindhellfest-frontend`) accessible sur le port `3000`. Il communique avec le backend de deux façons selon le contexte d'exécution :

| Contexte                      | URL utilisée                                         | Raison                                              |
| ----------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| Côté serveur (SSR, layouts) | `http://backend:4000` via `API_URL_SERVER`        | Communication interne au réseau Docker `app-net` |
| Côté client (navigateur)    | `http://localhost:4000` via `NEXT_PUBLIC_API_URL` | Le navigateur ne connaît pas le réseau Docker     |

Les fichiers statiques uploadés (images d'artistes, etc.) sont également servis via le frontend grâce à une règle de réécriture (`rewrite`) dans `next.config.ts` qui proxifie les requêtes `/uploads/*` vers le backend.

### 1.2. Objectifs techniques et choix de Next.js App Router

Next.js 16 avec l'**App Router** a été retenu pour plusieurs raisons qui répondent directement aux besoins du projet.

**Rendu hybride SSR / Client**

L'application mélange des pages publiques (accueil, artistes, actualités) et une zone d'administration protégée. L'App Router permet de choisir précisément la stratégie de rendu par composant : les pages publiques bénéficient du rendu serveur (SSR) pour le SEO et la performance, tandis que les interactions dynamiques (formulaires, modales, filtres) sont gérées par des composants client (`"use client"`).

**Protection de la zone admin côté serveur**

Le layout `admin/layout.tsx` est un composant serveur asynchrone : il effectue une requête vers l'endpoint `/admin/auth/me` du backend avant même de rendre la page. Si la session est absente ou invalide, Next.js redirige immédiatement vers `/login` côté serveur — sans que le moindre contenu admin ne soit envoyé au navigateur. Cette approche est plus sûre qu'une protection purement côté client.

**Route Groups pour une architecture multi-layout**

L'App Router introduit le concept de **Route Groups** (dossiers entre parenthèses comme `(public)` et `(auth)`) : ils permettent de regrouper des routes sous un layout commun sans que le nom du dossier n'apparaisse dans l'URL. Le projet en tire parti pour appliquer trois thèmes visuels distincts — visiteur, authentification, administration — sans duplication de code.

**Gestion native des polices et des métadonnées**

Next.js intègre nativement l'optimisation des polices Google (`next/font`) et la gestion des métadonnées SEO (`export const metadata`), deux fonctionnalités utilisées dès le layout racine.

---

## 2. Stack technique

### 2.1. Tableau des technologies et versions

| Technologie           | Version     | Rôle                                                                  |
| --------------------- | ----------- | ---------------------------------------------------------------------- |
| Next.js               | 16.1.6      | Framework React — App Router, SSR, routing, optimisation d'images     |
| React                 | 19.2.3      | Bibliothèque UI — composants, état, contexte                        |
| TypeScript            | ^5          | Typage statique strict sur l'ensemble du code                          |
| Tailwind CSS          | ^4          | Styles utilitaires — via PostCSS, intégré sans fichier de config JS |
| Vitest                | ^4.0.18     | Framework de tests unitaires et composants                             |
| React Testing Library | ^16.3.2     | Tests d'intégration des composants React                              |
| ESLint                | ^9          | Analyse statique du code — règles Next.js intégrées                |
| Prettier              | ^3.8.1      | Formatage automatique du code                                          |
| Node.js               | 20 (Alpine) | Environnement d'exécution du conteneur Docker                         |

### 2.2. Dépendances de production

Ce sont les packages embarqués dans l'image finale et nécessaires au fonctionnement de l'application en production.

**Next.js, React, React DOM** (`next ^16.1.6`, `react 19.2.3`, `react-dom 19.2.3`)

Le cœur du framework. `react-dom` est le package qui assure le rendu React dans le navigateur. Next.js orchestre le tout : routing, SSR, optimisation des assets, gestion des polices.

**FontAwesome** (`@fortawesome/fontawesome-svg-core`, `free-solid-svg-icons`, `free-regular-svg-icons`, `free-brands-svg-icons`, `react-fontawesome`)

Bibliothèque d'icônes SVG utilisée dans toute l'interface (navigation, boutons, réseaux sociaux dans le footer). Le package `react-fontawesome` expose le composant `<FontAwesomeIcon>`. Le CSS auto-injection est désactivé (`config.autoAddCss = false`) dans le layout racine pour éviter les flash de style — les styles sont importés manuellement via `@fortawesome/fontawesome-svg-core/styles.css`.

**react-modal** (`^3.16.3`)

Gestion des fenêtres modales accessibles (focus trap, aria). Utilisé pour toutes les modales de l'administration (ajout d'artiste, ajout d'actualité, suppression, changement de mot de passe). Nécessite une initialisation globale de l'`appElement` pour l'accessibilité, gérée dans le composant `ModalSetup`.

### 2.3. Dépendances de développement

Ces packages ne sont présents que pendant le développement et les tests. Ils ne sont pas inclus dans l'image de production (`npm ci --omit=dev`).

**Tailwind CSS + PostCSS** (`tailwindcss ^4`, `@tailwindcss/postcss ^4`)

Tailwind CSS 4 abandonne le fichier `tailwind.config.js` au profit d'une intégration directe via PostCSS. Le plugin `@tailwindcss/postcss` est le seul point d'entrée — Tailwind scanne automatiquement les fichiers source et génère uniquement les classes utilisées.

**TypeScript + types** (`typescript ^5`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/react-modal`)

Le compilateur TypeScript et les définitions de types pour Node.js et les bibliothèques React. Aucun `any` n'est autorisé dans le projet — le mode `strict` est activé dans `tsconfig.json`.

**Vitest** (`vitest ^4.0.18`)

Framework de tests rapide, compatible avec la syntaxe Jest. Utilisé en mode `jsdom` pour simuler un environnement navigateur lors des tests de composants.

**React Testing Library** (`@testing-library/react ^16.3.2`, `@testing-library/jest-dom ^6.9.1`, `@testing-library/user-event ^14.6.1`)

Ensemble de trois packages complémentaires pour tester les composants React du point de vue de l'utilisateur : `react` pour le rendu et les queries, `jest-dom` pour les matchers DOM (`toBeInTheDocument`, `toHaveClass`…), `user-event` pour simuler les interactions clavier et souris.

**jsdom** (`^27.4.0`)

Implémentation JavaScript du DOM utilisée par Vitest pour simuler le navigateur dans un environnement Node.js. Configuré comme environnement de test dans `vitest.config.ts`.

**ESLint** (`eslint ^9`, `eslint-config-next 16.1.4`)

Analyse statique du code. `eslint-config-next` active les règles spécifiques à Next.js (utilisation correcte de `<Image>`, `<Link>`, règles d'accessibilité…).

**Prettier** (`prettier ^3.8.1`)

Formateur de code automatique. Lancé via `npm run format` qui réécrit tous les fichiers selon les règles définies dans `.prettierrc`.

---

## 3. Architecture — carte du projet

### 3.1. Arbre des dossiers annoté

```
apps/frontend/
│
├── src/
│   ├── app/                          # Routage Next.js App Router
│   │   ├── layout.tsx                # Layout racine — squelette HTML, polices, styles globaux
│   │   ├── globals.css               # Classes composants (@layer components)
│   │   ├── tokens.css                # Design tokens CSS (couleurs, typographie, espacements)
│   │   ├── animations.css            # Keyframes et classes d'animation
│   │   │
│   │   ├── (public)/                 # Route Group — thème visiteur
│   │   │   ├── layout.tsx            # Layout public : Banner + Footer (thème visitor)
│   │   │   ├── page.tsx              # Page d'accueil /
│   │   │   ├── HomeHero.tsx          # Section héro de la page d'accueil
│   │   │   ├── HomeNews.tsx          # Section actualités de la page d'accueil
│   │   │   ├── HomeProgrammation.tsx # Section programmation de la page d'accueil
│   │   │   ├── HomePartenaires.tsx   # Section partenaires de la page d'accueil
│   │   │   ├── HomeInfosPratiques.tsx# Section infos pratiques de la page d'accueil
│   │   │   ├── artists/
│   │   │   │   ├── page.tsx          # Page /artists — liste des artistes
│   │   │   │   └── [id]/page.tsx     # Page /artists/[id] — fiche artiste
│   │   │   ├── news/
│   │   │   │   ├── page.tsx          # Page /news — liste des actualités
│   │   │   │   └── [id]/page.tsx     # Page /news/[id] — détail d'une actualité
│   │   │   └── practical-info/
│   │   │       └── page.tsx          # Page /practical-info — informations pratiques
│   │   │
│   │   ├── (auth)/                   # Route Group — thème authentification
│   │   │   ├── layout.tsx            # Layout auth : Banner + Footer (thème admin)
│   │   │   └── login/
│   │   │       └── page.tsx          # Page /login — formulaire de connexion
│   │   │
│   │   └── admin/                    # Zone administration (protégée côté serveur)
│   │       ├── layout.tsx            # Layout admin : vérif session + AdminUserProvider
│   │       ├── dashboard/
│   │       │   ├── page.tsx          # Page /admin/dashboard
│   │       │   ├── DashboardContent.tsx
│   │       │   └── ChangePasswordModal.tsx
│   │       ├── artists/
│   │       │   ├── page.tsx          # Page /admin/artists
│   │       │   ├── ArtistEditButton.tsx
│   │       │   └── [id]/page.tsx     # Page /admin/artists/[id]
│   │       ├── news/
│   │       │   ├── page.tsx          # Page /admin/news
│   │       │   ├── NewsEditButton.tsx
│   │       │   └── [id]/page.tsx     # Page /admin/news/[id]
│   │       └── users/
│   │           ├── page.tsx          # Page /admin/users
│   │           ├── UsersContent.tsx
│   │           └── AddUserModal.tsx
│   │
│   ├── components/                   # Composants partagés entre plusieurs pages
│   │   ├── Banner.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── AdminUserProvider.tsx
│   │   ├── ArtistsContent.tsx
│   │   ├── ArtistDetailContent.tsx
│   │   ├── NewsContent.tsx
│   │   ├── NewsDetailContent.tsx
│   │   ├── ContactUs.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── LegalMention.tsx
│   │   ├── LoadingLine.tsx
│   │   ├── MobileFiltersButton.tsx
│   │   ├── ModalSetup.tsx
│   │   ├── ModalCloseButton.tsx
│   │   ├── SectionCta.tsx
│   │   ├── SideBarTool.tsx
│   │   └── modals/
│   │       ├── AddArtistModal.tsx
│   │       ├── AddNewsModal.tsx
│   │       └── DeleteModal.tsx
│   │
│   ├── hooks/                        # Hooks React personnalisés
│   │   ├── useFetch.ts
│   │   ├── useMutation.ts
│   │   ├── useDelete.ts
│   │   ├── useModal.ts
│   │   ├── useNavPath.ts
│   │   └── useRoleGuard.ts
│   │
│   ├── functions/                    # Fonctions utilitaires pures (pas de React)
│   │   ├── apiRequest.ts
│   │   ├── fetchPublic.ts
│   │   ├── getApiErrorMessage.ts
│   │   ├── formatDate.ts
│   │   └── validation.ts
│   │
│   ├── config/                       # Données de configuration statiques
│   │   ├── ui.ts
│   │   └── festival.ts
│   │
│   ├── type.ts                       # Types TypeScript métier centralisés
│   └── declarations.d.ts             # Déclarations de modules pour TypeScript
│
├── public/                           # Assets statiques servis directement par Next.js
├── next.config.ts
├── tsconfig.json
├── eslint.config.js (mjs)
├── vitest.config.ts
├── postcss.config.mjs
├── .prettierrc
├── .prettierignore
├── Dockerfile
├── .dockerignore
└── package.json
```

### 3.2. Principe des Route Groups `(public)` / `(auth)` / `admin`

L'App Router de Next.js permet de créer des **Route Groups** en nommant un dossier entre parenthèses, par exemple `(public)`. Le nom entre parenthèses est **ignoré dans l'URL** : il ne sert qu'à organiser les fichiers et à appliquer un layout commun à un groupe de routes.

Le projet exploite ce mécanisme pour définir trois zones visuellement et fonctionnellement distinctes, sans que cette organisation n'apparaisse dans les URLs.

| Dossier       | URLs concernées                                    | Layout appliqué                        | Thème CSS               |
| ------------- | --------------------------------------------------- | --------------------------------------- | ------------------------ |
| `(public)/` | `/`, `/artists`, `/news`, `/practical-info` | Banner + Footer                         | `data-theme="visitor"` |
| `(auth)/`   | `/login`                                          | Banner + Footer                         | `data-theme="admin"`   |
| `admin/`    | `/admin/*`                                        | Banner + Footer + vérification session | `data-theme="admin"`   |

**Pourquoi `(auth)` partage-t-il le thème admin ?**

La page de connexion est destinée aux membres de l'association, pas aux visiteurs publics. Elle adopte donc la palette de couleurs de l'espace admin pour signaler visuellement qu'on entre dans un espace privé — même si l'utilisateur n'est pas encore authentifié.

**Pourquoi `admin/` n'est-il pas un Route Group ?**

La zone admin utilise un dossier `admin/` sans parenthèses car son nom doit apparaître dans les URLs (`/admin/dashboard`, `/admin/artists`…). Contrairement aux Route Groups, ce dossier fait partie du chemin réel. Son layout est en revanche le plus complexe des trois : c'est un composant serveur asynchrone qui vérifie la session avant tout rendu (voir section 11.5).

### 3.3. Séparation pages / composants / hooks / functions / config

L'architecture du `src/` suit un principe de séparation des responsabilités strict : chaque dossier a un rôle unique et les dépendances ne circulent que dans un sens.

```
config/  ──►  functions/  ──►  hooks/  ──►  components/  ──►  app/ (pages)
  │                                              ▲
  └──────────────────────────────────────────────┘
              type.ts  (transversal)
```

| Dossier         | Responsabilité                                                                               | Ce qu'il ne fait pas                                                       |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `app/`        | Routing, layouts, pages — orchestration des composants et des données SSR                   | Pas de logique UI réutilisable — chaque page délègue aux composants    |
| `components/` | Composants React réutilisables entre plusieurs pages                                         | Pas d'appel `fetch` brut — passe toujours par un hook ou `functions/` |
| `hooks/`      | Logique stateful réutilisable (fetch, mutation, modale…)                                    | Pas de rendu JSX — retourne uniquement des données et des fonctions      |
| `functions/`  | Fonctions pures sans état React (fetch, formatage, erreurs, validation)                      | Pas d'import de hooks ou composants React                                  |
| `config/`     | Données de référence et fonctions utilitaires liées à l'UI (navigation, filtres, rôles) | Pas d'état React, pas d'appel réseau                                     |
| `type.ts`     | Types TypeScript partagés entre tous les dossiers                                            | Source de vérité unique — aucun type métier dupliqué ailleurs         |

Cette organisation garantit que chaque fichier reste testable indépendamment et que l'on peut retrouver n'importe quel élément de l'application sans ambiguïté.

---

## 4. Fichiers de configuration

### 4.1. `next.config.ts`

```ts
const nextConfig: NextConfig = {
  async rewrites() { ... },
  images: { remotePatterns: [...] },
};
```

Ce fichier configure le comportement global de Next.js. Il contient deux blocs :

**`rewrites`** — Proxification des fichiers uploadés

Les images d'artistes sont stockées sur le backend (`/uploads/*`). Pour qu'elles soient accessibles depuis le navigateur sans exposer le port `4000`, une règle de réécriture redirige silencieusement toutes les requêtes `/uploads/*` vers `http://backend:4000/uploads/*`. L'URL vue par le navigateur reste propre (`/uploads/image.jpg`) et le backend reste le seul service à gérer les fichiers.

**`images.remotePatterns`** — Sources d'images autorisées

Le composant `<Image>` de Next.js optimise et sécurise les images distantes. Pour qu'il accepte une URL externe, la source doit être explicitement autorisée. Deux patterns sont déclarés : HTTPS sur tous les domaines (pour les images hébergées en ligne) et HTTP sur `localhost` (pour le développement local).

---

### 4.2. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "noEmit": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Ce fichier contrôle le comportement du compilateur TypeScript. Les options clés du projet :

| Option               | Valeur                 | Effet                                                                                                   |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `strict`           | `true`               | Active toutes les vérifications strictes — interdit `any` implicite, `null` non vérifié, etc.   |
| `noEmit`           | `true`               | TypeScript vérifie les types mais ne génère pas de fichiers JS — c'est Next.js qui compile          |
| `target`           | `ES2017`             | Code compilé compatible avec les navigateurs modernes et Node.js 20                                    |
| `moduleResolution` | `bundler`            | Résolution de modules adaptée aux bundlers modernes (Next.js / Webpack / Turbopack)                   |
| `paths`            | `@/*` → `./src/*` | Alias d'import —`import X from "@/components/X"` au lieu de chemins relatifs profonds                |
| `isolatedModules`  | `true`               | Chaque fichier est traité indépendamment, requis pour la compatibilité avec les transpileurs rapides |
| `plugins`          | `next`               | Plugin TypeScript officiel Next.js — autocomplétion et validation dans les Server Components          |

---

### 4.3. `eslint.config.mjs`

```js
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([...nextVitals, ...nextTs, globalIgnores([...])]);
```

ESLint 9 utilise le nouveau format de configuration "flat config" (un tableau de règles, sans `.eslintrc`). Deux préréglages sont activés :

- **`eslint-config-next/core-web-vitals`** — règles Next.js de base + règles axées sur les Core Web Vitals (performance, accessibilité, utilisation correcte de `<Image>`, `<Link>`, `<Script>`…)
- **`eslint-config-next/typescript`** — règles TypeScript spécifiques à Next.js (typage des props de pages, Server Components…)

Le bloc `globalIgnores` exclut les dossiers générés (`.next/`, `build/`, `out/`) et le fichier `next-env.d.ts` (généré automatiquement, ne doit pas être analysé).

---

### 4.4. `vitest.config.ts`

```ts
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
```

Ce fichier configure l'environnement de test. Trois paramètres essentiels :

**`environment: "jsdom"`** — Vitest tourne dans Node.js, qui n'a pas de DOM natif. jsdom simule un navigateur complet (HTML, CSS, événements) pour permettre de rendre des composants React et d'interagir avec eux dans les tests.

**`globals: true`** — Active les globals de test (`describe`, `it`, `expect`, `vi`…) sans avoir à les importer dans chaque fichier de test.

**`setupFiles`** — Exécute `tests/setup.ts` avant chaque suite de tests. Ce fichier importe les matchers `@testing-library/jest-dom` (`toBeInTheDocument`, `toHaveClass`…) pour qu'ils soient disponibles globalement.

**`resolve.alias`** — Reproduit l'alias `@/` du `tsconfig.json` pour que les imports fonctionnent de la même façon dans les tests que dans le code source.

---

### 4.5. `postcss.config.mjs`

```js
const config = {
  plugins: { "@tailwindcss/postcss": {} },
};
```

PostCSS est le preprocesseur CSS utilisé par Next.js. Ce fichier lui indique quels plugins appliquer lors de la compilation des styles.

Tailwind CSS 4 a abandonné son fichier de configuration dédié (`tailwind.config.js`) : toute la configuration passe désormais directement dans les fichiers CSS via des directives (`@theme`, `@layer`…). Le plugin `@tailwindcss/postcss` est le seul point d'entrée nécessaire — il scanne automatiquement les fichiers `.tsx` et `.ts` du projet pour détecter les classes utilisées et générer uniquement le CSS correspondant.

---

### 4.6. `.prettierrc` / `.prettierignore`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "endOfLine": "auto"
}
```

Prettier formate automatiquement le code à chaque exécution de `npm run format`. Les règles définies :

| Règle          | Valeur    | Signification                                                        |
| --------------- | --------- | -------------------------------------------------------------------- |
| `semi`        | `true`  | Point-virgule obligatoire en fin d'instruction                       |
| `singleQuote` | `false` | Guillemets doubles pour les chaînes de caractères                  |
| `tabWidth`    | `2`     | Indentation à 2 espaces                                             |
| `endOfLine`   | `auto`  | Fin de ligne adaptée à l'OS (LF sur Linux/macOS, CRLF sur Windows) |

`.prettierignore` exclut du formatage les fichiers qui n'ont pas à être touchés : `node_modules/`, `.next/`, et les fichiers Markdown (`README.md`, `STYLE.md`) pour éviter de reformater la documentation.

---

### 4.7. `Dockerfile`

Le Dockerfile du frontend est organisé en **trois stages multi-étapes** :

**Stage `deps`** — Installation des dépendances

Copie uniquement `package.json` et `package-lock.json` puis exécute `npm ci`. Ce stage est mis en cache par Docker : il ne se réexécute que si les fichiers de dépendances changent, pas à chaque modification du code source.

**Stage `builder`** — Compilation de l'application

Part du stage `deps`, copie le code source et exécute `npm run build`. Next.js compile le projet et génère le dossier `.next/` contenant les pages pré-rendues et les assets optimisés.

**Stage `runner`** — Image de production

Repart d'une image Node.js propre, installe uniquement les dépendances de production (`npm ci --omit=dev`), puis copie depuis `builder` uniquement les fichiers nécessaires au démarrage : `.next/`, `public/` et `next.config.ts`. L'image finale ne contient ni le code source, ni les devDependencies, ni le cache de compilation.

**Stage `dev`** — Image de développement

Copie le code source et démarre avec `npm run dev`. Le code source n'est pas embarqué dans l'image mais monté depuis l'hôte via un volume Docker, ce qui permet le hot reload.

---

### 4.8. `.dockerignore`

```
node_modules
.next
.git
.gitignore
npm-debug.log
yarn-error.log
.env
.env.local
```

Ce fichier indique à Docker quels fichiers ne pas envoyer au daemon lors du `docker build`. Sans lui, Docker enverrait l'intégralité du dossier `frontend/` — y compris `node_modules/` (potentiellement plusieurs centaines de Mo) et `.next/` — ce qui alourdirait inutilement le contexte de build et ralentirait chaque compilation.

Les fichiers `.env` sont également exclus : les variables d'environnement sont injectées au moment du démarrage du conteneur via `docker-compose.yml`, pas au moment du build.

---

### 4.9. `.gitignore`

Ce fichier indique à Git quels fichiers ne pas versionner. Les catégories exclues :

| Catégorie      | Fichiers / Dossiers                  | Raison                                                       |
| --------------- | ------------------------------------ | ------------------------------------------------------------ |
| Dépendances    | `node_modules/`                    | Recréées via `npm ci`, ne doivent pas être versionnées |
| Build Next.js   | `.next/`, `out/`, `build/`     | Générés à la compilation, varient selon l'environnement  |
| Variables d'env | `.env*`                            | Contiennent des secrets — ne jamais commiter                |
| TypeScript      | `*.tsbuildinfo`, `next-env.d.ts` | Fichiers de cache et de types générés automatiquement     |
| Logs            | `npm-debug.log*`, `yarn-*.log*`  | Fichiers de debug locaux                                     |
| OS              | `.DS_Store`, `*.pem`             | Fichiers système macOS et certificats locaux                |

---

## 5. Système de types — `src/type.ts`

### 5.1. Pourquoi centraliser les types

Tous les types TypeScript partagés entre plusieurs fichiers sont regroupés dans un fichier unique : `src/type.ts`. Ce choix répond à plusieurs problèmes concrets.

**Éviter la duplication et les désynchronisations**

Sans fichier central, chaque développeur redéfinit localement le même type `ArtistItem` dans les fichiers qui en ont besoin. Si la structure de la réponse API évolue (ajout d'un champ, changement d'un type nullable), il faut retrouver et corriger toutes les définitions dispersées. Avec un fichier unique, une seule modification se propage partout.

**Aligner le frontend sur le contrat de l'API**

Les types du frontend sont alignés sur les réponses JSON du backend.

**Faciliter la revue de code et l'onboarding**

Un nouveau développeur peut comprendre l'ensemble du modèle de données frontend en lisant un seul fichier de moins de 100 lignes, sans avoir à parcourir l'ensemble des composants.

> Les types propres à un seul composant (utilisés nulle part ailleurs) restent locaux à leur fichier avec une déclaration `type` locale — seuls les types réutilisés dans 2+ fichiers remontent dans `src/type.ts`.

---

### 5.2. Liste et description de chaque type métier

Le fichier est organisé en quatre sections : `USERS`, `NEWS`, `ARTISTS` et `UI/API`.

#### Section `USERS`

**`UserRole`**

```ts
type UserRole = "admin" | "artists" | "news";
```

Union littérale des trois rôles autorisés dans l'application. C'est le miroir exact de l'ENUM PostgreSQL `user_role` défini en base de données. Utilisé dans `UserItem` et dans la logique de filtrage de navigation (`filterNavByRole` dans `config/ui.ts`).

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

Représente une ligne utilisateur complète telle que retournée par l'API. `password_changed_at` est nullable : il est `null` tant que l'utilisateur n'a jamais changé son mot de passe — ce qui déclenche la modale de changement obligatoire à la première connexion.

**`AdminUser`**

```ts
type AdminUser = Omit<UserItem, "created_at" | "password_changed_at">;
```

Version allégée de `UserItem`, construite par composition avec `Omit`. Représente les données de l'utilisateur connecté telles que retournées par `GET /admin/auth/me` — sans les champs de date inutiles au contexte d'affichage.

**`AdminAuthMeResponse`**

```ts
type AdminAuthMeResponse = {
  user: AdminUser;
  mustChangePassword: boolean;
};
```

Envelope complète de la réponse de `GET /admin/auth/me`. Le champ `mustChangePassword` est calculé côté backend et indique si l'utilisateur doit changer son mot de passe avant d'accéder à l'administration. Utilisé dans `admin/layout.tsx` pour injecter ces données dans le contexte via `AdminUserProvider`.

---

#### Section `NEWS`

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

Représente une actualité complète — miroir exact du type `NewsItem` backend. `content` et `author_name` sont nullables : une news peut être créée sans contenu ni auteur renseigné. `is_published` contrôle la visibilité côté public.

**`HomeNews`**

```ts
type HomeNews = Pick<
  NewsItem,
  "id" | "title" | "url_media" | "description_media" | "created_at"
>;
```

Sous-ensemble de `NewsItem` construit avec `Pick`, correspondant aux champs retournés par l'endpoint `GET /public/home`. La page d'accueil n'a pas besoin du contenu complet d'une actualité — uniquement les données nécessaires à l'aperçu.

---

#### Section `ARTISTS`

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
  is_featured: boolean;
  stage: string | null;
  start_time: string | null;
  end_time: string | null;
};
```

Représente un artiste complet. Les champs `youtube_url`, `spotify_url`, `stage`, `start_time` et `end_time` sont nullables — ils peuvent ne pas être renseignés au moment de la création. `is_featured` indique si l'artiste apparaît dans la section programmation de la page d'accueil.

**`HomeArtist`**

```ts
type HomeArtist = Pick<
  ArtistItem,
  | "id"
  | "name"
  | "stage"
  | "start_time"
  | "end_time"
  | "url_media"
  | "description_media"
>;
```

Sous-ensemble d'`ArtistItem` pour l'endpoint home — uniquement les champs nécessaires à l'affichage de la programmation en page d'accueil, sans la biographie ni les liens streaming.

---

#### Section `UI`

**`NavItem`**

```ts
type NavItem = {
  label?: string;
  labelBtn?: string;
  path?: string;
  active?: boolean;
  value?: string;
  role?: string;
  desc?: string;
  onClick?: () => void;
};
```

Type polyvalent utilisé pour tous les éléments de navigation et de filtrage définis dans `config/ui.ts`. Tous les champs sont optionnels car le type couvre deux usages différents : les liens de navigation (`label` + `path`) et les boutons de filtre (`labelBtn` + `active` + `value`). Le champ `role` permet de filtrer les liens visibles selon le rôle de l'utilisateur connecté.

---

#### Section `API`

**`ApiMessageResponse`**

```ts
type ApiMessageResponse = { message?: string };
```

Type utilisé pour les réponses API qui ne retournent qu'un message de confirmation sans entité — login, logout, changement de mot de passe, mot de passe oublié, formulaire de contact. Le champ `message` est optionnel car certains endpoints ne retournent pas de message explicite.

**`CreateApiResponse<T>`**

```ts
type CreateApiResponse<T> = { message: string } & T;
```

Type générique pour les réponses de création : l'API retourne à la fois un message et l'entité créée. Utilisé pour l'ajout d'un artiste, d'une actualité et d'un utilisateur. L'intersection avec `T` permet de typer précisément le retour selon l'entité concernée — `CreateApiResponse<{ artist: ArtistItem }>`, `CreateApiResponse<{ news: NewsItem }>`, `CreateApiResponse<{ user: UserItem }>`. En pratique, le frontend n'utilise jamais le champ `message` — seule l'entité retournée est exploitée. Le type reflète fidèlement le contrat de l'API backend sans pour autant consommer tous ses champs.

---

### 5.3. Convention de nommage et règle `no-any`

**Convention de nommage**

Tous les types suivent une convention de suffixe qui indique leur nature :

| Suffixe             | Signification                                                                                                                            | Exemples                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `Item`            | Colonnes de la base de données retournées telles quelles par un `SELECT`                                                             | `ArtistItem`, `NewsItem`, `UserItem` |
| `Response`        | Envelope retournée par un endpoint — peut contenir des données enrichies par le backend (jointures, calculs) en plus des colonnes BDD | `AdminAuthMeResponse`                    |
| `Role`            | Union littérale de valeurs autorisées                                                                                                  | `UserRole`                               |
| Préfixe `Home`   | Sous-ensemble d'une entité pour la page d'accueil                                                                                       | `HomeArtist`, `HomeNews`               |
| `<T>` générique | Type paramétré réutilisable                                                                                                           | `CreateApiResponse<T>`                   |

**Composition plutôt que duplication**

Les types dérivés sont construits par composition TypeScript (`Pick`, `Omit`) à partir des types de base — jamais réécrits à la main. Cela garantit qu'une modification de `ArtistItem` se répercute automatiquement sur `HomeArtist`.

**Règle `no-any`**

Le mode `strict` de TypeScript est activé dans `tsconfig.json`, ce qui rend `any` implicite impossible. L'utilisation explicite de `any` est également bannie par convention dans le projet : à la place, on utilise `unknown` quand le type est réellement inconnu, puis on affine avec des guards de type ou des assertions typées (`as MonType`) uniquement quand la structure est garantie par le contrat de l'API.

---

## 6. Système de styles

Le système de styles repose sur trois fichiers CSS chargés dans l'ordre suivant par `globals.css` :

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./animations.css";
```

---

### 6.1. `tokens.css`

Ce fichier déclare toutes les **variables CSS personnalisées** (custom properties) disponibles dans l'application. Elles sont définies sur `:root` et accessibles globalement. Le fichier est organisé en six sections :

**Dimensions layout** — valeurs structurelles utilisées dans des calculs CSS :

```css
--header-height: 106px;
--home-hero-min-height: 100dvh;
--app-min-width: 320px;
```

**Couleurs marque** — palette fixe de la marque, indépendante du thème. Nommées par numéro sans sémantique métier :

```css
--color-1: #cb3346; /* rouge principal */
--color-2: #e4e4e7; /* gris clair */
--color-3: #0ea5e9; /* bleu */
```

**Couleurs UI** — couleurs fonctionnelles pour les éléments d'interface :

```css
--color-text-input: #47474f;
--color-overlay: rgba(156, 163, 175, 0.3);
```

**Couleurs thème** — valeurs statiques par thème. `--color-text` et `--color-bg` sont les seules variables dynamiques — elles sont redéfinies selon le thème actif dans `globals.css` :

```css
--color-text-visitor: #ffffff;
--color-bg-visitor: black;
--color-bg-admin: #ffffff;
--color-text-admin: black;
```

**Espacement contextuel** (`--ctx-*`) — uniquement pour les valeurs d'espacement ayant une signification sémantique dans le projet. Pour tout le reste, l'échelle Tailwind standard est utilisée directement (`p-4`, `gap-6`…) :

```css
--ctx-paragraph-gap: 1rem;
--ctx-form-gap: 2rem;
--ctx-title-mb: 3rem;
```

**Animation** — propriétés de transition et d'animation réutilisables pour les boutons et les effets du hero :

```css
--anim-btn-transition: transform;
--anim-btn-duration: 200ms;
--anim-btn-scale: 1.1;
--anim-hero-duration: 0.9s;
--anim-hero-easing: cubic-bezier(0.16, 1, 0.3, 1);
```

---

### 6.2. `globals.css`

C'est le fichier d'entrée du système de styles. Il remplit trois rôles distincts.

**1. Imports** — charge Tailwind, les tokens et les animations dans l'ordre :

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./animations.css";
```

**2. Thèmes** — redéfinit `--color-text` et `--color-bg` selon l'attribut `data-theme` posé par chaque layout. C'est le seul mécanisme de changement de thème dans l'application :

```css
[data-theme="admin"] {
  --color-text: var(--color-text-admin);
  --color-bg: var(--color-bg-admin);
}
[data-theme="visitor"] {
  --color-text: var(--color-text-visitor);
  --color-bg: var(--color-bg-visitor);
}
```

**3. Classes composants** (`@layer components`) — toutes les classes CSS réutilisables de l'application. Organisées par catégorie via des commentaires :

| Catégorie  | Classes                                                                                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Boutons     | `.btn-cta`, `.btn-action`, `.btn-type-2`                                                                                                                                                         |
| Navigation  | `.nav-list`                                                                                                                                                                                          |
| Formulaires | `.input`, `.form-modal`, `.form-grid`, `.error-message`, `.success-message`, `.upload-zone`, `.upload-btn`, `.submit-modal-area`                                                       |
| Modales     | `.modal`, `.modal-overlay`                                                                                                                                                                         |
| Cartes      | `.card-row`, `.card-primary`, `.card-secondary`, `.card-profile`, `.card-profile-avatar`, `.card-profile-badge`, `.card-media-img`, `.card-artists-content`, `.card-artists-actions` |
| Layout      | `.app-root`                                                                                                                                                                                          |
| Pages       | `.title1`, `.title-modal`, `.admin-content-wrapper`, `.content-centered`, `.filter-row`, `.section-page`, `.detail-edit-area`                                                            |
| Home        | `.home-section`, `.home-section-vh`, `.home-section-title`, `.home-cards`, `.home-card`, `.home-card-img`, `.home-card-content`                                                          |
| Hero        | `.hero-slide-left`                                                                                                                                                                                   |

---

### 6.3. `animations.css`

Ce fichier déclare uniquement des `@keyframes` — aucune classe d'application directe. Les animations sont appliquées via des classes composants dans `globals.css` ou via des styles inline pour les cas ponctuels.

| Keyframe                               | Usage                                         |
| -------------------------------------- | --------------------------------------------- |
| `marquee-left` / `marquee-right`   | Défilement horizontal du bandeau partenaires |
| `line-reload`                        | Animation de la ligne dans `SectionCta`     |
| `line-expand`                        | Animation de chargement dans `LoadingLine`  |
| `slide-in-left` / `slide-in-right` | Entrée du texte hero depuis les côtés      |
| `blur-in`                            | Apparition avec flou sur le hero              |
| `scale-in`                           | Apparition avec zoom sur le hero              |

---

### 6.4. `declarations.d.ts`

```ts
declare module "*.css";
```

Ce fichier d'une seule ligne résout un problème TypeScript : par défaut, TypeScript ne sait pas comment traiter un import de fichier `.css` (`import "./globals.css"`) et génère une erreur de type. La déclaration `declare module "*.css"` indique à TypeScript d'accepter tous les imports de fichiers CSS sans erreur, en les considérant comme des modules valides.

---

### 6.5. Convention — jamais de valeurs brutes dans les `.tsx`

Toutes les valeurs CSS (couleurs, espacements, animations) passent par les tokens définis dans `tokens.css`. Aucune valeur brute ne doit apparaître dans un fichier `.tsx`.

```tsx
// ❌ Interdit
<div style={{ color: "#cb3346" }} />
<div className="text-[#cb3346]" />

// ✅ Correct
<div className="text-(--color-1)" />
```

**Trois exceptions documentées :**

| Exception                                        | Raison                                                                                                                                                                                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bg-transparent`                               | Transparence structurelle — utilisé dans `Banner.tsx` pour la navbar au scroll, pas de sémantique métier                                                                                                                                  |
| `bg-white` / `text-black`                    | Utilisés directement dans les `.tsx` quand le fond blanc et le texte noir sont une intention visuelle explicite et non liée au thème — `HomeHero.tsx` (bandeaux de titre), `Navigation.tsx` (bouton logout), `ModalCloseButton.tsx` |
| Valeurs Tailwind standard (`p-4`, `gap-6`…) | L'échelle d'espacement Tailwind s'utilise directement — un token `--ctx-*` n'est créé que si la valeur a une signification sémantique réutilisée dans 2+ endroits                                                                      |

---

## 7. Couche utilitaire — `src/functions/`

Les fonctions de ce dossier n'ont pas d'état React : pas de hooks, pas de JSX. Certaines sont pures (`formatDate`, `getApiErrorMessage`, `validation`) — même entrée, même sortie, aucun effet de bord. D'autres font des appels réseau (`apiRequest`, `fetchPublic`) et sont asynchrones avec effets de bord, mais restent découplées de React. Elles ne sont pas interchangeables : `apiRequest` est réservée au côté client, `fetchPublic` au côté serveur.

---

### 7.1. `apiRequest.ts`

`apiRequest` est la fonction de base qui effectue tous les appels API côté client. Elle n'est jamais appelée directement depuis un composant — elle est utilisée par des hooks dédiés selon le type d'opération :

| Hook            | Type de requête   | Usage                                       |
| --------------- | ------------------ | ------------------------------------------- |
| `useFetch`    | `GET`            | Chargement de données (liste d'artistes…) |
| `useMutation` | `POST` / `PUT` | Création et modification                   |
| `useDelete`   | `DELETE`         | Suppression                                 |

Chaque hook appelle `apiRequest` avec les options adaptées, ce qui centralise en un seul endroit la construction de la requête, la gestion des cookies et le traitement des erreurs. La fonction accepte deux paramètres :

- `path` — le chemin de l'endpoint API, par exemple `/admin/auth/login`. Il est concaténé avec `NEXT_PUBLIC_API_URL` pour former l'URL complète.
- `init` — les options `fetch` optionnelles (`method`, `headers`, `body`…). Ce paramètre est facultatif : omis sur un `GET` simple, renseigné sur un `POST` avec corps JSON.

`apiRequest` retourne toujours un objet `ApiRequestResult<T>` — une union discriminante à deux formes :

```ts
{
  data: T;
  error: null;
} // succès
{
  data: null;
  error: ApiRequestError;
} // échec
```

TypeScript force la vérification de `error` avant d'accéder à `data` — le cas d'erreur est impossible à ignorer silencieusement.

#### `ApiRequestError`

`ApiRequestError` est une classe d'erreur personnalisée qui étend la classe native `Error`. Elle ajoute une propriété `status` pour transporter le code HTTP en plus du message :

```ts
export class ApiRequestError extends Error {
  status: number;

  constructor(message: string | undefined, status: number) {
    super(message || "Erreur API");
    this.name = "ApiRequestError";
    this.status = status;
  }
}
```

- `super(message || "Erreur API")` initialise la partie native `Error` avec le message retourné par le backend — ou un fallback générique si le corps de la réponse était vide.
- `this.name = "ApiRequestError"` remplace le nom par défaut `"Error"` pour faciliter le debug.
- `this.status` transporte le code HTTP (`401`, `404`, `500`…) afin que l'appelant puisse adapter son comportement selon le type d'erreur.

---

### 7.2. `fetchPublic.ts`

`fetchPublic` est la fonction de fetch réservée au côté serveur. Elle est utilisée directement dans les composants serveur et les layouts SSR pour charger les données publiques avant le rendu de la page.

Elle n'est utilisée que pour des requêtes `GET` — charger des données pour le SSR ne nécessite pas de `POST` ou `DELETE`.

- `path` — le chemin de l'endpoint public, par exemple `/public/home`. Concaténé avec `API_URL_SERVER` (l'URL interne Docker `backend:4000`) — ou `NEXT_PUBLIC_API_URL` en fallback si la variable serveur n'est pas définie.

Elle retourne `Promise<T | null>` : les données parsées en cas de succès, `null` dans tous les cas d'échec — qu'il s'agisse d'un 404, d'un 500 ou d'un réseau coupé. Les erreurs ne sont pas distinguées : côté SSR sur une page publique, si les données ne sont pas disponibles on affiche un fallback — pas besoin de connaître la raison de l'échec. C'est à l'opposé d'`apiRequest` qui retourne une `ApiRequestError` avec le statut HTTP précis pour afficher un message d'erreur à l'utilisateur. Un `console.error` est ajouté en cas d'échec pour logger le statut HTTP dans la console du serveur Next.js et faciliter le debug.

#### Différences avec `apiRequest`

|             | `apiRequest`                                | `fetchPublic`                                   |
| ----------- | --------------------------------------------- | ------------------------------------------------- |
| Contexte    | Côté client (navigateur)                    | Côté serveur (SSR, composants serveur)          |
| URL de base | `NEXT_PUBLIC_API_URL` (`localhost:4000`)  | `API_URL_SERVER` (`backend:4000` dans Docker) |
| Cookies     | `credentials: "include"`                    | Aucun — pas d'authentification                   |
| Cache       | Aucune stratégie                             | ISR —`revalidate: 60` secondes                 |
| Retour      | `ApiRequestResult<T>` (union discriminante) | `T \| null`                                      |

L'option `{ next: { revalidate: 60 } }` est spécifique à Next.js : elle indique au serveur de mettre la réponse en cache et de la revalider toutes les 60 secondes (ISR — Incremental Static Regeneration). La page d'accueil l'utilise pour afficher la programmation et les actualités sans interroger l'API à chaque visite.

---

### 7.3. `getApiErrorMessage.ts`

`getApiErrorMessage` est appelée par les hooks après un appel `apiRequest` échoué. c'est lui qui récupaire le message contenue dans la classe `ApiRequestError` pour l'affiché a l'utilisateur

Elle accepte un seul paramètre :

- `error` — une `ApiRequestError` contenant un `message` (retourné par le backend ou fallback `"Erreur API"`) et un `status` HTTP.

La logique est en deux étapes :

1. **Message explicite** — si l'`ApiRequestError` porte un message retourné par le backend (`{ error: "Email déjà utilisé" }`), il est retourné directement.
2. **Message par défaut** — si le corps de la réponse était vide, mal formé ou ne contenait pas de champ `error`, `extractApiErrorMessage` (dans `apiRequest`) a retourné `undefined` et `ApiRequestError` a reçu le fallback `"Erreur API"`. `getApiErrorMessage` détecte ce fallback et bascule sur le switch par statut HTTP pour retourner un message utile.

| Status | Message retourné                              |
| ------ | ---------------------------------------------- |
| 401    | "Session expirée, merci de vous reconnecter." |
| 403    | "Accès refusé."                              |
| 404    | "Ressource introuvable."                       |
| 429    | "Trop de tentatives, réessayez plus tard."    |
| 5xx    | "Erreur serveur, réessayez plus tard."        |
| Autre  | "Une erreur est survenue."                     |

Cette centralisation garantit que tous les messages d'erreur affichés dans l'interface passent par un seul endroit — aucun message brut de l'API n'atteint l'utilisateur sans passer par ce filtre.

---

### 7.4. `formatDate.ts`

Ce fichier expose deux fonctions de formatage de dates en français. Elles sont utilisées directement dans les composants pour l'affichage.

#### `formatDateLong`

Formate une date ISO en date longue française. Accepte un seul paramètre :

- `isoString` — une date au format ISO 8601 (ex : `"2026-05-09T00:00:00.000Z"`)

Retourne une `string` au format `"9 mai 2026"`. Utilisée pour les dates de publication des actualités.

#### `formatConcertDatetime`

Formate une date ISO en deux chaînes séparées pour l'affichage des concerts. Accepte un seul paramètre :

- `isoString` — une date au format ISO 8601 incluant l'heure de passage

Retourne un objet `{ date, time }` :

- `date` : `"samedi 23 août"` — jour de la semaine + jour + mois
- `time` : `"20:00"` — heure de passage

L'objet retourne deux valeurs séparées plutôt qu'une chaîne unique car elles sont affichées dans des éléments HTML distincts dans les cartes artistes.

---

### 7.5. `validation.ts`

Ce fichier expose trois fonctions utilitaires de validation utilisées dans tous les formulaires de l'application pour bloquer la soumission avant que les données ne soient envoyées au backend.

```ts
export function isEmpty(value: string): boolean {
  return value.trim() === "";
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isMaxLength(value: string, max: number): boolean {
  return value.trim().length > max;
}
```

**`isEmpty`** — retourne `true` si la chaîne est vide ou ne contient que des espaces. Utilisée pour valider les champs obligatoires sans contrainte de format.

**`isEmail`** — retourne `true` si la valeur respecte le format email. Utilisée dans les formulaires login, mot de passe oublié, contact et ajout d'utilisateur.

**`isMaxLength`** — retourne `true` si la valeur dépasse la longueur maximale autorisée (après trim). Utilisée pour aligner les contraintes frontend sur les `max()` des schémas Zod du backend — sans dupliquer les schémas.

Ces trois fonctions forment la couche de validation frontend alignée sur les schémas Zod du backend. Elles ne remplacent pas la validation serveur — elles la complètent en bloquant les soumissions invalides côté client pour améliorer l'expérience utilisateur.

---

## 8. Hooks personnalisés — `src/hooks/`

Les hooks de ce dossier encapsulent de la logique React réutilisable : état, appels API. Contrairement aux fonctions de `src/functions/`, ils utilisent les import React (`useState`, `useEffect`, `useCallback`…) et ne peuvent être appelés que depuis des composants client (`"use client"`). Ils se divisent en deux catégories : les hooks d'API (`useFetch`, `useMutation`, `useDelete`) qui appellent `apiRequest` et gèrent l'état de chargement et d'erreur, et les hooks utilitaires (`useModal`, `useNavPath`, `useRoleGuard`) qui encapsulent de la logique d'interface sans appel réseau.

### 8.1. `useFetch.ts`

`useFetch` est le hook de chargement de données. Il effectue un `GET` vers l'API au montage du composant et expose l'état du chargement au composant appelant.

Il accepte un seul paramètre :

- `endpoint` — le chemin de l'endpoint API, par exemple `/public/artists`. Le hook se relance automatiquement si cette valeur change.

Il retourne un objet à trois propriétés :

- `data` — les données typées `T | null` (null tant que le chargement n'est pas terminé)
- `isLoading` — `true` pendant la requête, `false` une fois terminée
- `error` — un message d'erreur lisible (`string | null`), produit par la fonction `getApiErrorMessage` qui recupaire le message contenue dans `ApiRequestError`

En interne, l'état est géré par un `useReducer` avec trois actions : `LOADING`, `SUCCESS`, `ERROR`. Ce pattern évite les incohérences d'état qui peuvent survenir avec plusieurs `useState` indépendants — par exemple `isLoading: true` et `error` non null en même temps.

### 8.2. `useMutation.ts`

`useMutation` est le hook de création et de modification. Contrairement à `useFetch`, il n'effectue pas de requête au montage — il expose une fonction `mutate` que le composant appelle manuellement (au clic sur un bouton de formulaire, par exemple).

Il accepte deux paramètres :

- `endpoint` — le chemin de l'endpoint API, par exemple `/admin/artists`
- `method` — la méthode HTTP : `"POST"` pour une création, `"PATCH"` pour une modification

Il retourne un objet à quatre propriétés :

- `mutate` — la fonction à appeler pour déclencher la requête. Elle accepte un `body` (`FormData`, objet JSON, ou `null`) et un callback `onSuccess` appelé avec les données en cas de succès
- `isLoading` — `true` pendant la requête, `false` une fois terminée
- `error` — un message d'erreur lisible (`string | null`), converti par `getApiErrorMessage`
- `reset` — réinitialise `isLoading` et `error` à leur valeur initiale — utilisé à la fermeture d'une modale pour repartir d'un état propre

En interne, `mutate` adapte automatiquement le format du body : si c'est un `FormData` (upload d'image), il est envoyé tel quel sans `Content-Type` — le navigateur le définit automatiquement. Si c'est un objet JSON, il est sérialisé avec `JSON.stringify` et le header `Content-Type: application/json` est ajouté. Si `body` est `null`, la requête est envoyée sans corps.

`onSuccess` est une fonction définie par le composant parent et passée en paramètre à `mutate`. En cas de succès, `mutate` l'appelle avec les données reçues du backend — c'est le parent qui décide quoi en faire (fermer la modale, mettre à jour la liste, réinitialiser le formulaire…).

### 8.3. `useDelete.ts`

`useDelete` est le hook de suppression. Comme `useMutation`, il n'effectue pas de requête au montage — il expose une fonction `handleDelete` que le composant appelle manuellement.

Il accepte un seul paramètre :

- `endpoint` — le chemin de base de l'endpoint, par exemple `/admin/artists`. L'id de l'élément à supprimer est concaténé dynamiquement : `/admin/artists/42`.

Il retourne un objet à cinq propriétés :

- `handleDelete` — la fonction à appeler pour déclencher la suppression. Elle accepte l'`id` de l'élément à supprimer et un callback `onSuccess` appelé avec cet `id` en cas de succès — le parent s'en sert pour retirer l'élément de sa liste
- `isSubmitting` — `true` pendant la requête, `false` une fois terminée
- `isDeleted` — passe à `true` après une suppression réussie — utilisé pour afficher un message de confirmation dans la modale
- `error` — un message d'erreur lisible (`string | null`), converti par `getApiErrorMessage`
- `reset` — remet `isDeleted` et `error` à leur valeur initiale à la fermeture de la modale

### 8.4. `useModal.ts`

`useModal` est le hook de gestion de l'état d'ouverture d'une modale. Il est utilisé par les pages d'administration pour contrôler l'affichage des modales de création, modification et suppression.

Il accepte un paramètre optionnel :

- `initialOpen` — `boolean`, `false` par défaut. Si `true`, la modale s'ouvre immédiatement au montage du composant — utilisé pour la modale de changement de mot de passe provisoire.

Il est générique (`useModal<T>`) : `T` est le type de l'élément associé à la modale — par exemple `ArtistItem` pour la modale de suppression d'un artiste. Si aucun type n'est fourni, `T` vaut `undefined`.

Il retourne un objet à quatre propriétés :

- `isOpen` — `true` si la modale est ouverte, `false` sinon
- `item` — l'élément associé (`T | null`) — `null` pour une création, l'élément cible pour une modification ou suppression
- `open` — ouvre la modale. Accepte un `item` optionnel : sans argument pour une création, avec l'élément pour une édition ou suppression
- `close` — ferme la modale et remet `item` à `null`

Quatre modales du projet n'utilisent pas `useModal` et gèrent leur état avec un simple `useState(false)` : le menu mobile dans `Banner`, la modale de filtres dans `MobileFiltersButton`, les modales légales dans `Footer` et la modale "Mot de passe oublié" dans `/login`. Dans tous ces cas, la modale n'a pas d'`item` associé — `useState` est suffisant et plus explicite.

### 8.5. `useNavPath.ts`

`useNavPath` est un hook utilitaire qui encapsule `usePathname` de Next.js. Il n'accepte aucun paramètre et retourne un objet à deux propriétés :

- `pathname` — le chemin courant de l'URL, par exemple `/admin/artists`
- `isAdminPath` — `true` si le chemin contient `/admin`, `false` sinon

Il est utilisé dans les composants de navigation (`Banner`, `Navigation`) pour adapter l'affichage selon que l'utilisateur est dans la zone publique ou la zone d'administration — par exemple afficher un menu différent ou changer le style de la navbar.

### 8.6. `useRoleGuard.ts`

`useRoleGuard` est un hook de protection de routes côté client. Il vérifie que le rôle de l'utilisateur connecté lui permet d'accéder à la route courante, et le redirige vers `/admin/dashboard` si ce n'est pas le cas.

Il n'accepte aucun paramètre et ne retourne rien — il est appelé uniquement pour son effet de bord.

En interne, il récupère les informations de l'utilisateur connecté via `useAdminUser` — un hook qui lit le contexte exposé par `AdminUserProvider`, présent dans le layout admin. Il compare ensuite le `pathname` courant (via `useNavPath`) avec la configuration des routes admin définie dans `navAdminItem` (`ui.ts`). Si la route courante a une restriction de rôle (`item.role`), il vérifie que le rôle de l'utilisateur est dans la liste des rôles autorisés. Si ce n'est pas le cas, `router.replace("/admin/dashboard")` est appelé.

Ce hook complète la protection côté serveur du `admin/layout.tsx` : le layout vérifie qu'une session existe, `useRoleGuard` vérifie que le rôle est suffisant pour la page spécifique.

---

## 9. Configuration applicative — `src/config/`

Les fichiers de ce dossier ne contiennent ni logique React, ni appels réseau — ce sont des données statiques exportées sous forme de constantes et de fonctions pures. Ils centralisent les valeurs de configuration utilisées par plusieurs composants : liens de navigation, filtres, informations du festival. Modifier une valeur ici la propage automatiquement partout où elle est consommée.

### 9.1. `ui.ts`

Ce fichier centralise toute la configuration de navigation et de filtres de l'interface. Il exporte six constantes et une fonction :

**`navVisitorItems`** — les liens de la navigation publique (Accueil, Programmation, News, Information).

**`navAdminItem`** — les liens de la navigation admin, chacun pouvant porter un champ `role` listant les rôles autorisés (`"admin, artists"`). Le bouton Logout est inclus sans `role` ni `path` — il est toujours affiché.

**`navAdminQuickLinks`** — dérivé de `navAdminItem` par filtrage : exclut le Dashboard et le Logout. Utilisé pour les raccourcis affichés sur la page dashboard.

**`filterArtistsItems`** — filtres de la page artistes, générés dynamiquement depuis `FESTIVAL_DAYS` (`festival.ts`) : un bouton par jour du festival.

**`filterNewsItems`** — filtres de la page news : "Plus récent" / "Plus ancien".

**`filterUsersItems`** — filtres de la page utilisateurs admin, générés depuis `USER_ROLES`.

**`USER_ROLES`** — source de vérité unique des rôles disponibles (`admin`, `artists`, `news`). Utilisé pour générer les filtres et les options de sélection dans les formulaires. Ces rôles auraient pu être stockés dans une table dédiée en base de données, mais ce choix a été écarté : les rôles forment un ensemble fermé et connu à l'avance qui n'évolue pas sans intervention technique. En base, un type `ENUM` PostgreSQL garantit la même contrainte d'intégrité. Côté frontend, `USER_ROLES` joue le même rôle de source de vérité unique.

**`filterNavByRole(items, role)`** — fonction qui filtre une liste de `NavItem` selon le rôle de l'utilisateur connecté. Les items sans champ `role` (comme Logout) sont toujours inclus.

### 9.2. `festival.ts`

Ce fichier centralise les données statiques du festival.

**`FESTIVAL_DAYS`** — les dates d'ouverture du festival (`["2027-05-21", "2027-05-22", "2027-05-23"]`). Utilisé par `ui.ts` pour générer dynamiquement les filtres de la page artistes.

**`FESTIVAL_STAGES`** — les scènes disponibles (`["MainStage", "Tremplin"]`). Correspond aux valeurs de l'`ENUM concert_stage` en base de données. Comme pour les rôles, ces valeurs auraient pu être stockées dans une table dédiée, mais les scènes forment un ensemble fermé sans attributs propres — un `ENUM` PostgreSQL suffit. `FESTIVAL_STAGES` joue le même rôle de source de vérité côté frontend.

**`TICKETING_URL`** — l'URL de la billetterie externe. Utilisé par le bouton de billetterie affiché dans la navigation publique.

**`FESTIVAL_LOCATION`** — l'adresse du festival (nom, rue, ville). Utilisé dans la page d'informations pratiques.

---

## 10. Composants partagés — `src/components/`

Ce dossier regroupe les composants réutilisables entre plusieurs pages. Contrairement aux pages (`src/app/`), ils ne définissent pas de routes — ils sont importés là où on en a besoin. Certains sont des composants serveur (pas de `"use client"`), d'autres sont des composants client qui utilisent des hooks ou des interactions. Le dossier contient également un sous-dossier `modals/` pour les modales d'administration.

### 10.1. Composants de mise en page

#### `Banner`

`Banner` est le composant de navigation principal. Il détecte si l'URL est une page admin via `useNavPath` et récupère les informations de l'utilisateur connecté via `useAdminUser`. Il filtre ensuite les liens de navigation selon le rôle avec `filterNavByRole` — un admin ne voit que les pages auxquelles il a accès.

Il gère deux comportements visuels : le header devient transparent sur la page d'accueil tant que l'utilisateur n'a pas scrollé (écouté via un event listener `scroll` avec `{ passive: true }` pour ne pas bloquer le défilement), et il bascule entre une navigation desktop et mobile selon la taille de l'écran.

Le logout est géré via `useMutation` sur `POST /admin/auth/logout` — la fonction `handleLogout` encapsule l'appel pour qu'il ne s'exécute qu'au clic et non au rendu.

Le composant se compose de trois sous-composants internes :

- **`DesktopNav`** — navigation horizontale affichée sur grand écran, avec le bouton billetterie masqué en admin
- **`MobileNav`** — navigation mobile ouverte dans une modale `react-modal`, avec le même comportement de masquage du bouton billetterie en admin
- **`BtnTicket`** — lien externe vers la billetterie, ouvert dans un nouvel onglet avec `rel="noopener noreferrer"` pour empêcher la page ouverte d'accéder à `window.opener`

#### `Navigation.tsx`

`Navigation` est un composant de liste de liens réutilisable. Malgré son nom, il ne sert pas uniquement à la navigation — il affiche n'importe quelle liste de `NavItem[]`, qu'il s'agisse de liens de navigation ou de filtres. Il est utilisé dans trois contextes : `Banner` pour le menu mobile, `SideBarTool` pour la sidebar admin, et `MobileFiltersButton` pour les filtres en version mobile.

Il compare chaque item avec le `pathname` courant pour appliquer un style actif. Il gère deux types d'items : les liens (`item.path`) rendus avec `<Link>`, et les boutons (`item.labelBtn`) comme Logout ou les filtres. Il accepte une prop `variant` (`"sidebar"` ou `"modal"`) qui adapte les classes CSS selon le contexte d'affichage.

Les boutons utilisent l'appel optionnel `?.()` sur trois callbacks — `item.onClick?.()`, `setmodal?.()` et `onLogout?.()` — ce qui permet à un seul composant de gérer tous les cas selon les props reçues : changer un filtre actif, fermer le menu mobile, ou déclencher le logout.

#### `Footer.tsx`

`Footer` est le pied de page commun à toutes les pages publiques. Il affiche deux zones : les liens légaux ("Mentions légales", "Nous contacter") et les icônes des réseaux sociaux (Instagram, Facebook, YouTube) avec `rel="noopener noreferrer"` sur chaque lien externe.

Les deux listes — `legalLinks` et `socialLinks` — sont des constantes locales définies dans le fichier. Au clic sur un lien légal, une modale `react-modal` s'ouvre avec le contenu correspondant (`LegalMention` ou `ContactUs`). Un seul état `activeModal` (`"mentions" | "contact" | null`) suffit pour gérer les deux modales — pas besoin de deux `useState` séparés.

#### `SideBarTool.tsx`

`SideBarTool` est un composant de mise en page utilisé dans les pages admin. Il dispose le contenu de la page en deux colonnes : une sidebar sticky à gauche avec `Navigation` et le contenu principal à droite via `children`. Sur mobile, la sidebar est masquée (`hidden md:flex`) — seul le contenu enfant est affiché.

Il reçoit deux props : `items` — la liste des liens à afficher dans la sidebar — et `children` — le contenu spécifique à la page. Il utilise `useNavPath` pour passer `pathname` et `isAdminPath` à `Navigation` afin d'appliquer le style actif sur le bon lien.

### 10.2. Composants de contenu

#### `ArtistsContent.tsx`

`ArtistsContent` est le composant d'affichage de la liste des artistes. Il est partagé entre la page publique (`/artists`) et l'admin (`/admin/artists`) — `useNavPath` lui permet de détecter le contexte pour adapter les liens et afficher les boutons d'ajout et de suppression uniquement en admin.

Les données sont chargées via `useFetch` sur `/public/artists`. Le composant maintient trois états locaux pour gérer les modifications sans recharger l'API : `baseArtists` (données initiales), `addedArtists` (artistes ajoutés en session) et `deletedIds` (ids supprimés en session). La liste affichée est recalculée via `useMemo` en fusionnant ces trois sources, en appliquant le filtre par jour (`activeFilter`) et en triant par heure de passage. `useMemo` évite de recalculer cette liste à chaque re-render — par exemple quand `isDeleteModalOpen` change, le composant se re-render mais la liste n'est pas recalculée car ses dépendances n'ont pas changé.

Il utilise deux modales : `AddArtistModal`, dédié uniquement à la création d'artiste et non partagé avec d'autres composants, et `DeleteModal`, un composant générique partagé entre artistes, news et utilisateurs.

#### `NewsContent.tsx`

`NewsContent` est le composant d'affichage de la liste des actualités. Il est partagé entre la page publique (`/news`) et l'admin (`/admin/news`) — `useNavPath` lui permet de détecter le contexte pour afficher le badge "Brouillon" sur les news non publiées et les boutons de suppression uniquement en admin. En vue publique, les news non publiées sont filtrées côté client et ne sont jamais affichées.

Les données sont chargées via `useFetch` sur `/public/news`. Comme `ArtistsContent`, il maintient trois états locaux — `baseNews`, `addedNews` et `deletedIds` — pour gérer les modifications sans recharger l'API. La liste affichée est recalculée via `useMemo` en fusionnant ces trois sources et en appliquant le tri selon `activeFilter` — `"Plus ancien"` inverse l'ordre, `null` conserve l'ordre DESC retourné par l'API.

Il utilise deux modales : `AddNewsModal`, dédié uniquement à la création et modification de news, et `DeleteModal`, le composant générique partagé entre artistes, news et utilisateurs.

#### `ArtistDetailContent.tsx`

`ArtistDetailContent` est le composant d'affichage de la fiche complète d'un artiste. C'est un composant serveur — pas de `"use client"` — il reçoit un `ArtistItem` en prop depuis la page SSR.

Il affiche trois zones : une image héro pleine largeur avec le nom de l'artiste en overlay et un dégradé, une barre colorée avec la date et l'heure du concert formatées via `formatConcertDateTime` (une fonction locale qui formate en `"SAMEDI 21 MAI 20H30"`), et un corps avec la biographie, un lien retour et les icônes YouTube/Spotify conditionnelles — affichées uniquement si les URLs sont renseignées. Les liens externes utilisent `rel="noopener noreferrer"`.

Il accepte une prop `backPath` optionnelle (`"/artists"` par défaut) — utilisée pour adapter le lien retour selon qu'on vient de la page publique ou de l'admin.

#### `NewsDetailContent.tsx`

`NewsDetailContent` est le composant d'affichage du contenu complet d'une actualité. C'est un composant serveur — pas de `"use client"` — il reçoit un `NewsItem` en prop depuis la page SSR.

Il affiche trois zones : une image héro pleine largeur avec le titre en overlay et un dégradé, une barre colorée avec l'auteur (`author_name ?? "Auteur inconnu"`) et la date formatée via `formatDateLong`, et le corps de la news. Le contenu est découpé par sauts de ligne (`split("\n")`) pour afficher chaque paragraphe dans un `<p>` séparé — les lignes vides sont ignorées.

#### `SectionCta.tsx`

`SectionCta` affiche un séparateur avec un bouton call-to-action centré entre deux lignes horizontales animées au survol. Il reçoit `href` et un `label` optionnel (`"Voir plus"` par défaut). Utilisé sur la page d'accueil pour les liens vers la programmation et les actualités.

#### `LegalMention.tsx`

`LegalMention` affiche le contenu statique des mentions légales. C'est un composant serveur sans logique — uniquement du contenu texte. Il est rendu dans la modale ouverte depuis `Footer`.

### 10.3. Composants interactifs

#### `ContactUs.tsx`

`ContactUs` est le formulaire de contact affiché dans une modale depuis `Footer`. Il contient quatre champs : nom, email, sujet et message. Il utilise `useMutation` sur `POST /contact/submit`.

Le bouton d'envoi est désactivé tant que le formulaire est invalide ou pendant la requête via `isLoading`. La validation s'appuie sur `isEmail` pour le champ email, `isMaxLength` pour les longueurs maximales (100 pour le nom, 150 pour le sujet, 2000 pour le message) et des vérifications de longueur minimale pour les autres champs — alignées sur le schéma Zod `contactSchema` du backend. En cas de succès, le callback `onSuccess` réinitialise tous les champs, set `success` à `true` et le formulaire est remplacé par un message de confirmation. En cas d'erreur, le message est affiché sous le bouton.

#### `ForgotPassword.tsx`

`ForgotPassword` est le formulaire de réinitialisation de mot de passe. Il contient un seul champ email et utilise `useMutation` sur `POST /admin/auth/forgot-password`.

Le bouton d'envoi est désactivé tant que le champ email n'est pas valide — vérifié via `isEmail` — ou pendant la requête via `isLoading`. En cas de succès, le callback `onSuccess` set `success` à `true` et le formulaire est remplacé par un message de confirmation. En cas d'erreur, le message retourné par `getApiErrorMessage` est affiché sous le formulaire.

#### `MobileFiltersButton.tsx`

`MobileFiltersButton` est visible uniquement sur mobile (`md:hidden`). Il affiche un bouton icône qui au clic ouvre une modale `react-modal` contenant `Navigation` avec la liste des filtres passés en prop.

Il reçoit une seule prop `items` — la liste des filtres à afficher. Il utilise `useNavPath` pour passer `pathname` et `isAdminPath` à `Navigation` afin d'appliquer le style actif sur le bon filtre. `setmodal` est passé à `Navigation` pour fermer la modale automatiquement quand l'utilisateur sélectionne un filtre.

#### `modals/AddArtistModal.tsx`

`AddArtistModal` est la modale de création et de modification d'artiste. Elle fonctionne en deux modes : création (`POST /admin/artists`) et édition (`PATCH /admin/artists/:id`) — le mode est détecté via la prop `artistToEdit`. En mode édition, les champs sont pré-remplis et l'image est optionnelle (on conserve l'existante si aucune nouvelle n'est choisie).

Le formulaire est découpé en trois étapes :

- **Étape 1** — nom, genre, origine, biographie, liens YouTube et Spotify (optionnels). Les URLs sont validées via regex (`YOUTUBE_REGEX`, `SPOTIFY_REGEX`) avant de passer à l'étape suivante.
- **Étape 2** — description alt de l'image et upload du fichier. Une prévisualisation est générée via `URL.createObjectURL` et révoquée via `useEffect` pour éviter les fuites mémoire.
- **Étape 3** — scène (depuis `FESTIVAL_STAGES`), date (depuis `FESTIVAL_DAYS`), heure de début et de fin, case "Publier sur la page d'accueil".

Chaque étape a sa propre fonction de validation (`isStep1Invalid`, `isStep2Invalid`, `isStep3Invalid`) qui bloque le passage à l'étape suivante si les champs sont invalides. Les données sont soumises en `multipart/form-data` via `useMutation` pour permettre l'upload d'image via multer côté backend.

#### `modals/AddNewsModal.tsx`

`AddNewsModal` est la modale de création et de modification d'actualité. Elle fonctionne en deux modes : création (`POST /admin/news`) et édition (`PATCH /admin/news/:id`) — le mode est détecté via la prop `newsToEdit`. En mode édition, les champs sont pré-remplis et l'image est optionnelle.

Le formulaire est découpé en deux étapes :

- **Étape 1** — titre (obligatoire, min 2 / max 150 caractères), contenu (optionnel) et case "Publier".
- **Étape 2** — description alt de l'image et upload du fichier. Même principe que `AddArtistModal` : prévisualisation via `URL.createObjectURL` et révocation via `useEffect`.

Les données sont soumises en `multipart/form-data` via `useMutation` pour permettre l'upload d'image côté backend.

#### `modals/DeleteModal.tsx`

`DeleteModal` est la modale de confirmation de suppression générique, partagée entre artistes, news et utilisateurs. Contrairement à `AddArtistModal` et `AddNewsModal` qui sont dédiés à un seul type d'entité, `DeleteModal` est générique grâce à trois props : `endpoint` (chemin de l'API), `entityName` (nom affiché dans les textes) et `getLabel` (fonction qui extrait le nom de l'item à afficher dans le message de confirmation).

Il est générique au sens TypeScript également — `DeleteModal<T extends { id: string }>` — ce qui garantit que l'item passé possède toujours un `id`.

Il utilise `useDelete` et affiche deux états distincts : pendant la requête, le bouton affiche "Suppression..." via `isSubmitting` et est désactivé. En cas de succès, le contenu est remplacé par un message de confirmation via `isDeleted`. À la fermeture, `reset()` est appelé pour remettre `isDeleted` et `error` à leur valeur initiale avant la prochaine ouverture.

### 10.4. Composants utilitaires

#### `LoadingLine.tsx`

`LoadingLine` est un indicateur de chargement centré à l'écran — texte "CHARGEMENT" avec une ligne qui s'étend depuis le centre via l'animation `line-expand`. C'est un composant serveur sans props, affiché par `ArtistsContent` et `NewsContent` pendant le chargement des données.

#### `ModalCloseButton.tsx`

`ModalCloseButton` est le bouton de fermeture réutilisé dans toutes les modales. Il accepte une prop `absolute` optionnelle — en mode normal il est aligné à droite via flexbox, en mode `absolute` il est positionné en haut à droite par-dessus le contenu pour les modales à layout complexe.

#### `ModalSetup.tsx`

`ModalSetup` initialise `react-modal` une seule fois au niveau du layout avec `Modal.setAppElement("#app-root")`. Sans cette initialisation, `react-modal` ne peut pas gérer correctement le focus trap pour l'accessibilité. Il ne rend rien (`return null`) — c'est un composant purement technique.

### 10.5. Composants fonctionnels

Cette catégorie regroupe les composants qui n'affichent rien directement mais fournissent une infrastructure React — contexte, providers — aux composants qui les entourent.

#### `AdminUserProvider.tsx`

`AdminUserProvider` est un provider React qui expose les données de l'utilisateur admin à tous les composants de l'espace admin via le contexte React. Il n'affiche rien — il encapsule ses enfants dans `AdminUserContext.Provider`.

Il reçoit deux props : `value` — un `AdminAuthMeResponse` contenant les données utilisateur et le booléen `mustChangePassword` — et `children` — les composants enfants à envelopper. Il est instancié dans `admin/layout.tsx` avec les données récupérées côté serveur via `/admin/auth/me`.

Le fichier exporte également `useAdminUser` — le hook de consommation du contexte. Il retourne `null` si appelé hors du provider (layouts public et auth), ce qui permet aux composants partagés comme `Banner` de s'en servir sans planter.

---

## 11. Structure des layouts et routage

L'App Router de Next.js organise le routage par système de fichiers — chaque dossier dans `src/app/` correspond à un segment d'URL et peut définir son propre `layout.tsx`. Les layouts s'emboîtent : le layout racine englobe tout, les layouts enfants s'appliquent à leur sous-arbre uniquement.

Le projet utilise trois **Route Groups** (dossiers entre parenthèses) pour appliquer des layouts et des thèmes distincts sans que le nom du dossier n'apparaisse dans l'URL :

| Route Group  | URL concernées                                     | Layout appliqué                                            |
| ------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| `(public)` | `/`, `/artists`, `/news`, `/practical-info` | Thème visiteur +`Banner` + `Footer`                    |
| `(auth)`   | `/login`                                          | Thème authentification                                     |
| `admin`    | `/admin/*`                                        | Thème admin + protection de session +`AdminUserProvider` |

### 11.1. `src/app/layout.tsx` — racine

Le layout racine est le seul point qui englobe toutes les pages de l'application. Il définit le squelette HTML commun : balise `<html lang="fr">`, `<body>`, et le `<div id="app-root">` utilisé par `ModalSetup` pour l'accessibilité de `react-modal`.

Il configure trois éléments globaux :

- **Police** — `Bebas_Neue` est chargée via `next/font/google` et exposée comme variable CSS `--font-display`. L'option `display: "swap"` évite le flash de texte invisible pendant le chargement.
- **FontAwesome** — `config.autoAddCss = false` désactive l'injection automatique du CSS et les styles sont importés manuellement via `@fortawesome/fontawesome-svg-core/styles.css` pour éviter les flash de style.
- **Métadonnées SEO** — `export const metadata` définit le titre et la description de l'application, repris par Next.js dans le `<head>`.

`Banner`, `Footer` et les providers ne sont pas définis ici — ils sont délégués aux layouts de section pour que chaque zone de l'application puisse avoir sa propre structure.

### 11.2. `(public)/layout.tsx`

Le layout public s'applique à toutes les pages visiteur : accueil, artistes, news, informations pratiques. C'est un composant serveur simple — il encapsule les pages dans `Banner`, `main` et `Footer`.

Il applique le thème visiteur via `data-theme="visitor"` sur l'élément racine — l'attribut est lu par `globals.css` pour activer les tokens de couleur du thème public (`--color-bg`, `--color-text`…).

### 11.3. `(auth)/layout.tsx`

Le layout auth s'applique aux pages de connexion (`/login`, `/forgot-password`). Sa structure est identique au layout public — `Banner`, `main`, `Footer` — mais il applique le thème admin via `data-theme="admin"` dès le rendu serveur. L'utilisateur voit donc l'interface aux couleurs de l'espace admin avant même de se connecter.

### 11.4. `admin/layout.tsx`

Le layout admin est un composant serveur **asynchrone** — il exécute du code côté serveur avant de rendre quoi que ce soit. C'est le point d'entrée de la protection de la zone admin.

Il effectue les étapes suivantes dans l'ordre :

1. **Récupération des cookies** — `cookies()` de Next.js lit le cookie de session de la requête entrante côté serveur et le transmet manuellement dans le header `cookie` de la requête vers le backend.
2. **Vérification de session** — `fetch` vers `/admin/auth/me` avec `cache: "no-store"` pour que la vérification soit faite à chaque requête sans mise en cache. Si `fetch` échoue (réseau, backend inaccessible) ou si la réponse n'est pas `ok`, `redirect("/login")` est appelé immédiatement — aucun contenu admin n'est rendu.
3. **Injection des données** — si la session est valide, les données utilisateur (`AdminAuthMeResponse`) sont passées à `AdminUserProvider` qui les rend accessibles à tous les composants enfants via le contexte.

Il applique également `data-theme="admin"` pour le thème et encapsule le contenu dans `Banner` et `Footer`.

Ce `fetch` est intentionnellement différent de `fetchPublic` pour deux raisons : `fetchPublic` ne transmet pas les cookies (conçue pour les données publiques sans auth), et utilise `revalidate: 60` (ISR) — incompatible ici où la vérification doit être faite à chaque requête via `cache: "no-store"`.

### 11.5. Protection de la zone admin

La protection de la zone admin fonctionne sur deux niveaux complémentaires :

**Niveau 1 — Côté serveur (`admin/layout.tsx`)** — vérifie qu'une session valide existe avant de rendre quoi que ce soit. Si la session est absente ou invalide, `redirect("/login")` est appelé immédiatement côté serveur — aucun contenu admin n'est envoyé au navigateur. C'est le niveau le plus sûr.

**Niveau 2 — Côté client (`useRoleGuard`)** — vérifie que le rôle de l'utilisateur lui permet d'accéder à la page spécifique. Le layout ne vérifie que l'existence d'une session, pas le rôle. `useRoleGuard` compare le `pathname` courant avec la configuration des routes dans `navAdminItem` et redirige vers `/admin/dashboard` si le rôle est insuffisant.

Les deux niveaux sont nécessaires : le layout protège l'accès à la zone admin, `useRoleGuard` protège l'accès aux pages spécifiques à l'intérieur de cette zone.

### 11.6. Changement de thème entre layouts

Le changement de thème entre les zones publique et admin repose sur l'attribut `data-theme` défini dans chaque layout :

| Layout                  | `data-theme` | Tokens activés                                  |
| ----------------------- | -------------- | ------------------------------------------------ |
| `(public)/layout.tsx` | `"visitor"`  | `--color-text-visitor`, `--color-bg-visitor` |
| `(auth)/layout.tsx`   | `"admin"`    | `--color-text-admin`, `--color-bg-admin`     |
| `admin/layout.tsx`    | `"admin"`    | `--color-text-admin`, `--color-bg-admin`     |

Dans `globals.css`, les sélecteurs `[data-theme="admin"]` et `[data-theme="visitor"]` remappent les tokens `--color-text` et `--color-bg` vers les valeurs correspondantes. Tous les composants utilisent ces tokens — le changement de thème se propage automatiquement sans aucune logique JavaScript.

---

## 12. Pages de l'application

Les pages sont des composants serveur par défaut dans l'App Router. Elles effectuent les appels API côté serveur via `fetchPublic` pour les pages publiques, ou directement avec `fetch` pour les pages admin. Les interactions dynamiques (filtres, modales, formulaires) sont déléguées à des composants client importés dans la page.

Les routes dynamiques (`[id]`) utilisent le paramètre `params.id` pour charger les données spécifiques à l'entité demandée. Si les données ne sont pas trouvées (`fetchPublic` retourne `null`), la page appelle `notFound()` pour afficher la page 404 de Next.js.

### 12.1. Pages publiques

#### `/` — Page d'accueil

La page d'accueil charge ses données via `fetchPublic` sur `GET /public/home` — un endpoint qui agrège artistes et actualités en une seule requête. En cas d'échec, un fallback `{ artists: [], news: [] }` est utilisé pour éviter que la page ne plante.

Elle est composée de cinq sections distinctes, chacune dans son propre composant local :

- `HomeHero` — bandeau principal avec le visuel du festival
- `HomeProgrammation` — aperçu de la programmation avec les artistes reçus
- `HomeNews` — aperçu des actualités reçues
- `HomeInfosPratiques` — informations pratiques statiques (lieu, dates…)
- `HomePartenaires` — logos des partenaires

#### `/artists` — Liste des artistes

Contrairement aux autres pages publiques, cette page est un composant **client** (`"use client"`) — elle gère l'état du filtre actif (`activeFilter`) via `useState`. C'est le seul état de la page : les données sont chargées par `ArtistsContent` via `useFetch`.

Les filtres sont construits dynamiquement depuis `filterArtistsItems` en ajoutant un `onClick` et un `active` à chaque item selon le filtre courant. Ces items enrichis sont passés à la fois à `SideBarTool` (sidebar desktop) et `MobileFiltersButton` (modale mobile).

#### `/artists/[id]` — Fiche artiste

Page serveur qui charge l'artiste via `fetchPublic` sur `GET /public/artists/:id`. Si les données sont `null` (artiste inexistant ou API inaccessible), `notFound()` est appelé — Next.js affiche la page 404. Sinon les données sont passées à `ArtistDetailContent`.

#### `/news` — Liste des actualités

Même structure que `/artists` — composant client qui gère l'état du filtre de tri (`activeFilter`) via `useState`, initialisé à `"Plus récent"`. Les filtres sont construits depuis `filterNewsItems` avec `active` et `onClick` ajoutés dynamiquement, puis passés à `SideBarTool` et `MobileFiltersButton`. Les données sont chargées par `NewsContent`.

La différence avec `/artists` : `activeFilter` est une `string` (le label du filtre) et non `string | null` — il y a toujours un tri actif, jamais d'état "sans filtre".

#### `/news/[id]` — Détail d'une actualité

Même structure que `/artists/[id]` — page serveur qui charge la news via `fetchPublic` sur `GET /public/news/:id`. Si `null`, `notFound()` est appelé. Une news non publiée retourne également `null` côté backend — un visiteur ne peut pas accéder directement à une news en brouillon via son URL.

#### `/practical-info` — Informations pratiques

Page serveur entièrement statique — pas d'appel API, pas d'état client. Elle affiche les informations pratiques du festival (lieu, accès, restauration, sur place) à partir de constantes locales et de `FESTIVAL_LOCATION` importé depuis `festival.ts`.

### 12.2. Page d'authentification

#### `/login`

La page de connexion est un composant client. Elle affiche un formulaire email/mot de passe et utilise `useMutation` sur `POST /admin/auth/login`. La validation frontend bloque l'envoi si l'email est invalide (`isEmail`) ou si le mot de passe fait moins de 8 caractères — aligné sur le schéma Zod backend.

En cas de succès, le callback `onSuccess` redirige vers `/admin/dashboard` via `router.push`. En cas d'échec, le message d'erreur retourné par `getApiErrorMessage` est affiché au-dessus du bouton.

Un bouton "Mot de passe oublié" ouvre une modale contenant `ForgotPassword`.

### 12.3. Pages d'administration

#### `/admin/dashboard`

La page dashboard est un composant serveur minimal qui délègue tout à `DashboardContent` — un composant client qui accède aux données utilisateur via `useAdminUser`.

`DashboardContent` affiche deux zones :

- **Carte profil** — nom, rôle, email et bouton de changement de mot de passe. Si `mustChangePassword` est `true`, `useModal` est initialisé avec `true` pour ouvrir automatiquement la modale de changement de mot de passe au montage.
- **Grille** — un compte à rebours jusqu'au premier jour du festival (calculé via `getDaysUntil`) avec le lieu depuis `FESTIVAL_LOCATION`, et une liste de raccourcis vers les sections admin accessibles selon le rôle de l'utilisateur via `filterNavByRole`.

À la fermeture de la modale de changement de mot de passe, `router.refresh()` est appelé si `mustChangePassword` était `true`. Cela force Next.js à refaire le rendu côté serveur du layout — ce qui relance le fetch vers `/admin/auth/me` et récupère la nouvelle valeur de `mustChangePassword` (`false`). Sans ça, la modale se rouvrirait à chaque rechargement car les données du contexte viendraient encore du serveur avec l'ancienne valeur.

#### `/admin/artists`

Même structure que `/artists` — composant client avec filtre par jour via `useState`. La différence principale : `useRoleGuard()` est appelé en tête de composant pour vérifier que le rôle de l'utilisateur lui permet d'accéder à cette page. Un bouton `+` dans le `filter-row` ouvre la modale d'ajout via `useModal` — `isOpen` et `close` sont passés à `ArtistsContent` qui gère `AddArtistModal` en interne.

#### `/admin/artists/[id]`

Contrairement à `/artists/[id]` qui est serveur, cette page est un composant **client** — elle utilise `useFetch` pour charger l'artiste via `GET /public/artists/:id` et `useParams` pour récupérer l'`id` depuis l'URL.

Elle maintient un état `editedArtist` — `null` tant que l'utilisateur n'a pas modifié l'artiste. La valeur affichée est `editedArtist ?? data?.artist` : après édition, l'artiste mis à jour est affiché immédiatement sans recharger l'API.

Elle affiche `ArtistDetailContent` avec `backPath="/admin/artists"` et `ArtistEditButton` — un bouton flottant qui ouvre `AddArtistModal` en mode édition.

#### `/admin/news`

#### `/admin/news/[id]`

#### `/admin/users`

---

## 13. Tests

### 13.1. Stratégie de test

### 13.2. Outils — Vitest, React Testing Library, jsdom

### 13.3. Ce qui est testé et ce qui ne l'est pas
