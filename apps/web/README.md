# Auth App — Frontend

Frontend untuk aplikasi autentikasi JWT dengan Next.js 16 App Router dan Express backend.

## Tech Stack

- **Next.js 16** — App Router, Server Components
- **React 19**
- **Tailwind CSS v4** — CSS-first config (`@import "tailwindcss"`)
- **TanStack Query v5** — Server state management (posts, users)
- **React Hook Form + Zod** — Form validation
- **shadcn/ui** — Komponen UI (Button, Card, Dialog, dll.)
- **Lucide React** — Ikon

## Struktur Halaman

| Route | Deskripsi | Akses |
|-------|-----------|-------|
| `/` | Halaman utama / landing | Publik |
| `/login` | Login email/password + Google OAuth | Publik (redirect jika sudah login) |
| `/register` | Registrasi akun baru | Publik (redirect jika sudah login) |
| `/verify-email` | Verifikasi email (token dari URL) | Publik |
| `/dashboard` | Dashboard pengguna (info akun, statistik) | Perlu login |
| `/posts` | Daftar postingan milik pengguna | Perlu login |
| `/posts/new-post` | Buat postingan baru | Perlu login |
| `/posts/[id]` | Detail postingan | Perlu login |
| `/posts/[id]/edit-post` | Edit postingan | Perlu login |
| `/users` | Manajemen pengguna (Admin Panel) | ADMIN saja |

## Alur Autentikasi

1. **Register** — Isi form → `POST /auth/register` → simpan token → redirect ke `/dashboard`
2. **Login** — Isi form → `POST /auth/login` → simpan token → redirect ke `/dashboard`
3. **Google OAuth** — Klik tombol → redirect ke backend `/auth/google` → callback → token di URL → simpan ke `localStorage` → redirect ke `/dashboard`
4. **Verifikasi Email** — Link dari email → `/verify-email?token=...` → `GET /auth/verify-email` → tampilkan status

Token JWT disimpan di `localStorage` (key: `"token"`) dan dikirim via header `Authorization: Bearer <token>`.

## Komponen

### Auth (`components/auth/`)
- `LoginCard` — Form login email/password + tombol Google
- `RegisterCard` — Form registrasi (name, email, password, confirm password) + tombol Google
- `RequireAuth` — Wrapper: redirect ke `/login` jika tidak ada token
- `RedirectIfAuthenticated` — Wrapper: redirect ke `/dashboard` jika sudah login
- `VerifyEmail` — Halaman verifikasi email

### Dashboard (`components/dashboard/`)
- `DashboardNavbar` — Navbar sticky dengan tombol logout
- `StatCard` — Card statistik (Status, Provider, Role)
- `UserProfileCard` — Card profil pengguna
- `Spinner` — Loading spinner

### Posts (`components/posts/`)
- `PostList` — Daftar postingan (TanStack Query)
- `PostDetail` — Detail postingan + tombol edit/hapus
- `CreatePostCard` — Form buat postingan baru
- `EditPostCard` — Form edit postingan
- `DeletePostDialog` — Dialog konfirmasi hapus

### Users (`components/users/`)
- `UserTable` — Tabel daftar semua pengguna (admin only)
- `ChangeRoleButton` — Tombol ganti role pengguna

### UI (`components/ui/`)
Komponen dasar: Avatar, Badge, Button, Card, Checkbox, Dialog, Field, Input, Label, Separator, Textarea, Icons

## Menjalankan

```bash
# Dari root monorepo
npm run dev        # Menjalankan web (:3000) + backend (:3001)

# Atau dari direktori ini
npm run dev        # http://localhost:3000
```

### Environment Variables

Buat `.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Scripts

| Perintah | Deskripsi |
|----------|-----------|
| `npm run dev` | Dev server port 3000 |
| `npm run build` | Build production |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (zero warnings) |
| `npm run check-types` | Type-check + Next.js typegen |
| `npm run format` | Prettier formatting (dari root) |

## Catatan Desain

- **Semua border-radius = `rounded-none`** — gaya industrial/square
- Tema **dark mode** default (class `dark` di `<html>`)
- Animasi kustom: `animate-fade-up`, `animate-fade-in`, `animate-scale-in`
- Path alias `@/` → `apps/web/*
