
# Backend — Express Auth API

REST API with **email/password** and **Google OAuth 2.0** authentication. Built with Express 5, Passport.js, and Prisma, running on port `3001`.

---

## Prerequisites

- Node.js >= 18
- npm or pnpm (this monorepo uses Turborepo)
- PostgreSQL database
- Google Cloud account with an OAuth 2.0 Client ID _(optional — hanya untuk Google login)_

---

## Setup

**1. Install dependencies** (run from the monorepo root)

```bash
npm install
```

**2. Create a `.env` file** inside `apps/backend/`

```env
# Google OAuth
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
```

---

## Scripts

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Run server once via tsx               |
| `npm run dev:watch`   | Run with hot-reload                   |
| `npm run build`       | Compile TypeScript to `dist/`         |
| `npm run start`       | Run compiled output (`dist/index.js`) |
| `npm run lint`        | Run ESLint                            |
| `npm run check-types` | TypeScript type check without emit    |

---

## API Endpoints

Base URL: `http://localhost:3001`

### Health

```
GET /
```

```json
{ "message": "Hello from backend!" }
```

---

### Authentication — Email/Password

#### `POST /auth/register`

Membuat user baru + auto-login. Password di-hash dengan bcrypt.

**Request body:**

```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "password": "minimal6karakter"
}
```

**Success (201):**

```json
{
  "token": "<jwt>",
  "user": {
    "id": "clx...",
    "email": "budi@example.com",
    "name": "Budi",
    "avatarUrl": null,
    "role": "USER",
    "emailVerified": false
  }
}
```

**Error:**

```json
{ "error": "Email already registered" }
```
```json
{ "error": "Password must be at least 6 characters" }
```

---

#### `POST /auth/login`

**Request body:**

```json
{
  "email": "budi@example.com",
  "password": "minimal6karakter"
}
```

**Success (200):**

```json
{
  "token": "<jwt>",
  "user": {
    "id": "clx...",
    "email": "budi@example.com",
    "name": "Budi",
    "avatarUrl": null,
    "role": "USER"
  }
}
```

**Error:**

```json
{ "error": "Invalid email or password" }
```
```json
{ "error": "This account uses Google sign-in. Please sign in with Google." }
```

---

#### `GET /auth/verify-email`

Verifikasi alamat email menggunakan token yang dikirim via email.

**Query parameter:**

```
?token=<verification_token>
```

**Success (200):**

```json
{
  "message": "Email berhasil diverifikasi",
  "emailVerified": true
}
```

---

#### `GET /auth/resend-verification`

Kirim ulang email verifikasi. **Requires auth** (`Authorization: Bearer <token>`).

**Success (200):**

```json
{ "message": "Email verifikasi telah dikirim ulang" }
```

---

### Authentication — Google OAuth

#### `GET /auth/google`

Redirect browser ke Google consent screen.

```
http://localhost:3001/auth/google
```

> Navigate langsung di browser — jangan panggil dengan fetch/axios.

---

#### `GET /auth/google/callback`

Callback dari Google setelah user menyetujui consent. Jangan panggil manual.

1. Passport verifikasi kode OAuth dengan Google
2. User di-upsert via Prisma
3. JWT di-generate, diset sebagai httpOnly cookie
4. Redirect ke `FRONTEND_URL/dashboard?token=<jwt>`

---

### Authentication — Protected

Semua endpoint di bawah ini memerlukan `Authorization: Bearer <token>`.

#### `GET /auth/me`

Mengembalikan data user yang sedang login.

**Success (200):**

```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": null,
    "role": "USER",
    "provider": "local",
    "emailVerified": false,
    "tokenVersion": 0
  }
}
```

**Error (401):**

```json
{ "error": "Invalid token" }
```

---

#### `GET /auth/logout`

Menghapus cookie token dan meng-increment `tokenVersion` di database (membuat token lama tidak valid).

**Success (200):**

```json
{ "message": "Logout berhasil, hapus token di client" }
```

> Frontend juga harus menghapus token dari localStorage.

---

#### `GET /auth/users`

Mengembalikan semua user. **Admin only** (role: `ADMIN`).

**Success (200):**

```json
{
  "users": [
    {
      "id": "clx...",
      "name": "Budi",
      "email": "budi@example.com",
      "role": "USER",
      "provider": "local"
    }
  ]
}
```

**Error (403):**

```json
{ "error": "Only admins can view all users" }
```

---

#### `PATCH /auth/users/:userId/role`

Mengubah role user. **Admin only.**

**Request body:**

```json
{ "role": "ADMIN" }
```

**Success (200):**

```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "clx...",
    "email": "budi@example.com",
    "name": "Budi",
    "role": "ADMIN"
  }
}
```

**Error:**

```json
{ "error": "Only admins can change user roles" }
```
```json
{ "error": "Role must be either USER or ADMIN" }
```

---

### Posts — CRUD

Semua endpoint posts **memerlukan autentikasi** (`Authorization: Bearer <token>`).

#### `POST /posts`

Buat post baru.

**Request body:**

```json
{
  "title": "Judul post",
  "content": "Isi konten (opsional)",
  "published": false
}
```

**Success (201):**

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

---

#### `GET /posts`

List semua post milik user yang login.

**Success (200):**

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

Detail satu post (hanya author yang bisa akses).

**Success (200):**

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

**Error:**

```json
{ "error": "Post not found" }
```
```json
{ "error": "Forbidden" }
```

---

#### `PUT /posts/:id`

Update post (hanya author).

**Request body (semua field opsional):**

```json
{
  "title": "Judul baru",
  "content": "Konten baru",
  "published": true
}
```

**Success (200):**

```json
{
  "post": {
    "id": "clx...",
    "title": "Judul baru",
    "content": "Konten baru",
    "published": true,
    "authorId": "clx...",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "updatedAt": "2026-07-02T00:00:00.000Z",
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

#### `DELETE /posts/:id`

Hapus post (hanya author).

**Success (200):**

```json
{ "message": "Post deleted successfully" }
```

---

## Ringkasan Endpoint

| Method   | Path                          | Auth     | Role    | Deskripsi                |
| -------- | ----------------------------- | -------- | ------- | ------------------------ |
| `GET`    | `/`                           | ✗        | —       | Health check             |
| `POST`   | `/auth/register`              | ✗        | —       | Register + auto-login    |
| `POST`   | `/auth/login`                 | ✗        | —       | Login email/password     |
| `GET`    | `/auth/verify-email`          | ✗        | —       | Verifikasi email         |
| `GET`    | `/auth/resend-verification`   | ✓        | —       | Kirim ulang verifikasi   |
| `GET`    | `/auth/google`                | ✗        | —       | Google OAuth redirect    |
| `GET`    | `/auth/google/callback`       | ✗        | —       | Google callback          |
| `GET`    | `/auth/me`                    | ✓        | —       | Profile user saat ini    |
| `GET`    | `/auth/logout`                | ✓        | —       | Logout + invalidate JWT  |
| `GET`    | `/auth/users`                 | ✓        | ADMIN   | List semua user          |
| `PATCH`  | `/auth/users/:userId/role`    | ✓        | ADMIN   | Ubah role user           |
| `POST`   | `/posts`                      | ✓        | —       | Buat post                |
| `GET`    | `/posts`                      | ✓        | —       | List post saya           |
| `GET`    | `/posts/:id`                  | ✓        | —       | Detail post              |
| `PUT`    | `/posts/:id`                  | ✓        | —       | Update post              |
| `DELETE` | `/posts/:id`                  | ✓        | —       | Hapus post               |

---

## Auth Flow Singkat

### Email / Password

```
POST /auth/register  → { token, user }  → simpan token di localStorage
POST /auth/login     → { token, user }  → simpan token di localStorage
```

### Google OAuth

```
GET /auth/google  → redirect ke Google → callback → redirect ke /dashboard?token=<jwt>
```

### Request selanjutnya

```
Authorization: Bearer <token>
```

Token valid **1 jam** (`expiresIn: "1h"`). Logout meng-increment `tokenVersion` — semua token lama otomatis invalid.

---

## Libraries

| Library                  | Version | Purpose                      |
| ------------------------ | ------- | ---------------------------- |
| `express`                | ^5.2.1  | Web framework                |
| `passport`               | ^0.7.0  | Authentication middleware    |
| `passport-google-oauth2` | ^0.2.0  | Google OAuth 2.0 strategy    |
| `jsonwebtoken`           | ^9.0.2  | Generate and verify JWTs     |
| `bcryptjs`               | ^2.4.3  | Password hashing             |
| `@repo/database`         | workspace | Shared Prisma client & types |
| `helmet`                 | ^8.2.0  | Security headers             |
| `cors`                   | ^2.8.6  | CORS configuration           |
| `morgan`                 | ^1.11.0 | HTTP request logging         |

---

## Google OAuth Setup

Di [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized redirect URIs** harus mencakup: `http://localhost:3001/auth/google/callback`
- Untuk production, tambahkan production callback URI juga
