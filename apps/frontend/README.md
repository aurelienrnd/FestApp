# 📦 Frontend Projet Vindhellfest - Architecture & Documentation
## Script :
- `docker compose up -d frontend` : Demarrer le frontend
- `docker compose restart frontend` : Redemarrer uniquement le frontend
- `docker compose logs -f frontend` : Consulter les logs

Pour executer une commande npm dans le conteneur : `docker exec -it vindhellfest-frontend`
- `npm run dev` : Lancer le serveur Next.js en developpement
- `npm run build` : Construire l'application
- `npm run start` : Demarrer l'application en production
- `npm run lint` : Verifier le code (ESLint)

## Stack technique
**Dependencies**
- `next` : Framework React pour le rendu hybride (SSR/SSG).
- `react` : Bibliotheque UI.
- `react-dom` : Rendu React dans le navigateur.

**DevDependencies**
- `@types/node` : Definitions TypeScript pour Node.js.
- `@types/react` : Definitions TypeScript pour React.
- `@types/react-dom` : Definitions TypeScript pour React DOM.
- `eslint` : Analyse statique du code.
- `eslint-config-next` : Regles ESLint pour Next.js.
- `tailwindcss` : Framework CSS utilitaire.
- `@tailwindcss/postcss` : Integration Tailwind via PostCSS.
- `typescript` : Compilateur TypeScript.

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

## Dockerfile
Ce Dockerfile definit la maniere dont l'application Next.js est installee, build, puis lancee.

## src/app/
- `page.tsx` : Page d'accueil.
- `layout.tsx` : Layout global (structure de base).
- `globals.css` : Styles globaux.
- Dossiers `admin`, `news`, `lineup`, `login`, `practical-info` : pages et sections principales.

## ESLint
ESLint verifie le code pour detecter les erreurs et maintenir un style coherent.
