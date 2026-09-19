# API Backend - Vindhellfest

## Résumé des endpoints

| Méthode | Route                         | Accès               | Description                                                              |
| ------- | ----------------------------- | ------------------- | ------------------------------------------------------------------------ |
| ALL     | `/api/auth/*`                  | Voir section dédiée  | Authentification, session et CRUD utilisateurs — géré par Better Auth   |
| POST    | `/admin/news`                 | admin, news         | Créer une news (multipart/form-data)                                     |
| PATCH   | `/admin/news/:id`             | admin, news         | Modifier une news (multipart/form-data)                                  |
| DELETE  | `/admin/news/:id`             | admin, news         | Supprimer une news et son fichier image                                  |
| POST    | `/admin/artists`              | admin, artists      | Créer un artiste (multipart/form-data)                                   |
| PATCH   | `/admin/artists/:id`          | admin, artists      | Modifier un artiste (multipart/form-data)                                |
| DELETE  | `/admin/artists/:id`          | admin, artists      | Supprimer un artiste et son concert associé                              |
| POST    | `/contact/submit`             | Public              | Soumettre le formulaire de contact                                       |
| GET     | `/public/home`                | Public              | Données agrégées pour la page d'accueil (artistes mis en avant + news)  |
| GET     | `/public/artists`             | Public              | Liste des artistes de la programmation                                   |
| GET     | `/public/artists/:id`         | Public              | Détail d'un artiste                                                      |
| GET     | `/public/news`                | Public / Privilégié | Liste des news (tous si admin/news, publiés sinon)                       |
| GET     | `/public/news/:id`            | Public / Privilégié | Détail d'un news (brouillons accessibles si admin/news)                  |

---

## Authentification & Utilisateurs

Base path : `/api/auth`

Toute l'authentification (connexion, déconnexion, session, réinitialisation de mot de passe) et le CRUD utilisateurs sont gérés par **Better Auth** (`src/lib/auth.ts`), monté sur `/api/auth/*` via `toNodeHandler(auth)` (`src/app.ts`) — avant `express.json()`, Better Auth lisant lui-même le corps brut des requêtes. Ce ne sont pas des routes que ce backend définit : leur contrat exact (schéma de requête/réponse, codes d'erreur) est celui de Better Auth, pas documenté ici.

Endpoints principaux :

| Méthode | Route                                | Rôle requis        | Description                                    |
| ------- | ------------------------------------- | -------------------- | ------------------------------------------------- |
| POST    | `/api/auth/sign-in/email`            | Public               | Connexion, pose un cookie de session signé       |
| POST    | `/api/auth/sign-out`                 | Authentifié          | Invalide la session courante                     |
| GET     | `/api/auth/get-session`              | Public               | Session courante (`null` si absente)             |
| POST    | `/api/auth/request-password-reset`   | Public               | Envoie un lien de réinitialisation par email      |
| POST    | `/api/auth/reset-password`           | Public (token requis) | Change le mot de passe via le token reçu par email |
| POST    | `/api/auth/admin/create-user`        | admin                | Créer un utilisateur                             |
| GET     | `/api/auth/admin/list-users`         | admin                | Lister les utilisateurs                          |
| POST    | `/api/auth/admin/update-user`        | admin                | Modifier un utilisateur (dont son rôle)          |
| POST    | `/api/auth/admin/set-user-password`  | admin                | Changer le mot de passe d'un utilisateur         |
| POST    | `/api/auth/admin/remove-user`        | admin                | Supprimer un utilisateur                         |

> L'accès aux routes `/api/auth/admin/*` est réservé au rôle `admin` par la configuration `adminRoles` du plugin admin de Better Auth (défaut : `["admin"]`, aligné sur notre champ `role`). Un rôle `artists` ou `news` reçoit `403`.

Le champ `role` (`"admin" | "artists" | "news"`) est un champ additionnel ajouté à l'utilisateur Better Auth (`user.additionalFields.role` dans `src/lib/auth.ts`) — c'est le seul champ que nos propres routes (`/admin/*` ci-dessous) lisent, via `res.locals.userRole` peuplé par `requireAuth`.

Couverture de test : `tests/integration/admin/betterAuth.test.ts` (sign-in, sign-out, session, reset de mot de passe, plugin admin) et `tests/unit/auth.sendResetPassword.test.ts` (choix invite/reset).

---

## Public

### GET `/public/home`

Retourne les artistes avec `is_featured = TRUE` et les 2 dernières news publiées. Les deux requêtes sont exécutées en parallèle via `Promise.all`.

Authentification :

- Aucune (route publique).

Réponse en succès :

- Statut : `200`
- Corps :

```json
{
  "artists": [
    {
      "id": "uuid",
      "name": "Band A",
      "url_media": "/uploads/artists/uuid.webp",
      "description_media": "Photo promo",
      "stage": "Grande Scene",
      "start_time": "2025-06-21T20:00:00.000Z",
      "end_time": "2025-06-21T21:30:00.000Z"
    }
  ],
  "news": [
    {
      "id": "uuid",
      "title": "Ouverture de la billetterie",
      "url_media": "/uploads/news/uuid.webp",
      "description_media": "Photo news",
      "created_at": "2025-06-01T10:00:00.000Z"
    }
  ]
}
```

> `artists` contient uniquement les artistes dont `is_featured = TRUE` — au maximum 2 (limite appliquée par trigger en base). `news` contient au plus les 2 dernières news publiées, vide s'il n'y en a aucune.

---

Base path: `/public/artists`

### GET `/public/artists`

Afficher la programmation (liste des artistes).

Authentification:

- Aucune (route publique).

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "artists": [
    {
      "id": "uuid",
      "name": "Red Hot Chili Peppers",
      "url_media": "/uploads/artists/uuid.webp",
      "description_media": "Photo promo du groupe Red Hot Chili Peppers",
      "is_featured": false,
      "stage": "Grande Scene",
      "start_time": "2025-06-20T18:00:00.000Z"
    }
  ]
}
```

> `stage` et `start_time` sont `null` si aucun concert n'est encore associe a l'artiste (LEFT JOIN).
> `bio`, `genre`, `origin`, `youtube_url`, `spotify_url` et `end_time` ne sont pas retournes dans la liste — utiliser `GET /public/artists/:id` pour recuperer l'artiste complet.

### GET `/public/artists/:id`

Retourne le detail d'un artiste par son identifiant, avec son concert associe si existant.

Authentification:

- Aucune (route publique).

Parametre d'URL:

- `id`: UUID de l'artiste.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "artist": {
    "id": "uuid",
    "name": "Red Hot Chili Peppers",
    "genre": "Rock",
    "origin": "Etats-Unis, Los Angeles",
    "bio": "Groupe de rock melant riffs lourds et funky.",
    "url_media": "/uploads/artists/uuid.webp",
    "description_media": "Photo promo du groupe Red Hot Chili Peppers",
    "youtube_url": "https://www.youtube.com/@RedHotChiliPeppers",
    "spotify_url": "https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5",
    "is_featured": false,
    "stage": "Grande Scene",
    "start_time": "2025-06-20T18:00:00.000Z",
    "end_time": "2025-06-20T19:30:00.000Z"
  }
}
```

> `stage`, `start_time` et `end_time` sont `null` si aucun concert n'est encore associe a l'artiste (LEFT JOIN).

Reponses d'erreur:

- `404` `{ "error": "Artiste introuvable" }`

---

### GET `/public/news`

Retourne la liste des news triees par date de creation decroissante.

Middleware: `optionalAuth` — si l'utilisateur est authentifie avec le role `admin` ou `news`, toutes les news sont retournees (y compris les brouillons). Sinon, seules les news avec `is_published = TRUE` sont retournees.

Authentification:

- Aucune requise (route semi-publique).

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "news": [
    {
      "id": "uuid",
      "title": "Ouverture de la billetterie",
      "is_published": true,
      "created_at": "2026-04-06T10:00:00.000Z",
      "url_media": "/uploads/news/uuid.webp",
      "description_media": "Photo de la billetterie",
      "author_name": "Admin"
    }
  ]
}
```

> `content` n'est pas retourné dans la liste — utiliser `GET /public/news/:id` pour récupérer la news complète.
> `author_name` est `null` si l'utilisateur auteur a ete supprime.

### GET `/public/news/:id`

Retourne une news complète par son identifiant.

Middleware: `optionalAuth` — si l'utilisateur est authentifie avec le role `admin` ou `news`, les brouillons (`is_published = FALSE`) sont accessibles (previsualisation). Sinon, un brouillon retourne `404`.

Authentification:

- Aucune requise (route semi-publique).

Parametre d'URL:

- `id`: UUID de la news.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "news": {
    "id": "uuid",
    "title": "Ouverture de la billetterie",
    "content": "La billetterie du Vindhellfest ouvre officiellement ses portes.",
    "is_published": true,
    "created_at": "2026-04-06T10:00:00.000Z",
    "url_media": "/uploads/news/uuid.webp",
    "description_media": "Photo de la billetterie",
    "author_name": "Admin"
  }
}
```

> `author_name` est `null` si l'utilisateur auteur a ete supprime.

Reponses d'erreur:

- `404` `{ "error": "News introuvable" }` — news inexistante ou brouillon non accessible

---

## News

> Routes admin réservées aux rôles `admin` et `news` — session Better Auth requise (`requireAuth` + `requireRole("admin", "news")`).

### POST `/admin/news`

Creer une news avec une image uploadée.

Middlewares: `requireAuth`, `requireRole("admin", "news")`, `upload.single("image")`, `validateBody`

Corps de requete:

- Format: `multipart/form-data`
- Champ fichier: `image` (jpeg, png ou webp — 5 Mo max)

```
title=Ouverture de la billetterie
content=La billetterie du Vindhellfest ouvre officiellement ses portes.
is_published=true
description_media=Photo de la billetterie
image=<fichier image>
```

> `content` est optionnel. `is_published` est une string `"true"` ou `"false"` (multipart ne supporte pas les booleens) — defaut `false` si absent.

Reponse en succes:

- Statut: `201`
- Corps:

```json
{
  "message": "News creee",
  "news": {
    "id": "uuid",
    "title": "Ouverture de la billetterie",
    "content": "La billetterie du Vindhellfest ouvre officiellement ses portes.",
    "is_published": true,
    "created_at": "2026-04-06T10:00:00.000Z",
    "url_media": "/uploads/news/uuid.webp",
    "description_media": "Photo de la billetterie",
    "author_name": "Admin"
  }
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `400` `{ "error": "Image requise" }`
- `400` `{ "error": "Type de fichier non autorise (jpeg, png ou webp uniquement)" }`
- `401` `{ "error": "Session manquante" }`
- `403` `{ "error": "Acces refuse" }`

---

### PATCH `/admin/news/:id`

Modifier une news existante.

Middlewares: `requireAuth`, `requireRole("admin", "news")`, `upload.single("image")`, `validateBody`

Parametre d'URL:

- `id`: UUID de la news a modifier.

Corps de requete:

- Format: `multipart/form-data`
- Champ fichier: `image` (jpeg, png ou webp — 5 Mo max, optionnel — si absent, l'image existante est conservee)

```
title=Ouverture de la billetterie
content=Contenu mis a jour.
is_published=true
description_media=Photo de la billetterie
image=<fichier image>
```

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "News modifiee",
  "news": {
    "id": "uuid",
    "title": "Ouverture de la billetterie",
    "content": "Contenu mis a jour.",
    "is_published": true,
    "created_at": "2026-04-06T10:00:00.000Z",
    "url_media": "/uploads/news/uuid.webp",
    "description_media": "Photo de la billetterie",
    "author_name": "Admin"
  }
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide ou corps invalide)
- `400` `{ "error": "Type de fichier non autorise (jpeg, png ou webp uniquement)" }`
- `401` `{ "error": "Session manquante" }`
- `403` `{ "error": "Acces refuse" }`
- `404` `{ "error": "News introuvable" }`

---

### DELETE `/admin/news/:id`

Supprime definitivement une news et son fichier image.

Middlewares: `requireAuth`, `requireRole("admin", "news")`

Parametre d'URL:

- `id`: UUID de la news a supprimer.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "News supprimee"
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide)
- `401` `{ "error": "Session manquante" }`
- `403` `{ "error": "Acces refuse" }`
- `404` `{ "error": "News introuvable" }`

---

## Artists

> Routes admin réservées aux rôles `admin` et `artists` — session Better Auth requise (`requireAuth` + `requireRole("admin", "artists")`).

### POST `/admin/artists`

Creer un artiste avec une image uploadée.

Middlewares: `requireAuth`, `requireRole("admin", "artists")`, `upload.single("image")`, `validateBody`

Corps de requete:

- Format: `multipart/form-data`
- Champ fichier: `image` (jpeg, png ou webp — 5 Mo max)

```
name=Red Hot Chili Peppers
genre=Rock
origin=Etats-Unis, Los Angeles
bio=Groupe de rock melant riffs lourds et funky.
description_media=Photo promo du groupe
youtube_url=https://www.youtube.com/@RedHotChiliPeppers
spotify_url=https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5
image=<fichier image>
stage=Grande Scene
start_time=2025-06-20T18:00:00.000Z
end_time=2025-06-20T19:30:00.000Z
is_featured=true
```

> `youtube_url` et `spotify_url` sont optionnels. `is_featured` est une string `"true"` ou `"false"` (multipart ne supporte pas les booleens) — defaut `false` si absent. `start_time` et `end_time` doivent etre au format ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`). L'artiste et son concert sont inseres en base dans une seule transaction SQL.

Reponse en succes:

- Statut: `201`
- Corps:

```json
{
  "message": "Artiste cree",
  "artist": {
    "id": "uuid",
    "name": "Red Hot Chili Peppers",
    "genre": "Rock",
    "origin": "Etats-Unis, Los Angeles",
    "bio": "Groupe de rock melant riffs lourds et funky.",
    "url_media": "/uploads/artists/uuid.webp",
    "description_media": "Photo promo du groupe",
    "youtube_url": "https://www.youtube.com/@RedHotChiliPeppers",
    "spotify_url": "https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5",
    "is_featured": true,
    "stage": "Grande Scene",
    "start_time": "2026-05-22T21:00:00.000Z",
    "end_time": "2026-05-22T22:30:00.000Z"
  }
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `400` `{ "error": "Image requise" }`
- `400` `{ "error": "Type de fichier non autorise (jpeg, png ou webp uniquement)" }`
- `401` `{ "error": "Session manquante" }`
- `403` `{ "error": "Acces refuse" }`
- `409` `{ "error": "Deux artistes sont déjà mis en avant sur la page d'accueil." }`

### PATCH `/admin/artists/:id`

Modifier un artiste existant et son concert associe.

Middlewares: `requireAuth`, `requireRole("admin", "artists")`, `upload.single("image")`, `validateBody`

Parametre d'URL:

- `id`: UUID de l'artiste a modifier.

Corps de requete:

- Format: `multipart/form-data`
- Champ fichier: `image` (jpeg, png ou webp — 5 Mo max, optionnel — si absent, l'image existante est conservee)

```
name=Red Hot Chili Peppers
genre=Rock
origin=Etats-Unis, Los Angeles
bio=Groupe de rock melant riffs lourds et funky.
description_media=Photo promo du groupe
youtube_url=https://www.youtube.com/@RedHotChiliPeppers
spotify_url=https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5
image=<fichier image>
stage=Grande Scene
start_time=2025-06-20T18:00:00.000Z
end_time=2025-06-20T19:30:00.000Z
is_featured=true
```

> `youtube_url` et `spotify_url` sont optionnels. `is_featured` est une string `"true"` ou `"false"` (multipart ne supporte pas les booleens) — defaut `false` si absent. `start_time` et `end_time` doivent etre au format ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`). La mise a jour de l'artiste et de son concert se fait dans une seule transaction SQL. Si une nouvelle image est fournie, l'ancienne est supprimee du disque.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Artiste modifie",
  "artist": {
    "id": "uuid",
    "name": "Red Hot Chili Peppers",
    "genre": "Rock",
    "origin": "Etats-Unis, Los Angeles",
    "bio": "Groupe de rock melant riffs lourds et funky.",
    "url_media": "/uploads/artists/uuid.webp",
    "description_media": "Photo promo du groupe",
    "youtube_url": "https://www.youtube.com/@RedHotChiliPeppers",
    "spotify_url": "https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5",
    "is_featured": true,
    "stage": "Grande Scene",
    "start_time": "2025-06-20T18:00:00.000Z",
    "end_time": "2025-06-20T19:30:00.000Z"
  }
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide ou corps invalide)
- `400` `{ "error": "Type de fichier non autorise (jpeg, png ou webp uniquement)" }`
- `401` `{ "error": "Session manquante" }`
- `403` `{ "error": "Acces refuse" }`
- `404` `{ "error": "Artiste introuvable" }`
- `409` `{ "error": "Deux artistes sont déjà mis en avant sur la page d'accueil." }`

---

### DELETE `/admin/artists/:id`

Supprime definitivement un artiste, son concert associe et son fichier image.

> Le concert est supprime automatiquement en cascade par la base de donnees (`ON DELETE CASCADE`). Le fichier image est supprime du disque apres la suppression en base.

Middlewares: `requireAuth`, `requireRole("admin", "artists")`

Parametre d'URL:

- `id`: UUID de l'artiste a supprimer.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Artiste supprime"
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide)
- `401` `{ "error": "Session manquante" }`
- `403` `{ "error": "Acces refuse" }`
- `404` `{ "error": "Artiste introuvable" }`

---

## Contact

Base path: `/contact`

### POST `/contact/submit`

Transmet le message du formulaire de contact par email a l'adresse de l'organisation.

Middlewares: `validateBody`

Corps de requete:

```json
{
  "email": "visiteur@example.fr",
  "name": "Jean Dupont",
  "subject": "Question sur le festival",
  "message": "Bonjour, je souhaitais savoir..."
}
```

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Message envoye"
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`

---

## Notes

- Format d'erreur standardisé pour toutes les routes définies dans ce backend (`/admin/*`, `/public/*`, `/contact/*`) :

```json
{ "error": "..." }
```

  Les routes `/api/auth/*` sont gérées par Better Auth et ont leur propre format d'erreur.
- Toute erreur non anticipée est capturée par le handler d'erreur global et renvoyée en `500 { "error": "Erreur interne du serveur" }`.
