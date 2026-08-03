# STAGE 1

FROM node:24-alpine AS builder

WORKDIR /app

# Origen , destino
COPY package.json package-lock.json ./ 

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# STAGE 2

FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

COPY --from=builder /app/dist ./dist


RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD [ "node","dist/index.js" ]