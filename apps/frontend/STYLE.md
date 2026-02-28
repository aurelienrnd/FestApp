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
| `--color-1` | `globals.css` (`.btn-cta`), `components/Footer.tsx`, `components/Banner.tsx`, `components/Navigation.tsx`, `app/login/page.tsx` |
| `--color-2` | `globals.css` (`.mobil-menu`) |
| `--color-3` | `components/Footer.tsx` (separateur) |
| `--color-text-visitor` | `globals.css` (theme visitor) |
| `--color-bg-visitor` | `globals.css` (theme visitor) |
| `--color-bg-admin` | `globals.css` (theme admin) |
| `--color-text-admin` | `globals.css` (theme admin) |
| `--color-bg-input` | `globals.css` (`.input`, `.text-area`) |
| `--color-text-input` | `globals.css` (`.mobil-menu`, `.input`, `.text-area`) |
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
| `--gap-content-small` | `globals.css` (`.nav-list`), `components/Banner.tsx`, `components/Footer.tsx`, `components/ContactUs.tsx`, `components/ForgotPassword.tsx`, `components/LegalMention.tsx`, `components/ModalCloseButton.tsx`, `components/SideBarTool.tsx`, `app/news/page.tsx`, `app/admin/users/page.tsx`, `app/admin/dashboard/DashboardContent.tsx` |
| `--gap-content-big` | `app/admin/dashboard/DashboardContent.tsx` |
| `--spacing-paragraph` | `components/ContactUs.tsx`, `components/ForgotPassword.tsx`, `components/LegalMention.tsx` |
| `--spacing-around-meduim` | `globals.css` (`.section-page`), `components/Banner.tsx`, `components/ContactUs.tsx`, `components/Footer.tsx`, `components/SideBarTool.tsx` |
| `--spacing-around-big` | `globals.css` (`.section-page`), `components/Footer.tsx` |
| `--spacing-around-small` | `globals.css` (`.input`, `.text-area`) |
| `--spacing-around-xsmall` | `globals.css` (`.input`, `.text-area`) |
| `--spacing-form` | `app/login/page.tsx` |
| `--margin-bottom-title` | `globals.css` (`.title1`), `components/AddButton.tsx` |

### Typographie

| Variable | Usages |
| --- | --- |
| `--font-family-input` | `globals.css` (`.input`, `.text-area`) |

## 3. Classes reutilisables (@layer components)

Classes definies dans `globals.css`:
- `.title1`
- `.title-modal`
- `.nav-list`
- `.btn-cta`
- `.btn-type-2`
- `.mobil-menu`
- `.modal-overlay`
- `.modal`
- `.form-modal`
- `.input`
- `.text-area`
- `.submit-modal-area`
- `.section-page`

## 4. Conventions recommandees

- Prioriser les tokens semantiques avant les valeurs brutes Tailwind.
- Utiliser la scale `--space-*` comme base unique.
- Creer un token semantique seulement quand une valeur est reutilisee.
- Garder la syntaxe Tailwind variable: `gap-(--token)`, `px-(--token)`, `bg-(--token)`.
