# =========================
# Backend Dockerfile
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependencias del sistema para Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar variables de entorno para Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# --- Dev (hot-reload con nodemon) ---
FROM base AS dev
COPY package*.json ./
RUN npm ci || npm install
COPY . .
EXPOSE 8888
CMD ["npm","run","dev"]

# --- Prod (opcional) ---
FROM base AS build
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 8888
CMD ["node","src/server.js"]
