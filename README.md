# Next.js + Express Auth

Monorepo fullstack autentikasi dengan **Next.js 16** (frontend) dan **Express 5** (backend), menggunakan **JWT** stateless dan **Prisma** + **PostgreSQL**.

## Struktur Proyek

```

next-express-auth/
├── apps/
│ ├── web/ # Next.js 16 (port 3000)
│ └── backend/ # Express 5 (port 3001)
├── packages/
│ ├── database/ # Prisma schema & client
│ ├── eslint-config/
│ └── typescript-config/
├── package.json # Root monorepo (npm workspaces + Turbo)
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

Jalankan migrasi database:

```bash
cd packages/database
npm run db:push
```

### 3. Jalankan development

```bash
npm run dev
```

Perintah ini menjalankan **web** (port 3000) dan **backend** (port 3001) secara bersamaan via Turbo.

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
npm run test         # Jalankan test (Vitest)

# Database
cd packages/database
npm run db:generate  # Regenerate Prisma client setelah ubah schema
npm run db:push      # Sync schema ke DB (tanpa migration)
npm run db:migrate   # Buat migration
npm run db:studio    # Buka Prisma Studio
```

## API Endpoints

### Auth (`/auth`)

| Method | Endpoint                    | Auth         | Deskripsi                    |
| ------ | --------------------------- | ------------ | ---------------------------- |
| GET    | `/auth/google`              | -            | Redirect ke Google OAuth     |
| GET    | `/auth/google/callback`     | -            | Callback dari Google         |
| POST   | `/auth/register`            | -            | Daftar akun baru             |
| POST   | `/auth/login`               | -            | Login email/password         |
| GET    | `/auth/me`                  | Bearer Token | Lihat profile user           |
| GET    | `/auth/logout`              | Bearer Token | Logout (invalidasi token)    |
| GET    | `/auth/verify-email`        | -            | Verifikasi email via token   |
| GET    | `/auth/resend-verification` | Bearer Token | Kirim ulang email verifikasi |

### Posts (`/posts`) — semua butuh autentikasi

| Method | Endpoint     | Deskripsi                   |
| ------ | ------------ | --------------------------- |
| POST   | `/posts`     | Buat post baru              |
| GET    | `/posts`     | Lihat semua post milik user |
| GET    | `/posts/:id` | Lihat detail post           |
| PUT    | `/posts/:id` | Update post (hanya pemilik) |
| DELETE | `/posts/:id` | Hapus post (hanya pemilik)  |

## Alur Autentikasi

1. **Login** — user login via email/password atau Google OAuth
2. **JWT** — backend generate JWT, dikirim sebagai httpOnly cookie + response body
3. **LocalStorage** — frontend simpan token dari response body
4. **Authorization Header** — setiap request protected pakai `Bearer <token>`
5. **Logout** — backend increment `tokenVersion`, token lama jadi tidak valid

## Testing

```bash
cd apps/backend
npm run test          # Vitest run
```

Test menggunakan **Vitest** + **Supertest** — semua dependensi eksternal (database, email, Google OAuth) di-mock, jadi tidak perlu koneksi ke service sungguhan.

### Test coverage

| Endpoint                        | Sukses | Error         |
| ------------------------------- | ------ | ------------- |
| `GET /`                         | ✅     | -             |
| `POST /auth/register`           | ✅     | 400, 400, 500 |
| `POST /auth/login`              | ✅     | 400, 500      |
| `GET /auth/me`                  | ✅     | 401, 401, 401 |
| `GET /auth/logout`              | ✅     | -             |
| `GET /auth/resend-verification` | ✅     | -             |
| `POST /posts`                   | ✅     | 400           |
| `GET /posts`                    | ✅     | -             |
| `GET /posts/:id`                | ✅     | 404           |
| `PUT /posts/:id`                | ✅     | 403           |
| `DELETE /posts/:id`             | ✅     | 404           |

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
