# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the **monorepo root** unless noted.

```bash
npm run dev          # Start all apps (web :3000, backend :3001) concurrently via Turbo
npm run build        # Build all packages and apps
npm run lint         # Lint all packages
npm run check-types  # Type-check all packages (runs next typegen first for web)
npm run format       # Prettier format everything
```

Scoped to a single app (from its directory or with `--filter`):

```bash
# From apps/backend
npm run dev:watch    # tsx watch — auto-restart on change

# From packages/database
npm run db:generate  # Prisma client codegen after schema changes
npm run db:push      # Sync schema to DB without migration file
npm run db:migrate   # Create and apply a dev migration
npm run db:studio    # Open Prisma Studio
```

## Architecture

Turbo monorepo with two apps and two shared packages:

```
apps/web        – Next.js 16 / React 19, port 3000
apps/backend    – Express 5, port 3001
packages/database – Prisma 7 + PostgreSQL via @prisma/adapter-pg
```

### Auth Flow (JWT, stateless)

1. User hits `GET /api/auth/google` → redirected to Google consent screen.
2. Google redirects to `GET /api/auth/google/callback` → `googleCallback` controller.
3. Backend finds or creates the user via Prisma, generates a JWT, sets it as an **httpOnly cookie** (`token`), and redirects to `FRONTEND_URL/dashboard`.
4. Protected routes use the `authenticateJwt` middleware which reads the cookie and attaches `req.user`.
5. `GET /api/auth/me` returns the currently authenticated user.
6. `GET /api/auth/logout` clears the cookie; the frontend must also discard any stored token.

Session-based auth code exists but is commented out throughout — the active approach is JWT via cookie.

### Backend structure (`apps/backend/src/`)

```
index.ts             – Express setup (CORS, Helmet, Morgan, routes)
config/
  passport.ts        – Passport strategy registration
  cors.ts            – CORS config (allows :3000 with credentials)
  logger.ts          – Morgan request logging
modules/auth/
  auth.routes.ts     – Route definitions
  auth.controller.ts – googleCallback, getMe, logout
  auth.service.ts    – DB calls (find/create user)
middleware/
  authenticate-jwt.ts – JWT cookie verification, attaches req.user
  error-handler.ts
strategies/
  google.strategy.ts  – passport-google-oauth2 strategy
utils/jwt.ts          – generateJwt / verifyJwt helpers
```

### Frontend (`apps/web/`)

Uses Next.js App Router (`app/` directory). Currently has only the default Turborepo starter page. The `@repo/ui` package is the source for shared components — add new shared components there, not inline in the app.

### Database (`packages/database/`)

Prisma schema is at `packages/database/src/schema.prisma`. The Prisma client is exported from `packages/database/src/index.ts` and imported by the backend as `@repo/database`. After any schema change, run `db:generate` then restart the backend.

## Environment Variables

The backend reads from `apps/backend/.env`. Minimum required:

```
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```
