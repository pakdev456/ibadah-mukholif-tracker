# Panduan Deploy ke Vercel + Railway

## Persiapan

### 1. Setup Database di Railway

1. Buka [railway.app](https://railway.app) → New Project → Add PostgreSQL
2. Klik database → tab **Variables** → salin nilai `DATABASE_URL`
3. Format: `postgresql://user:password@host:port/database`

### 2. Deploy ke Vercel

1. Push kode ini ke GitHub/GitLab
2. Buka [vercel.com](https://vercel.com) → New Project → Import repository
3. Konfigurasi project di Vercel:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root)
   - Biarkan Build Command, Output Directory, Install Command otomatis dari `vercel.json`

4. **Environment Variables** — tambahkan di Vercel dashboard:
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Salin dari Railway |
   | `SESSION_SECRET` | String acak panjang (min 32 karakter) |
   | `NODE_ENV` | `production` |

5. Klik **Deploy**

## Struktur Deployment

```
vercel.json          ← konfigurasi Vercel (sudah ada)
api/index.ts         ← entry point serverless untuk Express API
artifacts/
  babussalam/        ← frontend React (di-build jadi static files)
  api-server/        ← Express backend (di-bundle ke api/index.ts)
lib/
  db/                ← Drizzle ORM schema
```

## Cara Kerja

- **Frontend** → di-build Vite → static files → di-serve Vercel CDN
- **Backend** → Express app → wrapped jadi Vercel serverless function di `api/index.ts`
- **Database** → Railway PostgreSQL, diakses via `DATABASE_URL`
- **Session** → disimpan di tabel `sessions` di PostgreSQL (persist antar request)

## Setelah Deploy

Akses website di domain Vercel Anda (contoh: `your-app.vercel.app`)

Login: username `jali`, password `ibadah2026`

## Catatan

- Session cookie di-set sebagai `secure` + `sameSite: none` di production
- Tabel `sessions` dibuat otomatis saat pertama kali app dijalankan
- Data terus tersinkron karena semua request ke Railway PostgreSQL yang sama
