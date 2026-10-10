# Integration Plan

## Backend
- Folder: `services/simsimplay-api`
- Run: `npm run start:dev --workspace=services/simsimplay-api` (dev) / `npm run build && npm start` (prod)
- Port: `3000` (env `PORT`)
- Health check: `GET /api/health` → `{ status, services }`, 503 only when `unhealthy`
- Orchestration: `docker-compose.yml` at repo root (postgres:5432, redis:6379)

## Frontend
- Folder: `services/simsimplay-web`
- Dev: `npm run dev --workspace=services/simsimplay-web` (Vite, port 5173)
- Build: `npm run build --workspace=services/simsimplay-web`
- API seam to swap: `services/simsimplay-web/src/api/index.ts` — currently exports `mockClient`; repoint to a new live `HttpApiClient implements ApiClient` (interface in `src/api/ApiClient.ts`)
- Mock files to delete after wiring: `src/api/mockClient.ts`, `src/mocks/data.ts`, `src/game/omokEngine.ts` (client-side duplicate used only by the mock), `src/api/uuid.ts` (mock-only helper)
- No dev-only Mock State Switcher was scaffolded (out of scope for MVP)

## API Route Inventory (method + path)
| Method | Path | Auth |
|---|---|---|
| GET | /api/health | none |
| POST | /api/auth/register | none |
| POST | /api/auth/login | none |
| GET | /api/auth/me | Bearer |
| GET | /api/games | none |
| POST | /api/omok/games | Bearer |
| GET | /api/omok/games/:gameId | Bearer |
| POST | /api/omok/games/:gameId/moves | Bearer |
| POST | /api/matches/queue | Bearer |
| DELETE | /api/matches/queue/:queueId | Bearer |
| GET | /api/users/me/profile | Bearer |
| GET | /api/users/me/matches | Bearer |
| WS | /socket.io (room:join, move:submit) | n/a |

Auth: JWT bearer issued by `POST /api/auth/login`; `AuthGuard` (`services/simsimplay-api/src/auth/auth.guard.ts`) validates `Authorization: Bearer <token>`. Signing key: `JWT_SECRET` env var (required in non-Development).

## Database
- Type: PostgreSQL (docker-compose local; Azure Database for PostgreSQL Flexible Server in prod)
- Connection env var: `DATABASE_URL`
- Migration tool/directory: none yet — create migrations in `infra/migrations/` (tool not yet chosen; recommend `node-pg-migrate` or raw numbered `.sql` files run via a small script)
- Required tables (minimum): `users (id uuid pk, email unique, nickname, password_hash, created_at)`, `profiles (user_id fk, nickname, rating, updated_at)`, `matches (id uuid pk, user_id fk, opponent, mode, result, rating_change, created_at)`
- **NO seed data** — migrations only, tables start empty

## Shared Types
- Package: `services/shared` (`@simsimplay/shared`, workspace dependency)
- Import alias: `@simsimplay/shared` (plain package name, already linked via npm workspaces)

## Services (Essential / Enhancement)
- Essential: Azure Static Web Apps (frontend hosting), Azure Container Apps (API host), Azure Database for PostgreSQL Flexible Server, Azure Cache for Redis
- No Enhancement-classified services in this plan

## Notes
- Redis is currently unused by any handler (reserved for matching queue / room state per plan); wire it in during integration if live matching needs it.
- In-memory Omok/queue state in `OmokService`/`MatchingService` must be replaced with Postgres/Redis-backed persistence during integration.

## Integration Results
- Added `infra/migrations/001_initial.sql` with constrained `users`, `profiles`, and `matches` tables plus indexes; applied successfully with `npm run migrate`.
- Added repeatable `npm run migrate` and `npm run migrate:down` commands using `infra/migrations/migrate.cjs`. No seed data was created or run.
- Backend build passed and every REST inventory route registered. Smoke tests passed with PostgreSQL and Redis running: health 200, auth registration/login/me, games, Omok create/read/move, matching enqueue/cancel, profile, and recent matches.
- Replaced the frontend mock seam with typed `src/api/client.ts`, configured the Vite `/api` proxy, and removed all mock-only files. Frontend source contains no mock or preview-state references.
- Full project build passed. End-to-end verification passed through `http://localhost:5173/api/health` and `http://localhost:5173/api/games`, both returning live backend responses.
