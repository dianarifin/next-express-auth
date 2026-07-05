# Next.js + Express Auth

Monorepo fullstack autentikasi dengan **Next.js 16** (frontend) dan **Express 5** (backend), menggunakan **JWT** stateless dan **Prisma** + **PostgreSQL**.

## Struktur Proyek

```
next-express-auth/
├── apps/
│   ├── web/          # Next.js 16 (port 3000)
│   └── backend/      # Express 5 (port 3001)
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── eslint-config/
│   └── typescript-config/
├── package.json      # Root monorepo (npm workspaces + Turbo)
└── turbo.json
```

## Prasyarat

- **Node.js** >= 18
- **PostgreSQL** — database harus sudah running

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup database

Buat database PostgreSQL, lalu buat file `.env` di `apps/backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nama_database"
JWT_SECRET="rahasia-kamu"
FRONTEND_URL="http://localhost:3000"
```

Jalankan sync schema:

```bash
cd packages/database
npm run db:push
```

### 3. Jalankan development

```bash
npm run dev
```

Menjalankan **web** (port 3000) dan **backend** (port 3001) secara bersamaan via Turbo.

---

## Perintah Umum

| Perintah              | Keterangan                  |
| --------------------- | --------------------------- |
| `npm run dev`         | Jalankan web + backend      |
| `npm run build`       | Build semua apps & packages |
| `npm run lint`        | Lint semua package          |
| `npm run check-types` | Type-check semua            |
| `npm run format`      | Prettier format             |

### Scoped commands

```bash
# Backend
cd apps/backend
npm run dev:watch    # Auto-restart saat ada perubahan

# Database
cd packages/database
npm run db:generate  # Regenerate Prisma client setelah ubah schema
npm run db:push      # Sync schema ke DB (tanpa migration)
npm run db:migrate   # Buat migration
npm run db:studio    # Buka Prisma Studio
```

---

## API Endpoints

### Auth

| Method | Endpoint                    | Auth | Role  | Deskripsi                 |
| ------ | --------------------------- | ---- | ----- | ------------------------- |
| POST   | `/auth/register`            | ✗    | —     | Register + auto-login     |
| POST   | `/auth/login`               | ✗    | —     | Login email/password      |
| GET    | `/auth/verify-email`        | ✗    | —     | Verifikasi email          |
| GET    | `/auth/resend-verification` | ✓    | —     | Kirim ulang verifikasi    |
| GET    | `/auth/google`              | ✗    | —     | Redirect ke Google OAuth  |
| GET    | `/auth/google/callback`     | ✗    | —     | Callback dari Google      |
| GET    | `/auth/me`                  | ✓    | —     | Lihat profile user        |
| GET    | `/auth/logout`              | ✓    | —     | Logout (invalidasi token) |
| GET    | `/auth/users`               | ✓    | ADMIN | List semua user           |
| PATCH  | `/auth/users/:userId/role`  | ✓    | ADMIN | Ubah role user            |

### Posts — semua butuh autentikasi

| Method | Endpoint     | Deskripsi                   |
| ------ | ------------ | --------------------------- |
| POST   | `/posts`     | Buat post baru              |
| GET    | `/posts`     | Lihat semua post milik user |
| GET    | `/posts/:id` | Lihat detail post           |
| PUT    | `/posts/:id` | Update post (hanya pemilik) |
| DELETE | `/posts/:id` | Hapus post (hanya pemilik)  |

---

## Alur Autentikasi

1. **Login** — user login via email/password atau Google OAuth
2. **JWT** — backend generate JWT, dikirim sebagai httpOnly cookie + response body
3. **LocalStorage** — frontend simpan token dari response body
4. **Authorization Header** — setiap request protected pakai `Bearer <token>`
5. **Logout** — backend increment `tokenVersion`, token lama jadi tidak valid

---

## Teknologi

| Bagian   | Teknologi                                         |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind v4, TanStack Query |
| Backend  | Express 5, Passport.js, JWT                       |
| Database | PostgreSQL, Prisma 7                              |
| Monorepo | Turbo, npm workspaces                             |
| Testing  | Vitest, Supertest                                 |

```

```
