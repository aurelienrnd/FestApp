# Étape 1 : build TypeScript -> JavaScript (inchangé, utilisé pour l'image de prod)
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances et installer (inclut devDependencies par défaut)
COPY package*.json ./
RUN npm install

# Copier le code source et la configuration TS, puis compiler vers dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Étape 2 : image de production (runner) - plus légère, avec seulement les dépendances de prod
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Installer uniquement les deps de production
COPY package*.json ./
RUN npm install --only=production

# Copier les fichiers compilés depuis le build
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]

# Étape 3 : image de développement (avec hot reload)
FROM node:20-alpine AS dev

WORKDIR /app
ENV NODE_ENV=development

# Copier les fichiers de dépendances et installer TOUTES les dépendances (y compris dev)
COPY package*.json ./
RUN npm install

# Copier le code source (pour disposer d’un contexte initial dans l'image)
COPY tsconfig.json ./
COPY src ./src

# Exposer le port d'écoute de l'app en dev (ex: 4000)
EXPOSE 4000

# Lancer le serveur en mode développement (hot reload via ts-node-dev)
CMD ["npm", "run", "dev"]

