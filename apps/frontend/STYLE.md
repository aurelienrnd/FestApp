# Guide Style Frontend

Ce document decrit l'etat reel du style dans `apps/frontend`.

## 1. Fichiers de style

| Fichier                               | Rôle                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/frontend/src/app/tokens.css`  | Variables CSS uniquement — un seul `:root`, 7 sections commentées                    |
| `apps/frontend/src/app/globals.css` | `@import "tailwindcss"` + `@import "./tokens.css"` + thèmes + `@layer components` |

`globals.css` n'a plus aucun bloc `:root` — toutes les variables sont dans `tokens.css`.

Details :

- `--font-display` est reference dans `apps/frontend/src/app/layout.tsx:7` et provient de Next Font (Bebas Neue avec subsets latin + latin-ext).

---

## 2. Tokens declares et usages

### Dimensions layout

| Variable                         | Valeur     | Usages                                                                          |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `--header-height`              | `106px`  | `HomeHero.tsx` (`marginTop` inline, `mt-(--header-height)`), `globals.css` (`.home-section-full`) |
| `--home-hero-min-height`       | `100dvh` | `HomeHero.tsx` (`h-(--home-hero-min-height)`)                             |
| `--home-hero-min-height-floor` | `600px`  | `HomeHero.tsx` (`min-h-(--home-hero-min-height-floor)`) — plancher paysage |
| `--app-min-width`              | `320px`  | `globals.css` (`.app-root`) — largeur minimale de l'application            |

### Couleurs marque

| Variable      | Valeur      | Usages                                                                                                                   |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `--color-1` | `#cb3346` | `globals.css` (`.btn-cta`, `.detail-name-block`, `.error-message`), composants divers |
| `--color-2` | `#e4e4e7` | `globals.css` (`.input`, `.upload-zone`), `Banner.tsx`                                                           |
| `--color-3` | `#0ea5e9` | `SectionCta.tsx`, `Footer.tsx`                                                                                       |

### Couleurs UI

| Variable               | Valeur                       | Usages                                                                                                                                |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-text-input` | `#47474f`                  | `globals.css` (`.input`, `.card-row`, `.upload-btn`, `.upload-zone`, `.btn-action`, `.home-section`), composants divers |
| `--color-overlay`    | `rgba(156, 163, 175, 0.3)` | `globals.css` (`.modal-overlay`)                                                                                                  |

### Couleurs thème

| Variable                 | Valeur       | Usages                                          |
| ------------------------ | ------------ | ----------------------------------------------- |
| `--color-text-visitor` | `#ffffff`  | `globals.css` (thème visitor)                |
| `--color-bg-visitor`   | `black`    | `globals.css` (thème visitor)                |
| `--color-bg-admin`     | `#ffffff`  | `globals.css` (thème admin)                  |
| `--color-text-admin`   | `black`    | `globals.css` (thème admin)                  |
| `--color-text`         | thème actif | `globals.css` (`.app-root`), `layout.tsx` |
| `--color-bg`           | thème actif | `globals.css` (`.app-root`), `Footer.tsx` |

### Espacement contextuel

| Variable                | Valeur   | Usages                                                                 |
| ----------------------- | -------- | ---------------------------------------------------------------------- |
| `--ctx-paragraph-gap` | `1rem` | `ContactUs.tsx`, `ForgotPassword.tsx`, `LegalMention.tsx`        |
| `--ctx-form-gap`      | `2rem` | `login/page.tsx`                                                     |
| `--ctx-title-mb`      | `3rem` | `globals.css` (`.title1`), `AddButton.tsx`, `admin/*/page.tsx` |

> Pour tout autre espacement, utiliser l'echelle Tailwind directement (`p-4`, `gap-6`, `mt-8`...).

### Typographie

| Variable                | Valeur                | Usages                                          |
| ----------------------- | --------------------- | ----------------------------------------------- |
| `--font-family-input` | `Arial, sans-serif` | `globals.css` (`.input`), `ContactUs.tsx` |

### Animation

| Variable                  | Valeur        | Usages                                                               |
| ------------------------- | ------------- | -------------------------------------------------------------------- |
| `--anim-btn-transition` | `transform` | `globals.css` (`.btn-cta`), `Banner.tsx`, `Footer.tsx`       |
| `--anim-btn-duration`   | `200ms`     | `globals.css` (`.btn-cta`), `Banner.tsx`, `Footer.tsx`       |
| `--anim-btn-scale`      | `1.1`       | `globals.css` (`.btn-cta:hover`), `Banner.tsx`, `Footer.tsx` |

---

## 3. Classes reutilisables (@layer components)

### Layout

| Classe        | Description                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `.app-root` | Racine de l'application — `flex min-h-screen flex-col`, thème bg/text, `min-w-(--app-min-width)` |

### Boutons

| Classe          | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| `.btn-cta`    | Bouton call-to-action — fond `--color-1`, texte blanc, scale au hover                 |
| `.btn-type-2` | Bouton secondaire — hover opacity                                                       |
| `.btn-action` | Bouton d'action admin — bordure `--color-text-input`, arrondi, padding, hover opacity |

### Navigation

| Classe        | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| `.nav-list` | Liste de liens horizontale — flex,`gap-6`, letter-spacing |

### Formulaires

| Classe                 | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `.form-modal`        | Formulaire dans une modale —`space-y-4`                             |
| `.input`             | Champ texte — bordure, fond `--color-2`, police Arial               |
| `.submit-modal-area` | Zone du bouton de soumission — flex centré                           |
| `.upload-zone`       | Zone d'upload — flex colonne centré, fond `--color-2`, arrondi     |
| `.upload-btn`        | Bouton d'upload — pill, bordure `--color-text-input`, hover opacity |
| `.error-message`     | Message d'erreur — centré, couleur `--color-1`                     |
| `.form-grid`         | Grille de formulaire — 1 colonne mobile, 2 colonnes desktop           |

### Modales

| Classe                  | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `.modal-overlay`      | Fond semi-transparent — fixed,`z-50`, centré, `bg-(--color-overlay)`         |
| `.modal`              | Conteneur de modale standard — arrondi,`bg-white text-black`                    |
| `.modal-detail`       | Conteneur de modale détail —`w-[90vw]`, `bg-white`, arrondi, overflow hidden |
| `.detail-layout`      | Layout interne — flex colonne, relative                                           |
| `.detail-img-wrapper` | Wrapper image —`relative w-full h-80`                                           |
| `.detail-close-btn`   | Bouton fermeture — absolu `top-3 right-3 z-10`, texte noir                      |
| `.detail-name-block`  | Bloc nom — fond `--color-1`, décalé à gauche                                 |
| `.detail-name`        | Nom — texte blanc, bold, uppercase,`text-2xl`                                   |
| `.detail-bio`         | Biographie —`bg-white text-black`, scrollable, `max-h-48`                     |
| `.detail-date-block`  | Bloc date —`bg-black text-white`, bold, uppercase, décalé à droite           |

### Cartes

| Classe                      | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `.card-row`               | Carte en ligne — bordure, flex colonne mobile / ligne desktop         |
| `.card-media-img-wrapper` | Conteneur image — pleine largeur mobile,`w-48 self-stretch` desktop |
| `.card-media-img`         | Image —`object-cover`, arrondie haut mobile / gauche desktop        |
| `.card-lineup-content`    | Contenu de la carte — flex colonne/ligne, space-between               |
| `.card-lineup-actions`    | Zone d'actions — flex centré, marges responsive                      |

### Pages

| Classe                     | Description                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `.title1`                | Titre principal — centré, très grand, uppercase, bold,`mb-(--ctx-title-mb)`                          |
| `.title-modal`           | Titre de modale — centré, grand, bold                                                                   |
| `.section-page`          | Conteneur de section — padding vertical/horizontal responsive                                            |
| `.admin-content-wrapper` | Wrapper contenu admin —`flex-1 flex justify-center`                                                    |
| `.content-centered`      | Contenu centré pleine hauteur —`flex h-full justify-center items-center`                              |
| `.filter-row`            | Barre de filtres — flex centré,`gap-6`                                                                |
| `.home-section`          | Section home générique — pleine largeur, padding responsive, flex colonne centré, bordure supérieure |
| `.home-section-full`     | Modificateur — section pleine hauteur d'écran hors header (`calc(100dvh - --header-height)`), contenu centré verticalement |
| `.home-section-title`    | Titre de section home —`text-4xl md:text-6xl`, uppercase, bold, `tracking-widest`                    |
| `.home-grid`             | Grille 2 colonnes responsive — `grid-cols-1 md:grid-cols-2`, `gap-6`, `max-w-4xl` — sections Programmation et News |

---

## 4. Conventions

- Couleurs : uniquement via tokens `--color-*` — jamais de valeurs brutes dans les `.tsx`.
  - Exception : `bg-transparent` pour la transparence structurelle.
  - `bg-white` / `text-black` autorisés uniquement à l'intérieur d'une classe composant dans `globals.css`.
- Espacement : echelle Tailwind standard directement (`p-4`, `gap-6`, `mt-8`...). Tokens `--ctx-*` uniquement pour les valeurs avec une signification semantique metier.
- Syntaxe Tailwind variable : `gap-(--token)`, `px-(--token)`, `bg-(--token)`.
- Toute nouvelle classe composant va dans `globals.css` sous `@layer components` — jamais en objet JS ou inline statique.
- Pas de `@layer` imbriqués dans `@layer components` — les sections sont organisées par commentaires `/* === NOM === */`.
- Un token est cree uniquement si la valeur est reutilisee dans 2+ endroits avec le meme sens metier.
- Les classes à usage unique (un seul fichier `.tsx`) sont inlinées directement dans le composant.
