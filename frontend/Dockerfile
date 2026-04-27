# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --silent

COPY . .

ARG VITE_API_BASE_URL=http://134.33.132.134
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG BASE_PATH=/ananya-aegis-fe
ENV BASE_PATH=$BASE_PATH

RUN npm run build

# ---- Production Stage ----
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5000

CMD ["nginx", "-g", "daemon off;"]
