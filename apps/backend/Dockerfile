# Étape 1 : build TypeScript -> JavaScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier le code source et la config TS
COPY tsconfig.json ./
COPY src ./src

# Compiler TypeScript vers dist/
RUN npm run build

# Étape 2 : image de run, plus légère
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Installer uniquement les deps de prod
COPY package*.json ./
RUN npm install --only=production

# Copier les fichiers compilés
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
