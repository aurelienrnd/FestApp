# API Backend - Vindhellfest

## Résumé des endpoints

| Méthode | Route                         | Accès               | Description                                                              |
| ------- | ----------------------------- | ------------------- | ------------------------------------------------------------------------ |
| POST    | `/admin/news`                 | admin, news         | Créer une news (multipart/form-data)                                     |
| PATCH   | `/admin/news/:id`             | admin, news         | Modifier une news (multipart/form-data)                                  |
| DELETE  | `/admin/news/:id`             | admin, news         | Supprimer une news et son fichier image                                  |
| POST    | `/admin/artists`              | admin, artists      | Créer un artiste (multipart/form-data)                                   |
| PATCH   | `/admin/artists/:id`          | admin, artists      | Modifier un artiste (multipart/form-data)                                |
| DELETE  | `/admin/artists/:id`          | admin, artists      | Supprimer un artiste et son concert associé                              |
| POST    | `/admin/auth/login`           | Public              | Connexion administrateur                                                 |
| POST    | `/admin/auth/logout`          | Authentifié         | Déconnexion                                                              |
| GET     | `/admin/auth/me`              | Authentifié         | Informations utilisateur + renouvellement token                          |
| PATCH   | `/admin/auth/password`        | Authentifié         | Modifier le mot de passe de l'utilisateur connecte                       |
| POST    | `/admin/auth/forgot-password` | Public              | Reinitialiser le mot de passe et envoyer un nouveau par email            |
| GET     | `/admin/users`                | admin               | Liste des utilisateurs                                                   |
| POST    | `/admin/users`                | admin               | Créer un utilisateur                                                     |
| PATCH   | `/admin/users/:id`            | admin               | Modifier un utilisateur                                                  |
| DELETE  | `/admin/users/:id`            | admin               | Supprimer un utilisateur                                                 |
| POST    | `/contact/submit`             | Public              | Soumettre le formulaire de contact                                       |
| GET     | `/public/home`                | Public              | Données agrégées pour la page d'accueil (artistes mis en avant + 2 news) |
| GET     | `/public/artists`             | Public              | Liste des artistes de la programmation                                   |
| GET     | `/public/artists/:id`         | Public              | Détail d'un artiste                                                      |
| GET     | `/public/news`                | Public / Privilégié | Liste des news (tous si admin/news, publiés sinon)                       |
| GET     | `/public/news/:id`            | Public / Privilégié | Détail d'un news (brouillons accessibles si admin/news)                  |
| GET     | `/health`                     | Public              | Santé du serveur (diagnostic)                                            |
| GET     | `/debug/db`                   | Public              | Connexion à la base de données (diagnostic)                              |

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
  "newsList": [
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

> `artists` contient uniquement les artistes dont `is_featured = TRUE` — au maximum 2 (limite appliquée par trigger en base). `newsList` est vide s'il n'y a aucune news publiée.

Réponses d'erreur :

- `500` `{ "error": "Erreur interne du serveur" }`

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

Reponses d'erreur:

- `500` `{ "error": "Erreur serveur" }`

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
- `500` `{ "error": "Erreur interne du serveur" }`

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
  "newsList": [
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

> `content` et `user_id` ne sont pas retournés dans la liste — utiliser `GET /public/news/:id` pour récupérer la news complète.
> `author_name` est `null` si l'utilisateur auteur a ete supprime.

Reponses d'erreur:

- `500` `{ "error": "Erreur interne du serveur" }`

---

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
    "user_id": "uuid",
    "author_name": "Admin"
  }
}
```

> `author_name` est `null` si l'utilisateur auteur a ete supprime.

Reponses d'erreur:

- `404` `{ "error": "News introuvable" }` — news inexistante ou brouillon non accessible

## Authentification

Base path: `/admin/auth`

### POST `/admin/auth/login`

Connecte un administrateur et pose un cookie httpOnly contenant le token d'acces.

Middlewares: `rateLimitLogin`, `validateBody`

Corps de requete:

```json
{
  "email": "admin@test.fr",
  "password": "Test1234!"
}
```

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Authentification réussie"
}
```

- Header: `Set-Cookie` (token d'acces)

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `401` `{ "error": "Email ou mot de passe incorrect" }`
- `429` `{ "error": "Trop de tentatives, reessayer plus tard" }`

### POST `/admin/auth/logout`

Revoque la session courante.

Authentification:

- Cookie d'authentification valide requis.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Deconnexion reussie"
}
```

Reponses d'erreur:

- `401` si non authentifie ou session invalide/fermee.

### GET `/admin/auth/me`

Retourne les informations de l'utilisateur connecte et renouvelle le cookie d'acces si la session est ouverte.

Authentification:

- Cookie d'authentification valide requis.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "user": {
    "id": "uuid",
    "email": "admin@test.fr",
    "display_name": "Admin",
    "role": "admin"
  },
  "mustChangePassword": false
}
```

> `mustChangePassword` est `true` si `password_changed_at` est `null` en base (mot de passe provisoire jamais modifié).

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Utilisateur introuvable" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
- `401` `{ "error": "Session manquante" }`

### POST `/admin/auth/forgot-password`

Reinitialise le mot de passe d'un utilisateur en generant un mot de passe temporaire et en l'envoyant par email.

Middlewares: `rateLimitLogin`, `validateBody`

Corps de requete:

```json
{
  "email": "admin@test.fr"
}
```

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Nouveau mot de passe envoye par email"
}
```

> L'utilisateur devra changer son mot de passe a la prochaine connexion (`mustChangePassword` sera `true`).

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `404` `{ "error": "Aucun compte associe a cet email" }`
- `429` `{ "error": "Trop de tentatives, reessayer plus tard" }`

---

### PATCH `/admin/auth/password`

Modifie le mot de passe de l'utilisateur connecte.

Middlewares: `auth`, `sessionIsOpen`, `validateBody`, `hashPassword("newPassword")`

Authentification:

- Cookie d'authentification valide requis.
- L'`id` de l'utilisateur est extrait du token JWT (`res.locals.user.id`).

Corps de requete:

```json
{
  "password": "AncienMotDePasse1!",
  "newPassword": "NouveauMotDePasse1!"
}
```

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Mot de passe modifie"
}
```

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
- `401` `{ "error": "Session manquante" }`
- `401` `{ "error": "Mot de passe incorrect" }`
- `404` `{ "error": "Utilisateur introuvable" }`

---

## Users

Base path: `/admin/users`

> Toutes les routes de cette section sont réservées au rôle `admin`. Un rôle `artists` ou `news` recevra une réponse `403`.

### GET `/admin/users`

Afficher la liste des utilisateurs.

Authentification:

- Cookie d'authentification valide requis.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@test.fr",
      "display_name": "Admin",
      "role": "admin",

      "created_at": "2026-03-12T10:15:30.000Z",
      "password_changed_at": "2026-03-12T12:00:00.000Z"
    },
    {
      "id": "uuid",
      "email": "autre@test.fr",
      "display_name": "autreAdmin",
      "role": "admin",

      "created_at": "2026-03-12T11:10:00.000Z",
      "password_changed_at": null
    }
  ]
}
```

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
- `401` `{ "error": "Session manquante" }`

### POST `/admin/users`

Ajouter un utilisateur.

Authentification:

- Cookie d'authentification valide requis.

Corps de requete:

- `role` accepte: `admin`, `artists`, `news`.

```json
{
  "email": "nouveau@test.fr",
  "first_name": "Nouveau",
  "last_name": "User",
  "role": "admin"
}
```

Reponse en succes:

- Statut: `201`
- Corps:

```json
{
  "message": "Utilisateur cree",
  "user": {
    "id": "uuid",
    "email": "nouveau@test.fr",
    "display_name": "Nouveau User",
    "role": "admin",

    "created_at": "2026-03-12T10:30:00.000Z"
  }
}
```

> Le mot de passe provisoire est envoye directement par email a l'adresse du nouvel utilisateur.

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
- `401` `{ "error": "Session manquante" }`
- `409` `{ "error": "Email deja utilise" }`
- `409` `{ "error": "Nom deja utilise" }`

### PATCH `/admin/users/:id`

Modifier un utilisateur.

Authentification:

- Cookie d'authentification valide requis.

Parametre d'URL:

- `id`: UUID de l'utilisateur a modifier.

Corps de requete:

- `role` accepte: `admin`, `artists`, `news`.

```json
{
  "email": "modifie@test.fr",
  "first_name": "Modifie",
  "last_name": "User",
  "role": "artists"
}
```

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Utilisateur modifie",
  "user": {
    "id": "uuid",
    "email": "modifie@test.fr",
    "display_name": "Modifie User",
    "role": "artists",

    "created_at": "2026-03-12T10:15:30.000Z"
  }
}
```

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide ou corps invalide)
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
- `401` `{ "error": "Session manquante" }`
- `404` `{ "error": "Utilisateur introuvable" }`
- `409` `{ "error": "Email deja utilise" }`
- `409` `{ "error": "Nom deja utilise" }`

### DELETE `/admin/users/:id`

Supprime definitivement un utilisateur de la base de donnees.

Authentification:

- Cookie d'authentification valide requis.

Parametre d'URL:

- `id`: UUID de l'utilisateur a supprimer.

Reponse en succes:

- Statut: `200`
- Corps:

```json
{
  "message": "Utilisateur supprime"
}
```

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide)
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
- `401` `{ "error": "Session manquante" }`
- `404` `{ "error": "Utilisateur introuvable" }`

## News

> Routes admin réservées aux rôles `admin` et `news`.

### POST `/admin/news`

Creer une news avec une image uploadée.

Middlewares: `auth`, `sessionIsOpen`, `requireRole("admin", "news")`, `upload.single("image")`, `validateBody`

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
    "user_id": "uuid",
    "author_name": "Admin"
  }
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `400` `{ "error": "Image requise" }`
- `400` `{ "error": "Type de fichier non autorise (jpeg, png ou webp uniquement)" }`
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `403` `{ "error": "Acces refuse" }`

---

### PATCH `/admin/news/:id`

Modifier une news existante.

Middlewares: `auth`, `sessionIsOpen`, `requireRole("admin", "news")`, `upload.single("image")`, `validateBody`

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
    "user_id": "uuid",
    "author_name": "Admin"
  }
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide ou corps invalide)
- `400` `{ "error": "Type de fichier non autorise (jpeg, png ou webp uniquement)" }`
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `403` `{ "error": "Acces refuse" }`
- `404` `{ "error": "News introuvable" }`

---

### DELETE `/admin/news/:id`

Supprime definitivement une news et son fichier image.

Middlewares: `auth`, `sessionIsOpen`, `requireRole("admin", "news")`

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
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `403` `{ "error": "Acces refuse" }`
- `404` `{ "error": "News introuvable" }`

---

## Artists

### POST `/admin/artists`

Creer un artiste avec une image uploadée.

Middlewares: `auth`, `sessionIsOpen`, `requireRole("admin", "artists")`, `upload.single("image")`, `validateBody`

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
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `403` `{ "error": "Acces refuse" }`
- `409` `{ "error": "Deux artistes sont déjà mis en avant sur la page d'accueil." }`

### PATCH `/admin/artists/:id`

Modifier un artiste existant et son concert associe.

Middlewares: `auth`, `sessionIsOpen`, `requireRole("admin", "artists")`, `upload.single("image")`, `validateBody`

Authentification:

- Cookie d'authentification valide requis.

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

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide ou corps invalide)
- `400` `{ "error": "Type de fichier non autorise (jpeg, png ou webp uniquement)" }`
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
- `401` `{ "error": "Session manquante" }`
- `403` `{ "error": "Acces refuse" }`
- `404` `{ "error": "Artiste introuvable" }`
- `409` `{ "error": "Deux artistes sont déjà mis en avant sur la page d'accueil." }`

---

### DELETE `/admin/artists/:id`

Supprime definitivement un artiste, son concert associe et son fichier image.

> Le concert est supprime automatiquement en cascade par la base de donnees (`ON DELETE CASCADE`). Le fichier image est supprime du disque apres la suppression en base.

Middlewares: `auth`, `sessionIsOpen`, `requireRole("admin", "artists")`

Authentification:

- Cookie d'authentification valide requis.

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

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }` (id invalide)
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`
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
- `500` `{ "error": "Erreur interne du serveur" }`

---

## Diagnostic

> `/health` est disponible en toutes circonstances. `/debug/db` est conditionné à `NODE_ENV !== "production"` — il retourne `404` en production.

### GET `/health`

Vérifie que le serveur backend est opérationnel.

Authentification : aucune.

Réponse en succès :

- Statut : `200`
- Corps :

```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

### GET `/debug/db`

Vérifie la connexion à la base de données. **Disponible uniquement hors production** (`NODE_ENV !== "production"`) — retourne `404` via `notFoundHandler` en production.

Authentification : aucune.

Réponse en succès :

- Statut : `200`
- Corps :

```json
{
  "db": "ok",
  "now": "2026-04-25T10:00:00.000Z"
}
```

Réponse en erreur :

- `500` `{ "error": "Impossible de joindre la base de donnees" }`

---

## Notes

- Format d'erreur standardisé :

```json
{ "error": "..." }
```
