# 📦 Frontend Projet Vindhellfest - Architecture & Documentation
## Script :
- `docker compose up -d frontend` : Demarrer le frontend
- `docker compose restart frontend` : Redemarrer uniquement le frontend
- `docker compose logs -f frontend` : Consulter les logs

Pour executer une commande npm dans le conteneur : `docker exec -it vindhellfest-frontend`
- `npm run lint` : 	Vérifier le code (ESLint)
- `npm run format` : 	Formater ton code auto avec Prettier
- `npm test` : Lancer les tests vitetest

## Stack technique
**Dependencies**
- `next` : Framework React pour le rendu hybride (SSR/SSG).
- `react` : Bibliothèque UI.
- `react-dom` : Rendu React dans le navigateur.
- `react-modal` : Composant de modale accessible.
- `@fortawesome/react-fontawesome` : Composants Font Awesome pour React.
- `@fortawesome/free-solid-svg-icons` : Pack d’icônes solid Font Awesome.
- `@fortawesome/fontawesome-svg-core` : Cœur Font Awesome.

**DevDependencies**
- `@types/node` : Définitions TypeScript pour Node.js.
- `@types/react` : Définitions TypeScript pour React.
- `@types/react-dom` : Définitions TypeScript pour React DOM.
- `@types/react-modal` : Définitions TypeScript pour React Modal.
- `eslint` : Analyse statique du code.
- `eslint-config-next` : Règles ESLint pour Next.js.
- `tailwindcss`: Framework CSS utilitaire.
- `@tailwindcss/postcss` : Intégration Tailwind via PostCSS.
- `typescript` : Compilateur TypeScript.
- `vitest` : Runner de tests.
- `@testing-library/react` : Tests de composants React.
- `@testing-library/jest-dom` : Matchers DOM pour tests.
- `@testing-library/user-event` : Simulation d’interactions utilisateur.
- `jsdom` : Environnement DOM pour tests.
- `prettier` : Formateur de code automatique.

## Architecture
```bash
├─ .next/
├─ node_modules/
├─ public/
├─ src/
│  ├─ app/
│  │  └─ admin/
│  │     ├─ dashboard/
│  │     │  ├─ lineup/
│  │     │  ├─ news/
│  │     │  └─ users/
│  │     ├─ lineup/
│  │     ├─ login/
│  │     ├─ news/
│  │     └─ practical-info/
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ .dockerignore
├─ .gitignore
├─ Dockerfile
├─ eslint.config.mjs
├─ next.config.ts
├─ package.json
├─ package-lock.json
├─ postcss.config.mjs
├─ tsconfig.json
└─ README.md
```

## 📄 Dockerfile
Le projet utilise un Dockerfile multi-stage pour generer deux types d'images a partir du meme fichier :
une image de developpement et une image de production.
Le front beneficie de 5 stages car il possaide plus de dependances, ce qui optimise la taille et le temps de rebuild, alors que le back se contente de 3 stages.
- Base commune : `node:20-alpine`.
- Stage `deps` : installation des dependances.
- Stage `builder` : copie des dependances, copie du code et lancement du build.
- Image de production (`runner`)
- Image de developpement (`dev`)

## 📁 src/
### 📁 app/
- **📄 globals.css :** 
Déclare les variables CSS globales, les thèmes admin/visitor et quelques utilitaires Tailwind.

- **📄 layout.tsx :** Layout racine Next.js : charge la police Google, définit les métadonnées SEO et enveloppe l’app avec le provider + bannière + footer.

- **📄 page.tsx :** Page d’accueil par défaut (route /).

Les autres dossiers regroupent les routes Next.js de l’app (pages)

### 📁 components/
Contient les composants UI réutilisables (Banner, footer, navigation, provider).

### 📁 config/
Centralise les constantes et paramètres de configuration du frontend.

## 📁 test
Ce dossier regroupe les tests unitaires et d’intégration côté front : Vitest exécute les tests et les assertions, tandis que Testing Library valide le rendu et les interactions. Les tests s’appuient sur jsdom pour simuler le navigateur et vérifier le comportement des composants et des pages dans un environnement contrôlé.

## ESLint & Prettier
Dans ce projet, deux outils complémentaires assurent la qualité du code :

### ESLint — Analyseur de code
ESLint est un analyseur statique qui vérifie le code TypeScript/JavaScript pour détecter :
- erreurs de logique
- mauvaises pratiques
- variables non utilisées
- types incorrects
- règles de style définies par l’équipe
- incohérences dans l’organisation du code

### Prettier — Formateur automatique (style du code uniquement)
Il ne vérifie pas les bugs, il s’occupe uniquement de :
- indentation
- guillemets
- trailing commas
- espaces
- retours à la ligne
- mise en forme des objets et fonctions




