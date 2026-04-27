# Build:  docker build -t ananya-fe --build-arg VITE_API_BASE_URL=http://<your-backend-ip>:5000 .
# Run:    docker run -d --name ananya-fe -p 5000:5000 ananya-fe
#         (-p host:container is required; without it, localhost:5000 will not work.)

# --- Build: install deps and produce static dist/ ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer cache)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* at build time only
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Path where the SPA is mounted (matches nginx rewrite prefix)
ARG BASE_PATH=/ananya-aegis/
ENV BASE_PATH=$BASE_PATH

RUN npm run build

# --- Run: static files only (small image, no Node in production) ---
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5000

CMD ["nginx", "-g", "daemon off;"]
