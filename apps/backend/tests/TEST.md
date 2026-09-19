# Tests — Backend

## Introduction

### Stack

| Outil       | Rôle                                                             |
| ----------- | ---------------------------------------------------------------- |
| Vitest      | Runner, assertions, mocks (`vi.mock`, `vi.fn`, `vi.mocked`)     |
| Supertest   | Requêtes HTTP contre le serveur Express (tests d'intégration)  |
| PostgreSQL  | Vraie base de données de test isolée (Docker Compose `db`)     |
| Better Auth | Authentification reelle (pas mockee) — cf. section dediee plus bas |

---

### Organisation

```
tests/
├── setup.ts                      ← mocks globaux (nodemailer, sharp, fs)
├── helpers/
│   ├── testServer.ts             ← instance Express partagée
│   ├── createAuthSession.ts      ← cree un user + une vraie session Better Auth (cookie signe)
│   └── fixtures.ts               ← insertUser / insertArtist / insertNews
├── unit/
│   ├── auth.sendResetPassword.test.ts
│   ├── requireRole.middleware.test.ts
│   ├── validateBody.middleware.test.ts
│   ├── validateUuidParam.middleware.test.ts
│   ├── imageUpload.service.test.ts
│   └── mailer.service.test.ts
└── integration/
    ├── admin/
    │   ├── artists.test.ts
    │   ├── news.test.ts
    │   └── betterAuth.test.ts
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

| Module               | Raison                                                              |
| --------------------- | ------------------------------------------------------------------- |
| `nodemailer`          | Évite l'envoi réel d'emails — `sendMail` est une `vi.fn()`         |
| `sharp`               | Évite le traitement d'image — retourne une chaîne de mocks         |
| `fs/promises`         | `mkdir`, `writeFile` et `unlink` sont des `vi.fn()` — pas d'écriture disque |

> `setup.ts` mocke aussi `express-rate-limit`, mais ce mock est mort : le package n'est pas une dépendance du backend (`npm ls express-rate-limit` échoue) et rien dans `src/` ne l'importe — aucune route custom n'a de rate limiting propre. A supprimer si `knip`/un futur nettoyage le signale.

La base de données **n'est pas mockée** dans les tests d'intégration : une vraie instance PostgreSQL de test est utilisée. Son schéma est réinitialisé une fois avant toute la suite (`beforeAll` : `DROP SCHEMA public CASCADE` puis rejeu des migrations SQL, dont le schéma Better Auth généré par sa CLI) et vidée entre chaque test (`afterEach` : `TRUNCATE` de toutes les tables, y compris `user`/`session`/`account`/`verification`).

---

### L'authentification n'est pas mockée non plus

L'authentification repose entièrement sur Better Auth (`src/lib/auth.ts`), sans code custom à mocker. Les tests s'appuient sur la vraie instance :

- **`createAuthSession(role)`** crée un utilisateur via `auth.api.createUser` (plugin admin) puis se connecte via `auth.api.signInEmail({ asResponse: true })` pour récupérer un vrai cookie de session signé — impossible à reconstruire à la main. Utilisé par la quasi-totalité des tests d'intégration qui ont juste besoin d'une session valide.
- **`integration/admin/betterAuth.test.ts`** teste Better Auth lui-même via de vraies requêtes HTTP sur `/api/auth/*` (sign-in, sign-out, session, reset de mot de passe, plugin admin), plutôt que de re-tester une librairie déjà testée en amont — l'objectif est de vérifier que **notre configuration** (`emailAndPassword`, champ `role`, `adminRoles`) est correcte de bout en bout.

**Piège rencontré et contourné** : Better Auth applique son propre rate limiting interne, indépendant de tout package `express-rate-limit`. Deux règles spéciales s'appliquent sur tout le fichier de test (le compteur est partagé, l'instance `auth` étant un singleton) :

| Chemin                                                          | Fenêtre | Max |
| ---------------------------------------------------------------- | ------- | --- |
| `/sign-in*`, `/sign-up`, `/change-password`, `/change-email`     | 10 s    | 3   |
| `/request-password-reset`, `/forget-password*`                   | 60 s    | 3   |

Pour les vérifications annexes qui ont juste besoin d'une session (par ex. « est-ce que ce mot de passe fonctionne maintenant ? »), `betterAuth.test.ts` appelle `auth.api.signInEmail` directement (hors HTTP, donc hors de ce throttle — même code de production). En revanche, `auth.api.requestPasswordReset`/`resetPassword` appelés hors HTTP se sont révélés peu fiables en CI (leur middleware `originCheck` attend un vrai contexte de requête) : ces deux endpoints ne sont donc appelés qu'en HTTP réel, dans la limite du budget de 3 requêtes/60s ci-dessus.

---

### Ce qui n'est pas testé

- **Les contrôleurs individuellement** — ils sont couverts de bout en bout par les tests d'intégration. Les tester en isolation n'apporterait pas de valeur supplémentaire pour les patterns utilisés ici.
- **Les routes publiques de lecture des artistes côté admin** — `GET /admin/artists` et `GET /admin/artists/:id` ne sont pas écrites (ce comportement est couvert côté public).
- **`GET /home`** — aucun test n'existe pour cette route (données agrégées de la page d'accueil).

---

## Fichiers de test

---

### `unit/auth.sendResetPassword.test.ts`

Teste en isolation totale (pas de DB, pas de HTTP, pas de rate limiter) la logique de choix invite/reset de `src/lib/auth.ts`. `betterAuth()` renvoie l'objet `options` tel quel (`node_modules/better-auth/dist/auth/base.mjs`) : `auth.options.emailAndPassword.sendResetPassword` **est** la fonction écrite dans `auth.ts`, appelable directement.

| #   | Description                                                        | `it(...)`                                                                          |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | `callbackURL` contient `context=invite` → `sendInviteEmail`          | `appelle sendInviteEmail quand callbackURL contient context=invite`                  |
| 2   | `callbackURL` sans context → `sendPasswordResetEmail`                | `appelle sendPasswordResetEmail quand callbackURL n'a pas de context`                |
| 3   | `callbackURL` avec un context différent d'`invite` → `sendPasswordResetEmail` | `appelle sendPasswordResetEmail quand callbackURL a un context different de invite` |
| 4   | Pas de `callbackURL` du tout → `sendPasswordResetEmail`              | `appelle sendPasswordResetEmail quand l'URL n'a pas de callbackURL du tout`          |

---

### `unit/requireRole.middleware.test.ts`

Teste le middleware `requireRole` qui contrôle l'accès aux routes selon le rôle de l'utilisateur stocké dans `res.locals`. Les objets Express sont simulés manuellement — aucun serveur ne démarre.

| #   | Description                                        | `it(...)`                                                                   |
| --- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | Rôle autorisé → `next()` sans argument              | `appelle next() si le role de l'utilisateur est dans la liste autorisee`      |
| 2   | Rôle non autorisé → `throw AppError(403)`           | `throw AppError(FORBIDDEN, 403) si le role n'est pas dans la liste autorisee` |
| 3   | `res.locals.userRole` absent → `throw AppError(403)` | `throw AppError(FORBIDDEN, 403) si res.locals.userRole est absent`           |

---

### `unit/validateBody.middleware.test.ts`

Teste le middleware `validateBody` en isolation, sans serveur Express. Vérifie qu'il délègue correctement à Zod pour valider le body et qu'il remplace `req.body` par les données transformées (trim, coercions Zod).

| #   | Description                                    | `it(...)`                                                              |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| 1   | Body valide → `next()` sans argument           | `appelle next() si le body est valide selon le schema Zod`             |
| 2   | Body transformé (trim) écrit dans `req.body`   | `remplace req.body par les donnees parsees et transformees (trim)`     |
| 3   | Body invalide → `next(AppError 400)`           | `appelle next(AppError) avec 400 si le body est invalide`              |
| 4   | Body vide → `next(AppError 400)`               | `appelle next(AppError) avec 400 si le body est vide`                  |

---

### `unit/validateUuidParam.middleware.test.ts`

Teste le middleware `validateUuidParam` qui protège les routes paramétrées (`:id`) contre les valeurs non-UUID. Vérifie le cas nominal, le cas d'erreur et la prise en charge d'un nom de paramètre personnalisé.

| #   | Description                                       | `it(...)`                                                            |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | UUID valide → `next()` sans argument              | `appelle next() si le parametre est un UUID valide`                  |
| 2   | Valeur non-UUID → `next(AppError 400)`            | `appelle next(AppError) avec 400 si le parametre n'est pas un UUID`  |
| 3   | Paramètre absent → `next(AppError 400)`           | `appelle next(AppError) avec 400 si le parametre est absent`         |
| 4   | Nom de paramètre personnalisé (`artistId`)        | `valide un parametre avec un nom personnalise`                       |

---

### `unit/imageUpload.service.test.ts`

Teste le service `imageUpload` en isolation : `sharp`, `fs/promises.mkdir` et `fs/promises.unlink` sont mockés. Vérifie que la chaîne d'appels est correcte et que le service est résilient aux erreurs de suppression.

| #   | Description                                               | `it(...)`                                                                     |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 1   | `saveImage` — `mkdir` appelé avec `{ recursive: true }`  | `appelle mkdir avec recursive: true avant l'ecriture`                             |
| 2   | `saveImage` — chaîne `sharp().resize().webp().toFile(chemin)` | `appelle sharp().resize().webp().toFile() avec le bon chemin`                 |
| 3   | `saveImage` — retourne une URL publique `/prefix/uuid.webp` | `retourne une URL publique au format /prefix/uuid.webp`                         |
| 4   | `saveImage` — chaque appel génère un UUID différent       | `chaque appel retourne une URL differente (UUID unique)`                          |
| 5   | `deleteImage` — `unlink` appelé avec le bon chemin        | `appelle unlink avec le bon chemin reconstruit depuis l'URL`                      |
| 6   | `deleteImage` — silent fail si `unlink` échoue            | `ne throw pas si unlink echoue (silent fail)`                                     |

---

### `unit/mailer.service.test.ts`

Teste le service `mailer` qui envoie des emails via nodemailer. `nodemailer.createTransport` est mocké globalement dans `setup.ts` — les tests vérifient uniquement que `sendMail` est appelé avec les bons arguments.

| #   | Description                                                        | `it(...)`                                                                          |
| --- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | `sendPasswordResetEmail` — bon destinataire + lien dans le body      | `appelle sendMail avec le bon destinataire et le lien de reinitialisation dans le body` |
| 2   | `sendPasswordResetEmail` — nom de l'utilisateur dans le corps        | `inclut le nom de l'utilisateur dans le corps du mail`                                 |
| 3   | `sendPasswordResetEmail` — aucun mot de passe en clair dans le mail  | `ne transmet aucun mot de passe en clair dans le mail`                                 |
| 4   | `sendInviteEmail` — bon destinataire + lien dans le body             | `appelle sendMail avec le bon destinataire et le lien dans le body`                    |
| 5   | `sendInviteEmail` — nom de l'utilisateur dans le corps               | `inclut le nom de l'utilisateur dans le corps du mail`                                 |
| 6   | `sendInviteEmail` — texte distinct de `sendPasswordResetEmail`       | `ne mentionne pas de reinitialisation demandee par l'utilisateur`                      |
| 7   | `sendContactEmail` — sujet préfixé `[Contact]`                       | `appelle sendMail avec le sujet prefixe [Contact]`                                     |
| 8   | `sendContactEmail` — `replyTo` = email de l'expéditeur               | `appelle sendMail avec replyTo egal a l'email de l'expediteur`                         |
| 9   | `sendContactEmail` — nom et email de l'expéditeur dans le corps      | `inclut le nom et l'email de l'expediteur dans le corps du mail`                       |

---

### `integration/admin/artists.test.ts`

Teste les routes CRUD artistes, accessibles aux rôles `admin` et `artists`. Les requêtes utilisent `multipart/form-data` (upload d'image). `sharp` est mocké globalement — aucun fichier n'est écrit sur le disque.

| #   | Description                                                      | `it(...)`                                                              |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
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
| --- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
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

### `integration/admin/betterAuth.test.ts`

Teste Better Auth lui-même via de vraies requêtes sur `/api/auth/*` (pas de mock d'`authClient`, contrairement aux tests front) : sign-in, sign-out, session, reset de mot de passe et plugin admin. Objectif : vérifier que notre configuration (`emailAndPassword`, champ `role`, `adminRoles` par défaut `["admin"]`) fonctionne de bout en bout, pas re-tester Better Auth. `sendPasswordResetEmail`/`sendInviteEmail` sont mockées pour capturer l'URL de reset générée. Voir la section « L'authentification n'est pas mockée non plus » pour le contournement du rate limiting interne de Better Auth.

> Les 3 tests de réinitialisation de mot de passe sont les 3 seuls appels HTTP à `/request-password-reset` de tout le fichier (budget max : 3/60s, partagé sur tout le fichier). `auth.api.requestPasswordReset`/`resetPassword` appelés hors HTTP se sont révélés peu fiables en CI (le middleware `originCheck` de ces deux endpoints attend un vrai contexte de requête) — contrairement à `signInEmail`, qui reste appelé hors HTTP partout ailleurs (`canSignIn`, `createAuthSession`) sans ce problème. Le choix invite/reset selon `callbackURL` est déjà couvert en isolation totale, hors budget, par `tests/unit/auth.sendResetPassword.test.ts`.

| #   | Description                                                                           | `it(...)`                                                                                    |
| --- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| 1   | `POST /sign-in/email` — succès → 200 + cookie + rôle                                  | `retourne 200, un cookie de session et le role de l'utilisateur`                              |
| 2   | `POST /sign-in/email` — mauvais mot de passe → 401                                    | `retourne 401 avec un mauvais mot de passe`                                                   |
| 3   | `POST /sign-in/email` — email inconnu → 401                                           | `retourne 401 pour un email inconnu`                                                          |
| 4   | `POST /sign-out` — invalide le cookie (`get-session` → `null` ensuite)                | `invalide le cookie de session : get-session renvoie null ensuite`                            |
| 5   | `GET /get-session` — sans cookie → `null`                                             | `renvoie null sans cookie`                                                                    |
| 6   | `GET /get-session` — cookie valide → utilisateur + rôle                               | `renvoie l'utilisateur (avec son role) pour un cookie valide`                                 |
| 7   | Cycle complet HTTP : demande → reset → ancien mdp refusé → nouveau accepté → sessions revoquees | `cycle complet : demande, reset, ancien mot de passe refuse, nouveau accepte, sessions revoquees` |
| 8   | `redirectTo` avec `context=invite` → `sendInviteEmail` (pas `sendPasswordResetEmail`), en HTTP réel | `appelle sendInviteEmail (pas sendPasswordResetEmail) quand redirectTo contient context=invite, en HTTP reel` |
| 9   | Email inconnu → 200 sans envoi d'email (pas d'énumération d'utilisateurs)             | `retourne 200 sans envoyer d'email pour un email inconnu`                                      |
| 10  | `GET /admin/list-users` — sans cookie → 401                                           | `retourne 401 sans cookie`                                                                    |
| 11  | `POST /admin/create-user` — rôle non-admin → 403 (`adminRoles` par défaut `[admin]`)  | `retourne 403 pour un role non-admin (adminRoles par defaut = [admin])`                       |
| 12  | Cycle complet : create → list → update (rôle) → set-password → remove                | `cree, liste, modifie, change le mot de passe puis supprime un utilisateur`                    |
| 13  | `POST /admin/remove-user` — se supprimer soi-même → 400                              | `retourne 400 quand on tente de se supprimer soi-meme`                                        |

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
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | Body valide → 200 + message envoyé                 | `retourne 200 et envoie le message de contact`                         |
| 2   | Email invalide → 400                               | `retourne 400 si l'email est invalide`                                 |
| 3   | Nom trop court (< 2 caractères) → 400              | `retourne 400 si le nom est trop court`                                |
| 4   | Sujet trop court (< 2 caractères) → 400            | `retourne 400 si le sujet est trop court`                              |
| 5   | Message trop court (< 10 caractères) → 400         | `retourne 400 si le message est trop court`                            |
| 6   | Champs obligatoires manquants → 400                | `retourne 400 si des champs obligatoires sont manquants`               |
