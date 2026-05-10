# Règles de typage — Frontend

## Où déclarer un type

- **Utilisé dans 2+ fichiers** → `src/type.ts`
- **Utilisé dans 1 seul fichier, plusieurs fois** → type local en haut du fichier
- **Utilisé une seule fois** → inline directement là où c'est utilisé

## Alignement API

Un type qui représente une réponse retournée par l'API doit refléter exactement les champs exposés.

- Champ toujours présent → `string` (jamais `string | null`)
- Champ nullable → `string | null`

## Types dérivés

Préférer `Omit<T, ...>` et `Pick<T, ...>` pour les variantes d'un même type métier plutôt que redéclarer une interface similaire from scratch.

## Nommage

Règle unique :

```
[Domaine][Usage]     →  réponse API, partagée front/back (même nom des deux côtés)
```

- **Sans suffixe** : type partagé, même nom et même structure que le back (`ArtistDetail`, `UserItem`, `NewsItem`...)
- **`*Item`** : forme complète d'une entité telle qu'exposée par l'API — par opposition aux variantes allégées (`UserItem`, `NewsItem`...)

> Un type partagé ne doit jamais contenir un champ absent de la réponse API.
