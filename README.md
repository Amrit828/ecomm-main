# Ecomm — Full-Stack E-Commerce Mini Project

A full-stack e-commerce application built with a React frontend and a Spring Boot microservices backend, backed by MongoDB.

## Live Deployment

- Frontend: https://amrit-shop-ecommerce.netlify.app
- Backend (auth-service): https://ecomm-main.onrender.com

## Architecture

- **frontend** — React 19 + TypeScript + Vite + Tailwind CSS v4
- **backend/auth-service** (port `8081`) — user registration, login, JWT issuance/validation
- **backend/product-service** (port `8082`) — product catalog
- **backend/cart-service** (port `8083`) — shopping cart
- **backend/order-service** (port `8084`) — order placement
- **MongoDB** — shared `EcommerceDB` database

Each backend service is an independent Spring Boot application; the frontend talks to them directly via their own base URLs.

## Running Locally

The easiest way to run the full stack is with Docker Compose:

```bash
docker-compose up --build
```

This starts MongoDB, all four backend services, and the frontend (served on port `80`).

### Environment Variables

| Variable | Used by | Purpose |
|---|---|---|
| `MONGO_URI` | all backend services | MongoDB connection string |
| `JWT_SECRET` | auth-service | secret used to sign/verify JWTs |
| `AUTH_SERVICE_URL` | product/cart/order-service | where to validate incoming JWTs |
| `PRODUCT_SERVICE_URL` | cart-service, order-service | product-service base URL |
| `CART_SERVICE_URL` | order-service, auth-service | cart-service base URL |
| `VITE_AUTH_URL`, `VITE_PRODUCT_URL`, `VITE_CART_URL`, `VITE_ORDER_URL` | frontend | backend service URLs baked in at build time |

### Running Services Individually

```bash
# Backend (from each service directory, e.g. backend/auth-service)
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Java, Spring Boot, Spring Security, Spring Data MongoDB
- **Database:** MongoDB
- **Deployment:** Netlify (frontend), Render (backend), MongoDB Atlas

---
This project was built as a mini project for an Internet Programming course.
