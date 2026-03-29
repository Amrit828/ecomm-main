# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Accept API URLs as build args (Vite bakes these in at build time)
ARG VITE_AUTH_URL=http://localhost:8081
ARG VITE_PRODUCT_URL=http://localhost:8082
ARG VITE_CART_URL=http://localhost:8083
ARG VITE_ORDER_URL=http://localhost:8084
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_PRODUCT_URL=$VITE_PRODUCT_URL
ENV VITE_CART_URL=$VITE_CART_URL
ENV VITE_ORDER_URL=$VITE_ORDER_URL

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config to support React Router (client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
