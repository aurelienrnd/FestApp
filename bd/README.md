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
├── mcd_vindhellfest.drawio
├── mld_vindhellfest.drawio
└── README.md
```

---

## MCD

> Diagramme : `mcd_vindhellfest.drawio`

### Relations entre entités

Le MCD modélise 3 associations.

**UTILISATEUR — ouvre — SESSION** `(0,n) / (1,1)`

Un utilisateur peut ouvrir zéro ou plusieurs sessions (connexions successives). Une session appartient à exactement un utilisateur — elle ne peut pas exister sans lui.

**UTILISATEUR — rédige — NEWS** `(0,n) / (0,1)`

Un utilisateur peut rédiger zéro ou plusieurs news. Une news est rédigée par zéro ou un utilisateur — le `(0,1)` traduit le fait que l'auteur peut être inconnu si son compte a été supprimé.

**ARTISTE — se produit — CONCERT** `(1,1) / (0,n)`

Un artiste peut se produire dans zéro ou plusieurs concerts (un artiste peut être programmé plusieurs fois). Un concert est associé à exactement un artiste — il ne peut pas exister sans artiste référencé.

**Relation UTILISATEUR — ARTISTE (non modélisée)**

Un utilisateur crée techniquement un artiste, mais cette association n'a pas été modélisée. L'application n'affiche pas l'auteur d'un artiste, ne filtre pas les artistes par créateur et ne gère pas de droits par propriété — la relation n'a donc aucune valeur fonctionnelle. En Merise, une association ne se modélise que si elle répond à une question métier réelle dans l'application. Modéliser une relation sans usage fonctionnel ajouterait de la complexité sans valeur et induirait en erreur un lecteur du MCD.

---

### Choix des identifiants

Dans le MCD, toutes les entités utilisent un `#identifiant` technique (UUID). Il aurait été possible d'utiliser une clé naturelle pour certaines d'entre elles :

| Entité        | Alternative possible                                               | Raison du rejet                                        |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| `UTILISATEUR` | `email` (UNIQUE + NOT NULL)                                        | Un email peut changer — instabilité comme identifiant  |
| `CONCERT`     | `stage` + `start_time` (combinaison unique via contrainte EXCLUDE) | Clé composite plus lourde à manipuler en code et en FK |
| `ARTISTE`     | aucune —`name` n'est pas UNIQUE                                    | UUID obligatoire                                       |
| `SESSION`     | aucune                                                             | UUID obligatoire                                       |
| `NEWS`        | aucune —`title` + `created_at` trop fragile                        | UUID obligatoire                                       |

Pour des raisons de cohérence, de stabilité et de simplicité, l'UUID a été retenu comme identifiant sur toutes les tables.

---

### Choix de ne pas créer d'entités `ROLE` et `STAGE`

Il aurait été possible en Merise strict de modéliser `role` et `stage` comme des entités à part entière. Ce choix a été écarté pour les raisons suivantes.

#### `role` sur `UTILISATEUR`

Les rôles (`admin`, `artists`, `news`) forment un ensemble **fermé et connu à l'avance**, qui n'évolue pas sans intervention technique sur le projet. Une entité `ROLE` séparée se justifie uniquement si le rôle possède ses propres attributs ou s'il est amené à être géré dynamiquement. Ici un rôle n'est qu'un libellé fixe — une entité dédiée aurait ajouté une jointure inutile et une complexité de gestion sans valeur métier. En base, un type `ENUM` PostgreSQL garantit la même contrainte d'intégrité directement, sans table supplémentaire.

#### `stage` sur `CONCERT`

Les scènes (`MainStage`, `Tremplin`) définissent l'infrastructure physique du festival. Une entité `STAGE` aurait du sens uniquement si une scène avait ses propres attributs (capacité, équipements, localisation...). Dans ce projet, une scène n'est qu'un **libellé identifiant un espace** — elle n'a pas de données propres qui justifieraient une entité. De plus, les contraintes d'exclusion de chevauchement horaire en base reposent directement sur la valeur de `stage` : introduire une FK vers une table `stages` aurait complexifié ces contraintes sans apport fonctionnel.

### Règle générale appliquée

> Une entité séparée se justifie quand la valeur a ses **propres attributs** ou qu'elle est **amenée à évoluer dynamiquement**. Ni `role` ni `stage` ne remplissent ces conditions dans ce projet.

---

## MLD

> Diagramme : `mld_vindhellfest.drawio`

### Types utilisés

| Type                 | Colonnes associées                                                                        | Raison du choix                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UUID`               | `id` sur toutes les tables                                                                | Identifiant unique universel généré sans coordination entre serveurs, non prédictible (sécurité), portable entre environnements                               |
| `CITEXT`             | `email` (users), `display_name` (users)                                                   | Comparaison insensible à la casse sans `LOWER()` explicite — `admin@example.com` et `Admin@Example.com` sont traités comme identiques                         |
| `VARCHAR(255)`       | `password_hash`, `url_media`, `description_media`, `youtube_url`, `spotify_url`           | Chaîne à longueur bornée connue à l'avance — 255 est la limite standard pour les URLs et hashs bcrypt                                                         |
| `VARCHAR(150)`       | `title` (news)                                                                            | Titre court, longueur métier volontairement contrainte pour éviter les abus                                                                                   |
| `CITEXT`             | `display_name` (users)                                                                    | Nom d'affichage `UNIQUE` insensible à la casse, minimum 2 caractères — `"Jean"` et `"jean"` sont considérés identiques                                        |
| `VARCHAR(80)`        | `origin` (artists)                                                                        | Origine géographique — longueur suffisante pour « États-Unis, Los Angeles »                                                                                   |
| `VARCHAR(150)`       | `name` (artists)                                                                          | Nom d'artiste sensible à la casse — `"AC/DC"` et `"ac/dc"` sont distincts, la casse fait partie du nom                                                        |
| `VARCHAR(60)`        | `genre` (artists)                                                                         | Genre musical — libellé court, longueur suffisante                                                                                                            |
| `TEXT`               | `bio` (artists), `content` (news)                                                         | Contenu long sans limite prévisible —`TEXT` en PostgreSQL est illimité et aussi performant que `VARCHAR` sans contrainte                                      |
| `BOOLEAN`            | `is_published` (news), `is_featured` (artists)                                            | Valeur binaire oui/non — le type le plus direct et lisible pour un état                                                                                       |
| `TIMESTAMPTZ`        | `created_at`, `expires_at`, `revoked_at`, `password_changed_at`, `start_time`, `end_time` | Stocke la date ET le fuseau horaire — indispensable pour un festival avec des horaires précis et des utilisateurs potentiellement dans des fuseaux différents |
| `ENUM user_role`     | `role` (users)                                                                            | Ensemble fermé de 3 valeurs (`admin`, `artists`, `news`) — l'ENUM garantit l'intégrité directement en base, plus fiable qu'un `VARCHAR` libre                 |
| `ENUM concert_stage` | `stage` (concerts)                                                                        | Ensemble fermé de 2 valeurs (`MainStage`, `Tremplin`) — même raison que `user_role`, requis pour les contraintes `EXCLUDE` de chevauchement                   |

---

### Clés primaires et clés étrangères

Chaque table possède une clé primaire `id (UUID)` générée automatiquement. Les relations entre tables sont assurées par 3 clés étrangères.

| Clé étrangère        | Table source | Référence    | Nullable | Comportement à la suppression                                          |
| -------------------- | ------------ | ------------ | -------- | ---------------------------------------------------------------------- |
| `sessions.user_id`   | `sessions`   | `users.id`   | NON      | `ON DELETE CASCADE` — la session est supprimée avec l'utilisateur      |
| `news.user_id`       | `news`       | `users.id`   | OUI      | `ON DELETE SET NULL` — la news est conservée, l'auteur devient inconnu |
| `concerts.artist_id` | `concerts`   | `artists.id` | NON      | `ON DELETE CASCADE` — le concert est supprimé avec l'artiste           |

Les tables `users` et `artists` n'ont aucune clé étrangère — ce sont les racines du schéma. Toutes les dépendances partent d'elles vers les autres tables.

> **Contrainte UNIQUE sur `display_name` :** L'unicité du nom d'affichage est garantie à deux niveaux — au niveau applicatif via `checkDisplayNameAvailable` (renvoie un `409 Conflict` si le nom est déjà pris) et au niveau SQL via une contrainte `UNIQUE` sur la colonne. Cette double garantie assure que même une insertion directe en base contournant l'API ne peut pas créer de doublon.

> **Note sur `news.user_id` :** Un membre de l'organisation peut quitter le festival — les news qu'il a rédigées doivent pouvoir rester en ligne indépendamment de son départ. C'est pourquoi la suppression d'un utilisateur passe son `user_id` à `NULL` plutôt que de supprimer les news en cascade. Une alternative aurait été de ne jamais supprimer un utilisateur mais de le passer comme inactif (`is_active = FALSE`), ce qui aurait permis de conserver une trace de qui a écrit quoi. Cette approche de désactivation douce (soft delete) pourrait être ajoutée dans une version future de l'application.

---

## MPD

> Scripts : `bd/init/01_user_schema.sql` à `bd/init/05_concert_schema.sql`

### Extensions PostgreSQL

| Extension    | Tables concernées  | Rôle                                                                                                                           |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `pgcrypto`   | toutes             | Fournit `gen_random_uuid()` pour la génération des UUID                                                                        |
| `citext`     | `users`, `artists` | Fournit le type `CITEXT` pour les comparaisons insensibles à la casse sur `email` et `name`                                    |
| `btree_gist` | `concerts`         | Permet les contraintes `EXCLUDE USING gist` sur des colonnes scalaires (`stage`) combinées à des plages horaires (`tstzrange`) |

---

### Valeurs par défaut

| Valeur par défaut           | Colonnes concernées                            | Rôle                                                                                                                          |
| --------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `DEFAULT gen_random_uuid()` | `id` sur toutes les tables                     | Génère automatiquement un UUID à l'insertion — aucune valeur à fournir côté application                                       |
| `DEFAULT NOW()`             | `created_at` (users, sessions, news)           | Horodate automatiquement la création de la ligne                                                                              |
| `DEFAULT FALSE`             | `is_published` (news), `is_featured` (artists) | Une news est brouillon et un artiste n'est pas mis en avant par défaut — un choix explicite est requis pour activer ces états |

> **Note sur l'absence de `created_at` sur `artists` et `concerts` :** Ces deux tables ne tracent pas la date de création. Un `created_at` pourrait être utile en cas d'audit ou de débogage, mais ni le backend ni le frontend ne l'utilisent — aucune route ne le lit, aucun composant ne l'affiche. L'ajouter aurait été de la complexité sans valeur fonctionnelle pour ce projet.

---

### Contraintes CHECK

Les contraintes `CHECK` garantissent la cohérence des données directement en base — elles sont rejetées même en contournant l'API.

| Table      | Contrainte                             | Règle                                                                                                      |
| ---------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `sessions` | `chk_session_expires_after_created`    | `expires_at > created_at` — une session ne peut pas expirer avant d'avoir été créée                        |
| `sessions` | `chk_session_revoked_after_created`    | `revoked_at IS NULL OR revoked_at >= created_at` — une session ne peut pas être révoquée avant sa création |
| `news`     | `CHECK char_length(title) >= 2`        | Le titre d'une news doit faire au moins 2 caractères                                                       |
| `artists`  | `CHECK char_length(name) >= 2`         | Le nom d'un artiste doit faire au moins 2 caractères                                                       |
| `users`    | `CHECK char_length(display_name) >= 2` | Le nom d'affichage doit faire au moins 2 caractères                                                        |
| `concerts` | `chk_concert_end_after_start`          | `end_time > start_time` — un concert ne peut pas se terminer avant de commencer                            |

---

### Contraintes EXCLUDE

Les contraintes `EXCLUDE` sont spécifiques à PostgreSQL. Elles vont plus loin qu'un `UNIQUE` car elles vérifient le **chevauchement** sur une plage, pas l'égalité exacte. Elles nécessitent l'extension `btree_gist`.

| Table      | Contrainte          | Règle                                                                         |
| ---------- | ------------------- | ----------------------------------------------------------------------------- |
| `concerts` | `no_overlap_stage`  | Deux concerts ne peuvent pas se chevaucher dans le temps sur la**même scène** |
| `concerts` | `no_overlap_artist` | Un même artiste ne peut pas jouer sur deux scènes en**même temps**            |

Ces deux contraintes reposent sur une plage horaire `tstzrange(start_time, end_time, '[)')` — l'intervalle est fermé au début et ouvert à la fin, ce qui signifie qu'un concert peut commencer exactement à l'heure où le précédent se termine.

---

### Triggers

#### `trg_check_featured_limit` — table `artists`

Ce trigger limite à **2 le nombre d'artistes mis en avant** simultanément sur la page d'accueil (`is_featured = TRUE`).

- **Type :** `BEFORE INSERT OR UPDATE` — l'exception est levée avant l'écriture, ce qui annule l'opération
- **Mode :** `FOR EACH ROW` — accès à `NEW` (la ligne en cours d'écriture)
- **Logique :** si `NEW.is_featured = TRUE`, compte les artistes déjà à `TRUE` en excluant l'artiste en cours (`id != NEW.id`, pour ne pas se compter soi-même lors d'un `UPDATE`). Si ce count atteint 2, lève `RAISE EXCEPTION 'featured_limit_reached'`
- **Backend :** intercepte cette exception PostgreSQL et renvoie une erreur métier au frontend

---

### Index

Les index accélèrent les requêtes fréquentes en évitant un parcours complet de la table. Ils sont créés sur les colonnes utilisées en filtre ou en tri dans l'API.

| Index                      | Table      | Colonne(s)            | Requêtes optimisées                                  |
| -------------------------- | ---------- | --------------------- | ---------------------------------------------------- |
| `idx_sessions_user_id`     | `sessions` | `user_id`             | Récupérer les sessions d'un utilisateur              |
| `idx_sessions_expires_at`  | `sessions` | `expires_at`          | Vérifier si une session est expirée                  |
| `idx_sessions_revoked_at`  | `sessions` | `revoked_at`          | Vérifier si une session est révoquée                 |
| `idx_news_created_at`      | `news`     | `created_at`          | Trier les news par date                              |
| `idx_news_is_published`    | `news`     | `is_published`        | Filtrer les news publiées                            |
| `idx_artists_genre`        | `artists`  | `genre`               | Filtrer les artistes par genre                       |
| `idx_artists_name`         | `artists`  | `name`                | Rechercher un artiste par nom                        |
| `idx_artists_is_featured`  | `artists`  | `is_featured`         | Récupérer les artistes mis en avant (page d'accueil) |
| `idx_concerts_stage_start` | `concerts` | `(stage, start_time)` | Récupérer le programme d'une scène triée par horaire |
| `idx_concerts_start_time`  | `concerts` | `start_time`          | Trier tous les concerts par horaire                  |

> La table `users` n'a pas d'index supplémentaire — `email` est déjà indexé implicitement par sa contrainte `UNIQUE`.

---

## Seed

> Scripts : `bd/init/06_seed_users.sql` à `bd/init/09_seed_concerts.sql`

Les scripts seed insèrent des données de développement réalistes pour pouvoir tester l'application sans créer de contenu manuellement. Ils s'exécutent dans l'ordre après les scripts de schéma.

---

### 06_seed_users.sql — Utilisateurs

3 comptes administrateurs, un par rôle. Tous partagent le même mot de passe `MyPassword` (hash bcrypt stocké). Le champ `password_changed_at` est initialisé à `NOW()` pour simuler un compte actif.

| `display_name`    | `email`                 | `role`    |
| ----------------- | ----------------------- | --------- |
| `Admin`           | `admin@example.com`     | `admin`   |
| `artists Manager` | `artists@example.com`   | `artists` |
| `News Editor`     | `news@example.com`      | `news`    |

---

### 07_seed_news.sql — News

10 articles insérés avec des contenus longs et réalistes. Tous sont associés à `admin@example.com` via un `SELECT id FROM users WHERE email = '...'` — ce qui évite de coder en dur un UUID et garantit la cohérence avec le seed utilisateur.

| `title`                                         | `is_published` | `created_at`              |
| ----------------------------------------------- | -------------- | ------------------------- |
| Ouverture de la billetterie                     | `TRUE`         | `NOW() - 5 days`          |
| Nouvelle tete d'affiche                         | `FALSE`        | `NOW() - 1 day`           |
| Le programme complet est devoile                | `TRUE`         | `NOW() - 4 days`          |
| Infos pratiques : acces et stationnement        | `TRUE`         | `NOW() - 3 days`          |
| Oasis de retour : une exclusivite Vindhellfest  | `TRUE`         | `NOW() - 10 days`         |
| Les coulisses du festival                       | `TRUE`         | `NOW() - 8 days`          |
| Restauration : les meilleurs stands du festival | `FALSE`        | `NOW() - 2 days`          |
| Retour sur la premiere edition de Vindhellfest  | `TRUE`         | `NOW() - 365 days`        |
| Developpement durable : nos engagements         | `TRUE`         | `NOW() - 6 days`          |
| Concours : gagnez vos pass VIP                  | `FALSE`        | `NOW() - 12 hours`        |

7 news publiées, 3 en brouillon — permet de tester le filtrage `is_published` côté API et frontend.

---

### 08_seed_artists.sql — Artistes

10 artistes avec biographies complètes, URLs médias, liens YouTube et Spotify. 2 artistes ont `is_featured = TRUE` (Red Hot Chili Peppers et Oasis) — ce qui atteint exactement la limite imposée par le trigger `trg_check_featured_limit`.

| `name`                    | `genre`          | `origin`                   | `is_featured` |
| ------------------------- | ---------------- | -------------------------- | ------------- |
| Red Hot Chili Peppers     | Rock             | Etats-Unis, Los Angeles    | `TRUE`        |
| Foo Fighters              | Rock             | Etats-Unis, Seattle        | `FALSE`       |
| Oasis                     | Britpop          | Royaume-Uni, Manchester    | `TRUE`        |
| AC/DC                     | Hard rock        | Australie, Sydney          | `FALSE`       |
| Guns N' Roses             | Hard rock        | Etats-Unis, Los Angeles    | `FALSE`       |
| Pearl Jam                 | Grunge           | Etats-Unis, Seattle        | `FALSE`       |
| Muse                      | Rock alternatif  | Royaume-Uni, Teignmouth    | `FALSE`       |
| Arctic Monkeys            | Indie rock       | Royaume-Uni, Sheffield     | `FALSE`       |
| Queens of the Stone Age   | Hard rock        | Etats-Unis, Palm Desert    | `FALSE`       |
| The Strokes               | Indie rock       | Etats-Unis, New York       | `FALSE`       |

---

### 09_seed_concerts.sql — Concerts

10 concerts répartis sur 3 jours (21, 22 et 23 mai 2027), sur 2 scènes. Chaque jour, 2 concerts simultanés : un sur `MainStage` et un sur `Tremplin`, puis un deuxième créneau sur chaque scène. Les artistes sont référencés par `SELECT id FROM artists WHERE name = '...'` pour éviter les UUID en dur.

| Date          | `stage`     | `start_time` | `end_time` | Artiste                   |
| ------------- | ----------- | ------------ | ---------- | ------------------------- |
| 21 mai 2027   | MainStage   | 18h00        | 19h00      | Red Hot Chili Peppers     |
| 21 mai 2027   | Tremplin    | 18h00        | 19h00      | Foo Fighters              |
| 21 mai 2027   | MainStage   | 19h00        | 20h00      | Oasis                     |
| 21 mai 2027   | Tremplin    | 19h00        | 20h00      | Guns N' Roses             |
| 22 mai 2027   | MainStage   | 18h00        | 19h00      | AC/DC                     |
| 22 mai 2027   | Tremplin    | 18h00        | 19h00      | Pearl Jam                 |
| 22 mai 2027   | MainStage   | 19h00        | 20h00      | Muse                      |
| 22 mai 2027   | Tremplin    | 19h00        | 20h00      | Queens of the Stone Age   |
| 23 mai 2027   | MainStage   | 18h00        | 19h00      | Arctic Monkeys            |
| 23 mai 2027   | Tremplin    | 18h00        | 19h00      | The Strokes               |

Les créneaux simultanés sur des scènes différentes valident les contraintes `EXCLUDE` : deux concerts se chevauchent sur `MainStage` et `Tremplin` simultanément — ce qui est légal — mais aucun artiste ne joue deux fois en même temps, et aucune scène n'a deux concerts qui se chevauchent.

---
