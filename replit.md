# Babussalam - Sistem Pendataan Mukholif Divisi Ibadah

Website pendataan pelanggar (mukholif) untuk Divisi Ibadah Organisasi Santri Babussalam.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/babussalam run dev` — run the frontend (port 24098)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/violations.ts` — violations table schema
- `artifacts/api-server/src/routes/` — API route handlers (auth, violations, students, dashboard)
- `artifacts/babussalam/src/` — React frontend
- `artifacts/babussalam/src/contexts/AuthContext.tsx` — auth state management

## Architecture decisions

- Session-based auth (express-session) with hardcoded credentials: username `jali`, password `ibadah2026`
- All data stored in PostgreSQL — synced across all browsers automatically
- OpenAPI-first: spec drives both server Zod validators and React Query client hooks
- Frontend uses generated hooks from `@workspace/api-client-react`, never raw fetch

## Product

- **Login**: Secure login page (username: jali, password: ibadah2026)
- **Dashboard**: Stats (total mukholif, total pelanggaran, harian, bulanan), top violators, recent violations, breakdown by type and class
- **Pendataan**: Form to record new violations (nama, kelas, asrama, waktu, jenis pelanggaran, catatan) with auto-count per student
- **Daftar Mukholif**: Searchable/filterable table of students by name, kelas, asrama
- **Detail Mukholif**: Per-student violation history with edit/delete per row

## User preferences

- Theme: strict black and white (dark mode, monochromatic)
- Language: Indonesian UI labels
- Login: username `jali`, password `ibadah2026`

## Gotchas

- Always restart the API server after code changes (it builds with esbuild)
- Run `pnpm run typecheck:libs` after changing `lib/db/src/schema/`
- Session cookies require `credentials: include` on fetch — handled via Orval custom-fetch config

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
