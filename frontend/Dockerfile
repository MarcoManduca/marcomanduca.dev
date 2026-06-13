# --- Build stage ---
FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run generate:sitemap && npm run build

# --- Serve stage ---
FROM nginx:1.27-alpine

# Backend upstream for the /api proxy, templated at container start
ENV BACKEND_UPSTREAM=http://backend:8000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ > /dev/null || exit 1
