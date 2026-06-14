# Tests — Backend

## Introduction

### Stack

| Outil       | Rôle                                                             |
| ----------- | ---------------------------------------------------------------- |
| Vitest      | Runner, assertions, mocks (`vi.mock`, `vi.fn`, `vi.mocked`)     |
| Supertest   | Requêtes HTTP against le serveur Express (tests d'intégration)  |
| PostgreSQL  | Vraie base de données de test isolée (Docker Compose `test`)    |

---

### Organisation

```
tests/
├── setup.ts                      ← mocks globaux (nodemailer, sharp, fs)
├── helpers/
│   ├── testServer.ts             ← instance Express partagée
│   ├── createAuthSession.ts      ← crée un user + session + cookie JWT
│   └── fixtures.ts               ← insertUser / insertArtist / insertNews
├── unit/
│   ├── auth.middleware.test.ts
│   ├── requireRole.middleware.test.ts
│   ├── validateBody.middleware.test.ts
│   ├── validateUuidParam.middleware.test.ts
│   ├── imageUpload.service.test.ts
│   ├── mailer.service.test.ts
│   └── user.service.test.ts
└── integration/
    ├── admin/
    │   ├── auth.test.ts
    │   ├── artists.test.ts
    │   ├── news.test.ts
    │   └── users.test.ts
    └── public/
        ├── contact.test.ts
        └── public.test.ts
```

---

### Deux niveaux de test

**Tests unitaires** (`tests/unit/`) — testent une fonction ou un middleware en isolation.
La base de données, nodemailer et sharp sont mockés. Aucun serveur ne démarre.
Ils vérifient le comportement interne : erreurs levées, arguments passés aux dépendances, valeurs retournées.

**Tests d'intégration** (`tests/integration/`) — testent l'API de bout en bout via Supertest.
Chaque requête traverse toute la chaîne Express : middlewares → contrôleur → base de données réelle.
L'envoi d'email et le traitement d'image sont mockés globalement dans `setup.ts`.

---

### Ce qui est mocké globalement (`setup.ts`)

| Module          | Raison                                                              |
| --------------- | ------------------------------------------------------------------- |
| `nodemailer`    | Évite l'envoi réel d'emails — `sendMail` est une `vi.fn()`         |
| `sharp`         | Évite le traitement d'image — retourne une chaîne de mocks         |
| `fs/promises`   | `mkdir` et `unlink` sont des `vi.fn()` — pas d'écriture disque     |

La base de données **n'est pas mockée** dans les tests d'intégration : une vraie instance PostgreSQL de test est utilisée. Elle est réinitialisée entre chaque fichier via `afterEach` (vidage des tables).

---

### Ce qui n'est pas testé

- **Les contrôleurs individuellement** — ils sont couverts de bout en bout par les tests d'intégration. Les tester en isolation n'apporterait pas de valeur supplémentaire pour les patterns utilisés ici.
- **Les routes publiques de lecture des artistes côté admin** — `GET /admin/artists` et `GET /admin/artists/:id` ne sont pas encore écrits (leur comportement est couvert par les routes publiques).

---

### Pourquoi les tests ne sont pas refactorisés

#### Les helpers de fixtures sont déjà partagés

`insertUser`, `insertArtist` et `insertNews` sont dans `tests/helpers/fixtures.ts` et importés dans tous les tests d'intégration. C'est le seul refactoring qui apporte une vraie valeur : les données SQL d'insertion sont réutilisées.

#### Les corps de requête `VALID_*` sont locaux par choix

Chaque fichier de test déclare ses propres constantes (`VALID_ARTIST_FIELDS`, `VALID_NEWS_FIELDS`, etc.). Les extraire dans un fichier partagé créerait un couplage fragile : modifier un champ pour un test d'un endpoint casserait silencieusement les assertions d'un autre.

#### Les mocks de `vi.mock()` ne peuvent pas être extraits

Vitest hisse les appels `vi.mock()` en tête de fichier à la compilation. Il est impossible de les placer dans une fonction utilitaire importée — le mock ne s'appliquerait pas au bon module scope. C'est une contrainte du système de modules ES.

---

## Fichiers de test

---


### `unit/validateBody.middleware.test.ts`

Teste le middleware `validateBody` en isolation, sans serveur Express. Vérifie qu'il délègue correctement à Zod pour valider le body et qu'il remplace `req.body` par les données transformées (trim, coercions Zod).

| #   | Description                                    | `it(...)`                                                              |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Body valide → `next()` sans argument           | `appelle next() si le body est valide selon le schema Zod`             |
| 2   | Body transformé (trim) écrit dans `req.body`   | `remplace req.body par les donnees parsees et transformees (trim)`     |
| 3   | Body invalide → `next(AppError 400)`           | `appelle next(AppError) avec 400 si le body est invalide`              |
| 4   | Body vide → `next(AppError 400)`               | `appelle next(AppError) avec 400 si le body est vide`                  |

---

### `unit/validateUuidParam.middleware.test.ts`

Teste le middleware `validateUuidParam` qui protège les routes paramétrées (`:id`) contre les valeurs non-UUID. Vérifie le cas nominal, le cas d'erreur et la prise en charge d'un nom de paramètre personnalisé.

| #   | Description                                       | `it(...)`                                                          |
| --- | ------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | UUID valide → `next()` sans argument              | `appelle next() si le parametre est un UUID valide`                |
| 2   | Valeur non-UUID → `next(AppError 400)`            | `appelle next(AppError) avec 400 si le parametre n'est pas un UUID`|
| 3   | Paramètre absent → `next(AppError 400)`           | `appelle next(AppError) avec 400 si le parametre est absent`       |
| 4   | Nom de paramètre personnalisé (`artistId`)        | `valide un parametre avec un nom personnalise`                     |

---

### `unit/requireRole.middleware.test.ts`

Teste le middleware `requireRole` qui contrôle l'accès aux routes selon le rôle de l'utilisateur stocké dans `res.locals`. Les objets Express sont simulés manuellement — aucun serveur ne démarre.

| #   | Description                                        | `it(...)`                                                                   |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Rôle autorisé → `next()` sans argument             | `appelle next() si le role de l'utilisateur est dans la liste autorisee`    |
| 2   | Rôle non autorisé → `throw AppError(403)`          | `throw AppError(FORBIDDEN, 403) si le role n'est pas dans la liste autorisee` |
| 3   | `res.locals.userRole` absent → `throw AppError(403)` | `throw AppError(FORBIDDEN, 403) si res.locals.userRole est absent`         |

---

### `unit/auth.middleware.test.ts`

Teste les middlewares `auth` (obligatoire) et `optionalAuth` (sans redirection si non connecté). Les deux lisent le cookie JWT, vérifient la base de données et peuplent `res.locals`. La couche DB est mockée — le JWT est signé avec le vrai secret d'env.

| #   | Description                                                      | `it(...)`                                                                               |
| --- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Aucun cookie → `throw AppError(AUTH_MISSING_COOKIE, 401)`        | `throw AUTH_MISSING_COOKIE si aucun cookie n'est present`                               |
| 2   | Token invalide → `throw AppError(AUTH_INVALID_ACCESS_TOKEN, 401)`| `throw AUTH_INVALID_ACCESS_TOKEN si le token est invalide`                              |
| 3   | Token valide mais user absent → `throw AppError(AUTH_USER_NOT_FOUND, 401)` | `throw AUTH_USER_NOT_FOUND si le user n'existe pas en base`                 |
| 4   | Token valide + user existant → `res.locals` peuplé + `next()`    | `peuple res.locals et appelle next() si le token est valide et le user existe`          |
| 5   | `optionalAuth` — aucun cookie → `next()` sans toucher `res.locals` | `appelle next() sans peupler res.locals si aucun cookie n'est present`                |
| 6   | `optionalAuth` — token invalide → `next()` sans toucher `res.locals` | `appelle next() sans peupler res.locals si le token est invalide`                  |
| 7   | `optionalAuth` — token valide + user existant → `res.locals` peuplé | `peuple res.locals et appelle next() si le token est valide et le user existe`       |

---

### `unit/imageUpload.service.test.ts`

Teste le service `imageUpload` en isolation : `sharp`, `fs/promises.mkdir` et `fs/promises.unlink` sont mockés. Vérifie que la chaîne d'appels est correcte et que le service est résilient aux erreurs de suppression.

| #   | Description                                               | `it(...)`                                                                     |
| --- | --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `saveImage` — `mkdir` appelé avec `{ recursive: true }`  | `appelle mkdir avec recursive: true avant l'ecriture`                         |
| 2   | `saveImage` — chaîne `sharp().resize().webp().toFile(chemin)` | `appelle sharp().resize().webp().toFile() avec le bon chemin`             |
| 3   | `saveImage` — retourne une URL publique `/prefix/uuid.webp` | `retourne une URL publique au format /prefix/uuid.webp`                     |
| 4   | `saveImage` — chaque appel génère un UUID différent       | `chaque appel retourne une URL differente (UUID unique)`                      |
| 5   | `deleteImage` — `unlink` appelé avec le bon chemin        | `appelle unlink avec le bon chemin reconstruit depuis l'URL`                  |
| 6   | `deleteImage` — silent fail si `unlink` échoue            | `ne throw pas si unlink echoue (silent fail)`                                 |

---

### `unit/user.service.test.ts`

Teste les fonctions utilitaires du service `user` : vérification d'unicité d'email et de display_name, existence d'un utilisateur, génération et hachage de mot de passe. La couche DB est mockée — aucune base de données n'est nécessaire.

| #   | Description                                                               | `it(...)`                                                                          |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | `checkEmailAvailable` — email libre → pas d'erreur                        | `ne throw pas si l'email n'existe pas en base`                                     |
| 2   | `checkEmailAvailable` — email déjà pris → `throw AppError(409)`          | `throw USER_EMAIL_ALREADY_USED si l'email est deja utilise`                        |
| 3   | `checkEmailAvailable` — `excludeId` fourni → pas d'erreur (modification) | `exclut l'utilisateur courant si excludeId est fourni (cas modification)`          |
| 4   | `checkDisplayNameAvailable` — display_name libre → pas d'erreur          | `ne throw pas si le display_name n'existe pas en base`                             |
| 5   | `checkDisplayNameAvailable` — display_name pris → `throw AppError(409)`  | `throw USER_DISPLAY_NAME_ALREADY_USED si le display_name est deja utilise`         |
| 6   | `checkDisplayNameAvailable` — `excludeId` fourni → pas d'erreur          | `exclut l'utilisateur courant si excludeId est fourni (cas modification)`          |
| 7   | `checkUserExists` — user existant → pas d'erreur                         | `ne throw pas si l'utilisateur existe en base`                                     |
| 8   | `checkUserExists` — user absent → `throw AppError(404)`                  | `throw USER_NOT_FOUND si l'utilisateur n'existe pas`                               |
| 9   | `generateTemporaryPassword` — longueur ≥ 12                              | `retourne une chaine d'au moins 12 caracteres`                                     |
| 10  | `generateTemporaryPassword` — chaque appel unique                         | `chaque appel retourne une valeur differente`                                      |
| 11  | `hashPassword` — hash bcrypt valide vérifié par `bcrypt.compare`          | `retourne un hash bcrypt valide verifie par bcrypt.compare`                        |
| 12  | `hashPassword` — même mot de passe → hash différent à chaque fois (salt) | `deux appels avec le meme mot de passe produisent des hashs differents (salt)`     |

---

### `unit/mailer.service.test.ts`

Teste le service `mailer` qui envoie des emails via nodemailer. `nodemailer.createTransport` est mocké globalement dans `setup.ts` — les tests vérifient uniquement que `sendMail` est appelé avec les bons arguments.

| #   | Description                                                        | `it(...)`                                                                          |
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1   | `sendPasswordResetEmail` — bon destinataire + mot de passe dans le body | `appelle sendMail avec le bon destinataire et le mot de passe dans le body`   |
| 2   | `sendPasswordResetEmail` — nom de l'utilisateur dans le corps       | `inclut le nom de l'utilisateur dans le corps du mail`                             |
| 3   | `sendWelcomeEmail` — bon destinataire + identifiants dans le body  | `appelle sendMail avec le bon destinataire et les identifiants dans le body`        |
| 4   | `sendWelcomeEmail` — nom dans le corps                             | `inclut le nom de l'utilisateur dans le corps du mail`                             |
| 5   | `sendWelcomeEmail` — email comme identifiant de connexion          | `inclut l'email comme identifiant de connexion dans le corps du mail`              |
| 6   | `sendContactEmail` — sujet préfixé `[Contact]`                     | `appelle sendMail avec le sujet prefixe [Contact]`                                 |
| 7   | `sendContactEmail` — `replyTo` = email de l'expéditeur             | `appelle sendMail avec replyTo egal a l'email de l'expediteur`                     |
| 8   | `sendContactEmail` — nom et email de l'expéditeur dans le corps    | `inclut le nom et l'email de l'expediteur dans le corps du mail`                   |

---

### `integration/admin/auth.test.ts`

Teste toutes les routes d'authentification admin de bout en bout via Supertest. Les cas nominaux et tous les cas d'erreur métier sont couverts : credentials incorrects, sessions révoquées ou expirées, validation du body Zod.

| #   | Description                                              | `it(...)`                                                                  |
| --- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | `POST /login` — bons credentials → 200 + cookie         | `retourne 200 et un cookie avec les bons credentials`                      |
| 2   | `POST /login` — mauvais mot de passe → 401              | `retourne 401 avec un mauvais mot de passe`                                |
| 3   | `POST /login` — email inexistant → 401                  | `retourne 401 avec un email inexistant`                                    |
| 4   | `POST /login` — body invalide → 400                     | `retourne 400 si le body est invalide`                                     |
| 5   | `POST /logout` — session révoquée → 200                 | `retourne 200 et revoque la session`                                       |
| 6   | `POST /logout` — sans cookie → 401                      | `retourne 401 sans cookie`                                                 |
| 7   | `GET /me` — connecté → 200 + infos user                 | `retourne 200 et les infos du user connecte`                               |
| 8   | `GET /me` — sans cookie → 401                           | `retourne 401 sans cookie`                                                 |
| 9   | `GET /me` — session révoquée → 401                      | `retourne 401 avec une session revoquee`                                   |
| 10  | `GET /me` — session expirée → 401                       | `retourne 401 avec une session expiree`                                    |
| 11  | `POST /forgot-password` — email existant → 200          | `retourne 200 et envoie un email si l'email existe`                        |
| 12  | `POST /forgot-password` — email inexistant → 404        | `retourne 404 si l'email n'existe pas`                                     |
| 13  | `POST /forgot-password` — body invalide → 400           | `retourne 400 si le body est invalide`                                     |
| 14  | `PATCH /password` — mot de passe mis à jour → 200       | `retourne 200 et met a jour le mot de passe`                               |
| 15  | `PATCH /password` — ancien mot de passe incorrect → 401 | `retourne 401 si l'ancien mot de passe est incorrect`                      |
| 16  | `PATCH /password` — body invalide → 400                 | `retourne 400 si le body est invalide`                                     |
| 17  | `PATCH /password` — sans cookie → 401                   | `retourne 401 sans cookie`                                                 |

---

### `integration/admin/users.test.ts`

Teste les routes CRUD utilisateurs, accessibles uniquement au rôle `admin`. Vérifie les contrôles d'unicité (email, display_name), la validation du body Zod, et les contrôles d'accès par rôle.

| #   | Description                                                   | `it(...)`                                                              |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | `GET /users` — admin connecté → 200 + liste                   | `retourne 200 et la liste des utilisateurs`                            |
| 2   | `GET /users` — rôle `news` → 403                             | `retourne 403 avec un role non autorise (news)`                        |
| 3   | `GET /users` — sans cookie → 401                             | `retourne 401 sans cookie`                                             |
| 4   | `POST /users` — création réussie → 201 + user                | `retourne 201 et cree un utilisateur`                                  |
| 5   | `POST /users` — email déjà utilisé → 409                     | `retourne 409 si l'email est deja utilise`                             |
| 6   | `POST /users` — display_name déjà utilisé → 409              | `retourne 409 si le display_name est deja utilise`                     |
| 7   | `POST /users` — body invalide → 400                          | `retourne 400 si le body est invalide`                                 |
| 8   | `POST /users` — rôle `news` → 403                            | `retourne 403 avec un role non autorise (news)`                        |
| 9   | `POST /users` — sans cookie → 401                            | `retourne 401 sans cookie`                                             |
| 10  | `PATCH /users/:id` — modification réussie → 200              | `retourne 200 et modifie l'utilisateur`                                |
| 11  | `PATCH /users/:id` — UUID inexistant → 404                   | `retourne 404 si l'utilisateur n'existe pas`                           |
| 12  | `PATCH /users/:id` — UUID invalide → 400                     | `retourne 400 si l'id n'est pas un UUID valide`                        |
| 13  | `PATCH /users/:id` — body invalide → 400                     | `retourne 400 si le body est invalide`                                 |
| 14  | `PATCH /users/:id` — rôle `artists` → 403                    | `retourne 403 avec un role non autorise (artists)`                     |
| 15  | `PATCH /users/:id` — sans cookie → 401                       | `retourne 401 sans cookie`                                             |
| 16  | `DELETE /users/:id` — suppression réussie → 200              | `retourne 200 et supprime l'utilisateur`                               |
| 17  | `DELETE /users/:id` — UUID inexistant → 404                  | `retourne 404 si l'utilisateur n'existe pas`                           |
| 18  | `DELETE /users/:id` — UUID invalide → 400                    | `retourne 400 si l'id n'est pas un UUID valide`                        |
| 19  | `DELETE /users/:id` — rôle `artists` → 403                   | `retourne 403 avec un role non autorise (artists)`                     |
| 20  | `DELETE /users/:id` — sans cookie → 401                      | `retourne 401 sans cookie`                                             |

---

### `integration/admin/artists.test.ts`

Teste les routes CRUD artistes, accessibles aux rôles `admin` et `artists`. Les requêtes utilisent `multipart/form-data` (upload d'image). `sharp` est mocké globalement — aucun fichier n'est écrit sur le disque.

| #   | Description                                                      | `it(...)`                                                              |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | `POST /artists` — création avec image → 201 + artiste           | `retourne 201 et cree un artiste avec les bons champs`                 |
| 2   | `POST /artists` — sans image → 400                              | `retourne 400 si aucune image n'est fournie`                           |
| 3   | `POST /artists` — body invalide → 400                           | `retourne 400 si le body est invalide`                                 |
| 4   | `POST /artists` — limite 2 artistes en avant → 409              | `retourne 409 si la limite de 2 artistes en avant est atteinte`        |
| 5   | `POST /artists` — rôle `news` → 403                             | `retourne 403 avec un role non autorise (news)`                        |
| 6   | `POST /artists` — sans cookie → 401                             | `retourne 401 sans cookie`                                             |
| 7   | `PATCH /artists/:id` — modification sans image → 200            | `retourne 200 et modifie l'artiste`                                    |
| 8   | `PATCH /artists/:id` — modification avec nouvelle image → 200   | `retourne 200 et modifie l'artiste avec une nouvelle image`            |
| 9   | `PATCH /artists/:id` — UUID inexistant → 404                    | `retourne 404 si l'artiste n'existe pas`                               |
| 10  | `PATCH /artists/:id` — UUID invalide → 400                      | `retourne 400 si l'id n'est pas un UUID valide`                        |
| 11  | `PATCH /artists/:id` — rôle `news` → 403                        | `retourne 403 avec un role non autorise (news)`                        |
| 12  | `PATCH /artists/:id` — sans cookie → 401                        | `retourne 401 sans cookie`                                             |
| 13  | `DELETE /artists/:id` — suppression réussie → 200               | `retourne 200 et supprime l'artiste`                                   |
| 14  | `DELETE /artists/:id` — UUID inexistant → 404                   | `retourne 404 si l'artiste n'existe pas`                               |
| 15  | `DELETE /artists/:id` — UUID invalide → 400                     | `retourne 400 si l'id n'est pas un UUID valide`                        |
| 16  | `DELETE /artists/:id` — rôle `news` → 403                       | `retourne 403 avec un role non autorise (news)`                        |
| 17  | `DELETE /artists/:id` — sans cookie → 401                       | `retourne 401 sans cookie`                                             |

---

### `integration/admin/news.test.ts`

Teste les routes CRUD news, accessibles aux rôles `admin` et `news`. Même structure que les artistes : requêtes `multipart/form-data`, `sharp` mocké, contrôles d'accès et validation du body couverts.

| #   | Description                                                    | `it(...)`                                                              |
| --- | -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | `POST /news` — création avec image → 201 + news               | `retourne 201 et cree une news avec les bons champs`                   |
| 2   | `POST /news` — sans image → 400                               | `retourne 400 si aucune image n'est fournie`                           |
| 3   | `POST /news` — body invalide → 400                            | `retourne 400 si le body est invalide`                                 |
| 4   | `POST /news` — rôle `artists` → 403                           | `retourne 403 avec un role non autorise (artists)`                     |
| 5   | `POST /news` — sans cookie → 401                              | `retourne 401 sans cookie`                                             |
| 6   | `PATCH /news/:id` — modification sans image → 200             | `retourne 200 et modifie la news`                                      |
| 7   | `PATCH /news/:id` — modification avec nouvelle image → 200    | `retourne 200 et modifie la news avec une nouvelle image`              |
| 8   | `PATCH /news/:id` — UUID inexistant → 404                     | `retourne 404 si la news n'existe pas`                                 |
| 9   | `PATCH /news/:id` — UUID invalide → 400                       | `retourne 400 si l'id n'est pas un UUID valide`                        |
| 10  | `PATCH /news/:id` — rôle `artists` → 403                      | `retourne 403 avec un role non autorise (artists)`                     |
| 11  | `PATCH /news/:id` — sans cookie → 401                         | `retourne 401 sans cookie`                                             |
| 12  | `DELETE /news/:id` — suppression réussie → 200                | `retourne 200 et supprime la news`                                     |
| 13  | `DELETE /news/:id` — UUID inexistant → 404                    | `retourne 404 si la news n'existe pas`                                 |
| 14  | `DELETE /news/:id` — UUID invalide → 400                      | `retourne 400 si l'id n'est pas un UUID valide`                        |
| 15  | `DELETE /news/:id` — rôle `artists` → 403                     | `retourne 403 avec un role non autorise (artists)`                     |
| 16  | `DELETE /news/:id` — sans cookie → 401                        | `retourne 401 sans cookie`                                             |

---

### `integration/public/public.test.ts`

Teste les routes publiques de lecture, accessibles sans authentification. Couvre le comportement de filtrage des brouillons : sans auth seules les news publiées sont visibles, avec un rôle `admin` ou `news` les brouillons sont inclus.

| #   | Description                                                             | `it(...)`                                                                          |
| --- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | `GET /public/artists` — liste des artistes → 200                        | `retourne 200 et la liste des artistes`                                            |
| 2   | `GET /public/artists` — aucun artiste → 200 + liste vide               | `retourne 200 avec une liste vide si aucun artiste`                                |
| 3   | `GET /public/artists/:id` — artiste existant → 200 + détail            | `retourne 200 et le detail d'un artiste`                                           |
| 4   | `GET /public/artists/:id` — UUID inexistant → 404                       | `retourne 404 si l'artiste n'existe pas`                                           |
| 5   | `GET /public/news` — sans auth → uniquement news publiées              | `retourne 200 et uniquement les news publiees sans authentification`                |
| 6   | `GET /public/news` — rôle `admin` → brouillons inclus                  | `retourne toutes les news (brouillons inclus) avec un role admin`                  |
| 7   | `GET /public/news` — rôle `news` → brouillons inclus                   | `retourne toutes les news (brouillons inclus) avec un role news`                   |
| 8   | `GET /public/news` — aucune news publiée → 200 + liste vide            | `retourne 200 avec une liste vide si aucune news publiee`                          |
| 9   | `GET /public/news/:id` — news publiée sans auth → 200                  | `retourne 200 et le detail d'une news publiee sans authentification`               |
| 10  | `GET /public/news/:id` — brouillon sans auth → 404                     | `retourne 404 si la news est en brouillon sans authentification`                   |
| 11  | `GET /public/news/:id` — brouillon avec rôle `admin` → 200             | `retourne 200 pour un brouillon avec un role admin`                                |
| 12  | `GET /public/news/:id` — UUID inexistant → 404                          | `retourne 404 si la news n'existe pas`                                             |

---

### `integration/public/contact.test.ts`

Teste la route de soumission du formulaire de contact. Aucune authentification requise. Couvre tous les cas de validation Zod : email, longueur minimale du nom, du sujet et du message, champs manquants.

| #   | Description                                        | `it(...)`                                                              |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Body valide → 200 + message envoyé                 | `retourne 200 et envoie le message de contact`                         |
| 2   | Email invalide → 400                               | `retourne 400 si l'email est invalide`                                 |
| 3   | Nom trop court (< 2 caractères) → 400              | `retourne 400 si le nom est trop court`                                |
| 4   | Sujet trop court (< 2 caractères) → 400            | `retourne 400 si le sujet est trop court`                              |
| 5   | Message trop court (< 10 caractères) → 400         | `retourne 400 si le message est trop court`                            |
| 6   | Champs obligatoires manquants → 400                | `retourne 400 si des champs obligatoires sont manquants`               |
