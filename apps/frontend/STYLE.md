# Guide Style Frontend

Ce document decrit l'etat reel du style dans `apps/frontend`.

## 1. Fichiers de style

| Fichier                                   | Rôle                                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `apps/frontend/src/app/tokens.css`      | Variables CSS uniquement — un seul `:root`, 7 sections commentées                                                      |
| `apps/frontend/src/app/animations.css` | Keyframes uniquement — `marquee-left`, `marquee-right`, `line-reload`, `line-expand`, `slide-in-left`, `slide-in-right`, `blur-in`, `scale-in` |
| `apps/frontend/src/app/globals.css`    | `@import "tailwindcss"` + `@import "./tokens.css"` + `@import "./animations.css"` + thèmes + `@layer components` |

`globals.css` n'a plus aucun bloc `:root` — toutes les variables sont dans `tokens.css`.

Details :

- `--font-display` est reference dans `apps/frontend/src/app/layout.tsx:7` et provient de Next Font (Bebas Neue avec subset latin).

---

## 2. Tokens declares et usages

### Dimensions layout

| Variable                         | Valeur     | Usages                                                                          |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `--header-height`              | `106px`  | `HomeHero.tsx` (`-mt-(--header-height)` section, `mt-(--header-height)` div interne), `globals.css` (`.home-section-vh` calc), `SideBarTool.tsx` (`top-(--header-height)` sidebar sticky) |
| `--home-hero-min-height`       | `100dvh` | `HomeHero.tsx` (`h-(--home-hero-min-height)`)                             |
| `--home-hero-min-height-floor` | `600px`  | `HomeHero.tsx` (`min-h-(--home-hero-min-height-floor)`) — plancher paysage |
| `--app-min-width`              | `320px`  | `globals.css` (`.app-root`) — largeur minimale de l'application            |

### Couleurs marque

| Variable      | Valeur      | Usages                                                                                                                   |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `--color-1` | `#cb3346` | `globals.css` (`.btn-cta`, `.detail-name-block`, `.error-message`, `.card-profile-avatar`, `.card-profile-badge`), `HomeInfosPratiques.tsx` (inline barre colorée `bg`, icônes SVG `text`), `LineupContent.tsx` (inline badge "Page d'accueil" admin-only), composants divers |
| `--color-2` | `#e4e4e7` | `globals.css` (`.input`, `.upload-zone`), `ArtistDetailModal.tsx` (inline icônes YouTube/Spotify) |
| `--color-3` | `#0ea5e9` | `LoadingLine.tsx` (inline), `SectionCta.tsx` (inline), `Footer.tsx`                                             |

### Couleurs UI

| Variable               | Valeur                       | Usages                                                                                                                                |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-text-input` | `#47474f`                  | `globals.css` (`.input`, `.card-row`, `.card-profile`, `.upload-btn`, `.btn-action`, `.home-card`), `DashboardContent.tsx` (inline), `Banner.tsx` (inline nav hover) |
| `--color-overlay`    | `rgba(156, 163, 175, 0.3)` | `globals.css` (`.modal-overlay`)                                                                                                  |

### Couleurs thème

| Variable                 | Valeur       | Usages                                          |
| ------------------------ | ------------ | ----------------------------------------------- |
| `--color-text-visitor` | `#ffffff`  | `globals.css` (thème visitor)                |
| `--color-bg-visitor`   | `black`    | `globals.css` (thème visitor)                |
| `--color-bg-admin`     | `#ffffff`  | `globals.css` (thème admin)                  |
| `--color-text-admin`   | `black`    | `globals.css` (thème admin)                  |
| `--color-text`         | thème actif | `globals.css` (`.app-root`), `layout.tsx` (body) |
| `--color-bg`           | thème actif | `globals.css` (`.app-root`, `.card-profile-avatar`), `layout.tsx` (body), `Banner.tsx` (header bg conditionnel), `Footer.tsx` |

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
| `--anim-btn-transition`  | `transform`                    | `globals.css` (`.btn-cta`), `Banner.tsx`, `Footer.tsx`       |
| `--anim-btn-duration`    | `200ms`                        | `globals.css` (`.btn-cta`), `Banner.tsx`, `Footer.tsx`       |
| `--anim-btn-scale`       | `1.1`                          | `globals.css` (`.btn-cta:hover`), `Banner.tsx`, `Footer.tsx` |
| `--anim-hero-duration`   | `0.9s`                         | `globals.css` (`.hero-slide-left`), `HomeHero.tsx` (inline style) |
| `--anim-hero-easing`     | `cubic-bezier(0.16, 1, 0.3, 1)` | `globals.css` (`.hero-slide-left`), `HomeHero.tsx` (inline style) |

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
| `.form-modal`        | Formulaire dans une modale — `mt-4 space-y-4`                       |
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
| `.modal`              | Conteneur de modale standard — arrondi, `bg-white text-black`, `max-h-[95vh]` scroll interne ; plein écran (`w-screen h-screen`) via `@media (max-height: 650px)` déclaré hors `@layer` |
| `.modal-detail`       | Conteneur de modale détail —`w-[90vw]`, `bg-white`, arrondi, overflow hidden, `max-h-[95dvh]` |
| `.detail-layout`      | Layout interne — flex colonne, relative, `overflow-y-auto` (scroll interne si contenu dépasse `modal-detail`) |
| `.detail-img-wrapper` | Wrapper image —`relative w-full h-80`                                           |
| `.detail-close-btn`   | Bouton fermeture — absolu `top-3 right-3 z-10`, texte noir                      |
| `.detail-name-block`  | Bloc nom — fond `--color-1`, décalé à gauche                                 |
| `.detail-name`        | Nom — texte blanc, bold, uppercase,`text-2xl`                                   |
| `.detail-bio`         | Biographie —`bg-white text-black`, scrollable, `max-h-48`                     |
| `.detail-date-block`  | Bloc date —`bg-black text-white`, bold, uppercase, décalé à droite           |

### Cartes

| Classe                      | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `.card-primary`           | Texte principal d'une carte — `font-black uppercase tracking-wide` — taille inlinée selon contexte (`text-xl` users, `text-4xl` dashboard, non précisée lineup/news) |
| `.card-secondary`         | Texte secondaire d'une carte — `text-sm text-(--color-text)/60` — s'adapte au thème (admin blanc/visiteur noir) |
| `.card-profile`           | Conteneur carte profil — bordure `--color-text-input`, arrondi, flex colonne mobile / ligne desktop — padding et gap inlinés (`p-6 gap-6` users, `p-8 gap-8` dashboard) |
| `.card-profile-avatar`    | Avatar lettre — cercle `--color-1`, fond `--color-bg`, centré, bold uppercase — taille inlinée (`w-14 h-14 text-2xl` users, `w-24 h-24 text-4xl` dashboard) |
| `.card-profile-badge`     | Badge rôle — pill `--color-1`, texte blanc, `text-sm` bold uppercase — padding inliné (`px-3 py-1` users, `px-4 py-1.5` dashboard) |
| `.card-row`               | Carte en ligne — bordure `--color-text-input`, flex colonne mobile / ligne desktop, hover scale `1.02` (`transition: transform 0.3s ease`) |
| `.card-media-img-wrapper` | Conteneur image — pleine largeur mobile,`w-48 self-stretch` desktop |
| `.card-media-img`         | Image —`object-cover`, arrondie haut mobile / gauche desktop        |
| `.card-lineup-content`    | Contenu de la carte — flex colonne mobile / ligne desktop, `justify-between`, `items-start lg:items-center`, `py-3 px-4` |
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
| `.home-section`          | Section home générique — pleine largeur, padding responsive, flex colonne centré                      |
| `.home-section-vh`       | Modificateur de hauteur pour les sections home — `justify-between`, hauteur plafonnée à `min(100dvh - header, 1100px)` en md+ — utilisé dans `HomeNews.tsx` et `HomeProgrammation.tsx` |
| `.home-section-title`    | Titre de section home — `text-4xl md:text-6xl`, uppercase, bold, `tracking-widest` |
| `.home-cards`            | Conteneur des cartes home — flex colonne mobile / ligne desktop, centré, `gap-6`, `flex-1 my-8` |
| `.home-card`             | Carte home — `flex-1`, `md:max-w-[50%]`, flex colonne, `overflow-hidden`, bordure `--color-text-input`, arrondi |
| `.home-card-img`         | Image d'une carte home — relative, pleine largeur, `flex-1 min-h-36 overflow-hidden` — hover zoom `scale(1.05)` sur l'`<img>` interne (`transition: transform 0.4s ease`) |
| `.home-card-content`     | Contenu texte d'une carte home — `flex-shrink-0`, flex colonne centré, `gap-3 p-6` |

### Hero animations

| Classe              | Description                                                                            |
| ------------------- | -------------------------------------------------------------------------------------- |
| `.hero-slide-left` | Entrée depuis la gauche — `slide-in-left` via `--anim-hero-duration/easing`, `both` — utilisé dans `HomeHero.tsx` (bandeaux dates) et `Navigation.tsx` (items sidebar avec délai cascadé) |

> Les autres animations hero (`slide-in-right`, `blur-in`, `scale-in`) et `hero-date-label` sont inlinées dans `HomeHero.tsx` via `style={{ animation: '...' }}` — usage unique dans ce composant. Les délais (`animationDelay`) sont aussi appliqués en inline style pour créer l'effet de cascade.

---

## 4. Animations

### Keyframes

| Nom               | De                       | Vers                  | Utilisation                                                                     |
| ----------------- | ------------------------ | --------------------- | ------------------------------------------------------------------------------- |
| `marquee-left`  | `translateX(0)`        | `translateX(-50%)`  | `HomePartenaires.tsx` (inline) — défilement vers la gauche                   |
| `marquee-right` | `translateX(-50%)`     | `translateX(0)`     | `HomePartenaires.tsx` (inline) — défilement vers la droite                   |
| `line-reload`   | `scaleX(0)`            | `scaleX(1)`         | `SectionCta.tsx` (inline via `group-has`) — animation hover des lignes CTA  |
| `line-expand`   | `scaleX(0→1→0)`      | —                   | `LoadingLine.tsx` (inline) — pulsation de la ligne de chargement             |
| `slide-in-left` | `translateX(-110vw)`  | `translateX(0)`     | `.hero-slide-left` (globals.css) — entrée depuis la gauche                   |
| `slide-in-right`| `translateX(110vw)`   | `translateX(0)`     | `HomeHero.tsx` (inline) — entrée depuis la droite                            |
| `blur-in`       | `blur(20px) opacity 0` | `blur(0) opacity 1` | `HomeHero.tsx` (inline) — apparition avec flou                               |
| `scale-in`      | `scale(0.8) opacity 0` | `scale(1) opacity 1`| `HomeHero.tsx` (inline) — apparition avec zoom                               |

> Les keyframes marquee fonctionnent sur un `track` dont le contenu est dupliqué (largeur totale = 2× le contenu visible). Le défilement de 50% crée une boucle seamless.


---

## 5. Conventions

- Couleurs : uniquement via tokens `--color-*` — jamais de valeurs brutes dans les `.tsx`.
  - Exception : `bg-transparent` pour la transparence structurelle.
  - `bg-white` / `text-black` autorisés uniquement à l'intérieur d'une classe composant dans `globals.css`.
- Espacement : echelle Tailwind standard directement (`p-4`, `gap-6`, `mt-8`...). Tokens `--ctx-*` uniquement pour les valeurs avec une signification semantique metier.
- Syntaxe Tailwind variable : `gap-(--token)`, `px-(--token)`, `bg-(--token)`.
- Toute nouvelle classe composant va dans `globals.css` sous `@layer components` — jamais en objet JS ou inline statique.
- Pas de `@layer` imbriqués dans `@layer components` — les sections sont organisées par commentaires `/* === NOM === */`.
- Un token est cree uniquement si la valeur est reutilisee dans 2+ endroits avec le meme sens metier.
- Les classes à usage unique (un seul fichier `.tsx`) sont inlinées directement dans le composant.
- Toute valeur d'animation réutilisée dans 2+ endroits devient un token `--anim-*` dans `tokens.css`.
- Les `@keyframes` vont exclusivement dans `animations.css` — jamais dans `globals.css` ni dans un composant.
- Les paramètres de durée/easing spécifiques à un seul composant (ex : `80s` pour le marquee) sont inlinés directement dans la classe `@layer components`.
