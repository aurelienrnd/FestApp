# 📦 Base de Donnée Projet Vindhellfest – Architecture & Documentation

## Demarrage :
- `docker compose up -d db` :  Lance uniquement la base de données Postgres en arrière-plan.

- `docker compose down -v` : Arrête et supprime, les conteneurs, les réseaux Docker, et la base de données (utile apres modif sur la bdd)

- `docker exec -it vindhellfest-db psql -U postgres -d vindhellfest` : Entre dans le conteneur PostgreSQL et ouvre un terminal psql.
Util pour tester tes tables directement dans la base.


## Architecture globale du projet

```bash
├─ .init/
│  ├─ 01_user_schema.sql
│  └─ 02_user_inserts.sql
└─ README.md
```
## 📁 `init/` – Fichier d'initialisation de la base de donnée
Le dossier init/ regroupe l’ensemble des scripts SQL utilisés pour créer et alimenter la base de données durant le développement.
Il contient deux types de fichiers :
- `schema.sql` – Définit la structure de la base (tables, contraintes, extensions, triggers, etc.)
- `inserts.sql` – Fournit des données d’exemple pour les phases de développement et de test

### `01_user_schema.sql`
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
