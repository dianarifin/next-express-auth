# Backend — Express Auth API

REST API for authentication based on **Google OAuth 2.0 + JWT**. Built with Express 5 and Passport.js, running on port `3001`.

---

## Prerequisites

- Node.js >= 18
- npm or pnpm (this monorepo uses Turborepo)
- Google Cloud account with an OAuth 2.0 Client ID
- PostgreSQL database (this project uses [Neon](https://neon.tech))

---

## Setup

**1. Install dependencies** (run from the monorepo root)

```bash
npm install
```

**2. Create a `.env` file** inside `apps/backend/`

```env
# Google OAuth — create credentials at https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# JWT — replace with a long random string
JWT_SECRET=replace-with-a-strong-secret

# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Optional
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**3. Start the development server**

```bash
npm run dev:watch   # with hot-reload (recommended)
# or
npm run dev         # single run, no hot-reload
```

---

## Scripts

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Run server once via tsx                |
| `npm run dev:watch`   | Run with hot-reload                    |
| `npm run build`       | Compile TypeScript to `dist/`          |
| `npm run start`       | Run compiled output (`dist/index.js`)  |
| `npm run lint`        | Run ESLint                             |
| `npm run check-types` | TypeScript type check without emitting |

---

## API Endpoints

Base URL: `http://localhost:3001`

### Health Check

```
GET /
```

Response:

```json
{ "message": "Hello from backend!" }
```

---

### Authentication

#### `GET /auth/google`

Initiates the Google login flow. Redirects the browser to the Google consent screen.

**Usage:** Navigate the browser directly to this URL — do not call it with fetch/axios.

```
http://localhost:3001/auth/google
```

---

#### `GET /auth/google/callback`

Automatic callback from Google after the user approves consent. Do not call this manually.

**What happens here:**

1. Passport verifies the authorization code with Google
2. User is found or created in the database via Prisma
3. A JWT token is generated
4. Token is set as an `httpOnly` cookie
5. Browser is redirected to `FRONTEND_URL/dashboard?token=<jwt>`

---

#### `GET /auth/me`

Returns the currently authenticated user's data. **Requires a valid JWT.**

**Request header:**

```
Authorization: Bearer <token>
```

**Success response (200):**

```json
{
  "user": {
    "id": "cuid-user-id",
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": "https://lh3.googleusercontent.com/..."
  }
}
```

**Error responses (401):**

```json
{ "error": "Unauthorized" }
```

```json
{ "error": "Invalid token" }
```

---

#### `GET /auth/logout`

Instructs the frontend to delete the token. The server holds no state, so there is no session to destroy server-side.

**Response (200):**

```json
{ "message": "Logout berhasil, hapus token di client" }
```

> The frontend must delete the token from its cookie or localStorage after receiving this response.

---

## Using the Token in the Frontend

After a successful Google login, the token is delivered in two ways:

1. **`httpOnly` cookie** — set automatically by the backend, safe from XSS
2. **Query param** — `http://localhost:3000/dashboard?token=<jwt>`

For subsequent requests to protected endpoints, send the token in the `Authorization` header:

```javascript
// Using fetch
const res = await fetch("http://localhost:3001/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Using axios
axios.get("http://localhost:3001/auth/me", {
  headers: { Authorization: `Bearer ${token}` },
});
```

Tokens are valid for **1 hour** (`expiresIn: "1h"`).

---

## Libraries

| Library                  | Version   | Purpose                                                   |
| ------------------------ | --------- | --------------------------------------------------------- |
| `express`                | ^5.2.1    | Web framework                                             |
| `passport`               | ^0.7.0    | Authentication middleware                                 |
| `passport-google-oauth2` | ^0.2.0    | Google OAuth 2.0 strategy                                 |
| `jsonwebtoken`           | ^9.0.2    | Generate and verify JWTs                                  |
| `@repo/database`         | workspace | Shared Prisma client                                      |
| `helmet`                 | ^8.2.0    | Security headers                                          |
| `cors`                   | ^2.8.6    | CORS configuration                                        |
| `cookie-parser`          | ^1.4.7    | Cookie parsing                                            |
| `express-session`        | ^1.19.0   | Session support (installed but inactive — see note below) |

### Dev Dependencies

| Library      | Purpose                                   |
| ------------ | ----------------------------------------- |
| `tsx`        | Run TypeScript directly without compiling |
| `typescript` | ^6.0.3                                    |
| `@types/*`   | Type definitions for all libraries above  |

---

## Architecture Notes

### Why is some code commented out?

The session-based auth code (`express-session`, `passport.session()`, `serializeUser`) is intentionally preserved as a **learning reference**. The active strategy is **JWT + httpOnly cookie**.

Summary of the difference:

|             | Session-based (commented out)              | JWT-based (active)                   |
| ----------- | ------------------------------------------ | ------------------------------------ |
| State       | Stored on the server (session store)       | Stateless — state lives in the token |
| Logout      | Destroy session on the server              | Delete token on the client           |
| Scalability | Requires sticky sessions or a shared store | Easy to scale horizontally           |

### JWT payload structure

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://..."
}
```

### Google OAuth setup

In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized redirect URIs** must include: `http://localhost:3001/auth/google/callback`
- For production, add your production callback URI as well
