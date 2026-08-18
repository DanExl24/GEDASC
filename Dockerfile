# STAGE 1: BUILDER
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=https://api-gedasc.adsoproject.dev
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# STAGE 2: NGINX SERVE
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80