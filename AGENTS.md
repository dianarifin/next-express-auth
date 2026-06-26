# AGENTS.md

## Commands (run from monorepo root)

```bash
npm run dev          # Start web (:3000) + backend (:3001) concurrently via Turbo
npm run build        # Build all packages and apps
npm run lint         # Lint all packages
npm run check-types  # Type-check all (runs next typegen first for web)
npm run format       # Prettier format everything
```

Scoped:
```bash
# From apps/backend
npm run dev:watch    # tsx watch — auto-restart on change

# From packages/database
npm run db:generate  # Prisma client codegen after schema changes
npm run db:push      # Sync schema to DB without migration file
npm run db:migrate   # Create and apply a dev migration
npm run db:studio    # Open Prisma Studio
```

Verification order: `lint` → `check-types` → `build`.

## Architecture

```
apps/web              — Next.js 16 / React 19, port 3000
apps/backend          — Express 5, port 3001
packages/database     — Prisma 7 + PostgreSQL via @prisma/adapter-pg
packages/eslint-config
packages/typescript-config
```

**No `@repo/ui` package exists** — UI components live in `apps/web/components/ui/`. Do NOT import from `@repo/ui`.

### Frontend (`apps/web/`)

- Next.js App Router — pages in `app/` directory
- Tailwind v4 — CSS-first config in `app/globals.css` (`@import "tailwindcss"`, no `tailwind.config.*`)
- Custom CSS utilities: `animate-fade-up`, `animate-fade-in`, `animate-scale-in`
- `@/*` path alias resolves to `apps/web/*`
- `lib/utils.ts` exports `cn()` via `clsx` + `tailwind-merge` (shadcn-style)
- Deps installed: `class-variance-authority`, `lucide-react`, `clsx`, `tailwind-merge`
- All cards and buttons use **`rounded-none`** (square corners) — this is an intentional design constraint
- `components/ui/` — shadcn-style base: `button.tsx`, `card.tsx`, `Avatar.tsx`, `Badge.tsx`, `icons.tsx`
- `components/auth/` — login: `login-card.tsx`, `google-button.tsx`, `trust-badges.tsx`
- `components/dashboard/` — dashboard: `navbar.tsx`, `stat-card.tsx`, `user-profile-card.tsx`, `spinner.tsx`
- Google sign-in button is an `<a>` tag linking to backend OAuth endpoint, NOT a `<button>`

### Backend (`apps/backend/src/`)

```
index.ts              — Express setup (CORS, Morgan, Passport, routes)
config/
  passport.ts         — Passport strategy registration
  cors.ts             — CORS config (allows :3000 with credentials)
  logger.ts           — Morgan request logging
modules/auth/
  auth.routes.ts      — Route definitions
  auth.controller.ts  — googleCallback, getMe, logout
  auth.service.ts     — DB calls (find/create user)
middleware/
  authenticate-jwt.ts — JWT cookie verification, attaches req.user
  error-handler.ts
strategies/
  google.strategy.ts
utils/
  jwt.ts              — generateJwt / verifyJwt helpers
```

- `@/*` path alias resolves to `apps/backend/src/*`
- Import database: `import { prisma } from "@repo/database/src/lib/prisma"` (NOT `@repo/database/lib/prisma`)

### Auth Flow (JWT via httpOnly cookie, stateless)

1. `GET /api/auth/google` → Google consent screen
2. Google redirects to `GET /api/auth/google/callback` → `googleCallback` controller
3. Backend upserts user via Prisma, generates JWT (`expiresIn: "1h"`), sets httpOnly `token` cookie (`maxAge: 7d`), redirects to `FRONTEND_URL/dashboard?token=<jwt>`
4. Dashboard reads token from URL query param, stores in `localStorage`, cleans URL
5. Protected routes use `authenticateJwt` middleware (reads cookie, attaches `req.user`)
6. `GET /api/auth/me` returns current user (uses `Authorization: Bearer <token>` header)
7. `GET /api/auth/logout` clears cookie — frontend must also `localStorage.removeItem("token")`
8. Token sent to backend via both cookie AND Authorization header depending on route — be consistent

### Database (`packages/database/`)

- Prisma schema: `packages/database/src/prisma/schema.prisma`
- Generated client: `packages/database/src/generated/prisma/`
- Client instance: `packages/database/src/lib/prisma.ts` (singleton, PrismaPg adapter)
- After schema change: `db:generate` then restart backend

## Conventions

- Use `@/` imports everywhere in both apps, never relative paths
- Google button must stay as `<a href={BACKEND + "/auth/google"}>` — it's an OAuth redirect, not an API call
- Token is stored in `localStorage` key `"token"` — both login and logout manage it
- Backend reads `DATABASE_URL` from `apps/backend/.env` (uses `dotenv/config` internally via Prisma lib)
- No test framework exists yet
- No CI/CD workflows configured
