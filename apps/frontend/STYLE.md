# Guide Style Frontend

Ce document decrit l etat reel du style dans `apps/frontend`.

## 1. Fichier central

Le style global est centralise dans:
- `apps/frontend/src/app/globals.css`

Il contient:
- les variables CSS (`:root`)
- les themes (`:root[data-theme="..."]`)
- les classes composants reutilisables (`@layer components`)

Details:
- `--font-koulen` est reference dans `apps/frontend/src/app/layout.tsx:13` et provient de Next Font.

## 2. Tokens declares et usages

### Couleurs

| Variable | Usages |
| --- | --- |
| `--color-1` | `globals.css` (`.btn-cta`), `components/Banner.tsx`, `components/Footer.tsx`, `components/Navigation.tsx`, `app/login/page.tsx`, `app/admin/users/AddUserModal.tsx`, `app/admin/users/DelateUserModal.tsx`, `app/admin/users/UsersContent.tsx` |
| `--color-2` | `globals.css` (`.mobil-menu`) |
| `--color-3` | `components/Footer.tsx` (separateur) |
| `--color-text-visitor` | `globals.css` (theme visitor) |
| `--color-bg-visitor` | `globals.css` (theme visitor) |
| `--color-bg-admin` | `globals.css` (theme admin) |
| `--color-text-admin` | `globals.css` (theme admin) |
| `--color-bg-input` | `globals.css` (`.input`, `.text-area`) |
| `--color-text-input` | `globals.css` (`.mobil-menu`, `.input`, `.text-area`), `app/admin/dashboard/DashboardContent.tsx`, `app/admin/users/UsersContent.tsx` |
| `--color-text` | `globals.css` (`.btn-cta`, `.mobil-menu`), `app/layout.tsx` |
| `--color-bg` | `app/layout.tsx`, `components/Footer.tsx` |

### Animation

| Variable | Usages |
| --- | --- |
| `--anim-btn-transition` | `globals.css` (`.btn-cta`, `.mobil-menu`), `components/Footer.tsx` |
| `--anim-btn-duration` | `globals.css` (`.btn-cta`, `.mobil-menu`), `components/Footer.tsx` |
| `--anim-btn-scale` | `globals.css` (`.btn-cta:hover`, `.mobil-menu:hover`), `components/Footer.tsx` |

### Echelle d espacement (`--space-*`)

| Variable | Usages |
| --- | --- |
| `--space-2` | source de `--spacing-around-xsmall` |
| `--space-3` | source de `--spacing-around-small` |
| `--space-4` | source de `--spacing-paragraph` |
| `--space-6` | source de `--gap-content-small`, `--spacing-around-meduim` |
| `--space-8` | source de `--spacing-form` |
| `--space-10` | source de `--spacing-around-big` |
| `--space-12` | source de `--margin-bottom-title` |
| `--space-20` | source de `--gap-content-big` |

### Espacements semantiques

| Variable | Usages |
| --- | --- |
| `--gap-content-small` | `globals.css` (`.nav-list`), `components/Banner.tsx`, `components/Footer.tsx`, `components/ContactUs.tsx`, `components/ForgotPassword.tsx`, `components/LegalMention.tsx`, `components/ModalCloseButton.tsx`, `components/Navigation.tsx`, `components/SideBarTool.tsx`, `app/news/page.tsx`, `app/admin/users/page.tsx`, `app/admin/dashboard/DashboardContent.tsx`, `app/admin/users/AddUserModal.tsx`, `app/admin/users/UsersContent.tsx` |
| `--gap-content-big` | `app/admin/dashboard/DashboardContent.tsx` |
| `--spacing-paragraph` | `components/ContactUs.tsx`, `components/ForgotPassword.tsx`, `components/LegalMention.tsx` |
| `--spacing-around-meduim` | `globals.css` (`.section-page`), `components/Banner.tsx`, `components/ContactUs.tsx`, `components/Footer.tsx`, `components/SideBarTool.tsx`, `app/admin/users/AddUserModal.tsx`, `app/admin/users/DelateUserModal.tsx` |
| `--spacing-around-big` | `globals.css` (`.section-page`), `components/Footer.tsx`, `app/admin/dashboard/DashboardContent.tsx` |
| `--spacing-around-small` | `globals.css` (`.input`, `.text-area`), `components/Navigation.tsx`, `app/admin/users/UsersContent.tsx` |
| `--spacing-around-xsmall` | `globals.css` (`.input`, `.text-area`) |
| `--spacing-form` | `app/login/page.tsx` |
| `--margin-bottom-title` | `globals.css` (`.title1`), `components/AddButton.tsx`, `app/admin/users/page.tsx` |

### Typographie

| Variable | Usages |
| --- | --- |
| `--font-family-input` | `globals.css` (`.input`, `.text-area`) |

## 3. Classes reutilisables (@layer components)

### Classes de base

| Classe | Description |
| --- | --- |
| `.title1` | Titre principal de page — centré, très grand, uppercase, bold |
| `.title-modal` | Titre de modale — centré, grand, bold |
| `.nav-list` | Liste de liens de navigation — flex, gap, letter-spacing |
| `.btn-cta` | Bouton call-to-action — fond `--color-1`, texte blanc, scale au hover |
| `.btn-type-2` | Bouton secondaire — hover opacity |
| `.mobil-menu` | Bouton menu mobile — fond `--color-2`, scale au hover |
| `.modal-overlay` | Fond semi-transparent de modale — fixed, centré |
| `.modal` | Conteneur de modale — arrondi, fond clair |
| `.form-modal` | Formulaire dans une modale — space-y |
| `.input` | Champ texte — bordure, fond `--color-bg-input`, police Arial |
| `.text-area` | Zone de texte redimensionnable — hauteur fixe, même style que `.input` |
| `.submit-modal-area` | Zone du bouton de soumission — flex centré |
| `.section-page` | Conteneur de section de page — padding vertical/horizontal responsive |
| `.side-bar` | Texte de la sidebar admin — taille responsive |
| `.card-row` | Carte en ligne — bordure, flex colonne sur mobile, ligne sur desktop |

### `@layer dashboard` — Cartes du dashboard admin

| Classe | Description |
| --- | --- |
| `.card-dashboard-media-center` | Zone média de la carte dashboard — centrée avec marges |
| `.card-dashboard-avatar` | Avatar circulaire — taille fixe, bordure, fond `--color-bg` |
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
| `.card-media-img` | Image de l'artiste — arrondie en haut sur mobile, à gauche sur desktop, largeur fixe (`w-48`) |
| `.card-lineup-content` | Contenu de la carte lineup — flex colonne/ligne, space-between |
| `.card-lineup-actions` | Zone d'actions — flex centré, marges responsive |

## 4. Conventions recommandees

- Prioriser les tokens semantiques avant les valeurs brutes Tailwind.
- Utiliser la scale `--space-*` comme base unique.
- Creer un token semantique seulement quand une valeur est reutilisee.
- Garder la syntaxe Tailwind variable: `gap-(--token)`, `px-(--token)`, `bg-(--token)`.
