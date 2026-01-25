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
│  ├─ 02_sessions_schema.sql
│  ├─ 03_article_schema.sql
│  ├─ 04_artist_schema.sql
│  └─ 05_concert_schema.sql
└─ README.md
```
## 📁 `init/` – Fichier d'initialisation de la base de donnée
Le dossier init/ regroupe l’ensemble des scripts SQL utilisés pour créer et alimenter la base de données durant le développement.
### 📄 01_user_schema.sql — Table users
Ce fichier contient :
- Les extensions PostgreSQL nécessaires
- pgcrypto : génération d’UUID aléatoires (gen_random_uuid())
- citext : gestion des emails insensibles à la casse

La table est utilisée pour la création des comptes administrateurs
Elle inclut :
- un identifiant unique de type UUID
- une adresse email unique et insensible à la casse
- un mot de passe stocké sous forme hashée
- un nom d’affichage
- un indicateur d’activation/désactivation du compte
- des champs de suivi temporel (created_at, updated_at)

Automatisation de la mise à jour
- un trigger PostgreSQL mettant automatiquement à jour updated_at à chaque modification

Gestion du développement
- suppression conditionnelle de la table (DROP TABLE IF EXISTS ... CASCADE) pour éviter les conflits lors des évolutions du schéma

### 📄 02_sessions_schema.sql — Table sessions
Ce fichier contient :
- un identifiant unique de session
- une référence vers l’utilisateur connecté (clé étrangère vers users)
- une date d’expiration de la session
- une date de creation de la session
- une si la session est cloturée

Gestion du cycle de vie
- suppression automatique des sessions lorsque l’utilisateur associé est supprimé (cascade)

Gestion du développement
- suppression conditionnelle de la table pour permettre la recréation du schéma sans erreur

### 📄 03_article_schema.sql — Table articles
Ce fichier contient :
- un identifiant unique d’article
- un titre
- un contenu textuel
- un statut de publication
- des dates de création et de mise à jour
- url du media associer et sa description
- une référence vers l’auteur

Cohérence des données
- contraintes garantissant la validité des références utilisateurs

Gestion du développement
- suppression conditionnelle de la table pour faciliter les mises à jour du modèle

### 📄 04_artist_schema.sql — Table artists
Ce fichier contient :
- un identifiant unique d’artiste
- un nom d’artiste ou de groupe
- une description avec genre et origine
- des liens médias leur description

Gestion du développement
- suppression conditionnelle de la table pour permettre l’évolution du schéma sans conflit

### 📄 05_concert_schema.sql — Table concerts
Ce fichier contient :
- un identifiant unique de concert
- un artist associer
- une date et une heure de passage
- une scène ou localisation

Relations métier
- chaque concert est obligatoirement associé à un artiste existant

Gestion du développement
- suppression conditionnelle de la table pour permettre les modifications de structure en phase de conception
