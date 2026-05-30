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

```ts
export function isEmpty(value: string): boolean {
  return value.trim() === "";
}
```

Fonction utilitaire de validation : retourne `true` si la chaîne est vide ou ne contient que des espaces. Utilisée dans les modales de formulaire pour valider les champs obligatoires avant soumission (`isStep1Invalid`, `isStep2Invalid`…).

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

### 8.4. `useModal.ts`

### 8.5. `useNavPath.ts`

### 8.6. `useRoleGuard.ts`

---

## 9. Configuration applicative — `src/config/`

### 9.1. `ui.ts`

### 9.2. `festival.ts`

---

## 10. Composants partagés — `src/components/`

### 10.1. Composants de mise en page

### 10.2. Composants de contenu

### 10.3. Composants interactifs

### 10.4. Composants utilitaires

### 10.5. Composants fonctionnels

---

## 11. Structure des layouts et routage

### 11.1. `src/app/layout.tsx` — racine

### 11.2. `(public)/layout.tsx`

### 11.3. `(auth)/layout.tsx`

### 11.4. `admin/layout.tsx`

### 11.5. Protection de la zone admin

### 11.6. Changement de thème entre layouts

---

## 12. Pages de l'application

### 12.1. Pages publiques

#### `/` — Page d'accueil

#### `/artists` — Liste des artistes

#### `/artists/[id]` — Fiche artiste

#### `/news` — Liste des actualités

#### `/news/[id]` — Détail d'une actualité

#### `/practical-info` — Informations pratiques

### 12.2. Page d'authentification

#### `/login`

### 12.3. Pages d'administration

#### `/admin/dashboard`

#### `/admin/artists`

#### `/admin/artists/[id]`

#### `/admin/news`

#### `/admin/news/[id]`

#### `/admin/users`

---

## 13. Tests

### 13.1. Stratégie de test

### 13.2. Outils — Vitest, React Testing Library, jsdom

### 13.3. Ce qui est testé et ce qui ne l'est pas
