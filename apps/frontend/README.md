# Frontend — Projet Vindhellfest

Ce dossier contient l'application frontend du projet Vindhellfest, développée avec **Next.js 16** (App Router) et **TypeScript**.
Elle couvre l'interface publique du festival (programmation, actualités, informations pratiques) ainsi que l'interface d'administration protégée (gestion des artistes, des news et des utilisateurs).

Trois documents de référence complètent ce README :

| Fichier           | Description                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `STYLE.md`      | État réel du système de styles — tokens CSS, classes `@layer components`, animations |
| `TYPE.md`       | État réel des types TypeScript — types déclarés dans `src/type.ts` et conventions   |
| `tests/TEST.md` | État réel de la couverture de tests — fichiers, cas testés, outils utilisés           |

---

## Architecture

```
apps/frontend/
├── public/
│   ├── header_logo.png
│   ├── hero_bg.webp
│   ├── hero_logo.webp
│   └── partners/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── HomeHero.tsx
│   │   │   ├── HomeProgrammation.tsx
│   │   │   ├── HomeNews.tsx
│   │   │   ├── HomeInfosPratiques.tsx
│   │   │   ├── HomePartenaires.tsx
│   │   │   ├── artists/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── practical-info/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── DashboardContent.tsx
│   │   │   │   └── ChangePasswordModal.tsx
│   │   │   ├── artists/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ArtistEditButton.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── NewsEditButton.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx
│   │   │       ├── UsersContent.tsx
│   │   │       └── AddUserModal.tsx
│   │   ├── globals.css
│   │   ├── tokens.css
│   │   ├── animations.css
│   │   ├── icon.png
│   │   └── layout.tsx
│   ├── components/
│   │   ├── modals/
│   │   │   ├── AddArtistModal.tsx
│   │   │   ├── AddNewsModal.tsx
│   │   │   └── DeleteModal.tsx
│   │   ├── MobileFiltersButton.tsx
│   │   ├── AdminUserProvider.tsx
│   │   ├── ArtistDetailContent.tsx
│   │   ├── ArtistsContent.tsx
│   │   ├── Banner.tsx
│   │   ├── ContactUs.tsx
│   │   ├── Footer.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── LegalMention.tsx
│   │   ├── LoadingLine.tsx
│   │   ├── ModalCloseButton.tsx
│   │   ├── ModalSetup.tsx
│   │   ├── Navigation.tsx
│   │   ├── NewsContent.tsx
│   │   ├── NewsDetailContent.tsx
│   │   ├── SectionCta.tsx
│   │   └── SideBarTool.tsx
│   ├── config/
│   │   ├── festival.ts
│   │   └── ui.ts
│   ├── hooks/
│   │   ├── useDelete.ts
│   │   ├── useFetch.ts
│   │   ├── useModal.ts
│   │   ├── useMutation.ts
│   │   ├── useNavPath.ts
│   │   └── useRoleGuard.ts
│   ├── functions/
│   │   ├── apiRequest.ts
│   │   ├── fetchPublic.ts
│   │   ├── formatDate.ts
│   │   ├── getApiErrorMessage.ts
│   │   └── validation.ts
│   ├── declarations.d.ts
│   └── type.ts
├── tests/
│   ├── TEST.md
│   ├── setup.ts
│   ├── tsconfig.json
│   ├── components/
│   │   ├── AddArtistModal.test.tsx
│   │   ├── AddNewsModal.test.tsx
│   │   ├── AddUserModal.test.tsx
│   │   ├── AdminArtistDetailPage.test.tsx
│   │   ├── AdminNewsDetailPage.test.tsx
│   │   ├── ArtistsContent.test.tsx
│   │   ├── ArtistsPage.test.tsx
│   │   ├── ChangePasswordModal.test.tsx
│   │   ├── ContactUs.test.tsx
│   │   ├── DashboardContent.test.tsx
│   │   ├── DeleteModal.test.tsx
│   │   ├── Footer.test.tsx
│   │   ├── ForgotPassword.test.tsx
│   │   ├── LoginPage.test.tsx
│   │   ├── NewsContent.test.tsx
│   │   ├── NewsPage.test.tsx
│   │   ├── UsersContent.test.tsx
│   │   └── UsersPage.test.tsx
│   ├── functions/
│   │   ├── filterNavByRole.test.ts
│   │   ├── formatDate.test.ts
│   │   ├── getApiErrorMessage.test.ts
│   │   └── validation.test.ts
│   └── hooks/
│       ├── useDelete.test.ts
│       ├── useFetch.test.ts
│       ├── useMutation.test.ts
│       └── useRoleGuard.test.ts
├── .dockerignore
├── .gitignore
├── .prettierignore
├── .prettierrc
├── Dockerfile
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── STYLE.md
```

---

## Stack technique

**Dependencies**

- `next` : Framework React pour le rendu hybride (SSR/SSG).
- `react` : Bibliothèque UI.
- `react-dom` : Rendu React dans le navigateur.
- `react-modal` : Composant de modale accessible.
- `@fortawesome/react-fontawesome` : Composants Font Awesome pour React.
- `@fortawesome/fontawesome-svg-core` : Cœur Font Awesome.
- `@fortawesome/free-solid-svg-icons` : Pack d'icônes solid Font Awesome.
- `@fortawesome/free-regular-svg-icons` : Pack d'icônes regular Font Awesome.
- `@fortawesome/free-brands-svg-icons` : Pack d'icônes de marques (YouTube, Spotify…).

**DevDependencies**

- `typescript` : Compilateur TypeScript.
- `tailwindcss` : Framework CSS utilitaire.
- `@tailwindcss/postcss` : Intégration Tailwind via PostCSS.
- `eslint` : Analyse statique du code.
- `eslint-config-next` : Règles ESLint pour Next.js.
- `prettier` : Formateur de code automatique.
- `vitest` : Runner de tests.
- `@testing-library/react` : Tests de composants React.
- `@testing-library/jest-dom` : Matchers DOM pour tests.
- `@testing-library/user-event` : Simulation d'interactions utilisateur.
- `jsdom` : Environnement DOM pour les tests.
- `@types/node` : Définitions TypeScript pour Node.js.
- `@types/react` : Définitions TypeScript pour React.
- `@types/react-dom` : Définitions TypeScript pour React DOM.
- `@types/react-modal` : Définitions TypeScript pour React Modal.

---

## Configuration Next.js

### `next.config.ts`

Fichier de configuration de Next.js — permet d'étendre et de personnaliser le comportement du framework au-delà des valeurs par défaut.
Il est chargé au démarrage du serveur et s'applique aussi bien en développement qu'en production.

| Option       | Description                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rewrites` | Redirige les requêtes `/uploads/:path*` vers le backend (`API_URL_SERVER/uploads/:path*`) — permet au navigateur d'accéder aux images uploadées sans CORS |
| `images`   | Autorise les images distantes : tout domaine en `https` et `localhost` en `http` — nécessaire pour `next/image` avec des sources externes               |

---

## `.gitignore`

Ce fichier est généré automatiquement par `create-next-app`. Il complète le `.gitignore` racine en couvrant des entrées spécifiques à Next.js absentes de ce dernier : le dossier `.next/` (build et cache), `next-env.d.ts` (fichier TypeScript généré au démarrage) et `*.tsbuildinfo` (cache de compilation TypeScript).

---

## Docker

Le dossier utilise Docker pour conteneuriser l'application et l'intégrer dans l'architecture multi-services du projet.
Le `Dockerfile` définit comment construire l'image, et Docker Compose orchestre son démarrage en lien avec le backend et la base de données.

---

### `Dockerfile`

Le Dockerfile utilise le **multi-stage build** : un seul fichier produit plusieurs images distinctes selon l'usage (développement ou production). Chaque stage hérite du précédent ou repart de la base, ce qui permet de n'embarquer que le strict nécessaire dans l'image finale.

Image de base commune : `node:20-alpine` — légère, répertoire de travail `/app`, télémétrie Next.js désactivée (`NEXT_TELEMETRY_DISABLED=1`).

| Stage       | Hérite de | Rôle                                                                                                                                                                                                                      |
| ----------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`    | —         | Image de base commune —`node:20-alpine`, `WORKDIR /app`, désactive la télémétrie Next.js                                                                                                                          |
| `deps`    | `base`   | Copie `package.json` + `package-lock.json` et installe toutes les dépendances via `npm ci`                                                                                                                          |
| `builder` | `base`   | Copie les `node_modules` depuis `deps`, copie tout le code source, compile l'application (`npm run build`)                                                                                                           |
| `runner`  | `base`   | **Image de production** — installe uniquement les dépendances de production (`--omit=dev`), copie `.next/`, `public/` et `next.config.ts` depuis `builder`. Lance `npm run start` sur le port `3000` |
| `dev`     | `base`   | **Image de développement** — installe toutes les dépendances, copie tout le code source. Lance `npm run dev` sur le port `3000`. Utilisé par Docker Compose                                                  |

> Le stage `deps` est isolé pour tirer parti du cache Docker — les dépendances ne sont réinstallées que si `package.json` ou `package-lock.json` changent, même si le code source évolue.

- `docker compose up -d frontend` : Démarrer le frontend
- `docker compose restart frontend` : Redémarrer uniquement le frontend
- `docker compose logs -f frontend` : Consulter les logs

Pour exécuter une commande npm dans le conteneur :

```bash
docker exec -it vindhellfest-frontend npm run lint
docker exec -it vindhellfest-frontend npm run format
docker exec -it vindhellfest-frontend npm test
docker exec -it vindhellfest-frontend npm run test:run
```

---

## ESLint — `eslint.config.mjs`

Analyse statique du code TypeScript/React — détecte les erreurs de logique, les mauvaises pratiques, les variables inutilisées et les violations de typage.

| Configuration     | Valeur                                              | Description                                           |
| ----------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `nextVitals`    | `eslint-config-next/core-web-vitals`              | Règles Next.js strictes incluant les Core Web Vitals |
| `nextTs`        | `eslint-config-next/typescript`                   | Règles TypeScript pour Next.js                       |
| Dossiers ignorés | `.next/`, `out/`, `build/`, `next-env.d.ts` | Exclus de l'analyse — générés automatiquement     |

---

## Prettier — `.prettierrc`

Formateur automatique — s'occupe uniquement de la mise en forme, indépendamment de la logique du code.

| Option          | Valeur    | Description                                                        |
| --------------- | --------- | ------------------------------------------------------------------ |
| `semi`        | `true`  | Point-virgule en fin d'instruction                                 |
| `singleQuote` | `false` | Guillemets doubles                                                 |
| `tabWidth`    | `2`     | Indentation de 2 espaces                                           |
| `endOfLine`   | `auto`  | Fin de ligne adaptée au système (LF sur Linux, CRLF sur Windows) |

---

### `.prettierignore`

Liste les fichiers et dossiers exclus du formatage automatique.

| Entrée           | Raison                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| `README.md`     | Fichier de documentation — le formatage Prettier casserait les tableaux Markdown |
| `STYLE.md`      | Idem                                                                              |
| `node_modules/` | Dépendances — jamais formatées                                                 |
| `.next/`        | Build Next.js généré automatiquement                                           |

---

## `src/`

Contient l'intégralité du code source de l'application — pages, composants, hooks, fonctions utilitaires, types et styles.

---

### `app/`

Dossier de routage Next.js App Router — chaque sous-dossier correspond à une route, chaque `page.tsx` est une page rendue côté serveur.

#### routage

Next.js App Router génère les routes à partir de la structure des dossiers. Chaque `page.tsx` définit une page accessible, chaque `layout.tsx` définit un layout partagé pour toutes ses pages enfants.

**Conventions de nommage**

| Convention     | Exemple              | Effet                                                                                        |
| -------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `page.tsx`   | `artists/page.tsx` | Définit la page rendue pour cette route                                                     |
| `layout.tsx` | `admin/layout.tsx` | Layout partagé appliqué à toutes les pages du dossier et de ses sous-dossiers             |
| `(groupe)/`  | `(public)/`        | Route group — organise les fichiers et partage un layout sans ajouter de segment dans l'URL |
| `[param]/`   | `[id]/`            | Segment dynamique — la valeur est accessible via `params.id` dans le composant            |

**Routes de l'application**

| Route                  | Fichier source                       | Zone     |
| ---------------------- | ------------------------------------ | -------- |
| `/`                  | `(public)/page.tsx`                | Publique |
| `/artists`           | `(public)/artists/page.tsx`        | Publique |
| `/artists/:id`       | `(public)/artists/[id]/page.tsx`   | Publique |
| `/news`              | `(public)/news/page.tsx`           | Publique |
| `/news/:id`          | `(public)/news/[id]/page.tsx`      | Publique |
| `/practical-info`    | `(public)/practical-info/page.tsx` | Publique |
| `/login`             | `(auth)/login/page.tsx`            | Auth     |
| `/admin/dashboard`   | `admin/dashboard/page.tsx`         | Admin    |
| `/admin/artists`     | `admin/artists/page.tsx`           | Admin    |
| `/admin/artists/:id` | `admin/artists/[id]/page.tsx`      | Admin    |
| `/admin/news`        | `admin/news/page.tsx`              | Admin    |
| `/admin/news/:id`    | `admin/news/[id]/page.tsx`         | Admin    |
| `/admin/users`       | `admin/users/page.tsx`             | Admin    |

**Layouts par zone**

| Zone         | Layout                  | Rôle                                                                                        |
| ------------ | ----------------------- | -------------------------------------------------------------------------------------------- |
| Racine       | `app/layout.tsx`      | Police, SEO global, wrapper `#app-root`                                                    |
| `(public)` | `(public)/layout.tsx` | Ajoute la `Banner` et le `Footer` pour toutes les pages publiques                        |
| `(auth)`   | `(auth)/layout.tsx`   | Layout minimaliste pour la page de connexion — sans Banner ni Footer                        |
| `admin`    | `admin/layout.tsx`    | Vérifie la session via `GET /admin/auth/me`, redirige vers `/login` si non authentifié |

---

#### `layout.tsx (racine)`

Layout racine Next.js — point d'entrée de toute l'application. Il regroupe trois configurations globales, enveloppe le contenu dans un `<div id="app-root">` requis par `react-modal`, et délègue Banner et Footer aux layouts de chaque zone.

**Police d'affichage — `next/font/google`**

| Option       | Valeur             | Description                                                                        |
| ------------ | ------------------ | ---------------------------------------------------------------------------------- |
| Police       | `Bebas_Neue`     | Police Google chargée via `next/font` — optimisée et auto-hébergée          |
| `subsets`  | `["latin"]`      | Sous-ensemble de caractères chargé — réduit le poids du fichier de police      |
| `weight`   | `"400"`          | Grammage unique (Bebas Neue n'existe qu'en regular)                                |
| `display`  | `"swap"`         | Affiche d'abord la police de substitution, remplace dès que Bebas Neue est prête |
| `variable` | `--font-display` | Token CSS injecté dans `tokens.css` et référencé dans les composants         |

**FontAwesome — `config.autoAddCss = false`**

| Paramètre     | Valeur    | Description                                                                                                                                                                                                   |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoAddCss` | `false` | Désactive l'injection automatique du CSS FontAwesome dans le `<head>` — le fichier `styles.css` est importé manuellement à la place pour éviter le flash d'icônes non stylées (FOUT) au chargement |

**Métadonnées SEO — `metadata`**

| Champ           | Valeur                                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| `title`       | `"Vindellfest"`                                                                                               |
| `description` | `"Vindhellfest — Le festival de musique en Charente. Programmation, actualités et informations pratiques."` |

---

#### `icon.png`

Favicon du site — convention de fichier Next.js App Router. Placé directement dans `app/`, il est détecté automatiquement par le framework et injecté dans le `<head>` de toutes les pages sans aucune configuration supplémentaire.

---

### `Components/`
---

### `config/`
---

### `function/`
---

### `hooks/`
---

## `public/`

Contient les assets statiques servis directement par Next.js sans traitement — accessibles depuis la racine `/` de l'application.

| Fichier / Dossier   | Description                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header_logo.png` | Logo affiché dans la bannière de navigation                                                                                                                             |
| `hero_logo.webp`  | Logo principal affiché dans la section hero de la page d'accueil                                                                                                         |
| `hero_bg.webp`    | Image de fond de la section hero                                                                                                                                          |
| `partners/`       | Images des partenaires du festival — 23 fichiers `.webp` (`partenaire-1.webp` à `partenaire-23.webp`) utilisés dans le bandeau défilant `HomePartenaires.tsx` |

---

## Gestion des erreurs

La gestion des erreurs est centralisée autour de deux helpers :

### `apiRequest.ts` — Normalisation technique

- Chaque appel retourne un format unique :
  - succès : `{ data, error: null }`
  - échec : `{ data: null, error: ApiRequestError }`
- Si la réponse HTTP est en erreur (`!response.ok`) : lecture du message backend (`error`) si présent, puis création d'une `ApiRequestError(message, status)`.
- Si `fetch` échoue (réseau/runtime) : conversion en `ApiRequestError(..., 500)`.

### `getApiErrorMessage.ts` — Message utilisateur

- Priorité au message explicite venant du backend.
- Sinon fallback selon le status :
  - `401` : session expirée
  - `403` : accès refusé
  - `404` : ressource introuvable
  - `429` : trop de tentatives
  - `>=500` : erreur serveur

### Utilisation dans l'UI

- `src/app/(auth)/login/page.tsx` : affiche le message d'erreur formaté.
- `src/components/Banner.tsx` : ignore silencieusement l'erreur en cas d'échec du logout, puis redirige vers `/login` en cas de succès.
- `src/app/admin/layout.tsx` : vérifie la session via `/admin/auth/me` et redirige vers `/login` en cas d'échec.
