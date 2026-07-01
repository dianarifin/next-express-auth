# Backend — Express Auth API

REST API with **email/password** and **Google OAuth 2.0** authentication. Built with Express 5, Passport.js, and Prisma, running on port `3001`.

---

## Prerequisites

- Node.js >= 18
- npm or pnpm (this monorepo uses Turborepo)
- PostgreSQL database (this project uses [Neon](https://neon.tech))
- Google Cloud account with an OAuth 2.0 Client ID _(optional — hanya untuk Google login)_

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

**3. Sync database schema**

```bash
npm run db:push   # run from packages/database
```

**4. Start the development server**

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

#### `POST /auth/register`

Register a new user with email and password. Password is hashed with bcrypt before storage.

**Request body:**

```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "password": "minimal6karakter"
}
```

**Success response (201):**

```json
{
  "token": "<jwt>",
  "user": {
    "id": "clx...",
    "email": "budi@example.com",
    "name": "Budi",
    "avatarUrl": null,
    "role": "USER",
    "provider": "local"
  }
}
```

**Error responses:**

```json
{ "error": "Email already registered" }
```

```json
{ "error": "Password must be at least 6 characters" }
```

> Setelah register, user **auto-login** — token langsung dikembalikan dan disimpan sebagai httpOnly cookie.

---

#### `POST /auth/login`

Login with email and password.

**Request body:**

```json
{
  "email": "budi@example.com",
  "password": "minimal6karakter"
}
```

**Success response (200):**

```json
{
  "token": "<jwt>",
  "user": {
    "id": "clx...",
    "email": "budi@example.com",
    "name": "Budi",
    "avatarUrl": null,
    "role": "USER",
    "provider": "local"
  }
}
```

**Error responses:**

```json
{ "error": "Invalid email or password" }
```

```json
{ "error": "This account uses Google sign-in. Please sign in with Google." }
```

---

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
    "id": "clx...",
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "role": "USER",
    "provider": "google"
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

> The frontend must delete the token from localStorage after receiving this response.

---

### Posts

Semua endpoint posts **memerlukan autentikasi** (`Authorization: Bearer <token>`).

#### `POST /posts`

Create a new post.

**Request body:**

```json
{
  "title": "Judul post",
  "content": "Isi konten post (opsional)",
  "published": false
}
```

**Success response (201):**

```json
{
  "post": {
    "id": "clx...",
    "title": "Judul post",
    "content": "Isi konten post (opsional)",
    "published": false,
    "authorId": "clx...",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "updatedAt": "2026-07-01T00:00:00.000Z",
    "author": {
      "id": "clx...",
      "name": "Budi",
      "email": "budi@example.com",
      "avatarUrl": null
    }
  }
}
```

---

#### `GET /posts`

List all posts belonging to the authenticated user.

**Success response (200):**

```json
{
  "posts": [
    {
      "id": "clx...",
      "title": "Judul post",
      "content": "Isi konten",
      "published": false,
      "authorId": "clx...",
      "createdAt": "2026-07-01T00:00:00.000Z",
      "updatedAt": "2026-07-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /posts/:id`

Get a single post by ID. Hanya author yang bisa mengakses.

**Success response (200):**

```json
{
  "post": {
    "id": "clx...",
    "title": "Judul post",
    "content": "Isi konten",
    "published": false,
    "authorId": "clx...",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "updatedAt": "2026-07-01T00:00:00.000Z",
    "author": {
      "id": "clx...",
      "name": "Budi",
      "email": "budi@example.com",
      "avatarUrl": null
    }
  }
}
```

**Error responses:**

```json
{ "error": "Post not found" }
```

```json
{ "error": "Forbidden" }
```

---

## Auth Flow

### Email / Password

```
Frontend                          Backend
   │                                │
   │  POST /auth/register           │
   │  { name, email, password }     │
   │ ──────────────────────────────>│  bcrypt.hash(password)
   │                                │  Prisma.user.create
   │  { token, user }               │
   │ <──────────────────────────────│
   │                                │
   │  POST /auth/login              │
   │  { email, password }           │
   │ ──────────────────────────────>│  bcrypt.compare(password)
   │  { token, user }               │
   │ <──────────────────────────────│
   │                                │
   │  Simpan token ke localStorage  │
   │  Redirect ke /dashboard        │
```

### Google OAuth

```
Frontend                          Backend                      Google
   │                                │                            │
   │  GET /auth/google              │                            │
   │ ──────────────────────────────>│  Redirect ke Google consent│
   │ <──────────────────────────────│                            │
   │                                │                            │
   │  User login di Google          │                            │
   │ ──────────────────────────────│───────────────────────────>│
   │                                │                            │
   │  Google callback               │                            │
   │  GET /auth/google/callback     │                            │
   │ <──────────────────────────────│                            │
   │                                │  Upsert user via Prisma    │
   │                                │  Generate JWT              │
   │                                │  Set httpOnly cookie       │
   │  Redirect: /dashboard?token=X  │                            │
   │ <──────────────────────────────│                            │
```

---

## Using the Token in the Frontend

### Setelah login (email/password):

Token langsung dikembalikan di response JSON. Simpan ke `localStorage`:

```javascript
const res = await fetch("http://localhost:3001/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
  credentials: "include",
});

const { token, user } = await res.json();
localStorage.setItem("token", token);
```

### Setelah Google login:

Token dikirim sebagai query parameter setelah redirect:

```javascript
// Di halaman /dashboard
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
if (token) {
  localStorage.setItem("token", token);
  window.history.replaceState({}, "", "/dashboard");
}
```

### Untuk request selanjutnya:

```javascript
const res = await fetch("http://localhost:3001/auth/me", {
  headers: { Authorization: `Bearer ${token}` },
});
```

Tokens are valid for **1 hour** (`expiresIn: "1h"`).

---

## Shared Types

Backend dan frontend menggunakan type yang sama dari Prisma schema via `@repo/database/types`, sehingga response API konsisten di kedua sisi.

| Type | Deskripsi |
|---|---|
| `UserPublic` | Data user yang aman dikirim ke frontend |
| `JwtPayload` | Payload di dalam JWT (extends UserPublic) |
| `PostPublic` | Data post tanpa relasi author |
| `PostWithAuthor` | Data post termasuk informasi author |

---

## Libraries

| Library                  | Version   | Purpose                                                   |
| ------------------------ | --------- | --------------------------------------------------------- |
| `express`                | ^5.2.1    | Web framework                                             |
| `passport`               | ^0.7.0    | Authentication middleware                                 |
| `passport-google-oauth2` | ^0.2.0    | Google OAuth 2.0 strategy                                 |
| `jsonwebtoken`           | ^9.0.2    | Generate and verify JWTs                                  |
| `bcryptjs`               | ^2.4.3    | Password hashing                                          |
| `@repo/database`         | workspace | Shared Prisma client & types                              |
| `helmet`                 | ^8.2.0    | Security headers                                          |
| `cors`                   | ^2.8.6    | CORS configuration                                        |
| `morgan`                 | ^1.11.0   | HTTP request logging                                      |

### Dev Dependencies

| Library      | Purpose                                   |
| ------------ | ----------------------------------------- |
| `tsx`        | Run TypeScript directly without compiling |
| `typescript` | ^6.0.3                                    |
| `@types/*`   | Type definitions for all libraries above  |

---

## Architecture Notes

### JWT payload structure

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://...",
  "role": "USER",
  "provider": "local"
}
```

### Dua metode auth

|             | Email/Password (active)              | Google OAuth (active)                       |
| ----------- | ------------------------------------ | ------------------------------------------- |
| Endpoint    | `POST /auth/login`, `/register`      | `GET /auth/google`                          |
| Validasi    | bcrypt hash comparison               | Google OAuth 2.0 flow                       |
| User fields | `name`, `email`, `password`          | `googleId`, `provider: "google"`            |
| Multi-akun  | Satu email = satu akun               | Bisa gabung (field `provider` membedakan)   |

### Google OAuth setup

In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized redirect URIs** must include: `http://localhost:3001/auth/google/callback`
- For production, add your production callback URI as well
`
