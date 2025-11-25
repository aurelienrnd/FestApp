# 📦 Base de Donnée Projet Vindhellfest – Architecture & Documentation

# 🗂️ Structure du Projet
Voici l’architecture globale du projet avec l’explication du rôle de chaque dossier :

```bash
├─ .init/
│  └─ user_schema.sql
└─ README.md
```
## 📁 `init/` – Fichier d'initialisation de la base de donnée
Ce dossier contient l’ensemble des scripts nécessaires à la création et à la configuration initiale du schéma SQL du projet.

### `user_schema.sql`
Ce fichier contient :

Les extensions PostgreSQL nécessaires
- pgcrypto : génération d’UUID aléatoires (gen_random_uuid())
- citext : gestion des emails insensibles à la casse

La création de la table users, utilisée pour les comptes administrateurs
Elle inclut :
- un identifiant unique (UUID)
- une adresse email unique et case-insensitive (CITEXT)
- un mot de passe hashé
- un nom affiché
- un système d’activation/désactivation de compte
- des timestamps (created_at, updated_at)
- Un trigger PostgreSQL qui met automatiquement à jour le champ updated_at à chaque modification d’un utilisateur.
- Une suppression conditionnelle de la table en phase de développement pour éviter les conflits lors des modifications du schéma (DROP TABLE IF EXISTS ... CASCADE).