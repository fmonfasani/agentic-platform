# Prisma Environment Audit — agentic-platform

## 1. Folder Structure and Artefacts

| Path | Contents |
| --- | --- |
| `apps/api/prisma/` | `schema.prisma`, `seed.ts`, `seed.js`, migrations, Prisma client assets |
| `apps/api/src/prisma/` | `prisma.service.ts`, legacy `seed.ts` |

*No SQLite `.db` files are currently checked in (they are ignored via `.gitignore`).*

## 2. Configuration Sources

- **Environment file**: No `.env` (or `.env.local`) file was found under `apps/api/`. CLI commands therefore lack `DATABASE_URL`.
- **Schema datasource**: `apps/api/prisma/schema.prisma` defines `datasource db` with provider `sqlite` and `url = env("DATABASE_URL")`.
- **Runtime service**: `apps/api/src/prisma/prisma.service.ts` patches `process.env.DATABASE_URL` at runtime with `file:./dev.db` when the variable is missing, hiding the absence of `.env` during application startup.

## 3. Schema Integrity

- Models present: `Agent`, `AgentUsage`, `AgentTrace`, `Workflow`.
- All relations that reference `Agent` specify `onDelete: Cascade`.
- No duplicate model declarations were detected.

## 4. Seeds Overview

| File | Location | Notes |
| --- | --- | --- |
| `seed.ts` | `apps/api/prisma/` | Rich ENACOM dataset, imports `AgentType` helper, cleans tables, disconnects properly. |
| `seed.js` | `apps/api/prisma/` | Compiled JS equivalent, also disconnects. |
| `seed.ts` | `apps/api/src/prisma/` | Legacy minimal seed creating three agents; duplicates logic. |

`apps/api/package.json` wires the Prisma seed hook to `ts-node prisma/seed.ts`, so the TypeScript seed in `prisma/` is the one executed by `pnpm prisma db seed`.

## 5. Database Files

- No `.db` files exist in the repository (expected, because `.gitignore` excludes `apps/api/prisma/**/*.db`).
- Because `DATABASE_URL` is unset, Prisma CLI commands and seeds fail with `Environment variable not found: DATABASE_URL`.

## 6. Prisma Versions

- `@prisma/client` version: `^5.22.0` (apps/api `dependencies`).
- `prisma` CLI version: `^5.22.0` (apps/api `devDependencies`).
- Versions match; no change required.

## 7. Command Results

| Command | Outcome |
| --- | --- |
| `pnpm -C apps/api exec prisma generate` | ✅ Generated client using `prisma/schema.prisma`. |
| `pnpm -C apps/api exec prisma db push --force-reset` | ❌ Fails (`P1012`) because `DATABASE_URL` env var is missing. |
| `node prisma/seed.js` (from `apps/api`) | ❌ Aborts with `Environment variable not found: DATABASE_URL`. |
| `node -e "await prisma.agent.count()"` | ❌ Same initialization error without `DATABASE_URL`. |

## 8. Diagnosed Issues

1. **Missing `.env` file** under `apps/api/` leaves Prisma CLI and seeds without a datasource URL.
2. **Dual Prisma directories** (`prisma/` and `src/prisma/`) cause confusion: the Nest service lives under `src/prisma/`, but CLI assets and seeds live under `prisma/`.
3. **Fallback URL in `PrismaService`** masks configuration problems by silently forcing `file:./dev.db`.
4. **Multiple seed scripts** (TS, JS, and legacy TS) diverge in dataset scope.

## 9. Recommended Fixes

1. **Centralize configuration**
   - Create `apps/api/.env` with `DATABASE_URL="file:./prisma/dev.db"`.
   - Remove the fallback in `prisma.service.ts`; rely on environment configuration instead.
2. **Consolidate Prisma assets**
   - Keep official artefacts under `apps/api/prisma/` (schema, migrations, seed, database file).
   - Delete `apps/api/src/prisma/seed.ts`; move any shared utilities elsewhere.
3. **Database lifecycle**
   - Ensure `apps/api/prisma/dev.db` exists locally (generated via `prisma db push` or migrations).
   - Add the path to `.env` instructions/readme if needed.
4. **Workflow verification**
   - After creating `.env`, rerun `pnpm -C apps/api exec prisma generate`, `pnpm -C apps/api exec prisma db push`, and `pnpm -C apps/api exec prisma db seed` to confirm the environment.
   - Launch Prisma Studio with `pnpm -C apps/api exec prisma studio` to validate data.

Implementing the above will leave Prisma fully functional using a single datasource at `apps/api/prisma/dev.db` with consistent seeds and tooling.
