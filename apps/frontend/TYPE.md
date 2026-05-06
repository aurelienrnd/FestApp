# Règles de typage — Frontend

## Types partagés

Tout type utilisé dans 2+ fichiers va dans `src/types/index.ts` — jamais redéclaré inline ailleurs.

## Types locaux

Les props internes d'un composant ou d'une page utilisés dans un seul fichier sont déclarés inline dans ce fichier.

## Organisation

`src/types/index.ts` est divisé en sections commentées `// === NOM ===` — une par domaine métier (`USERS`, `ARTISTS`, `ARTICLES`...) plus une section `// === UI ===` pour les types purement front sans équivalent API.

## Pas de shapes répétées

Si la même structure `{ id: string; name: string; ... }` apparaît dans 2+ fichiers, c'est un type à extraire dans `src/types/index.ts`.

## Alignement back/front

Un type front qui reflète une réponse API ne doit jamais contenir un champ absent du back. Les sous-ensembles intentionnels (`Omit`, `Pick`) sont autorisés — c'est une réduction, pas une divergence.

## Types dérivés

Préférer `Omit<T, ...>` et `Pick<T, ...>` pour les variantes d'un même type métier plutôt que redéclarer une interface similaire from scratch.
