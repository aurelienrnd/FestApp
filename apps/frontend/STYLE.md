# Guide Style Frontend

Ce document décrit le style réellement utilisé dans `apps/frontend`.

## 1. Fichier central

Le style global est centralisé dans:
- `apps/frontend/src/app/globals.css`

Ce fichier contient:
- les variables CSS (`:root`)
- les thèmes (`:root[data-theme="..."]`)
- les classes composants réutilisables (`@layer components`)

## 2. Design tokens (`:root`)

Les tokens sont définis en variables CSS pour éviter les valeurs dupliquées.

### Couleurs
- `--collor-1`, `--collor-2`, `--collor-3`
- `--collor-bg-input`, `--collor-text-input`
- `--collor-text-visitor`, `--collor-bg-visitor`
- `--collor-text-admin`, `--collor-bg-admin`
- `--collor-text`, `--collor-bg` (variables actives selon le thème)

Note: le préfixe `collor` est conservé tel quel pour rester aligné avec le code actuel.

### Animation
- `--anim-btn-transition`
- `--anim-btn-duration`
- `--anim-btn-scale`

### Espacements
- `--spacing-container-modal`
- `--spacing-paraf-modal`
- `--spacing-padding-input-x`
- `--spacing-padding-input-y`
- `--spacing-section-page-x`
- `--spacing-mobil-section-page-y`
- `--spacing-desktop-section-page-y`

### Typographie
- `--font-family-input` (actuellement `Arial, sans-serif`)

## 3. Système de thème

Le projet utilise deux thèmes pilotés par l'attribut `data-theme`:
- `:root[data-theme="admin"]`
- `:root[data-theme="visitor"]`

Les composants s'appuient ensuite sur:
- `bg-(--collor-bg)`
- `text-(--collor-text)`

## 4. Classes réutilisables (`@layer components`)

Classes actuellement définies dans `globals.css`:
- `.title-modal`: titre principal des modales
- `.nav-list`: liste de navigation horizontale (alignement + gap + tracking)
- `.btn-cta`: bouton principal (couleur marque, transitions, état disabled)
- `.btn-type-2`: bouton secondaire (variation d'opacité)
- `.mobil-menu`: bouton menu mobile
- `.modal-overlay`: fond d'overlay des modales
- `.modal`: conteneur de modale
- `.form-modal`: structure verticale de formulaire en modale
- `.input`: style partagé des champs `input`
- `.text-area`: style partagé des champs `textarea`
- `.submit-modal-area`: zone d'alignement du bouton de soumission
- `.section-page`: spacing vertical/horizontal des sections de page

## 5. Usage dans les composants

- `Footer.tsx` utilise `.nav-list`, `.btn-type-2`, `.modal`, `.modal-overlay`, `.title-modal`.
- `ContactUs.tsx` et `ForgotPassword.tsx` utilisent `.form-modal`, `.input`, `.submit-modal-area`.
- `login/page.tsx` utilise `.section-page`, `.input`, `.btn-cta`, `.btn-type-2`, `.modal`, `.modal-overlay`, `.title-modal`.
- `Banner.tsx` utilise `.nav-list` et `.mobil-menu`.

## 6. Conventions en place

- Prioriser les classes partagées définies dans `@layer components` avant d'ajouter des classes locales.
- Ajouter une variable CSS dans `:root` si la valeur est réutilisable.
- Garder les styles inline/locales seulement pour les cas strictement spécifiques.
- Conserver la syntaxe Tailwind actuelle basée sur variables CSS, par exemple `bg-(--collor-bg)`.
