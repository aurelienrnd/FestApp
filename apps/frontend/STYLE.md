# Guide Style Frontend
Ce document explique comment fonctionne le style dans `apps/frontend`.

## 1. Fichier central

Le style global est centralisé dans:
- `apps/frontend/src/app/globals.css`

Ce fichier contient:
- les variables CSS (`:root`)
- les thèmes (`:root[data-theme="..."]`)
- les classes de composants réutilisables (`@layer components`)
- quelques utilitaires globaux

## 2. Design tokens (`:root`)
Les tokens sont définis en variables CSS pour éviter de dupliquer les valeurs.
Principales familles:
- Couleurs:
  - `--collor-1`, `--collor-2`, `--collor-3`
  - `--collor-bg-input`, `--collor-text-input`
- Thème:
  - `--collor-text-visitor`, `--collor-bg-visitor`
  - `--collor-text-admin`, `--collor-bg-admin`
  - `--collor-text`, `--collor-bg` (variables actives selon le thème)
- Animation:
  - `--anim-btn-transition`
  - `--anim-btn-duration`
  - `--anim-btn-scale`
- Espacements:
  - `--spacing-container-modal`
  - `--spacing-padding-input-x`
  - `--spacing-padding-input-y`
- Typographie:
  - `--font-family-input` (actuellement `Arial, sans-serif`)

## 3. Système de thème
Le projet utilise deux thèmes pilotés par l’attribut `data-theme`:
- `:root[data-theme="admin"]`
- `:root[data-theme="visitor"]`

Ces blocs alimentent les variables actives:
- `--collor-text`
- `--collor-bg`

Ensuite, les composants utilisent ces variables via Tailwind:
- `bg-(--collor-bg)`
- `text-(--collor-text)`

## 4. Classes réutilisables (`@layer components`)
Classes principales:
- `.btn-cta`: bouton principal (couleur marque + hover scale)
- `.mobil-menu`: bouton menu mobile
- `.modal-overlay`: overlay de modale
- `.modal`: conteneur de modale
- `.input`: style partagé des champs input
- `.text-area`: style partagé des zones de texte

`input` et `textarea` utilisent:
- les mêmes couleurs/bordures
- les mêmes paddings via tokens
- la même police via `font-family: var(--font-family-input)`

## 5. Typographie
La police globale du site est injectée dans:
- `apps/frontend/src/app/layout.tsx`
  avec `next/font/google` (`Koulen`), appliquée sur `<html>`.

Pour les champs de formulaire, une police dédiée est forcée via:
- `--font-family-input` dans `globals.css`

## 6. Bonnes pratiques pour ajouter du style
1. Ajouter d’abord une variable dans `:root` si la valeur doit être réutilisée.
2. Créer/étendre une classe dans `@layer components` pour éviter les classes longues répétées.
3. Utiliser les classes partagées dans les composants (`className="input"` par exemple).
4. Garder les styles contextuels directement dans le composant seulement si la règle est vraiment locale.

## 7. Conventions recommandées
- Préférer des noms cohérents de tokens: `--<categorie>-<objet>-<propriete>`.
- Réutiliser les tokens existants avant d’en créer un nouveau.
- Éviter les valeurs en dur si elles sont utilisées à plusieurs endroits.
- Si un style concerne plusieurs composants, le déplacer dans `globals.css`.
