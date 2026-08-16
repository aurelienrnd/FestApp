# Modèle de données — Phase 1 (Migration Better Auth)

Ce dossier documente l'évolution du schéma de base de données de FestApp pour la **Phase 1 — Migration Better Auth** du roadmap (Kanban Notion), à travers les trois niveaux de modélisation Merise :

- **MCD.md** — Modèle Conceptuel de Données (entités, associations, cardinalités)
- **MLD.md** — Modèle Logique de Données (schéma relationnel)
- **MPD.sql** — Modèle Physique de Données (DDL PostgreSQL exécutable)

## Rappel des 8 tâches de la Phase 1

| N° | Tâche | Impact sur les données |
|----|-------|------------------------|
| 1 | Installer Better Auth côté backend Express | Aucun (config applicative) |
| 2 | Adapter la table `users` au schéma Better Auth | Modifie `users`, ajoute `account` |
| 3 | Configurer le flux « mot de passe oublié » natif | Ajoute `verification` |
| 4 | Activer le plugin 2FA (TOTP) pour les comptes admin | Ajoute `two_factor` |
| 5 | Activer Google comme fournisseur de connexion en option | Enrichit `account` (colonnes OAuth) |
| 6 | Rate limiting intégré sur les routes d'authentification | Aucun (config applicative) |
| 7 | Helmet (CSP, HSTS, anti-sniffing) | Aucun (config applicative) |
| 8 | Protection CSRF hors Better Auth | Aucun (config applicative) |

## Principe de migration retenu

Pour éviter de perdre les comptes existants, la table `users` est **conservée** (pas de renommage), mais adaptée via le système de mapping de Better Auth (`modelName` / `fields`) :

- Les colonnes métier propres à FestApp sont **conservées telles quelles** : `display_name`, `role`.
- Les colonnes requises par Better Auth mais absentes sont **ajoutées** : `email_verified`, `image`, `updated_at`.
- Le mot de passe hashé (`password_hash`) est **retiré** de `users` et **déplacé** dans la nouvelle table `account` (c'est la convention Better Auth : une méthode d'authentification = une ligne `account`, ce qui permet aussi d'accueillir Google en Phase 1.5/tâche 5 sans nouvelle migration).
- La table `sessions` existante est **remplacée** par la table `session` générée par Better Auth (les sessions actives seront de toute façon invalidées par le changement de mécanisme, donc aucune perte de donnée métier).
- Deux tables sont **ajoutées** : `verification` (tâche 3, liens à usage unique) et `two_factor` (tâche 4, secrets TOTP + codes de secours).
- Les tables métier `news`, `artists`, `concerts` ne changent pas de structure ; seule la FK `news.user_id → users.id` est conservée à l'identique.
