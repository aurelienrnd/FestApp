# Guide Style Frontend

Ce document decrit l'etat reel du style dans `apps/frontend`.

## 1. Fichier central

Le style global est centralise dans :
- `apps/frontend/src/app/globals.css`

Il contient :
- les variables CSS (`:root`)
- les themes (`:root[data-theme="..."]`)
- les classes composants reutilisables (`@layer components`)

Details :
- `--font-display` est reference dans `apps/frontend/src/app/layout.tsx:7` et provient de Next Font (Bebas Neue avec subsets latin + latin-ext).

---

## 2. Tokens declares et usages

### Couleurs

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--color-1` | `#cb3346` | `globals.css` (`.btn-cta`), `components/Banner.tsx`, `components/Footer.tsx`, `app/login/page.tsx`, `app/admin/users/AddUserModal.tsx`, `app/admin/users/DelateUserModal.tsx`, `app/admin/users/UsersContent.tsx` |
| `--color-2` | `#e4e4e7` | `globals.css` (`.mobil-menu`), `app/admin/lineup/ArtistDetailModal.tsx` (icônes réseaux sociaux) |
| `--color-3` | `#0ea5e9` | `components/Footer.tsx` (separateur) |
| `--color-text-visitor` | `#ffffff` | `globals.css` (theme visitor) |
| `--color-bg-visitor` | `black` | `globals.css` (theme visitor) |
| `--color-bg-admin` | `#ffffff` | `globals.css` (theme admin) |
| `--color-text-admin` | `black` | `globals.css` (theme admin) |
| `--color-bg-input` | `#e4e4e7` | `globals.css` (`.input`, `.text-area`) |
| `--color-text-input` | `#47474f` | `globals.css` (`.mobil-menu`, `.input`, `.text-area`, `.card-row`), `globals.css` (`.text-festival-date` via composant), `app/admin/users/UsersContent.tsx` |
| `--color-text` | thème actif | `globals.css` (`.btn-cta`, `.mobil-menu`), `app/layout.tsx` |
| `--color-bg` | thème actif | `globals.css` (`.card-dashboard-avatar`), `app/layout.tsx`, `components/Footer.tsx` |

### Animation

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--anim-btn-transition` | `"transform"` | `globals.css` (`.btn-cta`, `.mobil-menu`), `components/Footer.tsx` |
| `--anim-btn-duration` | `200ms` | `globals.css` (`.btn-cta`, `.mobil-menu`), `components/Footer.tsx` |
| `--anim-btn-scale` | `1.1` | `globals.css` (`.btn-cta:hover`, `.mobil-menu:hover`), `components/Footer.tsx` |

### Espacement

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--space-xs` | `0.5rem` | `globals.css` (`.input`, `.text-area`), `app/admin/users/UsersContent.tsx` |
| `--space-sm` | `0.75rem` | `globals.css` (`.input`, `.text-area`, `.nav-btn-*`, `.card-row`, `.card-dashboard-*`, `.card-users-*`, `.card-user-*`, `.card-lineup-*`) |
| `--space-md` | `1.5rem` | `globals.css` (`.nav-list`, `.nav-vertical-list`, `.section-page`, `.card-dashboard-actions`, `.card-user-actions`), `components/Banner.tsx`, `components/Footer.tsx`, `components/ContactUs.tsx`, `components/ForgotPassword.tsx`, `components/LegalMention.tsx`, `components/ModalCloseButton.tsx`, `components/SideBarTool.tsx`, `app/lineup/page.tsx`, `app/news/page.tsx`, `app/admin/lineup/LineupContent.tsx`, `app/admin/users/page.tsx`, `app/admin/users/AddUserModal.tsx`, `app/admin/users/UsersContent.tsx`, `app/admin/dashboard/DashboardContent.tsx` |
| `--space-lg` | `2.5rem` | `globals.css` (`.section-page`), `components/Footer.tsx` |
| `--space-xl` | `5rem` | `app/admin/dashboard/DashboardContent.tsx` |
| `--spacing-paragraph` | `1rem` | `components/ContactUs.tsx`, `components/ForgotPassword.tsx`, `components/LegalMention.tsx` |
| `--spacing-form` | `2rem` | `app/login/page.tsx` |
| `--margin-bottom-title` | `3rem` | `globals.css` (`.title1`, `.card-dashboard-avatar`), `components/AddButton.tsx`, `app/admin/users/page.tsx` |

### Typographie

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--font-family-input` | `Arial, sans-serif` | `globals.css` (`.input`, `.text-area`) |

---

## 3. Classes reutilisables (@layer components)

### Classes de base

| Classe | Description |
| --- | --- |
| `.title1` | Titre principal de page — centré, très grand, uppercase, bold |
| `.title-modal` | Titre de modale — centré, grand, bold |
| `.nav-list` | Liste de liens de navigation horizontale — flex, `gap-(--space-md)`, letter-spacing |
| `.nav-vertical-list` | Liste de liens de navigation verticale — flex colonne, `gap-(--space-md)` |
| `.nav-btn-active-modal` | Bouton actif en variante modale — fond `--color-1`, largeur étendue |
| `.nav-btn-inactive-modal` | Bouton inactif en variante modale — fond noir, hover couleur principale |
| `.nav-btn-active-sidebar` | Bouton actif en variante sidebar — fond `--color-1`, largeur étendue |
| `.nav-btn-inactive-admin` | Bouton inactif sidebar (contexte admin) — fond noir, texte blanc |
| `.nav-btn-inactive-public` | Bouton inactif sidebar (contexte public) — fond blanc, texte noir |
| `.btn-cta` | Bouton call-to-action — fond `--color-1`, texte blanc, scale au hover |
| `.btn-type-2` | Bouton secondaire — hover opacity |
| `.mobil-menu` | Bouton menu mobile — fond `--color-2`, scale au hover |
| `.modal-overlay` | Fond semi-transparent de modale — fixed, centré |
| `.modal` | Conteneur de modale — arrondi, fond clair |
| `.form-modal` | Formulaire dans une modale — space-y |
| `.input` | Champ texte — bordure, fond `--color-bg-input`, police Arial |
| `.text-area` | Zone de texte redimensionnable — hauteur fixe, même style que `.input` |
| `.submit-modal-area` | Zone du bouton de soumission — flex centré |
| `.upload-zone` | Zone d'upload d'image — flex colonne centré, fond `--color-bg-input`, arrondi |
| `.upload-btn` | Bouton d'upload — pill, bordure `--color-text-input`, hover opacity |
| `.text-festival-date` | Texte de date du festival — taille responsive (`text-base` → `text-2xl`), centré sur desktop |
| `.footer-separator` | Séparateur horizontal du footer — `h-0.5`, largeur responsive |
| `.social-btn` | Bouton icône réseau social — carré `h-9 w-9`, centré, arrondi |
| `.section-page` | Conteneur de section de page — padding vertical/horizontal responsive |
| `.side-bar` | Texte de la sidebar admin — taille responsive |
| `.card-row` | Carte en ligne — bordure, flex colonne sur mobile, ligne sur desktop |

### `@layer dashboard` — Cartes du dashboard admin

| Classe | Description |
| --- | --- |
| `.card-dashboard-media-center` | Zone média de la carte dashboard — centrée avec marges |
| `.card-dashboard-avatar` | Avatar circulaire — taille fixe (`--margin-bottom-title`), bordure, fond `--color-bg` |
| `.card-dashboard-content` | Contenu principal de la carte — flex, justify-around, responsive |
| `.card-dashboard-field` | Champ individuel dans la carte — flex, justify-around |
| `.card-dashboard-actions` | Zone d'actions — flex colonne sur mobile, ligne sur desktop |

### `@layer users` — Cartes de la page utilisateurs

| Classe | Description |
| --- | --- |
| `.card-users-media-center` | Zone média de la carte utilisateur — centrée avec marges |
| `.card-user-name` | Nom de l'utilisateur — flex centré |
| `.card-user-content` | Contenu de la carte — flex wrap, space-between, responsive |
| `.card-user-field` | Champ individuel — flex nowrap |
| `.card-user-actions` | Zone d'actions — flex centré, gap, marges responsive |

### `@layer lineup` — Cartes de la programmation

| Classe | Description |
| --- | --- |
| `.card-media-img-wrapper` | Conteneur de l'image artiste — `relative`, pleine largeur et hauteur fixe (`h-48`) sur mobile, `w-48` et hauteur auto (`self-stretch`) sur desktop, `flex-shrink-0` |
| `.card-media-img` | Image de l'artiste — `object-cover`, arrondie en haut sur mobile, à gauche sur desktop |
| `.card-lineup-content` | Contenu de la carte lineup — flex colonne/ligne, space-between |
| `.card-lineup-actions` | Zone d'actions — flex centré, marges responsive |

---

## 4. Conventions

- Utiliser uniquement les tokens de `globals.css` — pas de valeurs brutes Tailwind (`gap-6`, `p-4`, etc.).
- Echelle d'espacement : `--space-xs` → `--space-xl` pour les valeurs generiques, tokens contextuels (`--spacing-paragraph`, `--spacing-form`, `--margin-bottom-title`) pour les cas specifiques.
- Syntaxe Tailwind variable : `gap-(--token)`, `px-(--token)`, `bg-(--token)`.
- Creer un token semantique seulement quand une valeur est reutilisee dans plusieurs contextes.
- Toute nouvelle classe composant va dans `globals.css` sous `@layer components`, pas dans un objet JS.
