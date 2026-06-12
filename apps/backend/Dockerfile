# --- 1 IMAGE de BUILD ---
# On choisit une image de base
FROM node:20-alpine AS builder

# Répertoire de travail à l’intérieur du conteneur
WORKDIR /app

# Copier les fichiers de dépendances et install (inclut devDependencies par défaut)
COPY package*.json ./
RUN npm install

# Copier le code source et la configuration TS.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# --- 2 IMAGE DE PRODUCTION ---
# On choisit une image de base
FROM node:20-alpine AS runner

# Répertoire de travail à l’intérieur du conteneur
WORKDIR /app
ENV NODE_ENV=production

# Copier les fichiers de dépendances de production et les installe
COPY package*.json ./
RUN npm install --only=production

# Copier les fichiers compilés depuis le build
COPY --from=builder /app/dist ./dist

# Ecoute sur le port 4000 et lance l’application quand le conteneur démarre
EXPOSE 4000
CMD ["node", "dist/index.js"]


# --- 3 IMAGE DE DEV ---
# Étape 3 : image de développement (avec hot reload)
FROM node:20-alpine AS dev

# Répertoire de travail à l’intérieur du conteneur
WORKDIR /app
ENV NODE_ENV=development

# Copier les fichiers de dépendances et les installe
COPY package*.json ./
RUN npm install

# Copier les fichiers compilés depuis le build
COPY tsconfig.json ./
COPY src ./src

# Ecoute sur le port 4000 et lance l’application quand le conteneur démarre
EXPOSE 4000
CMD ["npm", "run", "dev"]
