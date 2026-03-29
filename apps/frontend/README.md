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
- `@fortawesome/free-brands-svg-icons` : Pack d'icônes de marques (Instagram, Facebook, YouTube…).

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
│   └── header_logo.png
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── lineup/
│   │   │   │   └── page.tsx
│   │   │   ├── news/
│   │   │   │   └── page.tsx
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
│   │   │   ├── lineup/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── AddArtistModal.tsx
│   │   │   │   ├── DeleteArtistModal.tsx
│   │   │   │   └── LineupContent.tsx
│   │   │   ├── news/
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx
│   │   │       ├── UsersContent.tsx
│   │   │       ├── AddUserModal.tsx
│   │   │       └── DelateUserModal.tsx
│   │   ├── globals.css
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
│   │   ├── ModalCloseButton.tsx
│   │   ├── ModalSetup.tsx
│   │   ├── Navigation.tsx
│   │   └── SideBarTool.tsx
│   ├── config/
│   │   ├── footer.ts
│   │   └── navigation.ts
│   ├── hooks/
│   │   ├── useIsDesktop.ts
│   │   └── useNavPath.ts
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
│       │   └── MobilNav.test.tsx
│       ├── functions/
│       │   ├── apiRequest.test.ts
│       │   └── getApiErrorMessage.test.ts
│       └── pages/
│           ├── AddArtistModal.test.tsx
│           ├── DeleteArtistModal.test.tsx
│           ├── ChangePasswordModal.test.tsx
│           ├── DashboardContent.test.tsx
│           ├── LineupContent.test.tsx
│           ├── LoginPage.test.tsx
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

- **`globals.css`** : Déclare les variables CSS globales, les thèmes `admin`/`visitor` et les classes utilitaires Tailwind partagées (cards, layouts…).
- **`layout.tsx`** : Layout racine Next.js — charge la police Google, définit les métadonnées SEO. Ne contient pas de Banner/Footer (délégués aux layouts de section). Inclut un `<div id="app-root">` wrapper à l'intérieur du `<body>` pour permettre à `react-modal` d'appliquer `aria-hidden` correctement sans masquer l'intégralité de l'arbre d'accessibilité.

L'application est divisée en trois zones distinctes avec chacune leur layout :

**Zone publique — `(public)/`**

Le groupe de routes `(public)` est transparent pour les URLs (n'affecte pas les chemins). Son layout fournit `Banner` et `Footer` aux pages visiteur, avec `data-theme="visitor"` posé côté serveur.

| Dossier | Route | Description |
| --- | --- | --- |
| `(public)/page.tsx` | `/` | Page d'accueil |
| `(public)/lineup/` | `/lineup` | Programmation du festival — liste les artistes depuis l'API publique |
| `(public)/news/` | `/news` | Actualités de l'événement |
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
| `admin/lineup/` | `/admin/lineup` | Programmation — liste les artistes avec leur concert (`LineupContent.tsx`), modale d'ajout/modification 3 étapes (`AddArtistModal.tsx`), modale de suppression (`DeleteArtistModal.tsx`) — accès restreint aux rôles `admin` et `lineup` via `useRoleGuard`. Le champ date est un `<select>` limité aux jours de `FESTIVAL_DAYS`. Les concerts à cheval sur minuit sont gérés (end_time automatiquement décalé au lendemain) |
| `admin/news/` | `/admin/news` | Gestion des actualités — accès restreint aux rôles `admin` et `news` via `useRoleGuard` |
| `admin/users/` | `/admin/users` | Gestion des utilisateurs (`UsersContent.tsx`, `AddUserModal.tsx`, `DelateUserModal.tsx`) — accès restreint au rôle `admin` via `useRoleGuard`. `AddUserModal` gère l'ajout et la modification via une seule instance (prop `userToEdit`). Si l'utilisateur connecté se supprime lui-même, il est redirigé vers `/login` |

### `components/`

Composants UI réutilisables à travers l'application.

| Fichier | Description |
| --- | --- |
| `AdminUserProvider.tsx` | Context React qui expose les données de l'utilisateur admin connecté (`AdminUser`, `mustChangePassword`) — retourne `null` hors provider |
| `AddButton.tsx` | Bouton d'ajout réutilisable (ex : ajouter un utilisateur) |
| `Banner.tsx` | Bannière de navigation principale — filtre les liens admin par rôle via `filterNavByRole`, gère aussi le logout |
| `ContactUs.tsx` | Formulaire de contact (modale) |
| `Footer.tsx` | Pied de page avec liens réseaux sociaux et liens légaux |
| `ForgotPassword.tsx` | Modale mot de passe oublié |
| `LegalMention.tsx` | Modale mentions légales |
| `ModalCloseButton.tsx` | Bouton de fermeture générique pour les modales |
| `ModalSetup.tsx` | Initialise `Modal.setAppElement("#app-root")` une seule fois au niveau du layout racine |
| `Navigation.tsx` | Barre de navigation — adapte les liens selon le contexte (visiteur / admin) et les filtres de page |
| `SideBarTool.tsx` | Barre d'outils latérale de l'espace admin |

### `hooks/`

Hooks React réutilisables découplés des composants.

| Fichier | Description |
| --- | --- |
| `useIsDesktop.ts` | Détecte si l'écran est en mode desktop (≥ 768px) via `matchMedia` — consommé par `Banner` pour choisir entre `DesktopNav` et `MobilNav` |
| `useNavPath.ts` | Expose `pathname` et `isAdminPath` dérivés de `usePathname()` — consommé par `Banner`, `SideBarTool` et `AddButton` |
| `useRoleGuard.ts` | Redirige vers `/admin/dashboard` si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante — compare le rôle via `useAdminUser()` et la route via `useNavPath()` avec les restrictions définies dans `navAdminItem` |

### `config/`

Centralise les constantes de configuration du frontend.

| Fichier | Description |
| --- | --- |
| `festival.ts` | Source de vérité unique pour les dates du festival — exporte `FESTIVAL_DAYS: string[]` (tableau de dates ISO). Consommé par `DashboardContent`, `navigation.ts` et `AddArtistModal` |
| `navigation.ts` | Définit les items de navigation : liens visiteur (`navVisitorItems`), liens admin (`navAdminItem`), items de dashboard (`navDashBordItems`), filtres lineup/news/users. `filterLineUpItems` est généré dynamiquement depuis `FESTIVAL_DAYS`. Expose `filterNavByRole` pour filtrer les liens selon le rôle de l'utilisateur |
| `footer.ts` | Définit les liens du footer : liens légaux (`legalLinks`) et réseaux sociaux (`socialLinks`) |

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
| `index.ts` | Centralise les types métier réutilisables : `UserRole` (union des rôles valides), `UserListRow` (données utilisateur API), `ArtistListRow` (données artiste API avec `stage`, `start_time`, `end_time` nullables) |

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
| `useNavPath.test.tsx` | Vérifie la détection de la route admin (`isAdminPath`) via le hook `useNavPath` |
| `Banner.test.tsx` | Vérifie le rendu desktop/mobile et l'affichage conditionnel du bouton billetterie |
| `ContactUs.test.tsx` | Vérifie le formulaire de contact — activation du bouton, succès, erreur 400 et fallback 500 |
| `Footer.test.tsx` | Vérifie l'ouverture/fermeture des modales mentions légales et contact |
| `ForgotPassword.test.tsx` | Vérifie le formulaire mot de passe oublié — désactivation du bouton, succès, erreur 404 et fallback 500 |
| `MobilNav.test.tsx` | Vérifie l'ouverture/fermeture de la navigation mobile |

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
| `AddArtistModal.test.tsx` | Vérifie la modale d'ajout/modification artiste — navigation entre les 3 étapes, validation des champs, soumission réussie (POST et PATCH), mode édition pré-rempli et gestion des erreurs API |
| `DeleteArtistModal.test.tsx` | Vérifie la modale de suppression artiste — confirmation, succès, erreur API et fermeture après suppression |
| `ChangePasswordModal.test.tsx` | Vérifie la modale de changement de mot de passe — validation des saisies, gestion des erreurs API et mode forcé (sans bouton de fermeture) |
| `DashboardContent.test.tsx` | Vérifie le tableau de bord — ouverture automatique de la modale si `mustChangePassword` est vrai et affichage des informations utilisateur |
| `LineupContent.test.tsx` | Vérifie la liste des artistes — chargement, affichage avec données concert, fallbacks null (scène/date non définies), liste vide, erreur API, suppression et modification d'un artiste |
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
- `src/components/Banner.tsx` : journalise l'erreur formatée en cas d'échec du logout, puis redirige vers `/login` en cas de succès.
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
