# Règles de typage — Backend

## Où déclarer un type

- **Utilisé dans 2+ fichiers** → `src/type.ts`
- **Utilisé dans 1 seul fichier, plusieurs fois** → type local en haut du fichier
- **Utilisé une seule fois** → inline directement là où c'est utilisé

## Alignement BDD

Un type qui représente une ligne retournée par PostgreSQL doit refléter exactement les contraintes de la colonne.

- Colonne `NOT NULL` → `string` (jamais `string | null`)
- Colonne nullable → `string | null`

## Types dérivés

Préférer `Omit<T, ...>` et `Pick<T, ...>` pour les variantes d'un même type métier plutôt que redéclarer une interface similaire from scratch.

## Nommage

Règle unique :

```
[Domaine][Usage]Row  →  résultat SQL, backend uniquement (jamais exposé au client)
[Domaine][Usage]     →  réponse API, partagée front/back (même nom des deux côtés)
```

- **`*Row`** : type interne backend, jamais envoyé au client (`UserCredentialsRow`, `AuthUserRow`, `SessionRow`...)
- **Sans suffixe** : type partagé, même nom et même structure côté front et côté back (`ArtistDetail`, `UserItem`, `NewsItem`...)

### Suffixes des types partagés

- **`*Item`** : forme complète d'une entité telle qu'exposée par l'API — par opposition aux variantes allégées (`UserItem`, `NewsItem`...)

> Un type nommé `*Row` ne doit jamais apparaître directement dans un `res.json()`.
