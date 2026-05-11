# Frontend — Projet Vindhellfest

## Scripts Docker

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

## Variables d'environnement

- `NEXT_PUBLIC_API_URL` : URL de l'API utilisée côté client (navigateur).
- `API_URL_SERVER` : URL de l'API utilisée côté serveur (SSR Next.js, via le réseau Docker interne).

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
│   │   │   │   ├── AddArtistModal.tsx
│   │   │   │   ├── ArtistDetailContent.tsx
│   │   │   │   ├── ArtistEditButton.tsx
│   │   │   │   ├── DeleteArtistModal.tsx
│   │   │   │   ├── artistsContent.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── NewsContent.tsx
│   │   │   │   ├── newsDetailContent.tsx
│   │   │   │   ├── newsEditButton.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx
│   │   │       ├── UsersContent.tsx
│   │   │       ├── AddUserModal.tsx
│   │   │       └── DelateUserModal.tsx
│   │   ├── globals.css
│   │   ├── tokens.css
│   │   ├── animations.css
│   │   ├── icon.png
│   │   └── layout.tsx
│   ├── components/
│   │   ├── AddButton.tsx
│   │   ├── AdminUserProvider.tsx
│   │   ├── Banner.tsx
│   │   ├── ContactUs.tsx
│   │   ├── Footer.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── LegalMention.tsx
│   │   ├── LoadingLine.tsx
│   │   ├── ModalCloseButton.tsx
│   │   ├── ModalSetup.tsx
│   │   ├── Navigation.tsx
│   │   ├── SectionCta.tsx
│   │   └── SideBarTool.tsx
│   ├── config/
│   │   ├── festival.ts
│   │   └── ui.ts
│   ├── hooks/
│   │   ├── useNavPath.ts
│   │   └── useRoleGuard.ts
│   ├── functions/
│   │   ├── apiRequest.ts
│   │   └── getApiErrorMessage.ts
│   └── types/
│       └── index.ts
├── test/
│   ├── setup.ts
│   ├── integration/
│   │   └── AdminLayout.test.tsx
│   └── unitaire/
│       ├── components/
│       │   ├── Banner.test.tsx
│       │   ├── ContactUs.test.tsx
│       │   ├── Footer.test.tsx
│       │   ├── ForgotPassword.test.tsx
│       │   ├── MobilNav.test.tsx
│       │   ├── SectionCta.test.tsx
│       │   ├── useNavPath.test.tsx
│       │   └── useRoleGuard.test.tsx
│       ├── functions/
│       │   ├── apiRequest.test.ts
│       │   └── getApiErrorMessage.test.ts
│       └── pages/
│           ├── AddnewsModal.test.tsx
│           ├── AddArtistModal.test.tsx
│           ├── AddUserModal.test.tsx
│           ├── ChangePasswordModal.test.tsx
│           ├── DashboardContent.test.tsx
│           ├── DeletenewsModal.test.tsx
│           ├── DeleteArtistModal.test.tsx
│           ├── HomeHero.test.tsx
│           ├── HomeInfosPratiques.test.tsx
│           ├── HomeNews.test.tsx
│           ├── HomePartenaires.test.tsx
│           ├── HomeProgrammation.test.tsx
│           ├── artistsContent.test.tsx
│           ├── LoginPage.test.tsx
│           ├── NewsContent.test.tsx
│           ├── NewsDetailModal.test.tsx
│           └── UsersContent.test.tsx
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

## Dockerfile

Le projet utilise un Dockerfile multi-stage pour générer deux types d'images à partir du même fichier : une image de développement et une image de production.
Le frontend bénéficie de 5 stages car il possède plus de dépendances, ce qui optimise la taille et le temps de rebuild.

- Base commune : `node:20-alpine`
- Stage `deps` : installation des dépendances
- Stage `builder` : copie des dépendances, copie du code et lancement du build
- Image de production (`runner`)
- Image de développement (`dev`)

---

## `src/`

### `app/`

- **`tokens.css`** : Variables CSS uniquement — un seul `:root` structuré en 7 sections (dimensions, couleurs, espacement contextuel, typographie, animation). Importé par `globals.css`.
- **`animations.css`** : Keyframes uniquement — définit 8 keyframes : `marquee-left`/`marquee-right` (défilement partenaires), `line-reload` (animation hover SectionCta), `line-expand` (pulsation LoadingLine), `slide-in-left`/`slide-in-right`/`blur-in`/`scale-in` (animations hero et sidebar). Jamais référencé dans `globals.css` directement — consommé via `.hero-slide-left` ou inline style dans les composants.
- **`globals.css`** : Importe `tailwindcss`, `tokens.css` et `animations.css`, déclare les thèmes `admin`/`visitor` et les classes composants Tailwind partagées dans `@layer components` (boutons, formulaires, modales, cartes, layout, pages, marquee).
- **`layout.tsx`** : Layout racine Next.js — charge la police Google, définit les métadonnées SEO. Ne contient pas de Banner/Footer (délégués aux layouts de section). Inclut un `<div id="app-root">` wrapper à l'intérieur du `<body>` pour permettre à `react-modal` d'appliquer `aria-hidden` correctement sans masquer l'intégralité de l'arbre d'accessibilité.

L'application est divisée en trois zones distinctes avec chacune leur layout :

**Zone publique — `(public)/`**

Le groupe de routes `(public)` est transparent pour les URLs (n'affecte pas les chemins). Son layout fournit `Banner` et `Footer` aux pages visiteur, avec `data-theme="visitor"` posé côté serveur.

| Dossier | Route | Description |
| --- | --- | --- |
| `(public)/page.tsx` | `/` | Page d'accueil — composant serveur async avec ISR (`revalidate: 60`). Fetche `GET /public/home` via `API_URL_SERVER` et assemble les 5 sections : `HomeHero`, `HomeProgrammation`, `HomeNews`, `HomeInfosPratiques`, `HomePartenaires` |
| `(public)/artists/` | `/artists` | Programmation du festival — liste les artistes depuis l'API publique. Chaque carte navigue vers `/artists/[id]` |
| `(public)/artists/[id]/` | `/artists/:id` | Détail d'un artiste — server component avec ISR (`revalidate: 60`). Fetche `GET /public/artists/:id` et passe l'artiste à `ArtistDetailContent`. Redirige vers `/artists` via `notFound()` si l'artiste n'existe pas |
| `(public)/news/` | `/news` | Actualités du festival — liste les news publiées depuis `GET /public/news` avec image, titre, auteur et date. Chaque carte navigue vers `/news/[id]` |
| `(public)/news/[id]/` | `/news/:id` | Détail d'une news — server component avec ISR (`revalidate: 60`). Fetche `GET /public/news/:id` et passe la news à `newsDetailContent`. Redirige vers `/news` via `notFound()` si la news n'existe pas ou n'est pas publiée |
| `(public)/practical-info/` | `/practical-info` | Informations pratiques |

**Zone authentification — `(auth)/`**

Le groupe de routes `(auth)` est transparent pour les URLs. Son layout est identique au layout public mais applique `data-theme="admin"` côté serveur, permettant à la page login d'afficher le thème admin sans appartenir à la zone admin.

| Dossier | Route | Description |
| --- | --- | --- |
| `(auth)/login/` | `/login` | Formulaire de connexion à l'espace admin |

**Zone admin — `admin/` (accès protégé)**

| Dossier | Route | Description |
| --- | --- | --- |
| `admin/layout.tsx` | — | Vérifie la session via `/admin/auth/me`, redirige vers `/login` si non authentifié. Fournit `AdminUserProvider`, `Banner` et `Footer` — `Banner` a accès aux données utilisateur pour filtrer les liens par rôle |
| `admin/dashboard/` | `/admin/dashboard` | Tableau de bord (`DashboardContent.tsx`, `ChangePasswordModal.tsx`) — ouvre automatiquement la modale de changement de mot de passe si `mustChangePassword` est vrai. Affiche dynamiquement les dates du festival depuis `FESTIVAL_DAYS` |
| `admin/artists/` | `/admin/artists` | Programmation — liste les artistes avec leur concert (`artistsContent.tsx`), modale d'ajout 3 étapes (`AddArtistModal.tsx`), modale de suppression (`DeleteArtistModal.tsx`) — accès restreint aux rôles `admin` et `artists` via `useRoleGuard`. Le champ date est un `<select>` limité aux jours de `FESTIVAL_DAYS`. Les concerts à cheval sur minuit sont gérés (end_time automatiquement décalé au lendemain). Chaque carte navigue vers `/admin/artists/[id]` |
| `admin/artists/[id]/` | `/admin/artists/:id` | Détail et édition d'un artiste — client component, fetche `GET /public/artists/:id` via `apiRequest`. Affiche `ArtistDetailContent` (rendu statique partagé avec la page publique) et `ArtistEditButton` (`"use client"` — bouton + `AddArtistModal` en mode édition). Hérite des restrictions de rôle de `/admin/artists` via `useRoleGuard` avec correspondance préfixe |
| `admin/news/` | `/admin/news` | Gestion des actualités (`NewsContent.tsx`, `AddnewsModal.tsx`) — accès restreint aux rôles `admin` et `news` via `useRoleGuard`. Les brouillons (`is_published = false`) sont visibles uniquement en admin. Le tri Croissant/Décroissant est géré côté client. L'édition d'une news se fait depuis la page de détail |
| `admin/news/[id]/` | `/admin/news/:id` | Détail et édition d'une news — client component, fetche `GET /public/news/:id` via `apiRequest` (cookies d'auth pour l'accès aux brouillons). Affiche `newsDetailContent` et `newsEditButton` (`"use client"` — bouton + `AddnewsModal` en mode édition). Hérite des restrictions de rôle de `/admin/news` via `useRoleGuard` avec correspondance préfixe |
| `admin/users/` | `/admin/users` | Gestion des utilisateurs (`UsersContent.tsx`, `AddUserModal.tsx`, `DelateUserModal.tsx`) — accès restreint au rôle `admin` via `useRoleGuard`. `AddUserModal` gère l'ajout et la modification via une seule instance (prop `userToEdit`). Si l'utilisateur connecté se supprime lui-même, il est redirigé vers `/login` |

### `components/`

Composants UI réutilisables à travers l'application.

| Fichier | Description |
| --- | --- |
| `AdminUserProvider.tsx` | Context React qui expose les données de l'utilisateur admin connecté (`AdminUser`, `mustChangePassword`) — retourne `null` hors provider |
| `AddButton.tsx` | Bouton hamburger visible uniquement sur mobile — ouvre une modale `Navigation` pour afficher les filtres de la page (artists ou news). Utilisé dans `(public)/artists/page.tsx` et `(public)/news/page.tsx` |
| `Banner.tsx` | Bannière de navigation principale — sticky header, transparent sur la page d'accueil tant que l'utilisateur n'a pas scrollé (opaque dès le premier pixel de défilement via scroll listener), filtre les liens admin par rôle via `filterNavByRole`, gère aussi le logout |
| `ContactUs.tsx` | Formulaire de contact (modale) |
| `Footer.tsx` | Pied de page avec liens réseaux sociaux et liens légaux |
| `ForgotPassword.tsx` | Modale mot de passe oublié |
| `LegalMention.tsx` | Modale mentions légales |
| `LoadingLine.tsx` | Indicateur de chargement — texte "Chargement" centré avec une ligne bleue (`--color-3`) animée en pulsation via `line-expand`. Utilisé dans `artistsContent` et `NewsContent` |
| `ModalCloseButton.tsx` | Bouton de fermeture générique pour les modales |
| `ModalSetup.tsx` | Initialise `Modal.setAppElement("#app-root")` une seule fois au niveau du layout racine |
| `Navigation.tsx` | Barre de navigation — adapte les liens selon le contexte (visiteur / admin) et les filtres de page |
| `SectionCta.tsx` | Séparateur CTA réutilisable — bouton "Voir plus" centré entre deux lignes horizontales, navigue vers le `href` passé en prop |
| `SideBarTool.tsx` | Layout avec navigation sticky sur desktop et contenu principal à droite — sur mobile, n'affiche que les enfants. Utilisé dans les pages publiques artists et news, et les pages admin correspondantes |

### `hooks/`

Hooks React réutilisables découplés des composants.

| Fichier | Description |
| --- | --- |
| `useNavPath.ts` | Expose `pathname` et `isAdminPath` dérivés de `usePathname()` — consommé par `Banner`, `SideBarTool` et `AddButton` |
| `useRoleGuard.ts` | Redirige vers `/admin/dashboard` si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante — compare le rôle via `useAdminUser()` et la route via `useNavPath()` avec les restrictions définies dans `navAdminItem`. Utilise une correspondance préfixe (`startsWith`) pour que les routes dynamiques (ex : `/admin/news/[id]`) héritent automatiquement des restrictions de leur route parente |

### `config/`

Centralise les constantes de configuration du frontend.

| Fichier | Description |
| --- | --- |
| `festival.ts` | Source de vérité unique pour les données du festival — exporte `FESTIVAL_DAYS`, `FESTIVAL_LOCATION` et `TICKETING_URL`. Consommé par `DashboardContent`, `ui.ts`, `AddArtistModal`, `HomeInfosPratiques`, `Banner` et `HomeHero` |
| `ui.ts` | Définit les items de navigation et de filtrage — liens visiteur (`navVisitorItems`), liens admin (`navAdminItem`, `navAdminQuickLinks`), filtres artists/news/users, rôles utilisateurs (`USER_ROLES`). Expose `filterNavByRole` pour filtrer les liens selon le rôle de l'utilisateur |

### `functions/`

Utilitaires partagés pour les appels API et la gestion des erreurs.

| Fichier | Description |
| --- | --- |
| `apiRequest.ts` | Wrapper `fetch` typé — retourne toujours `{ data, error: null }` en succès ou `{ data: null, error: ApiRequestError }` en échec |
| `getApiErrorMessage.ts` | Traduit un `ApiRequestError` en message lisible — priorité au message backend, puis fallback par code HTTP (`401`, `403`, `404`, `429`, `>=500`) |

### `types/`

Types TypeScript partagés entre plusieurs composants.

| Fichier | Description |
| --- | --- |
| `type.ts` | Centralise les types métier réutilisables : `UserRole`, `UserItem`, `AdminUser`, `AdminAuthMeResponse`, `NewsItem`, `HomeNews`, `ArtistItem`, `HomeArtist`, `NavItem`, `ApiMessageResponse`, `CreateApiResponse` |

---

## `test/`

Contient la configuration globale des tests et tous les fichiers de test. Vitest exécute les tests et les assertions, Testing Library valide le rendu et les interactions, jsdom simule l'environnement navigateur.

### `setup.ts`

Fichier d'initialisation chargé avant chaque test — importe les matchers `@testing-library/jest-dom` pour étendre `expect` (ex : `toBeInTheDocument`, `toBeDisabled`).

### `integration/`

Tests qui font appel à des systèmes externes (fetch vers le backend, cookies…).

| Fichier | Description |
| --- | --- |
| `AdminLayout.test.tsx` | Vérifie que le layout admin appelle bien `/admin/auth/me`, gère les cookies de session et redirige vers `/login` en cas d'échec |

### `unitaire/components/`

Tests unitaires des composants React réutilisables.

| Fichier | Description |
| --- | --- |
| `SectionCta.test.tsx` | Vérifie le label par défaut, le label personnalisé et le href du lien |
| `useNavPath.test.tsx` | Vérifie la détection de la route admin (`isAdminPath`) via le hook `useNavPath` |
| `Banner.test.tsx` | Vérifie le rendu desktop/mobile et l'affichage conditionnel du bouton billetterie |
| `ContactUs.test.tsx` | Vérifie le formulaire de contact — activation du bouton, succès, erreur 400 et fallback 500 |
| `Footer.test.tsx` | Vérifie l'ouverture/fermeture des modales mentions légales et contact |
| `ForgotPassword.test.tsx` | Vérifie le formulaire mot de passe oublié — désactivation du bouton, succès, erreur 404 et fallback 500 |
| `MobilNav.test.tsx` | Vérifie l'ouverture/fermeture de la navigation mobile |
| `useRoleGuard.test.tsx` | Vérifie la redirection vers `/admin/dashboard` si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante |

### `unitaire/functions/`

Tests unitaires des utilitaires partagés.

| Fichier | Description |
| --- | --- |
| `apiRequest.test.ts` | Vérifie le wrapper fetch — succès, erreur HTTP et erreur réseau |
| `getApiErrorMessage.test.ts` | Vérifie les messages d'erreur — passthrough backend et fallbacks par code HTTP |

### `unitaire/pages/`

Tests unitaires des pages et de leurs flux principaux.

| Fichier | Description |
| --- | --- |
| `AddnewsModal.test.tsx` | Vérifie la modale d'ajout/modification news — navigation 2 étapes, validation (titre min 2 chars, description + image obligatoires en création), soumission POST et PATCH, mode édition pré-rempli (image optionnelle), erreur API |
| `AddArtistModal.test.tsx` | Vérifie la modale d'ajout/modification artiste — navigation entre les 3 étapes, validation des champs obligatoires, champs YouTube/Spotify optionnels, soumission réussie (POST et PATCH), mode édition pré-rempli et gestion des erreurs API |
| `DeletenewsModal.test.tsx` | Vérifie `DeleteModal` dans le contexte news — confirmation avec titre, succès (appel onDeleted), erreur API, fermeture après suppression |
| `DeleteArtistModal.test.tsx` | Vérifie la modale de suppression artiste — confirmation, succès, erreur API et fermeture après suppression |
| `NewsContent.test.tsx` | Vérifie la liste des news — chargement, affichage titre/auteur, fallback "Auteur inconnu", badge "Brouillon" (admin uniquement), filtre brouillons sur page publique, bouton Supprimer en admin, lien "Voir plus" vers `basePath/[id]`, tri Croissant, suppression et modification |
| `ChangePasswordModal.test.tsx` | Vérifie la modale de changement de mot de passe — validation des saisies, gestion des erreurs API et mode forcé (sans bouton de fermeture) |
| `DashboardContent.test.tsx` | Vérifie le tableau de bord — ouverture automatique de la modale si `mustChangePassword` est vrai et affichage des informations utilisateur |
| `HomeHero.test.tsx` | Vérifie le logo (alt) |
| `HomeInfosPratiques.test.tsx` | Vérifie l'affichage du nom, adresse, ville et le lien vers `/practical-info` |
| `HomeNews.test.tsx` | Vérifie l'affichage des titres de news et le retour null si tableau vide |
| `HomePartenaires.test.tsx` | Vérifie le nombre de logos, la présence d'un alt non vide et le lien vers `/practical-info` |
| `HomeProgrammation.test.tsx` | Vérifie l'affichage des noms d'artistes, scènes, dates formatées et le retour null si tableau vide |
| `artistsContent.test.tsx` | Vérifie la liste des artistes — chargement, affichage avec données concert, fallbacks null (scène/date non définies), liste vide, erreur API, suppression et ajout d'un artiste |
| `LoginPage.test.tsx` | Vérifie le formulaire de connexion — gestion des erreurs (401, 429, 500) et redirection en cas de succès |
| `UsersContent.test.tsx` | Vérifie le CRUD utilisateurs — chargement de la liste, ajout, modification, suppression, gestion des erreurs et redirection vers `/login` si l'utilisateur connecté se supprime lui-même |

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

---

## ESLint & Prettier

### ESLint — Analyseur de code

Vérifie le code TypeScript/JavaScript pour détecter :

- erreurs de logique
- mauvaises pratiques
- variables non utilisées
- types incorrects
- règles de style définies par l'équipe

### Prettier — Formateur automatique

S'occupe uniquement de la mise en forme :

- indentation
- guillemets
- trailing commas
- espaces et retours à la ligne
