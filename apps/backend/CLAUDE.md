# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev           # run with tsx (no watch)
npm run dev:watch     # watch mode (recommended for active development)

# Production
npm run build         # compile TypeScript to dist/
npm run start         # run compiled output

# Quality
npm run lint          # ESLint
npm run check-types   # TypeScript type check (no emit)
```

## Architecture

This is the Express backend in a Turborepo monorepo (`apps/backend`). It handles authentication only — no business logic routes exist yet. Shared packages are referenced via `@repo/*` path aliases (e.g. `@repo/database/lib/prisma`).

### Authentication Flow

```
Browser → GET /auth/google
       → Google OAuth consent
       → GET /auth/google/callback
       → Passport Google strategy verify callback
       → Prisma upsert user in DB
       → generateJwt() → set httpOnly cookie + redirect frontend with token
```

Protected routes use the `authenticateJwt` middleware, which reads `Authorization: Bearer <token>`, calls `verifyJwt()`, and attaches decoded payload to `req.user`.

Logout is client-side only — the server returns a reminder to delete the cookie. There is no token blacklist.

### Module Layout (current)

```
src/
  index.ts                 # Express setup, middleware stack, route registration
  config/passport.ts       # Registers strategies with passport
  strategies/
    google-strategy.ts     # GoogleStrategy: verify callback, DB upsert
  middleware/
    authenticate-jwt.ts    # JWT Bearer token guard
  routes/
    auth.ts                # /auth/google, /auth/google/callback, /auth/me, /auth/logout
  utils/
    jwt.ts                 # generateJwt / verifyJwt, JwtPayload type
```

### Suggested Cleaner Structure

When the project grows beyond auth-only, reorganize around domain modules:

```
src/
  index.ts
  config/
    passport.ts
    cors.ts               # move CORS config here
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts  # move route handler logic out of routes file
      auth.service.ts     # DB operations (currently inline in strategy)
  strategies/
    google.strategy.ts
  middleware/
    authenticate-jwt.ts
    error-handler.ts      # centralized error handler (Express 5 supports async errors natively)
  utils/
    jwt.ts
  types/
    express.d.ts          # augment req.user type (currently untyped)
```

Key improvements this structure enables:

- `auth.controller.ts` separates HTTP concerns (cookie, redirect) from business logic
- `auth.service.ts` isolates Prisma calls, making strategies testable without DB
- `express.d.ts` types `req.user` as `JwtPayload` instead of `any`

### Session-Cookie Code (preserved as reference)

Commented-out session middleware lives in:

- `src/index.ts` — `express-session` setup, `passport.session()`
- `src/config/passport.ts` — `serializeUser` / `deserializeUser`
- `src/routes/auth.ts` — `{ session: true }` on the callback handler

This is intentional. The project uses JWT + httpOnly cookies as the active strategy; session-based code is kept as a learning reference.

### Key Env Variables

| Variable               | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | OAuth app credential                                                |
| `GOOGLE_CLIENT_SECRET` | OAuth app credential                                                |
| `GOOGLE_CALLBACK_URL`  | Must match Google Console redirect URI                              |
| `JWT_SECRET`           | Signing secret (defaults to `"your-secret-key"` — override in prod) |
| `DATABASE_URL`         | Neon PostgreSQL connection string                                   |

### JWT Token Lifecycle

- Generated: `expiresIn: "1h"` in `utils/jwt.ts`
- Stored: httpOnly cookie (`maxAge: 7 days`) + query param on redirect
- There is a mismatch — cookie lives 7 days but token expires in 1 hour. Fix by aligning the two, or implement refresh tokens.

### TypeScript Path Alias

`@/*` resolves to `./src/*` (configured in `tsconfig.json`). Use this for all internal imports instead of relative paths.
