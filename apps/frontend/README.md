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
│   │   ├── AddButton.tsx
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
│           ├── AddArticleModal.test.tsx
│           ├── AddArtistModal.test.tsx
│           ├── AddUserModal.test.tsx
│           ├── ArtistDetailModal.test.tsx
│           ├── ArtistsContent.test.tsx
│           ├── ChangePasswordModal.test.tsx
│           ├── DashboardContent.test.tsx
│           ├── DeleteArticleModal.test.tsx
│           ├── DeleteArtistModal.test.tsx
│           ├── HomeHero.test.tsx
│           ├── HomeInfosPratiques.test.tsx
│           ├── HomeNews.test.tsx
│           ├── HomePartenaires.test.tsx
│           ├── HomeProgrammation.test.tsx
│           ├── LoginPage.test.tsx
│           ├── NewsContent.test.tsx
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

| Dossier                      | Route               | Description                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `(public)/page.tsx`        | `/`               | Page d'accueil — composant serveur async avec ISR (`revalidate: 60`). Fetche `GET /public/home` via `API_URL_SERVER` et assemble les 5 sections : `HomeHero`, `HomeProgrammation`, `HomeNews`, `HomeInfosPratiques`, `HomePartenaires` |
| `(public)/artists/`        | `/artists`        | Programmation du festival — liste les artistes depuis l'API publique. Chaque carte navigue vers `/artists/[id]`                                                                                                                                      |
| `(public)/artists/[id]/`   | `/artists/:id`    | Détail d'un artiste — server component avec ISR (`revalidate: 60`). Fetche `GET /public/artists/:id` et passe l'artiste à `ArtistDetailContent`. Redirige vers `/artists` via `notFound()` si l'artiste n'existe pas                       |
| `(public)/news/`           | `/news`           | Actualités du festival — liste les news publiées depuis `GET /public/news` avec image, titre, auteur et date. Chaque carte navigue vers `/news/[id]`                                                                                             |
| `(public)/news/[id]/`      | `/news/:id`       | Détail d'une news — server component avec ISR (`revalidate: 60`). Fetche `GET /public/news/:id` et passe la news à `newsDetailContent`. Redirige vers `/news` via `notFound()` si la news n'existe pas ou n'est pas publiée               |
| `(public)/practical-info/` | `/practical-info` | Informations pratiques                                                                                                                                                                                                                                  |

**Zone authentification — `(auth)/`**

Le groupe de routes `(auth)` est transparent pour les URLs. Son layout est identique au layout public mais applique `data-theme="admin"` côté serveur, permettant à la page login d'afficher le thème admin sans appartenir à la zone admin.

| Dossier           | Route      | Description                               |
| ----------------- | ---------- | ----------------------------------------- |
| `(auth)/login/` | `/login` | Formulaire de connexion à l'espace admin |

**Zone admin — `admin/` (accès protégé)**

| Dossier                 | Route                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin/layout.tsx`    | —                     | Vérifie la session via `/admin/auth/me`, redirige vers `/login` si non authentifié. Fournit `AdminUserProvider`, `Banner` et `Footer` — `Banner` a accès aux données utilisateur pour filtrer les liens par rôle                                                                                                                                                                                                                                                              |
| `admin/dashboard/`    | `/admin/dashboard`   | Tableau de bord (`DashboardContent.tsx`, `ChangePasswordModal.tsx`) — ouvre automatiquement la modale de changement de mot de passe si `mustChangePassword` est vrai. Affiche dynamiquement les dates du festival depuis `FESTIVAL_DAYS`                                                                                                                                                                                                                                               |
| `admin/artists/`      | `/admin/artists`     | Programmation — liste les artistes avec leur concert (`ArtistsContent`), modale d'ajout 3 étapes (`AddArtistModal`), modale de suppression générique (`DeleteModal`) — accès restreint aux rôles `admin` et `artists` via `useRoleGuard`. Le champ date est un `<select>` limité aux jours de `FESTIVAL_DAYS`. Les concerts à cheval sur minuit sont gérés (end_time automatiquement décalé au lendemain). Chaque carte navigue vers `/admin/artists/[id]` |
| `admin/artists/[id]/` | `/admin/artists/:id` | Détail et édition d'un artiste — client component, fetche `GET /public/artists/:id` via `apiRequest`. Affiche `ArtistDetailContent` (rendu statique partagé avec la page publique) et `ArtistEditButton` (`"use client"` — bouton + `AddArtistModal` en mode édition). Hérite des restrictions de rôle de `/admin/artists` via `useRoleGuard` avec correspondance préfixe                                                                                              |
| `admin/news/`         | `/admin/news`        | Gestion des actualités (`NewsContent`, `AddNewsModal`) — accès restreint aux rôles `admin` et `news` via `useRoleGuard`. Les brouillons (`is_published = false`) sont visibles uniquement en admin avec un badge "Brouillon". Le tri "Plus récent" / "Plus ancien" est géré côté client. L'édition d'une news se fait depuis la page de détail                                                                                                                                                     |
| `admin/news/[id]/`    | `/admin/news/:id`    | Détail et édition d'une news — client component, fetche `GET /public/news/:id` via `apiRequest` (cookies d'auth pour l'accès aux brouillons). Affiche `NewsDetailContent` et `NewsEditButton` (`"use client"` — bouton + `AddNewsModal` en mode édition). Hérite des restrictions de rôle de `/admin/news` via `useRoleGuard` avec correspondance préfixe                                                                                                              |
| `admin/users/`        | `/admin/users`       | Gestion des utilisateurs (`UsersContent`, `AddUserModal`, `DeleteModal`) — accès restreint au rôle `admin` via `useRoleGuard`. `AddUserModal` gère l'ajout et la modification via une seule instance (prop `userToEdit`). Si l'utilisateur connecté se supprime lui-même, il est redirigé vers `/login`                                                                                                                                                  |

### `components/`

Composants UI réutilisables à travers l'application.

| Fichier                        | Description                                                                                                                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modals/AddArtistModal.tsx`  | Modale d'ajout ou d'édition d'un artiste — formulaire en 3 étapes (infos, image, concert). Partagée entre la page liste et la page détail admin                                                                                                                         |
| `modals/AddNewsModal.tsx`    | Modale d'ajout ou d'édition d'une news — formulaire titre, contenu, image, statut de publication. Partagée entre la page liste et la page détail admin                                                                                                                   |
| `modals/DeleteModal.tsx`     | Modale de confirmation de suppression générique — reçoit `endpoint`, `entityName`, `getLabel` et `onDeleted`. Réutilisée pour les artistes, news et utilisateurs                                                                                                         |
| `AdminUserProvider.tsx`      | Context React qui expose les données de l'utilisateur admin connecté (`AdminUser`, `mustChangePassword`) — retourne `null` hors provider                                                                                                                                 |
| `AddButton.tsx`              | Bouton hamburger visible uniquement sur mobile — ouvre une modale `Navigation` pour afficher les filtres de la page (artists ou news). Utilisé dans `(public)/artists/page.tsx` et `(public)/news/page.tsx`                                                               |
| `ArtistDetailContent.tsx`   | Affichage statique du détail d'un artiste — partagé entre la page publique et la page admin                                                                                                                                                                                    |
| `ArtistsContent.tsx`         | Liste des artistes — fetche `GET /public/artists`, gère les états loading/error/empty, le filtre par jour, le tri par heure, l'ajout et la suppression locale. Affiche les boutons d'action uniquement sur les routes admin via `useNavPath`                             |
| `Banner.tsx`                 | Bannière de navigation principale — sticky header, transparent sur la page d'accueil tant que l'utilisateur n'a pas scrollé (opaque dès le premier pixel de défilement via scroll listener), filtre les liens admin par rôle via `filterNavByRole`, gère aussi le logout |
| `ContactUs.tsx`              | Formulaire de contact (modale)                                                                                                                                                                                                                                                    |
| `Footer.tsx`                 | Pied de page avec liens réseaux sociaux et liens légaux                                                                                                                                                                                                                         |
| `ForgotPassword.tsx`         | Modale mot de passe oublié                                                                                                                                                                                                                                                       |
| `LegalMention.tsx`           | Modale mentions légales                                                                                                                                                                                                                                                          |
| `LoadingLine.tsx`            | Indicateur de chargement — texte "Chargement" centré avec une ligne bleue (`--color-3`) animée en pulsation via `line-expand`                                                                                                                                             |
| `ModalCloseButton.tsx`       | Bouton de fermeture générique pour les modales                                                                                                                                                                                                                                  |
| `ModalSetup.tsx`             | Initialise `Modal.setAppElement("#app-root")` une seule fois au niveau du layout racine                                                                                                                                                                                         |
| `Navigation.tsx`             | Barre de navigation — adapte les liens selon le contexte (visiteur / admin) et les filtres de page                                                                                                                                                                               |
| `NewsContent.tsx`            | Liste des news — fetche `GET /public/news`, gère les états loading/error/empty, le tri "Plus récent" / "Plus ancien", l'ajout et la suppression locale. Affiche les brouillons avec badge uniquement en vue admin                                                        |
| `NewsDetailContent.tsx`      | Affichage statique du détail d'une news — partagé entre la page publique et la page admin                                                                                                                                                                                      |
| `SectionCta.tsx`             | Séparateur CTA réutilisable — bouton "Voir plus" centré entre deux lignes horizontales, navigue vers le `href` passé en prop                                                                                                                                               |
| `SideBarTool.tsx`            | Layout avec navigation sticky sur desktop et contenu principal à droite — sur mobile, n'affiche que les enfants. Utilisé dans les pages publiques artists et news, et les pages admin correspondantes                                                                          |

### `hooks/`

Hooks React réutilisables découplés des composants.

| Fichier              | Description                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useDelete.ts`     | Envoie une requête `DELETE` via `apiRequest` et gère les états loading/error — utilisé par `DeleteModal`                                                                                                                                                                                                                                                                                                                        |
| `useFetch.ts`      | Fetche une ressource GET au montage et expose `{ data, isLoading, error }` — utilisé par les composants de liste (`ArtistsContent`, `NewsContent`, `UsersContent`)                                                                                                                                                                                                                                                              |
| `useModal.ts`      | Gère l'état ouvert/fermé d'une modale et l'item sélectionné — expose `{ isOpen, item, open, close }`. Typé génériquement pour stocker n'importe quel item                                                                                                                                                                                                                                                                 |
| `useMutation.ts`   | Envoie une requête `POST` ou `PATCH` via `apiRequest` et expose `{ mutate, isLoading, error, reset }` — utilisé par les modales d'ajout/édition                                                                                                                                                                                                                                                                              |
| `useNavPath.ts`    | Expose `pathname` et `isAdminPath` dérivés de `usePathname()` — consommé par `Banner`, `SideBarTool`, `ArtistsContent` et `NewsContent`                                                                                                                                                                                                                                                                                    |
| `useRoleGuard.ts`  | Redirige vers `/admin/dashboard` si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante — compare le rôle via `useAdminUser()` et la route via `useNavPath()` avec les restrictions définies dans `navAdminItem`. Utilise une correspondance préfixe (`startsWith`) pour que les routes dynamiques (ex : `/admin/news/[id]`) héritent automatiquement des restrictions de leur route parente |

### `config/`

Centralise les constantes de configuration du frontend.

| Fichier         | Description                                                                                                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `festival.ts` | Source de vérité unique pour les données du festival — exporte `FESTIVAL_DAYS`, `FESTIVAL_LOCATION` et `TICKETING_URL`. Consommé par `DashboardContent`, `ui.ts`, `AddArtistModal`, `HomeInfosPratiques`, `Banner` et `HomeHero`                                              |
| `ui.ts`       | Définit les items de navigation et de filtrage — liens visiteur (`navVisitorItems`), liens admin (`navAdminItem`, `navAdminQuickLinks`), filtres artists/news/users, rôles utilisateurs (`USER_ROLES`). Expose `filterNavByRole` pour filtrer les liens selon le rôle de l'utilisateur |

### `functions/`

Utilitaires partagés pour les appels API et la gestion des erreurs.

| Fichier                   | Description                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apiRequest.ts`         | Wrapper `fetch` typé — retourne toujours `{ data, error: null }` en succès ou `{ data: null, error: ApiRequestError }` en échec                                      |
| `fetchPublic.ts`        | Wrapper `fetch` côté serveur (SSR) avec revalidation ISR — utilisé par les server components de la zone publique (`page.tsx` accueil, artiste, news)                 |
| `formatDate.ts`         | Fonctions de formatage de dates — `formatDateLong` (ex : "8 mai 2026") et `formatConcertDatetime` (retourne `{ date, time }` depuis un timestamp ISO)                |
| `getApiErrorMessage.ts` | Traduit un `ApiRequestError` en message lisible — priorité au message backend, puis fallback par code HTTP (`401`, `403`, `404`, `429`, `>=500`)               |
| `validation.ts`         | Helpers de validation de formulaire — expose `isEmpty` pour vérifier si un champ est vide                                                                                    |


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
