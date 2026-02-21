# =========================
# Frontend Dockerfile
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# --- Dev (Vite o Next hot reload) ---
FROM base AS dev
COPY package*.json ./
RUN npm ci || npm install
COPY . .
EXPOSE 3000
CMD ["npm","run","dev","--","--host"]

# --- Prod (Vite build estático con Nginx) ---
FROM base AS build-vite
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS prod-vite
COPY --from=build-vite /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

# --- Prod (Next SSR) ---
FROM base AS build-next
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS prod-next
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build-next /app/.next /app/.next
COPY --from=build-next /app/public /app/public
EXPOSE 3000
CMD ["npm","run","start"]
