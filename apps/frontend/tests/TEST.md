# Tests — Frontend

## Introduction

Ce dossier contient l'ensemble des tests unitaires et d'intégration du frontend Vindhellfest.

**Stack :** Vitest + React Testing Library (`render`, `renderHook`, `userEvent`, `waitFor`).

**Organisation en trois sections :**
- `hooks/` — logique métier isolée (fetch, mutation, suppression, garde de rôle)
- `components/` — composants React : modales, pages, contenu
- `functions/` — fonctions utilitaires pures sans DOM

**Ce qui est systématiquement mocké :** `next/navigation`, `next/image`, `next/link`, `react-modal`, `@fortawesome/react-fontawesome`, les hooks custom (`useFetch`, `useMutation`, `useDelete`), et les modales enfants (remplacées par des boutons déclencheurs pour tester l'état du parent sans passer par le formulaire complet).

**Ce qui n'est pas testé ici :** les Server Components (`Home`, pages de détail publiques, `practical-info`) — ils utilisent `async/await` côté serveur et ne sont pas compatibles avec jsdom. Ils relèvent des tests backend (Supertest) ou E2E (Playwright).

**Infrastructure :**
```
apps/frontend/
├── vitest.config.ts          globals: true, jsdom, setupFiles
└── tests/
    ├── tsconfig.json         paths @/* → ../src/*
    └── setup.ts              /// <reference types="vitest/globals" />, jest-dom
```

---

## Pourquoi les tests ne sont pas refactorisés

En lisant les fichiers de test, on remarque que certains blocs se répètent d'un fichier à l'autre : les mocks de `next/navigation`, `next/image`, `react-modal`, les objets de données fictives, etc. Ce n'est pas un oubli — c'est un choix délibéré. Voici pourquoi.

### Les blocs `vi.mock()` ne peuvent pas être extraits

C'est la contrainte la plus importante. En Vitest, tous les appels `vi.mock()` sont **hoisés** — le compilateur les remonte automatiquement en tête de fichier avant toute exécution, y compris avant les imports. Ce mécanisme est nécessaire pour que les mocks soient actifs au moment où les modules sont chargés.

Si on extrait un `vi.mock()` dans un fichier partagé et qu'on l'importe, le hoisting ne se produit plus : le mock arrive trop tard, le vrai module est déjà chargé, et le test échoue silencieusement. **Chaque fichier de test doit donc déclarer ses propres mocks** — c'est une limite de l'outil, pas du code.

### Les fixtures partagées ajoutent de l'indirection sans valeur

Les objets de données (`mockArtist`, `mockNewsItem`, `mockUserItem`) pourraient être centralisés dans un dossier `tests/fixtures/`. Techniquement, rien ne l'empêche.

Mais chaque fichier de test utilise des données adaptées à ce qu'il teste : des noms différents pour distinguer un artiste "avant" et "après" modification, des rôles spécifiques pour tester un filtre, une `created_at` précise pour tester un tri. Extraire ces données dans un fichier partagé forcerait à aller lire un second fichier pour comprendre un test — ce qui est exactement l'opposé de ce qu'on veut.

**Un test doit être compréhensible sans quitter le fichier.**

### Les helpers de formulaire sont trop spécifiques

Les fonctions `goToStep2`, `goToStep3`, `fillForm` sont propres à chaque composant : elles connaissent les placeholders exacts, les étapes, les labels. Les généraliser produirait une abstraction fragile qui casse dès qu'un label change dans l'interface.

### Résumé

| Ce qui se répète | Extractable ? | Pourquoi on ne le fait pas |
|---|---|---|
| Blocs `vi.mock()` | ❌ | Contrainte de hoisting Vitest — impossible techniquement |
| Objets de données fictives | ✅ | Ajouterait de l'indirection, chaque fichier a ses propres besoins |
| Helpers de formulaire | ✅ | Trop liés aux détails du composant, fragiles à extraire |

La répétition visible dans ces fichiers est le prix de la **lisibilité et de l'isolation** : chaque test file est autonome, se suffit à lui-même, et peut être lu, modifié ou supprimé sans impacter les autres.

---

## 1. Hooks

Les hooks encapsulent toute la logique d'appel API. Les tester en isolation garantit que la couche de données se comporte correctement indépendamment des composants.

---

### `tests/hooks/useFetch.test.ts`

Vérifie les trois états du cycle de vie d'un fetch : chargement, succès, erreur. Garantit que `isLoading`, `data` et `error` reflètent fidèlement l'état de la requête.

| # | Description | `it(...)` |
|---|---|---|
| 1 | État initial avant résolution de la promesse | `"demarre en etat isLoading: true, data: null"` |
| 2 | État après réponse réussie de l'API | `"passe en data et isLoading: false si l'API repond avec succes"` |
| 3 | État après erreur de l'API | `"passe en error et isLoading: false si l'API retourne une erreur"` |

---

### `tests/hooks/useMutation.test.ts`

Vérifie que le hook envoie correctement les requêtes (JSON et FormData), appelle `onSuccess` avec les bonnes données, et gère les erreurs et le reset. Couvre les deux types de body possibles.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Requête avec body JSON et headers corrects | `"appelle apiRequest avec la bonne methode et le bon body JSON"` |
| 2 | Requête avec FormData sans header Content-Type | `"appelle apiRequest avec un FormData sans header Content-Type"` |
| 3 | Callback `onSuccess` appelé avec les données | `"appelle onSuccess avec les donnees en cas de succes"` |
| 4 | `error` peuplé avec le message traduit en cas d'échec | `"peuple error avec le message traduit en cas d'echec"` |
| 5 | `reset()` remet `error` et `isLoading` à leur valeur initiale | `"reset() remet isLoading et error a leur valeur initiale"` |

---

### `tests/hooks/useDelete.test.ts`

Vérifie que le hook construit l'URL correctement (`endpoint/id`), met à jour `isDeleted` après succès, gère les erreurs et remet l'état à zéro via `reset()`.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Requête DELETE envoyée sur la bonne URL | `"appelle apiRequest avec DELETE sur endpoint/:id"` |
| 2 | `isDeleted` à `true` et `onSuccess` appelé après succès | `"met isDeleted a true et appelle onSuccess(id) en cas de succes"` |
| 3 | `error` peuplé avec le message traduit en cas d'échec | `"peuple error avec le message traduit en cas d'echec"` |
| 4 | `reset()` remet `isDeleted` et `error` à leur valeur initiale | `"reset() remet isDeleted et error a leur valeur initiale"` |

---

### `tests/hooks/useRoleGuard.test.ts`

Vérifie que le hook protège les routes admin en redirigeant vers `/admin/dashboard` si le rôle de l'utilisateur ne correspond pas aux autorisations de la route courante.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Aucune redirection si `adminUser` est null | `"ne redirige pas si adminUser est null"` |
| 2 | Aucune redirection si la route n'existe pas dans la navigation | `"ne redirige pas si la route ne correspond a aucun item de navigation"` |
| 3 | Aucune redirection si le rôle est autorisé | `"ne redirige pas si le role est autorise sur la route courante"` |
| 4 | Redirection si le rôle n'est pas autorisé | `"redirige vers /admin/dashboard si le role n'est pas autorise sur la route"` |

---

## 2. Composants

---

### `tests/components/DeleteModal.test.tsx`

Vérifie le cycle complet de la modale de suppression : confirmation, affichage de l'erreur API, message de succès et fermeture. Garantit que `getLabel` est bien utilisé pour personnaliser le texte de confirmation.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Clic sur "Confirmer" appelle `handleDelete` avec l'id | `"un clic sur Confirmer appelle handleDelete et getLabel est utilise dans le texte"` |
| 2 | Erreur API affichée sous le bouton | `"affiche l'erreur retournee par l'API si la suppression echoue"` |
| 3 | Message de succès et bouton "Confirmer" masqué quand `isDeleted` est `true` | `"affiche un message de succes quand isDeleted est true"` |
| 4 | Clic sur le bouton fermer appelle `onClose` | `"un clic sur le bouton fermer appelle onClose"` |

---

### `tests/components/AddArtistModal.test.tsx`

Vérifie la validation des 3 étapes, le comportement en mode édition (image optionnelle, champs pré-remplis), la validation des URLs YouTube/Spotify et l'affichage de l'erreur API.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Bouton de progression désactivé à chaque étape si les champs requis sont vides | `"le bouton de progression est desactive a chaque etape si les champs requis sont vides"` |
| 2 | Bouton "Suivant" actif à l'étape 2 sans nouvelle image en mode édition | `"ne desactive pas le bouton 'Suivant' a l'etape 2 sans nouvelle image en mode edition"` |
| 3 | Champs pré-remplis avec les données de `artistToEdit` | `"pre-remplit les champs avec les donnees de artistToEdit en mode edition"` |
| 4 | Clic sur le bouton fermer appelle `onClose` | `"un clic sur le bouton fermer appelle onClose"` |
| 5 | Erreur si l'URL YouTube ne correspond pas au domaine attendu | `"affiche une erreur si l'URL YouTube ne correspond pas au domaine attendu"` |
| 6 | Erreur si l'URL Spotify ne correspond pas au domaine attendu | `"affiche une erreur si l'URL Spotify ne correspond pas au domaine attendu"` |
| 7 | Erreur API affichée à l'étape 3 | `"affiche le message d'erreur API sur l'etape 3 si useMutation retourne une erreur"` |

---

### `tests/components/ArtistsContent.test.tsx`

Vérifie l'affichage des artistes, les mises à jour optimistes (ajout/suppression sans refetch) et le comportement différencié entre vue admin et vue publique (bouton "Supprimer" et badge "Page d'accueil").

| # | Description | `it(...)` |
|---|---|---|
| 1 | Affiche les artistes retournés par l'API | `"affiche les artistes retournes par l'API"` |
| 2 | Ajout optimiste : nouvel artiste visible sans refetch | `"ajoute l'artiste a la liste localement apres un ajout reussi"` |
| 3 | Suppression optimiste : artiste retiré sans refetch | `"retire l'artiste de la liste localement apres une suppression reussie"` |
| 4 | Bouton "Supprimer" absent en vue publique | `"masque le bouton 'Supprimer' en vue publique"` |
| 5 | Badge "Page d'accueil" visible en vue admin pour un artiste mis en avant | `"affiche le badge 'Page d'accueil' en vue admin pour un artiste mis en avant"` |
| 6 | Badge "Page d'accueil" absent en vue publique | `"masque le badge 'Page d'accueil' en vue publique"` |

---

### `tests/components/AddNewsModal.test.tsx`

Vérifie la validation des 2 étapes, le comportement en mode édition (image optionnelle, champs pré-remplis), la fermeture et l'affichage de l'erreur API.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Bouton de progression désactivé à chaque étape si les champs requis sont vides | `"le bouton de progression est desactive a chaque etape si les champs requis sont vides"` |
| 2 | Clic sur le bouton fermer appelle `onClose` | `"un clic sur le bouton fermer appelle onClose"` |
| 3 | Bouton "Modifier" actif sans nouvelle image en mode édition | `"ne desactive pas le bouton 'Modifier' sans nouvelle image en mode edition"` |
| 4 | Champs pré-remplis avec les données de `newsToEdit` | `"pre-remplit les champs avec les donnees de newsToEdit en mode edition"` |
| 5 | Erreur API affichée à l'étape 2 | `"affiche l'erreur retournee par l'API sur l'etape 2"` |

---

### `tests/components/NewsContent.test.tsx`

Vérifie l'affichage des news, les mises à jour optimistes, le tri par filtre, et le comportement différencié entre vue admin (badge "Brouillon", bouton "Supprimer") et vue publique (news non publiées filtrées).

| # | Description | `it(...)` |
|---|---|---|
| 1 | Affiche les news retournées par l'API | `"affiche les news retournees par l'API"` |
| 2 | Ajout optimiste : nouvelle news visible sans refetch | `"ajoute la news a la liste localement apres un ajout reussi"` |
| 3 | Suppression optimiste : news retirée sans refetch | `"retire la news de la liste localement apres une suppression reussie"` |
| 4 | Filtre "Plus ancien" inverse l'ordre de la liste | `"inverse l'ordre de la liste avec le filtre 'Plus ancien'"` |
| 5 | Badge "Brouillon" visible en vue admin pour une news non publiée | `"affiche le badge 'Brouillon' pour les news non publiees en vue admin"` |
| 6 | Bouton "Supprimer" absent en vue publique | `"masque le bouton 'Supprimer' en vue publique"` |
| 7 | Badge "Brouillon" absent en vue publique | `"masque le badge 'Brouillon' en vue publique"` |
| 8 | News non publiée absente de la liste en vue publique | `"masque les news non publiees en vue publique"` |

---

### `tests/components/AddUserModal.test.tsx`

Vérifie la validation du formulaire (tous les champs requis), la fermeture, la logique de découpe du `display_name` en prénom/nom en mode édition, et l'affichage de l'erreur API.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Bouton "Ajouter" désactivé si les champs requis sont vides | `"desactive le bouton 'Ajouter' si les champs requis sont vides"` |
| 2 | Clic sur le bouton fermer appelle `onClose` | `"un clic sur le bouton fermer appelle onClose"` |
| 3 | `display_name` découpé en prénom et nom en mode édition | `"splittes display_name en prenom et nom en mode edition"` |
| 4 | Erreur API affichée sous le bouton | `"affiche l'erreur retournee par l'API"` |

---

### `tests/components/ContactUs.test.tsx`

Vérifie que le formulaire de contact exige tous les champs, affiche un message de succès en remplaçant le formulaire après envoi, et expose l'erreur API.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Bouton "Envoyer" désactivé si les champs requis sont vides | `"desactive le bouton 'Envoyer' si les champs requis sont vides"` |
| 2 | Message de succès affiché et formulaire masqué après envoi réussi | `"affiche un message de succes et masque le formulaire apres envoi reussi"` |
| 3 | Erreur API affichée sous le bouton | `"affiche l'erreur retournee par l'API"` |

---

### `tests/components/Footer.test.tsx`

Vérifie que le footer gère correctement ses deux modales indépendantes (contact et mentions légales) : ouverture et fermeture.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Clic sur "Nous contacter" ouvre la modale contact | `"ouvre la modale contact au clic sur 'Nous contacter'"` |
| 2 | Clic sur "Mentions légales" ouvre la modale mentions | `"ouvre la modale mentions legales au clic sur 'Mentions legales'"` |
| 3 | Clic sur le bouton fermer ferme la modale | `"ferme la modale au clic sur le bouton fermer"` |

---

### `tests/components/ForgotPassword.test.tsx`

Vérifie que le formulaire de mot de passe oublié exige un email, affiche un message de succès après envoi et expose l'erreur API.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Bouton "Envoyer" désactivé si le champ email est vide | `"desactive le bouton 'Envoyer' si le champ email est vide"` |
| 2 | Message de succès affiché et formulaire masqué après envoi réussi | `"affiche un message de succes et masque le formulaire apres envoi reussi"` |
| 3 | Erreur API affichée sous le bouton | `"affiche l'erreur retournee par l'API"` |

---

### `tests/components/ChangePasswordModal.test.tsx`

Vérifie la validation client (champs requis, correspondance des mots de passe), le mode `forced` (bouton fermer masqué, bouton "Continuer" après succès), et l'affichage de l'erreur API.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Bouton "Modifier" désactivé si les 3 champs sont vides | `"desactive le bouton 'Modifier' si les champs sont vides"` |
| 2 | Clic sur le bouton fermer appelle `onClose` | `"un clic sur le bouton fermer appelle onClose"` |
| 3 | Erreur locale si les nouveaux mots de passe ne correspondent pas | `"affiche une erreur locale si les mots de passe ne correspondent pas"` |
| 4 | Message de succès et formulaire masqué après changement réussi | `"affiche le message de succes et masque le formulaire apres changement reussi"` |
| 5 | Erreur API affichée | `"affiche l'erreur retournee par l'API"` |
| 6 | Bouton fermer masqué en mode `forced` | `"masque le bouton fermer en mode forced"` |
| 7 | Bouton "Continuer" affiché après succès en mode `forced` | `"affiche le bouton 'Continuer' apres succes en mode forced"` |

---

### `tests/components/LoginPage.test.tsx`

Vérifie le formulaire de connexion : validation, affichage de l'erreur API, redirection après succès, et gestion de la modale mot de passe oublié.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Bouton "Envoyer" désactivé si email ou mot de passe est vide | `"desactive le bouton 'Envoyer' si email ou mot de passe est vide"` |
| 2 | Erreur API affichée si la connexion échoue | `"affiche l'erreur retournee par l'API si la connexion echoue"` |
| 3 | Redirection vers `/admin/dashboard` après connexion réussie | `"redirige vers /admin/dashboard apres connexion reussie"` |
| 4 | Clic sur "Mot de passe oublié" ouvre la modale | `"ouvre la modale mot de passe oublie au clic sur le bouton dedie"` |
| 5 | Clic sur le bouton fermer ferme la modale | `"ferme la modale mot de passe oublie au clic sur le bouton fermer"` |

---

### `tests/components/DashboardContent.test.tsx`

Vérifie que le tableau de bord affiche les informations de l'utilisateur connecté, filtre les raccourcis selon le rôle, gère l'ouverture de la modale de changement de mot de passe, et l'ouvre automatiquement en mode `forced` si `mustChangePassword` est vrai.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Rendu vide si `adminUser` est `null` | `"retourne null si adminUser est null"` |
| 2 | Affiche le `display_name` et le rôle de l'utilisateur connecté | `"affiche le display_name et le role de l'utilisateur connecte"` |
| 3 | Affiche uniquement les liens accessibles selon le rôle | `"affiche uniquement les liens accessibles selon le role"` |
| 4 | Clic sur "Modifier" ouvre la modale de changement de mot de passe | `"ouvre la modale au clic sur le bouton 'Modifier'"` |
| 5 | Modale ouverte automatiquement en mode `forced` si `mustChangePassword` est `true` | `"ouvre la modale en mode forced si mustChangePassword est true"` |

---

### `tests/components/UsersContent.test.tsx`

Vérifie les opérations CRUD optimistes sur la liste des utilisateurs, la mise à jour locale via le mécanisme d'override, et la redirection vers `/login` si l'utilisateur supprime son propre compte. Vérifie aussi l'ouverture des modales d'édition et de suppression.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Affiche les utilisateurs retournés par l'API | `"affiche les utilisateurs retournes par l'API"` |
| 2 | Ajout optimiste : nouvel utilisateur visible sans refetch | `"ajoute l'utilisateur a la liste localement apres un ajout reussi"` |
| 3 | Suppression optimiste : utilisateur retiré sans refetch | `"retire l'utilisateur de la liste localement apres une suppression reussie"` |
| 4 | Modification optimiste : `display_name` mis à jour via override sans refetch | `"met a jour l'utilisateur dans la liste localement apres une modification reussie"` |
| 5 | Redirection vers `/login` si l'utilisateur supprimé est l'utilisateur connecté | `"redirige vers /login si l'utilisateur supprime est l'utilisateur connecte"` |
| 6 | Clic sur "Modifier" ouvre la modale d'édition | `"clic sur 'Modifier' ouvre la modale d'edition"` |
| 7 | Clic sur "Supprimer" ouvre la modale de suppression | `"clic sur 'Supprimer' ouvre la modale de suppression"` |

---

### `tests/components/UsersPage.test.tsx`

Test d'intégration de la page utilisateurs complète. Vérifie que le filtre de rôle piloté par la page met à jour la liste via `UsersContent`, et que le bouton d'ajout ouvre la modale.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Clic sur un filtre de rôle n'affiche que les utilisateurs correspondants | `"filtre les utilisateurs par role apres clic sur un filtre"` |
| 2 | Clic sur "Ajouter un utilisateur" ouvre la modale d'ajout | `"ouvre la modale d'ajout au clic sur le bouton dedie"` |

---

### `tests/components/NewsPage.test.tsx`

Test d'intégration de la page news admin. Vérifie que le filtre de tri piloté par la page inverse l'ordre de la liste, et que le bouton d'ajout ouvre la modale.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Clic sur "Plus ancien" inverse l'ordre de la liste | `"inverse l'ordre de la liste apres clic sur le filtre 'Plus ancien'"` |
| 2 | Clic sur "Ajouter une news" ouvre la modale d'ajout | `"ouvre la modale d'ajout au clic sur le bouton dedie"` |

---

### `tests/components/ArtistsPage.test.tsx`

Test d'intégration de la page artistes admin. Vérifie que le filtre par date piloté par la page masque les artistes des autres jours, et que le bouton d'ajout ouvre la modale.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Clic sur un filtre de jour n'affiche que les artistes programmés ce jour-là | `"filtre les artistes par date apres clic sur un filtre de jour"` |
| 2 | Clic sur "Ajouter un artiste" ouvre la modale d'ajout | `"ouvre la modale d'ajout au clic sur le bouton dedie"` |

---

### `tests/components/AdminArtistDetailPage.test.tsx`

Vérifie que la page de détail artiste admin affiche les données de l'API et met à jour l'affichage localement après une modification réussie via `editedArtist` (sans refetch).

| # | Description | `it(...)` |
|---|---|---|
| 1 | Affiche les informations de l'artiste retourné par l'API | `"affiche les informations de l'artiste retourne par l'API"` |
| 2 | Mise à jour locale des informations après modification réussie | `"met a jour les informations affichees apres une modification reussie"` |

---

### `tests/components/AdminNewsDetailPage.test.tsx`

Vérifie que la page de détail news admin affiche les données de l'API et met à jour l'affichage localement après une modification réussie via `editedNews` (sans refetch).

| # | Description | `it(...)` |
|---|---|---|
| 1 | Affiche les informations de la news retournée par l'API | `"affiche les informations de la news retournee par l'API"` |
| 2 | Mise à jour locale des informations après modification réussie | `"met a jour les informations affichees apres une modification reussie"` |

---

## 3. Fonctions utilitaires

Fonctions pures sans DOM ni hooks — testées avec Vitest seul.

---

### `tests/functions/filterNavByRole.test.ts`

Vérifie que la fonction filtre correctement les items de navigation selon le rôle : items sans restriction toujours inclus, items filtrés selon le rôle, tableau vide si aucun item ne correspond.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Items sans champ `role` toujours inclus (ex : Logout) | `"retourne tous les items sans champ role (ex : Logout)"` |
| 2 | Seuls les items autorisés pour le rôle `admin` retournés | `"retourne uniquement les items autorises pour le role admin"` |
| 3 | Seuls les items autorisés pour le rôle `news` retournés | `"retourne uniquement les items autorises pour le role news"` |
| 4 | Tableau vide si aucun item ne correspond au rôle | `"retourne un tableau vide si aucun item ne correspond au role"` |

---

### `tests/functions/getApiErrorMessage.test.ts`

Vérifie que la fonction retourne le bon message selon le code HTTP : message explicite de l'API prioritaire, messages génériques pour 401/403/404/5xx, message de fallback pour les codes inconnus.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Message explicite de l'API retourné en priorité | `"retourne le message de l'API si celui-ci est explicite et non vide"` |
| 2 | Message générique 401 si absent | `"retourne le message generique 401 si le message est absent"` |
| 3 | Message générique 403 si absent | `"retourne le message generique 403 si le message est absent"` |
| 4 | Message générique 404 si absent | `"retourne le message generique 404 si le message est absent"` |
| 5 | Message générique serveur pour tout status >= 500 | `"retourne le message serveur pour tout status >= 500"` |
| 6 | Message de fallback pour un status inconnu | `"retourne le message de fallback pour un status inconnu"` |

---

### `tests/functions/formatDate.test.ts`

Vérifie le formatage des dates en français et la séparation date/heure pour l'affichage des concerts.

| # | Description | `it(...)` |
|---|---|---|
| 1 | Date ISO formatée en français long (jour + mois + année) | `"retourne une date en francais long"` |
| 2 | Objet retourné avec propriétés `date` et `time` distinctes | `"retourne un objet avec date et time separes"` |
| 3 | Heure au format `HH:MM` | `"retourne l'heure au format HH:MM"` |

---

### `tests/functions/validation.test.ts`

Vérifie la fonction `isEmpty` utilisée dans tous les formulaires pour bloquer la soumission si un champ est vide ou ne contient que des espaces.

| # | Description | `it(...)` |
|---|---|---|
| 1 | `true` pour une chaîne vide | `"retourne true pour une chaine vide"` |
| 2 | `true` pour une chaîne ne contenant que des espaces | `"retourne true pour une chaine ne contenant que des espaces"` |
| 3 | `false` pour une chaîne non vide | `"retourne false pour une chaine non vide"` |
