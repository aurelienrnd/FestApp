# Règles de typage — Backend

## Où déclarer un type

- **Utilisé dans 2+ fichiers** → `src/type.ts`
- **Utilisé dans 1 seul fichier, plusieurs fois** → type local en haut du fichier
- **Utilisé une seule fois** → inline directement là où c'est utilisé

## Alignement BDD

Un type qui représente une ligne retournée par PostgreSQL doit refléter exactement les contraintes de la colonne.

- Colonne `NOT NULL` → `string` (jamais `string | null`)
- Colonne nullable → `string | null`

## Types dérivés

Préférer `Omit<T, ...>` et `Pick<T, ...>` pour les variantes d'un même type métier plutôt que redéclarer une interface similaire from scratch.

## Nommage

Règle unique :

```
[Domaine][Usage]Row  →  résultat SQL, backend uniquement (jamais exposé au client)
[Domaine][Usage]     →  réponse API, partagée front/back (même nom des deux côtés)
```

- **`*Row`** : type interne backend, jamais envoyé au client (`NewsMediaRow`, `ArtistMediaRow`, `ConcertRow`...)
- **Sans suffixe** : type partagé, même nom et même structure côté front et côté back (`NewsItem`, `ArtistItem`...)

### Suffixes des types partagés

- **`*Item`** : forme complète d'une entité telle qu'exposée par l'API — par opposition aux variantes allégées (`NewsItem`, `ArtistItem`...)

> Un type nommé `*Row` ne doit jamais apparaître directement dans un `res.json()`.

---

## Types déclarés dans `src/type.ts`

### Express

| Champ        | Type         | Description                                          |
| ------------ | ------------ | ----------------------------------------------------- |
| `userId`   | `string`   | Id de l'utilisateur injecté par `requireAuth`        |
| `userRole` | `UserRole` | Rôle injecté par `requireAuth`                       |
| `sessionId`| `string`   | Id de session injecté par `requireAuth`              |

Augmentation de `Express.Locals` — accessible via `res.locals` dans les middlewares et contrôleurs.

L'authentification elle-même (identifiants, hachage du mot de passe, sessions) est gérée par Better Auth (`src/lib/auth.ts`) et n'a pas de type dédié ici : `res.locals` n'en reprend que le strict nécessaire pour `requireRole` et les contrôleurs.

---

### Utilisateurs

| Type       | Dérivé de | Description                                                          |
| ---------- | --------- | --------------------------------------------------------------------- |
| `UserRole` | —        | Union `"admin" \| "artists" \| "news"` — miroir du ENUM PostgreSQL |

Le rôle est le seul champ utilisateur dont le backend a besoin en dehors de Better Auth (contrôle d'accès via `requireRole`). Le reste (email, nom, id, liste des utilisateurs...) transite par le plugin admin de Better Auth et n'est pas retypé côté backend.

---

### News

| Type            | Dérivé de              | Description                                                          |
| --------------- | ---------------------- | ---------------------------------------------------------------------- |
| `NewsItem`    | —                     | Données complètes d'une news — partagé avec le front                 |
| `NewsMediaRow`| `Pick<NewsItem, ...>` | Champs nécessaires à la gestion du fichier image (`id`, `url_media`) |

Champs de `NewsItem` :

| Champ                 | Type              | Description                                              |
| --------------------- | ----------------- | ---------------------------------------------------------- |
| `id`                | `string`        | Identifiant unique                                       |
| `title`             | `string`        | Titre de la news                                         |
| `content`           | `string \| null` | Corps de la news en HTML — `null` dans les réponses de liste |
| `is_published`      | `boolean`       | `true` si publiée, `false` si brouillon                 |
| `created_at`        | `string`        | Date de publication (ISO)                                 |
| `url_media`         | `string`        | URL de l'image associée                                  |
| `description_media` | `string`        | Texte alternatif de l'image                              |
| `author_name`       | `string \| null` | Nom de l'auteur — `null` si l'utilisateur a été supprimé |

---

### Artistes

| Type              | Dérivé de                | Description                                                              |
| ----------------- | ------------------------ | --------------------------------------------------------------------------- |
| `ArtistItem`    | —                       | Données complètes d'un artiste — partagé avec le front                    |
| `ArtistMediaRow`| `Pick<ArtistItem, ...>` | Champs nécessaires à la gestion du fichier image (`id`, `url_media`)      |

Champs de `ArtistItem` :

| Champ                 | Type              | Description                                              |
| --------------------- | ----------------- | ---------------------------------------------------------- |
| `id`                | `string`        | Identifiant unique                                        |
| `name`              | `string`        | Nom de l'artiste ou du groupe                            |
| `genre`             | `string`        | Genre musical                                             |
| `origin`            | `string`        | Pays ou ville d'origine                                  |
| `bio`               | `string`        | Biographie longue — absente des réponses de liste        |
| `url_media`         | `string`        | URL de la photo                                           |
| `description_media` | `string`        | Texte alternatif de la photo                             |
| `youtube_url`       | `string \| null` | Lien YouTube — `null` si non renseigné                  |
| `spotify_url`       | `string \| null` | Lien Spotify — `null` si non renseigné                  |
| `stage`             | `string \| null` | Nom de la scène — `null` si concert non défini          |
| `start_time`        | `string \| null` | Heure de début (ISO) — `null` si concert non défini     |
| `end_time`          | `string \| null` | Heure de fin (ISO) — `null` si concert non défini       |
| `is_featured`       | `boolean`       | `true` si mis en avant sur la page d'accueil            |

---

### Concerts

| Type          | Dérivé de | Description                                              |
| ------------- | --------- | ----------------------------------------------------------- |
| `ConcertRow`| —        | Ligne de la table `concerts` — usage interne backend       |

Champs de `ConcertRow` :

| Champ        | Type     | Description                  |
| ------------ | -------- | ------------------------------ |
| `id`       | `string` | Identifiant unique             |
| `artist_id`| `string` | Référence vers l'artiste      |
| `stage`    | `string` | Nom de la scène                |
| `start_time`| `string` | Heure de début (ISO)          |
| `end_time` | `string` | Heure de fin (ISO)             |
