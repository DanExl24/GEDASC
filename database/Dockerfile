# STAGE 1: BUILDER
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos de paquetes
COPY package.json package-lock.json ./ 

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# STAGE 2: PRODUCTION RUNNER
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD [ "node", "dist/index.js" ]