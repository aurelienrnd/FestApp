# Règles de typage — Backend

## Types partagés

Tout type utilisé dans 2+ fichiers va dans `src/type.ts` — jamais redéclaré inline ailleurs.

## Types locaux

Un type utilisé dans un seul fichier (schéma Zod interne, shape de requête temporaire) est déclaré inline dans ce fichier.

## Organisation

`src/type.ts` est divisé en sections commentées `// === NOM ===` — une par domaine métier (`USERS`, `ARTISTS`, `ARTICLES`...) plus une section `// === DB ===` pour les types de lignes internes sans équivalent dans les réponses API, et une section `// === EXPRESS ===` pour l'augmentation de `Express.Locals`.

## Alignement BDD

Un type qui représente une ligne retournée par PostgreSQL doit refléter exactement les contraintes de la colonne.
- Colonne `NOT NULL` → `string` (jamais `string | null`)
- Colonne nullable → `string | null`

## Alignement front/back

Les types qui traversent l'API (corps de réponse JSON envoyé au client) doivent être **identiques en nom et en structure** à leurs homologues dans le front.
- Un champ présent dans la réponse back doit exister dans le type front correspondant.
- Un champ absent de la réponse (filtré avant le `res.json`) ne doit pas apparaître dans le type front.
- Les champs internes au back (ex : `user_id`, `password_hash`) ne sont jamais exposés dans les types de réponse.

## Types dérivés

Préférer `Omit<T, ...>` et `Pick<T, ...>` pour les variantes d'un même type métier plutôt que redéclarer une interface similaire from scratch.

## Nommage

Les types de réponse API partagés avec le front portent le **même nom** des deux côtés (`ArtistListRow`, `ArticleRow`, etc.) pour faciliter la lecture croisée du code.
