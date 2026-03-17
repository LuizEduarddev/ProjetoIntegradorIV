<<<<<<< HEAD
# Restaurant Management App (Monorepo)

This repository contains:

- `restaurant-api/`: Go 1.22 backend (Gin + pgx + JWT + PostgreSQL)
- `restaurant-app/`: React Native + Expo frontend (Zustand + React Query)

## Backend Quick Start

1. Copy env:

```bash
cp restaurant-api/.env.example restaurant-api/.env
```

2. Run PostgreSQL 15+ and apply migrations with `golang-migrate`:

```bash
migrate -path restaurant-api/migrations -database "postgres://postgres:postgres@localhost:5432/restaurant?sslmode=disable" up
```

3. Run API:

```bash
cd restaurant-api
go run ./cmd/server
```

4. Run backend tests:

```bash
cd restaurant-api
GOCACHE=$(pwd)/.gocache GOMODCACHE=$(pwd)/.gomodcache go test ./...
```

## Frontend Quick Start

1. Copy env:

```bash
cp restaurant-app/.env.example restaurant-app/.env
```

2. Install dependencies and run:

```bash
cd restaurant-app
npm install
npm start
```

3. Run frontend tests:

```bash
cd restaurant-app
npm test -- --runInBand --forceExit
```

## Seed Users

Migrations insert three users:

- `admin@restaurant.local` / `admin123`
- `waiter@restaurant.local` / `waiter123`
- `kitchen@restaurant.local` / `kitchen123`

## Auth Rule

- Public: `POST /auth/login`
- Every other endpoint requires `Authorization: Bearer <jwt>`
- JWT contains `user_id`, `email`, `role`
- Backend does not enforce role-based authorization
=======
>>>>>>> a787598bea88cc24b6e644b132cf93256fe831f1
# ProjetoIntegradorIV
