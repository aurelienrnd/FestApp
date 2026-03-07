# API Backend - Vindhellfest

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
    "is_active": true,
    "role": "admin"
  },
  "mustChangePassword": false
}
```

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `403` `{ "error": "Utilisateur introuvable" }`
- `401` `{ "error": "Session introuvable" }`
- `401` `{ "error": "Session deja fermee ou expiree" }`

## Users

Base path: `/admin/users`

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
      "is_active": true,
      "role": "admin"
    },
    {
      "id": "uuid",
      "email": "autre@test.fr",
      "display_name": "autreAdmin",
      "is_active": true,
      "role": "admin"
    }
  ]
}
```

- Header: `Set-Cookie` (token d'acces renouvele)

Reponses d'erreur:

- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`

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
  "temporary_password": "ab12cd34ef56gh78"
}
```

Reponses d'erreur:

- `400` `{ "error": "Donnees invalides" }`
- `401` `{ "error": "Cookie d'authentification manquant" }`
- `401` `{ "error": "Token d'acces manquant" }`
- `401` `{ "error": "Token d'acces invalide" }`
- `409` `{ "error": "Email deja utilise" }`
- `409` `{ "error": "Nom deja utilise" }`

## Notes

- Format d'erreur standardise:

```json
{ "error": "..." }
```
