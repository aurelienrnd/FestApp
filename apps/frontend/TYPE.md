# Guide Typage — Frontend

Ce document décrit l'état réel des types dans `apps/frontend`.

---

## 1. Fichier de types

| Fichier              | Rôle                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `src/type.ts`      | Types partagés entre plusieurs composants — seule source de vérité pour les types métier |

Règle de localisation :

- **Utilisé dans 2+ fichiers** → `src/type.ts`
- **Utilisé dans 1 seul fichier, plusieurs fois** → type local en haut du fichier
- **Utilisé une seule fois** → inline directement là où c'est utilisé

---

## 2. Types déclarés dans `src/type.ts`

### Utilisateurs

| Type                    | Dérivé de                                          | Description                                                            |
| ----------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `UserRole`            | —                                                 | Union `"admin" \| "artists" \| "news"` — miroir du ENUM PostgreSQL   |
| `UserItem`            | —                                                 | Ligne utilisateur complète retournée par l'API                        |
| `AdminUser`           | `Omit<UserItem, "created_at" \| "password_changed_at">` | Utilisateur connecté — retourné par `GET /admin/auth/me`      |
| `AdminAuthMeResponse` | —                                                 | Réponse de `GET /admin/auth/me` — `{ user: AdminUser, mustChangePassword: boolean }` |

Champs de `UserItem` :

| Champ                   | Type              | Description                                                                     |
| ----------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `id`                  | `string`        | Identifiant unique                                                              |
| `email`               | `string`        | Adresse email                                                                   |
| `display_name`        | `string`        | Prénom + nom concaténés                                                        |
| `role`                | `UserRole`      | Rôle de l'utilisateur                                                          |
| `created_at`          | `string`        | Date de création (ISO)                                                         |
| `password_changed_at` | `string \| null` | Date du dernier changement de mot de passe — `null` si mot de passe provisoire |

---

### News

| Type        | Dérivé de                  | Description                                                           |
| ----------- | -------------------------- | --------------------------------------------------------------------- |
| `NewsItem`  | —                         | News complète retournée par l'API — tous les champs y compris `content` |
| `HomeNews`  | `Pick<NewsItem, ...>`     | Variante allégée pour la page d'accueil — `id`, `title`, `url_media`, `description_media`, `created_at` |

Champs de `NewsItem` :

| Champ                 | Type              | Description                                                      |
| --------------------- | ----------------- | ---------------------------------------------------------------- |
| `id`                | `string`        | Identifiant unique                                               |
| `title`             | `string`        | Titre de la news                                                 |
| `content`           | `string \| null` | Corps de la news en HTML — `null` dans les réponses de liste    |
| `is_published`      | `boolean`       | `true` si publiée, `false` si brouillon                        |
| `created_at`        | `string`        | Date de publication (ISO)                                        |
| `url_media`         | `string`        | URL de l'image associée                                         |
| `description_media` | `string`        | Texte alternatif de l'image                                     |
| `author_name`       | `string \| null` | Nom de l'auteur — `null` si l'utilisateur a été supprimé       |

---

### Artistes

| Type           | Dérivé de               | Description                                                            |
| -------------- | ----------------------- | ---------------------------------------------------------------------- |
| `ArtistItem`  | —                      | Artiste complet retourné par l'API — tous les champs y compris `bio`  |
| `HomeArtist`  | `Pick<ArtistItem, ...>` | Variante allégée pour la page d'accueil — `id`, `name`, `stage`, `start_time`, `end_time`, `url_media`, `description_media` |

Champs de `ArtistItem` :

| Champ                 | Type              | Description                                               |
| --------------------- | ----------------- | --------------------------------------------------------- |
| `id`                | `string`        | Identifiant unique                                        |
| `name`              | `string`        | Nom de l'artiste ou du groupe                            |
| `genre`             | `string`        | Genre musical                                             |
| `origin`            | `string`        | Pays ou ville d'origine                                  |
| `bio`               | `string`        | Biographie longue — absente des réponses de liste        |
| `url_media`         | `string`        | URL de la photo                                           |
| `description_media` | `string`        | Texte alternatif de la photo                             |
| `youtube_url`       | `string \| null` | Lien YouTube — `null` si non renseigné                  |
| `spotify_url`       | `string \| null` | Lien Spotify — `null` si non renseigné                  |
| `is_featured`       | `boolean`       | `true` si mis en avant sur la page d'accueil            |
| `stage`             | `string \| null` | Nom de la scène — `null` si concert non défini          |
| `start_time`        | `string \| null` | Heure de début (ISO) — `null` si concert non défini     |
| `end_time`          | `string \| null` | Heure de fin (ISO) — `null` si concert non défini       |

---

### UI

| Type       | Description                                                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `NavItem` | Élément de navigation ou de filtre — tous les champs sont optionnels : `label`, `labelBtn`, `path`, `active`, `value`, `role`, `desc`, `onClick` |

Utilisé par `src/config/ui.ts` pour définir les items de navigation (`navVisitorItems`, `navAdminItem`…) et les filtres (`filterArtistsItems`, `filterNewsItems`, `filterUsersItems`).

---

### API

| Type                     | Description                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `ApiMessageResponse`   | Réponse générique `{ message?: string }` — endpoints qui ne retournent qu'un message                 |
| `CreateApiResponse<T>` | Réponse de création ou modification — `{ message: string } & T` — `T` est l'entité retournée        |

---

## 3. Conventions

### Où déclarer un type

- **Utilisé dans 2+ fichiers** → `src/type.ts`
- **Utilisé dans 1 seul fichier, plusieurs fois** → type local en haut du fichier
- **Utilisé une seule fois** → inline directement là où c'est utilisé

### Alignement API

Un type qui représente une réponse retournée par l'API doit refléter exactement les champs exposés.

- Champ toujours présent → `string` (jamais `string | null`)
- Champ nullable → `string | null`

> Un type partagé ne doit jamais contenir un champ absent de la réponse API.

### Types dérivés

Préférer `Omit<T, ...>` et `Pick<T, ...>` pour les variantes d'un même type métier plutôt que redéclarer une interface similaire from scratch.

### Nommage

```
[Domaine][Usage]     →  réponse API, partagée front/back (même nom des deux côtés)
```

- **Sans suffixe** : type partagé, même nom et même structure que le back (`ArtistItem`, `UserItem`, `NewsItem`...)
- **`*Item`** : forme complète d'une entité telle qu'exposée par l'API
