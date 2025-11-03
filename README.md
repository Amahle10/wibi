# Wibi (monorepo)

This repository contains a minimal scaffold for Wibi with two services:

- backend: Express + MongoDB API
- admin-web: Vite + React admin UI

Files added by scaffold:

- `backend/` - Express API, Dockerfile, `.env.example`
- `admin-web/` - Vite React app, Dockerfile
- `docker-compose.yml` - quick local compose to run backend + admin + caddy
- `Caddyfile`, `Caddyfile.dev` - example Caddy configs for production and development

Quick start (local, development):

1. From `wibi/backend` install deps and start backend:

```powershell
cd backend
npm install
npm run dev
```

2. From `wibi/admin-web` start the dev server:

```powershell
cd admin-web
npm install
npm run dev
```

3. The admin app default dev port is 5173 and backend is 5000. The Vite dev server proxies `/api` to `http://localhost:5000`.

Using docker-compose (production-ish):

```powershell
docker compose up --build
```

Notes:
- Fill `backend/.env.example` into `backend/.env` with a real `MONGO_URI` and `JWT_SECRET` before running in production.
- The scaffold provides minimal auth and ride models for a starting point.
