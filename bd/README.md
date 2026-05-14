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
│   ├── 03_news_schema.sql
│   ├── 04_artist_schema.sql
│   ├── 05_concert_schema.sql
│   ├── 06_seed_users.sql
│   ├── 07_seed_news.sql
│   ├── 08_seed_artists.sql
│   └── 09_seed_concerts.sql
└── README.md
```

---

## `init/` — Scripts d'initialisation

Le dossier `init/` regroupe l'ensemble des scripts SQL exécutés automatiquement par Docker au démarrage du conteneur PostgreSQL. Les fichiers `01` à `05` créent les tables. Les fichiers `06` à `09` insèrent les données de développement (fixtures).

> Les fichiers `01` à `05` commencent par un `DROP TABLE IF EXISTS ... CASCADE` pour permettre de relancer le conteneur proprement lors des évolutions du schéma. **À ne pas utiliser en production.**

---

### `01_user_schema.sql` — Table `users`

**Extensions utilisées :** `pgcrypto`, `citext`

Stocke les comptes des utilisateurs administrateurs de l'application.

| Colonne               | Type               | Contraintes               | Description                                        |
| --------------------- | ------------------ | ------------------------- | -------------------------------------------------- |
| `id`                  | `UUID`             | PRIMARY KEY               | Identifiant unique, généré automatiquement         |
| `email`               | `CITEXT`           | NOT NULL, UNIQUE          | Email insensible à la casse                        |
| `password_hash`       | `VARCHAR(255)`     | NOT NULL                  | Mot de passe hashé (bcrypt)                        |
| `display_name`        | `VARCHAR(100)`     | NOT NULL                  | Nom affiché dans l'interface admin                 |
| `role`                | `user_role` (ENUM) | NOT NULL                  | Rôle de l'utilisateur (`admin`, `artists`, `news`) |
| `password_changed_at` | `TIMESTAMPTZ`      | NULL                      | Date du dernier changement de mot de passe         |
| `created_at`          | `TIMESTAMPTZ`      | NOT NULL, DEFAULT `NOW()` | Date de création du compte                         |

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

### `03_news_schema.sql` — Table `news`

**Extensions utilisées :** `pgcrypto`

Stocke le contenu éditorial du festival (actualités, annonces).

| Colonne             | Type           | Contraintes                               | Description                                               |
| ------------------- | -------------- | ----------------------------------------- | --------------------------------------------------------- |
| `id`                | `UUID`         | PRIMARY KEY                               | Identifiant unique de l'news                              |
| `title`             | `VARCHAR(150)` | NOT NULL                                  | Titre de l'news                                           |
| `content`           | `TEXT`         | NULL                                      | Corps de l'news                                           |
| `is_published`      | `BOOLEAN`      | NOT NULL, DEFAULT `FALSE`                 | Statut de publication                                     |
| `created_at`        | `TIMESTAMPTZ`  | NOT NULL, DEFAULT `NOW()`                 | Date de création                                          |
| `url_media`         | `VARCHAR(255)` | NOT NULL                                  | URL ou chemin du média associé                            |
| `description_media` | `VARCHAR(255)` | NOT NULL                                  | Texte alternatif du média                                 |
| `user_id`           | `UUID`         | NULL, FK → `users(id)` ON DELETE SET NULL | Auteur de l'news (`NULL` si l'utilisateur a été supprimé) |

**Contrainte :** Si un utilisateur est supprimé, son `user_id` passe à `NULL` dans les news qu'il a rédigés — l'news est conservé et l'auteur s'affiche comme « Auteur inconnu » (`ON DELETE SET NULL`).

**Index :** `created_at`, `is_published`

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
| `is_featured`       | `BOOLEAN`      | NOT NULL, DEFAULT `FALSE`    | Mis en avant sur la page d'accueil — maximum 2 artistes simultanément  |

**Index :** `genre`, `name`

> `url_media` stocke un chemin local vers une image WebP générée par sharp lors de l'upload (ex : `/uploads/artists/<uuid>.webp`).

> **Choix de conception :** `youtube_url` et `spotify_url` sont deux colonnes directes sur `artists` plutôt qu'une table séparée. Ce choix est justifié car il y a exactement deux plateformes connues à l'avance. Si d'autres plateformes s'ajoutaient, une table `artist_links` deviendrait préférable.

**Trigger : `trg_check_featured_limit`**

Un trigger `BEFORE INSERT OR UPDATE` appelle la fonction `check_featured_limit()` avant chaque écriture sur la table. Il opère en mode `FOR EACH ROW` — ce qui donne accès à `NEW`, la ligne en cours d'écriture — contrairement à `FOR EACH STATEMENT` où `NEW` n'existe pas.

La logique est la suivante : si `NEW.is_featured = TRUE`, on compte les artistes déjà à `TRUE` en excluant l'artiste en cours (`id != NEW.id`, pour ne pas se compter soi-même lors d'un `UPDATE`). Si ce count atteint 2, la fonction lève `RAISE EXCEPTION 'featured_limit_reached'`, ce qui annule immédiatement l'opération. Le backend intercepte cette exception PostgreSQL et renvoie une erreur métier au frontend.

Le trigger est déclaré `BEFORE` (et non `AFTER`) pour que l'exception empêche l'écriture avant qu'elle n'ait lieu.

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

> **Choix de conception :** Dans une modélisation Merise stricte, `stage` pourrait être une entité à part entière. Ce choix a été fait de le garder comme attribut texte car les scènes du festival sont des libellés fixes et simples — elles n'ont pas d'attributs propres qui justifieraient une table dédiée. Ce choix évite une complexité inutile tout en respectant la 3FN.

---

## Fixtures de développement

Les fichiers `06` à `09` sont exécutés après la création des tables. Ils insèrent un jeu de données cohérent et suffisant pour tester toutes les fonctionnalités de l'application. Tous les mots de passe sont `MyPassword`.

---

### `06_seed_users.sql` — Comptes de développement

Insère 3 utilisateurs couvrant chacun des rôles disponibles.

| Email                 | Display name    | Rôle      |
| --------------------- | --------------- | --------- |
| `admin@example.com`   | Admin           | `admin`   |
| `artists@example.com` | artists Manager | `artists` |
| `news@example.com`    | News Editor     | `news`    |

---

### `07_seed_news.sql` — news de développement

Insère 10 news liés à `admin@example.com`, avec des dates relatives (`NOW() - INTERVAL '...'`) couvrant jusqu'à 365 jours en arrière.

| Titre                                          | Statut    |
| ---------------------------------------------- | --------- |
| Ouverture de la billetterie                    | Publié    |
| Nouvelle tête d'affiche                        | Brouillon |
| Le programme complet est dévoilé               | Publié    |
| Infos pratiques : accès et stationnement       | Publié    |
| Oasis de retour : une exclusivité Vindhellfest | Publié    |
| Les coulisses du festival                      | Publié    |
| Restauration : les meilleurs stands            | Brouillon |
| Retour sur la première édition                 | Publié    |
| Développement durable : nos engagements        | Publié    |
| Concours : gagnez vos pass VIP                 | Brouillon |

---

### `08_seed_artists.sql` — Artistes de développement

Insère 10 artistes rock avec biographies complètes, chemins d'images locaux et liens YouTube/Spotify officiels.

| Nom                     | Genre           | Origine                 |
| ----------------------- | --------------- | ----------------------- |
| Red Hot Chili Peppers   | Rock            | États-Unis, Los Angeles |
| Foo Fighters            | Rock            | États-Unis, Seattle     |
| Oasis                   | Britpop         | Royaume-Uni, Manchester |
| AC/DC                   | Hard rock       | Australie, Sydney       |
| Guns N' Roses           | Hard rock       | États-Unis, Los Angeles |
| Pearl Jam               | Grunge          | États-Unis, Seattle     |
| Muse                    | Rock alternatif | Royaume-Uni, Teignmouth |
| Arctic Monkeys          | Indie rock      | Royaume-Uni, Sheffield  |
| Queens of the Stone Age | Hard rock       | États-Unis, Palm Desert |
| The Strokes             | Indie rock      | États-Unis, New York    |

---

### `09_seed_concerts.sql` — Concerts de développement

Insère 10 concerts planifiés sur 3 jours fixes (21, 22, 23 mai 2027), répartis sur 2 scènes. Chaque créneau dure 1 heure à partir de 20h (heure de Paris). Les `artist_id` sont résolus par `SELECT id FROM artists WHERE name = '...'`.

| Artiste                 | Scène       | Créneau               |
| ----------------------- | ----------- | --------------------- |
| Red Hot Chili Peppers   | `MainStage` | 21 mai, 20h–21h       |
| Foo Fighters            | `Tremplin`  | 21 mai, 20h–21h       |
| Oasis                   | `MainStage` | 21 mai, 21h–22h       |
| Guns N' Roses           | `Tremplin`  | 21 mai, 21h–22h       |
| AC/DC                   | `MainStage` | 22 mai, 20h–21h       |
| Pearl Jam               | `Tremplin`  | 22 mai, 20h–21h       |
| Muse                    | `MainStage` | 22 mai, 21h–22h       |
| Queens of the Stone Age | `Tremplin`  | 22 mai, 21h–22h       |
| Arctic Monkeys          | `MainStage` | 23 mai, 20h–21h       |
| The Strokes             | `Tremplin`  | 23 mai, 20h–21h       |
