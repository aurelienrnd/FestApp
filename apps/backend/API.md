# API Backend - Vindhellfest

## Résumé des endpoints

| Méthode | Route                | Accès       | Description                                     |
| ------- | -------------------- | ----------- | ----------------------------------------------- |
| POST    | `/admin/auth/login`     | Public      | Connexion administrateur                        |
| POST    | `/admin/auth/logout`    | Authentifié | Déconnexion                                     |
| GET     | `/admin/auth/me`        | Authentifié | Informations utilisateur + renouvellement token |
| PATCH   | `/admin/auth/password`  | Authentifié | Modifier le mot de passe de l'utilisateur connecte |
| GET     | `/admin/users`       | Authentifié | Liste des utilisateurs                          |
| POST    | `/admin/users`       | Authentifié | Créer un utilisateur                            |
| PATCH   | `/admin/users/:id`   | Authentifié | Modifier un utilisateur                         |
| DELETE  | `/admin/users/:id`   | Authentifié | Supprimer un utilisateur                        |
| GET     | `/public/lineup`     | Public      | Liste des artistes de la programmation          |
| GET     | `/health`            | Public      | Santé du serveur (diagnostic)                   |
| GET     | `/debug/db`          | Public      | Connexion à la base de données (diagnostic)     |

---

## Authentification

Base path: `/admin/auth`

### POST `/admin/auth/login`

Connecte un administrateur et pose un cookie httpOnly contenant le token d'acces.

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
  "message": "Authentification reussie"
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

> Toutes les routes de cette section sont réservées au rôle `admin`. Un rôle `lineup` ou `news` recevra une réponse `403`.

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

- `role` accepte: `admin`, `lineup`, `news`.

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

- `role` accepte: `admin`, `lineup`, `news`.

```json
{
  "email": "modifie@test.fr",
  "first_name": "Modifie",
  "last_name": "User",
  "role": "lineup"
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
    "role": "lineup",

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

## Lineup

Base path: `/public/lineup`

### GET `/public/lineup`

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
      "genre": "Rock",
      "origin": "Etats-Unis, Los Angeles",
      "bio": "Groupe de rock melant riffs lourds et funcky.",
      "url_media": "https://www.franceinfo.fr/pictures/wgYIq-vpdl_9MeEJWHXBaIz0ns8/186x42:2836x1535/2656x1494/filters:format(avif):quality(50)/2022/04/01/phpPAEw95.jpg",
      "description_media": "Photo promo du groupe Red Hot Chili Peppers"
    }
  ]
}
```

Reponses d'erreur:

- `500` `{ "error": "Erreur serveur" }`

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

Vérifie que la connexion à la base de données est opérationnelle.

Authentification : aucune.

Réponse en succès :

- Statut : `200`
- Corps :

```json
{
  "db": "ok",
  "now": "2026-03-17T10:00:00.000Z"
}
```

Réponse d'erreur :

- `500` `{ "error": "Impossible de joindre la base de donnees" }`

---

## Notes

- Format d'erreur standardisé :

```json
{ "error": "..." }
```
