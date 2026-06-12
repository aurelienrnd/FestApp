# --- 1 IMAGE DE BASE ---
# On choisit une image de base
FROM node:20-alpine AS base

# Répertoire de travail à l’intérieur du conteneur et suppression de la telemetry
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- 2 IMAGE DE DEPENDANCES
# installation des dépendances
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- 3 IMAGE DE BUILD ---
# Compilation de l'application Next.js, copie de dépendances de l'étape deps et build le projet
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- 4 IMAGE DE PRODUCTION ---
# installation des dépendances sans les dep de dev et d'un environement de production
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copie seulement les fichier utiliser pour la prod dans l'image de prod
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Ecoute sur le port 3000 et lance l’application quand le conteneur démarre
EXPOSE 3000
CMD ["npm", "run", "start"]


# --- 4 IMAGE DE DEV ---
# installation des dépendances sans les dep de dev et d'un environement de production
FROM base AS dev
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci
# Copie tout les fichier dans l'image de dev
COPY . .

# Ecoute sur le port 3000 et lance l’application quand le conteneur démarre
EXPOSE 3000
CMD ["npm", "run", "dev"]
