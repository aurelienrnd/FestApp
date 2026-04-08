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
| `--header-height` | `106px` | `globals.css` (`.home-hero` margin-top négatif) |
| `--home-hero-min-height` | `100dvh` | `globals.css` (`.home-hero`) |
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
| `header` (Banner) | Header sticky — `sticky top-0 z-50`, fond transparent sur `.home-hero`, fond `--color-bg` sinon (via `IntersectionObserver`), transition `duration-300` |
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

### Classes partagées (root `@layer components`) — Composant `SectionCta`

| Classe | Description |
| --- | --- |
| `.home-section-link` | Conteneur du séparateur avec CTA — `flex items-center gap-(--space-md) w-full` |
| `.home-section-link-line` | Ligne horizontale bleue de part et d'autre du bouton — `flex-1 h-0.5 bg-(--color-3)` |

### `@layer home` — Page d'accueil

| Classe | Description |
| --- | --- |
| `.home-hero` | Section hero — pleine hauteur écran (`--home-hero-min-height` = `100dvh`), `margin-top: calc(-1 * --header-height)` pour glisser sous le header sticky, fond noir, `overflow-hidden`, `bg-cover bg-center` |
| `.home-hero-inner` | Contenu du hero — largeur 75% (`w-3/4`) centré (`mx-auto`), flex colonne en mobile, flex row avec `justify-between` en desktop (`md:`), sans padding, z-index 10 |
| `.home-hero-btn` | Modificateur du bouton billetterie dans le hero — `text-4xl`, `px-(--space-md)`, `py-(--space-sm)`, `rounded-full`. Déclaré directement dans `@layer components` après `.btn-cta` pour éviter la priorité inférieure des sous-layers. |
| `.home-section` | Section générique de la home — pleine largeur, padding responsive, flex colonne centré, bordure supérieure |
| `.home-section-title` | Titre de section — `text-4xl md:text-6xl`, uppercase, bold, `tracking-widest` |
| `.home-section-divider` | Séparateur rouge sous le titre — `h-0.5 w-16 bg-(--color-1)` |
| `.home-cta-row` | Conteneur du bouton CTA — flex centré, `mt-(--space-md)` |

#### `@layer home-lineup` — Cartes artistes de la home

| Classe | Description |
| --- | --- |
| `.home-artist-grid` | Grille 1 colonne mobile / 2 colonnes desktop, `max-w-4xl` |
| `.home-artist-card` | Carte artiste horizontale — image à gauche, texte à droite, bordure, arrondie |
| `.home-artist-img-wrapper` | Wrapper image — `relative w-40 flex-shrink-0 self-stretch` |
| `.home-artist-info` | Bloc texte de la carte — flex colonne centré, `gap-(--space-sm) p-(--space-md)` |
| `.home-artist-name` | Nom de l'artiste — `font-black uppercase text-xl leading-tight` |
| `.home-artist-meta` | Méta-données (date, heure, scène) — `text-sm uppercase tracking-wide` |
| `.home-artist-link` | Lien "VOIR PLUS" — `text-xs uppercase`, opacity 60 % → 100 % au hover |

#### `@layer home-news` — Cartes articles de la home

| Classe | Description |
| --- | --- |
| `.home-news-grid` | Grille 1 colonne mobile / 2 colonnes desktop, `max-w-4xl` |
| `.home-news-card` | Carte article verticale — image en haut, texte en bas, bordure, arrondie |
| `.home-news-img-wrapper` | Wrapper image — `relative h-40 w-full` |
| `.home-news-info` | Bloc texte — flex colonne, `gap-(--space-xs) p-(--space-md)` |
| `.home-news-title` | Titre de l'article — `font-black uppercase text-sm leading-tight` |

#### `@layer home-info` — Section infos pratiques

| Classe | Description |
| --- | --- |
| `.home-info-address` | Adresse du festival — `font-black uppercase` |
| `.home-info-text` | Texte de présentation — `text-sm leading-relaxed` |

#### `@layer home-partners` — Section partenaires

| Classe | Description |
| --- | --- |
| `.home-partners-grid` | Grille 3 colonnes mobile / 5 colonnes desktop, `max-w-4xl` |
| `.home-partner-logo` | Placeholder logo partenaire — `h-16`, fond `--color-bg-input`, texte centré |

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
