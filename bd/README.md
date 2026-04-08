# Base de données — Projet Vindhellfest

## Démarrage

- `docker compose up -d db` : Lance uniquement la base de données PostgreSQL en arrière-plan.
- `docker compose down -v` : Arrête et supprime les conteneurs, les réseaux Docker et la base de données (utile après une modification du schéma).
- `docker exec -it vindhellfest-db psql -U postgres -d vindhellfest` : Entre dans le conteneur PostgreSQL et ouvre un terminal psql. Utile pour tester les tables directement dans la base.

---

## Architecture globale

```
bd/
├── init/
│   ├── 01_user_schema.sql
│   ├── 02_sessions_schema.sql
│   ├── 03_article_schema.sql
│   ├── 04_artist_schema.sql
│   └── 05_concert_schema.sql
└── README.md
```

---

## `init/` — Scripts d'initialisation

Le dossier `init/` regroupe l'ensemble des scripts SQL exécutés automatiquement par Docker au démarrage du conteneur PostgreSQL. Ils créent les tables et insèrent des données de développement.

> Chaque fichier commence par un `DROP TABLE IF EXISTS ... CASCADE` pour permettre de relancer le conteneur proprement lors des évolutions du schéma. **À ne pas utiliser en production.**

---

### `01_user_schema.sql` — Table `users`

**Extensions utilisées :** `pgcrypto`, `citext`

Stocke les comptes des utilisateurs administrateurs de l'application.

| Colonne               | Type               | Contraintes               | Description                                       |
| --------------------- | ------------------ | ------------------------- | ------------------------------------------------- |
| `id`                  | `UUID`             | PRIMARY KEY               | Identifiant unique, généré automatiquement        |
| `email`               | `CITEXT`           | NOT NULL, UNIQUE          | Email insensible à la casse                       |
| `password_hash`       | `VARCHAR(255)`     | NOT NULL                  | Mot de passe hashé (bcrypt)                       |
| `display_name`        | `VARCHAR(100)`     | NOT NULL                  | Nom affiché dans l'interface admin                |
| `role`                | `user_role` (ENUM) | NOT NULL                  | Rôle de l'utilisateur (`admin`, `lineup`, `news`) |
| `password_changed_at` | `TIMESTAMPTZ`      | NULL                      | Date du dernier changement de mot de passe        |
| `created_at`          | `TIMESTAMPTZ`      | NOT NULL, DEFAULT `NOW()` | Date de création du compte                        |

**Données de développement :** Un utilisateur `admin@example.com` avec le mot de passe `MyPassword` est inséré au démarrage.

> **Choix de conception :** Le rôle utilisateur est une valeur parmi un ensemble fermé et connu à l'avance. Un type `ENUM` PostgreSQL (`user_role`) garantit la contrainte directement en base — toute valeur invalide est rejetée même en contournant l'API. Une table `ROLE` séparée aurait été possible en Merise strict mais aurait ajouté une jointure inutile.

---

### `02_sessions_schema.sql` — Table `sessions`

**Extensions utilisées :** `pgcrypto`

Gère la persistance des connexions et la sécurité des accès dans le cadre de l'authentification JWT.

| Colonne      | Type          | Contraintes                                  | Description                                          |
| ------------ | ------------- | -------------------------------------------- | ---------------------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY                                  | Identifiant unique de session                        |
| `user_id`    | `UUID`        | NOT NULL, FK → `users(id)` ON DELETE CASCADE | Utilisateur propriétaire de la session               |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL                                     | Date/heure d'expiration                              |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `NOW()`                    | Date de création                                     |
| `revoked_at` | `TIMESTAMPTZ` | NULL                                         | Date de révocation (`NULL` si la session est active) |

**Contraintes de cohérence :**

- `expires_at > created_at` — une session ne peut pas expirer avant d'avoir été créée
- `revoked_at IS NULL OR revoked_at >= created_at` — une session ne peut pas être révoquée avant sa création

**Index :** `user_id`, `expires_at`, `revoked_at`

---

### `03_article_schema.sql` — Table `articles`

**Extensions utilisées :** `pgcrypto`

Stocke le contenu éditorial du festival (actualités, annonces).

| Colonne             | Type           | Contraintes                               | Description                                                  |
| ------------------- | -------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `id`                | `UUID`         | PRIMARY KEY                               | Identifiant unique de l'article                              |
| `title`             | `VARCHAR(150)` | NOT NULL                                  | Titre de l'article                                           |
| `content`           | `TEXT`         | NULL                                      | Corps de l'article                                           |
| `is_published`      | `BOOLEAN`      | NOT NULL, DEFAULT `FALSE`                 | Statut de publication                                        |
| `created_at`        | `TIMESTAMPTZ`  | NOT NULL, DEFAULT `NOW()`                 | Date de création                                             |
| `url_media`         | `VARCHAR(255)` | NOT NULL                                  | URL ou chemin du média associé                               |
| `description_media` | `VARCHAR(255)` | NOT NULL                                  | Texte alternatif du média                                    |
| `user_id`           | `UUID`         | NULL, FK → `users(id)` ON DELETE SET NULL | Auteur de l'article (`NULL` si l'utilisateur a été supprimé) |

**Contrainte :** Si un utilisateur est supprimé, son `user_id` passe à `NULL` dans les articles qu'il a rédigés — l'article est conservé et l'auteur s'affiche comme « Auteur inconnu » (`ON DELETE SET NULL`).

**Index :** `created_at`, `is_published`

**Données de développement :** Deux articles sont insérés au démarrage et liés à `admin@example.com` : « Ouverture de la billetterie » (`is_published = TRUE`) et « Nouvelle tête d'affiche » (`is_published = FALSE`, brouillon).

---

### `04_artist_schema.sql` — Table `artists`

**Extensions utilisées :** `pgcrypto`, `citext`

Représente les groupes ou artistes programmés au festival.

| Colonne             | Type           | Contraintes                  | Description                                                            |
| ------------------- | -------------- | ---------------------------- | ---------------------------------------------------------------------- |
| `id`                | `UUID`         | PRIMARY KEY                  | Identifiant unique de l'artiste                                        |
| `name`              | `CITEXT`       | NOT NULL, `char_length >= 2` | Nom de l'artiste ou du groupe                                          |
| `genre`             | `VARCHAR(60)`  | NOT NULL                     | Genre musical                                                          |
| `origin`            | `VARCHAR(80)`  | NOT NULL                     | Origine (pays, ville)                                                  |
| `bio`               | `TEXT`         | NOT NULL                     | Biographie                                                             |
| `url_media`         | `VARCHAR(255)` | NOT NULL                     | Chemin local de l'image uploadée (ex : `/uploads/artists/<uuid>.webp`) |
| `description_media` | `VARCHAR(255)` | NOT NULL                     | Texte alternatif du média                                              |
| `youtube_url`       | `VARCHAR(255)` | NULL                         | Lien vers la chaîne YouTube officielle de l'artiste (optionnel)        |
| `spotify_url`       | `VARCHAR(255)` | NULL                         | Lien vers la page Spotify officielle de l'artiste (optionnel)          |

**Index :** `genre`, `name`

> `url_media` stocke un chemin local vers une image WebP générée par sharp lors de l'upload. Les données de développement utilisent encore des URLs externes — elles seront remplacées lors du premier ajout via le back-office.

> **Choix de conception :** `youtube_url` et `spotify_url` sont deux colonnes directes sur `artists` plutôt qu'une table séparée. Ce choix est justifié car il y a exactement deux plateformes connues à l'avance. Si d'autres plateformes s'ajoutaient, une table `artist_links` deviendrait préférable.

**Données de développement :** Red Hot Chili Peppers et Foo Fighters sont insérés au démarrage, avec leurs liens YouTube et Spotify officiels.

---

### `05_concert_schema.sql` — Table `concerts`

**Extensions utilisées :** `pgcrypto`, `citext`, `btree_gist`

Décrit les événements musicaux et modélise la programmation du festival.

| Colonne      | Type          | Contraintes                                    | Description                             |
| ------------ | ------------- | ---------------------------------------------- | --------------------------------------- |
| `id`         | `UUID`        | PRIMARY KEY                                    | Identifiant unique du concert           |
| `artist_id`  | `UUID`        | NOT NULL, FK → `artists(id)` ON DELETE CASCADE | Artiste qui se produit                  |
| `stage`      | `TEXT`        | NOT NULL                                       | Nom de la scène où se produit l'artiste |
| `start_time` | `TIMESTAMPTZ` | NOT NULL                                       | Date et heure de début                  |
| `end_time`   | `TIMESTAMPTZ` | NOT NULL                                       | Date et heure de fin                    |

**Contraintes de cohérence :**

- `end_time > start_time` — un concert ne peut pas se terminer avant de commencer
- `no_overlap_stage` — deux concerts ne peuvent pas se chevaucher sur la même scène (via `EXCLUDE USING gist`)
- `no_overlap_artist` — un artiste ne peut pas jouer sur deux scènes en même temps (via `EXCLUDE USING gist`)

> L'extension `btree_gist` est requise pour les contraintes d'exclusion sur les plages horaires (`tstzrange`).

**Index :** `(stage, start_time)`, `start_time`

**Données de développement :** Un concert de Red Hot Chili Peppers sur `main-stage` et un concert de Foo Fighters sur `second-stage` sont planifiés le lendemain du démarrage.

> **Choix de conception :** Dans une modélisation Merise stricte, `stage` pourrait être une entité à part entière. Ce choix a été fait de le garder comme attribut texte car les scènes du festival sont des libellés fixes et simples — elles n'ont pas d'attributs propres qui justifieraient une table dédiée. Ce choix évite une complexité inutile tout en respectant la 3FN.
