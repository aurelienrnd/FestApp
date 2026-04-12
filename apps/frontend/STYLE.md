# Guide Style Frontend

Ce document decrit l'etat reel du style dans `apps/frontend`.

## 1. Fichiers de style

| Fichier | Rôle |
| --- | --- |
| `apps/frontend/src/app/tokens.css` | Variables CSS uniquement — un seul `:root`, 7 sections commentées |
| `apps/frontend/src/app/globals.css` | `@import "tailwindcss"` + `@import "./tokens.css"` + thèmes + `@layer components` |

`globals.css` n'a plus aucun bloc `:root` — toutes les variables sont dans `tokens.css`.

Details :
- `--font-display` est reference dans `apps/frontend/src/app/layout.tsx:7` et provient de Next Font (Bebas Neue avec subsets latin + latin-ext).

---

## 2. Tokens declares et usages

### Dimensions layout

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--header-height` | `106px` | `globals.css` (`.home-hero` margin-top négatif), `HomeHero.tsx` (`mt-(--header-height)`) |
| `--home-hero-min-height` | `100dvh` | `globals.css` (`.home-hero`) |

### Couleurs marque

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--color-1` | `#cb3346` | `globals.css` (`.btn-cta`, `.home-section-divider`, `.nav-btn-active-*`, `.artist-detail-name-block`), composants divers |
| `--color-2` | `#e4e4e7` | `globals.css` (`.mobil-menu`, `.input`, `.text-area`, `.upload-zone`, `.home-partner-logo`), `ArtistDetailModal.tsx` |
| `--color-3` | `#0ea5e9` | `globals.css` (`.home-section-link-line`), `Footer.tsx` |

### Couleurs UI

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--color-text-input` | `#47474f` | `globals.css` (`.mobil-menu`, `.input`, `.text-area`, `.card-row`, `.upload-btn`, `.upload-zone`), composants divers |
| `--color-overlay` | `rgba(156, 163, 175, 0.3)` | `globals.css` (`.modal-overlay`) |

### Couleurs thème

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--color-text-visitor` | `#ffffff` | `globals.css` (thème visitor) |
| `--color-bg-visitor` | `black` | `globals.css` (thème visitor) |
| `--color-bg-admin` | `#ffffff` | `globals.css` (thème admin) |
| `--color-text-admin` | `black` | `globals.css` (thème admin) |
| `--color-text` | thème actif | `globals.css` (`.mobil-menu`), `layout.tsx` |
| `--color-bg` | thème actif | `globals.css` (`.card-dashboard-avatar`), `layout.tsx`, `Footer.tsx` |

### Espacement contextuel

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--ctx-paragraph-gap` | `1rem` | `ContactUs.tsx`, `ForgotPassword.tsx`, `LegalMention.tsx` |
| `--ctx-form-gap` | `2rem` | `login/page.tsx` |
| `--ctx-title-mb` | `3rem` | `globals.css` (`.title1`), `AddButton.tsx`, `admin/*/page.tsx` |

> Pour tout autre espacement, utiliser l'echelle Tailwind directement (`p-4`, `gap-6`, `mt-8`...).

### Typographie

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--font-family-input` | `Arial, sans-serif` | `globals.css` (`.input`, `.text-area`) |

### Animation

| Variable | Valeur | Usages |
| --- | --- | --- |
| `--anim-btn-transition` | `transform` | `globals.css` (`.btn-cta`, `.mobil-menu`) |
| `--anim-btn-duration` | `200ms` | `globals.css` (`.btn-cta`, `.mobil-menu`) |
| `--anim-btn-scale` | `1.1` | `globals.css` (`.btn-cta:hover`, `.mobil-menu:hover`) |

---

## 3. Classes reutilisables (@layer components)

### Boutons

| Classe | Description |
| --- | --- |
| `.btn-cta` | Bouton call-to-action — fond `--color-1`, texte blanc, scale au hover |
| `.btn-type-2` | Bouton secondaire — hover opacity |
| `.social-btn` | Bouton icône réseau social — carré `h-9 w-9`, centré, arrondi, texte blanc |

### Navigation

| Classe | Description |
| --- | --- |
| `.nav-list` | Liste de liens horizontale — flex, `gap-6`, letter-spacing |
| `.nav-vertical-list` | Liste de liens verticale — flex colonne, `gap-6` |
| `.mobil-menu` | Bouton menu mobile — fond `--color-2`, scale au hover |
| `.nav-btn-active-modal` | Bouton actif variante modale — fond `--color-1`, largeur étendue |
| `.nav-btn-inactive-modal` | Bouton inactif variante modale — fond noir, hover couleur principale |
| `.nav-btn-active-sidebar` | Bouton actif variante sidebar — fond `--color-1`, largeur étendue |
| `.nav-btn-inactive-admin` | Bouton inactif sidebar admin — fond noir, texte blanc |
| `.nav-btn-inactive-public` | Bouton inactif sidebar public — fond blanc, texte noir |

### Formulaires

| Classe | Description |
| --- | --- |
| `.form-modal` | Formulaire dans une modale — `space-y-4` |
| `.input` | Champ texte — bordure, fond `--color-2`, police Arial |
| `.text-area` | Zone de texte — hauteur fixe, même style que `.input` |
| `.submit-modal-area` | Zone du bouton de soumission — flex centré |
| `.upload-zone` | Zone d'upload — flex colonne centré, fond `--color-2`, arrondi |
| `.upload-btn` | Bouton d'upload — pill, bordure `--color-text-input`, hover opacity |

### Modales

| Classe | Description |
| --- | --- |
| `.modal-close-btn` | Bouton de fermeture en absolu — `top-3 right-3 z-10`, texte noir |
| `.modal-overlay` | Fond semi-transparent — fixed, centré, `bg-(--color-overlay)` |
| `.modal` | Conteneur de modale — arrondi, `bg-white text-black` |

### Cartes

| Classe | Description |
| --- | --- |
| `.card-row` | Carte en ligne — bordure, flex colonne mobile / ligne desktop |

#### `@layer dashboard` — Cartes du dashboard admin

| Classe | Description |
| --- | --- |
| `.card-dashboard-media-center` | Zone média — centrée avec marges |
| `.card-dashboard-avatar` | Avatar circulaire — `h-12 w-12`, bordure, fond `--color-bg` |
| `.card-dashboard-content` | Contenu principal — flex, justify-around, responsive |
| `.card-dashboard-field` | Champ individuel — flex, justify-around |
| `.card-dashboard-actions` | Zone d'actions — flex colonne mobile / ligne desktop |

#### `@layer users` — Cartes utilisateurs

| Classe | Description |
| --- | --- |
| `.card-users-media-center` | Zone média — centrée avec marges |
| `.card-user-name` | Nom de l'utilisateur — flex centré |
| `.card-user-content` | Contenu — flex wrap, space-between, responsive |
| `.card-user-field` | Champ individuel — flex nowrap |
| `.card-user-actions` | Zone d'actions — flex centré, gap, marges responsive |

#### `@layer lineup` — Cartes programmation

| Classe | Description |
| --- | --- |
| `.card-media-img-wrapper` | Conteneur image — pleine largeur mobile, `w-48 self-stretch` desktop |
| `.card-media-img` | Image — `object-cover`, arrondie haut mobile / gauche desktop |
| `.card-lineup-content` | Contenu de la carte — flex colonne/ligne, space-between |
| `.card-lineup-actions` | Zone d'actions — flex centré, marges responsive |

### Pages

| Classe | Description |
| --- | --- |
| `.title1` | Titre principal — centré, très grand, uppercase, bold, `mb-(--ctx-title-mb)` |
| `.title-modal` | Titre de modale — centré, grand, bold |
| `.text-festival-date` | Date du festival — taille responsive (`text-base` → `text-2xl`), centré desktop |
| `.footer-separator` | Séparateur horizontal du footer — `h-0.5`, largeur responsive |
| `.section-page` | Conteneur de section — padding vertical/horizontal responsive |
| `.side-bar` | Texte de la sidebar admin — taille responsive |
| `.home-section-link` | Conteneur du séparateur avec CTA — flex, `gap-6`, pleine largeur |
| `.home-section-link-line` | Ligne horizontale bleue — `flex-1 h-0.5 bg-(--color-3)` |

#### `@layer home` — Page d'accueil

| Classe | Description |
| --- | --- |
| `.home-hero` | Section hero — `h-(--home-hero-min-height)`, `bg-cover bg-center`, `margin-top: calc(-1 * --header-height)` |
| `.home-hero-badge` | Badge de date dans le hero — `bg-white text-black`, centré |
| `.home-section` | Section générique — pleine largeur, padding responsive, flex colonne centré, bordure supérieure |
| `.home-section-title` | Titre de section — `text-4xl md:text-6xl`, uppercase, bold, `tracking-widest` |
| `.home-section-divider` | Séparateur rouge sous le titre — `h-0.5 w-16 bg-(--color-1)` |
| `.home-cta-row` | Conteneur du bouton CTA — flex centré, `mt-6` |

#### `@layer home-lineup` — Cartes artistes

| Classe | Description |
| --- | --- |
| `.home-artist-grid` | Grille 1 col mobile / 2 col desktop, `max-w-4xl` |
| `.home-artist-card` | Carte artiste horizontale — image à gauche, texte à droite, bordure, arrondie |
| `.home-artist-img-wrapper` | Wrapper image — `relative w-40 flex-shrink-0 self-stretch` |
| `.home-artist-info` | Bloc texte — flex colonne centré, `gap-3 p-6` |
| `.home-artist-name` | Nom de l'artiste — `font-black uppercase text-xl leading-tight` |
| `.home-artist-meta` | Méta-données — `text-sm uppercase tracking-wide` |
| `.home-artist-link` | Lien "VOIR PLUS" — `text-xs uppercase`, opacity 60 % → 100 % au hover |

#### `@layer home-news` — Cartes articles

| Classe | Description |
| --- | --- |
| `.home-news-grid` | Grille 1 col mobile / 2 col desktop, `max-w-4xl` |
| `.home-news-card` | Carte article verticale — image en haut, texte en bas, bordure, arrondie |
| `.home-news-img-wrapper` | Wrapper image — `relative h-40 w-full` |
| `.home-news-info` | Bloc texte — flex colonne, `gap-2 p-6` |
| `.home-news-title` | Titre de l'article — `font-black uppercase text-sm leading-tight` |

#### `@layer home-info` — Infos pratiques

| Classe | Description |
| --- | --- |
| `.home-info-address` | Adresse du festival — `font-black uppercase` |
| `.home-info-text` | Texte de présentation — `text-sm leading-relaxed` |

#### `@layer home-partners` — Partenaires

| Classe | Description |
| --- | --- |
| `.home-partners-grid` | Grille 3 col mobile / 5 col desktop, `max-w-4xl` |
| `.home-partner-logo` | Placeholder logo — `h-16`, fond `--color-2`, texte centré |

#### `@layer artist-detail` — Modale détail artiste

| Classe | Description |
| --- | --- |
| `.modal-artist-detail` | Conteneur de la modale — `w-[90vw]`, `bg-white`, arrondi, overflow hidden |
| `.artist-detail-layout` | Layout interne — flex colonne, relative |
| `.artist-detail-img-wrapper` | Wrapper image — `relative w-full h-80` |
| `.artist-detail-close-btn` | Bouton fermeture — absolu `top-3 right-3 z-10`, texte noir |
| `.artist-detail-name-block` | Bloc nom — fond `--color-1`, décalé à gauche |
| `.artist-detail-name` | Nom de l'artiste — texte blanc, bold, uppercase, `text-2xl` |
| `.artist-detail-bio` | Biographie — `bg-white text-black`, scrollable, `max-h-48` |
| `.artist-detail-date-block` | Bloc date — `bg-black text-white`, bold, uppercase, décalé à droite |
| `.artist-detail-social` | Icônes réseaux sociaux — `bg-black`, flex centré, `text-2xl` |

---

## 4. Conventions

- Couleurs : uniquement via tokens `--color-*` — jamais de valeurs brutes dans les `.tsx`.
  - Exception : `bg-transparent` pour la transparence structurelle.
  - `bg-white` / `text-black` autorisés uniquement à l'intérieur d'une classe composant dans `globals.css`.
- Espacement : echelle Tailwind standard directement (`p-4`, `gap-6`, `mt-8`...). Tokens `--ctx-*` uniquement pour les valeurs avec une signification semantique metier.
- Syntaxe Tailwind variable : `gap-(--token)`, `px-(--token)`, `bg-(--token)`.
- Toute nouvelle classe composant va dans `globals.css` sous `@layer components` — jamais en objet JS ou inline statique.
- Un token est cree uniquement si la valeur est reutilisee dans 2+ endroits avec le meme sens metier.
