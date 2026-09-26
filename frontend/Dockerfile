# --- Build stage ---
FROM node:24-slim AS build

WORKDIR /app

# Vite inlines VITE_* variables at build time, so they must be build args.
# Pass them with `--build-arg` (or `build.args` in docker-compose).
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_COGNITO_AUTHORITY=""
ARG VITE_COGNITO_CLIENT_ID=""
ARG VITE_COGNITO_REDIRECT_URI=""
ARG VITE_COGNITO_DOMAIN=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_COGNITO_AUTHORITY=$VITE_COGNITO_AUTHORITY \
    VITE_COGNITO_CLIENT_ID=$VITE_COGNITO_CLIENT_ID \
    VITE_COGNITO_REDIRECT_URI=$VITE_COGNITO_REDIRECT_URI \
    VITE_COGNITO_DOMAIN=$VITE_COGNITO_DOMAIN

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# `npm run build` also generates public/sitemap.xml before bundling.
RUN npm run build

# --- Serve stage (non-root nginx, listens on 8080) ---
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Backend upstream for the /api proxy, templated at container start
ENV BACKEND_UPSTREAM=http://backend:8000

COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8080/ > /dev/null || exit 1
