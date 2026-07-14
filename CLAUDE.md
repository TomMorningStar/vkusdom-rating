# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

"ВкусДом" (vkusdom-rating) is an internal employee rating/voting app. Visitors scan a per-employee QR code, land on a public profile, and can like/dislike + leave a comment (one vote per employee per IP+User-Agent fingerprint). Admins manage employees and view an aggregate rating leaderboard through a Basic-Auth-protected admin panel. UI text and API error messages are in Russian.

Two independent npm projects, no monorepo tooling (no workspaces/turborepo):
- `server/` — Express + TypeScript + Prisma 7 + PostgreSQL
- `client/` — React 19 + TypeScript + Vite, plain CSS Modules (no UI framework, no state library)

There is no test suite in this repo (no test runner configured for either package).

## Commands

### Server (run from `server/`)
- `npm run dev` — dev server with hot reload (`ts-node-dev`)
- `npm run build` — compile TypeScript to `dist/`
- `npm run deploy` — `prisma generate && prisma migrate deploy && npm run build` (production deploy path)
- `npm start` — run compiled `dist/server.js`
- `npm run db:migrate` — create/apply a dev migration (`prisma migrate dev`)
- `npm run db:generate` — regenerate the Prisma client after schema changes
- `npm run db:seed` — currently a no-op stub (`prisma/seed.ts`); employees are created via the admin UI, not seeded

No lint script is defined for `server/`.

### Client (run from `client/`)
- `npm run dev` — Vite dev server; proxies `/api` and `/uploads` to `http://127.0.0.1:5000` (see `vite.config.ts`), so run the server locally on port 5000 alongside it
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- `npm run preview` / `npm run start` — serve the production build locally

### Environment setup
Both packages need a `.env` copied from `.env.example`:
- `server/.env`: `PORT`, `UPLOAD_DIR`, `DATABASE_URL` (Postgres), `DB_POOL_MAX`, `DATABASE_SSL`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`
- `client/.env`: `VITE_API_URL` (blank = same-origin, nginx proxies `/api`), `VITE_PUBLIC_APP_URL` (optional; origin baked into generated QR codes, blank = `window.location.origin`)

## Deployment

No Docker/CI in this repo — deploys straight onto a bare Ubuntu VPS (see `README.md` for the full runbook): PostgreSQL and nginx on the host, `server` runs as a plain Node process on `localhost:5000` (managed via systemd/pm2, not in this repo), and nginx serves `client/dist` while reverse-proxying `/api/*` and `/uploads/*` to the server (`client/nginx.conf`). Keep this deployment model in mind — e.g. don't introduce assumptions that require containers or a process manager that isn't already set up.

## Backend architecture

Strict layering, each layer only talks to the one below it:

```
routes/api.ts → controllers → services → repositories → Prisma (config/prisma.ts)
```

- **`app.ts`**: assembles the Express app (cors, `express.json`, static `/uploads`, mounts `apiRouter` at `/api`, then `notFoundHandler`/`errorHandler`). `server.ts` connects Prisma, starts listening, and disconnects on SIGINT/SIGTERM.
- **`routes/api.ts`**: single source of truth for all endpoints. Public: `GET /health`, `POST /admin/login`, `GET /employees/:id`, `GET /employees/:id/comments`, `POST /employees/:id/vote`. Everything under `/admin/*` (employee CRUD, `GET /admin/rating`) goes through the `requireAdmin` middleware.
- **`middlewares/requireAdmin.ts`**: HTTP Basic Auth checked against `ADMIN_LOGIN`/`ADMIN_PASSWORD` env vars on *every* admin request — there is no session/JWT/token issuance. The client just resends `Authorization: Basic ...` each call (see Frontend below).
- **`middlewares/uploadEmployeePhoto.ts`**: multer disk storage into `UPLOAD_DIR/employees`, allowlists jpg/png/webp, 5MB limit. Controllers are responsible for cleaning up the uploaded file (`deleteEmployeeUploadedFile`) if validation/DB work fails afterward, and for deleting the old photo file when it's replaced or the employee is removed (`deleteEmployeePhotoByUrl`).
- **`controllers/`**: thin — parse/validate input, call a service or repository, respond via `sendSuccess`/`sendError` (`utils/response.ts`), which produce the envelope `{ success: true, data }` / `{ success: false, message }` that the client's `apiFetch` expects.
- **`services/employeeService.ts`**: pure mapping/aggregation helpers (`countVotes`, `mapEmployeeListItem`, `mapEmployeeDetail`) — no DB access.
- **`services/voteService.ts`**: `ratingService.getRating()` (active employees sorted by score, then likes) and `voteService.castVote()`, which catches Prisma's unique-constraint error (`P2002`) to turn a duplicate vote into a 409 rather than a 500.
- **`repositories/`**: the only layer that imports the Prisma client directly.
- **`validators/`**: hand-rolled (no zod/joi), each returns a discriminated union `{ ok: true, data } | { ok: false, message }`. Follow this pattern for new input validation rather than adding a schema library.

### Data model (`prisma/schema.prisma`)
- `Employee` (fullName, position, description, photoUrl, isActive) has many `Vote` and `Comment`, both `onDelete: Cascade`.
- `Vote` has `@@unique([employeeId, ipAddress, userAgent])` — this is the entire anti-double-voting mechanism (no accounts/cookies for public voters).
- `Comment` is optional per vote (max 1000 chars, enforced in `validators/voteValidator.ts`), attached in the same `voteRepository.createVoteWithOptionalComment` transaction as the vote.

### Prisma driver adapters
This uses Prisma 7's driver-adapter pattern, not a plain `datasource url`. `config/prisma.ts` builds a `pg.Pool` from `utils/databaseUrl.ts` (handles `DATABASE_URL`, `DB_POOL_MAX`, `DATABASE_SSL`) and wraps it in `@prisma/adapter-pg` before constructing `PrismaClient`. `prisma.config.ts` (used by the Prisma CLI for migrations) independently reads `DATABASE_URL` from `.env`. When touching DB connection behavior, check both files.

## Frontend architecture

- React 19 + `react-router-dom` v7, no Redux/Zustand/Query — state is local `useState`/`useEffect` per page, data fetched directly from the `api/` layer.
- **Routing (`app/App.tsx`)**: `/login` and `/employee/:id` are public. `/` (HomePage), `/rating`, `/admin` are wrapped in `ProtectedRoute` (checks `isAuthenticated()`) then `Layout` (header/nav/logout). Any unmatched path redirects to `/login`.
- **`api/client.ts`**: `apiFetch<T>` is the single fetch wrapper — unwraps the `{ success, data }` envelope, throws `ApiRequestError` on `{ success: false }`, and auto-attaches the Basic Auth header from `api/auth.ts` unless called with `{ auth: false }`. It also switches off the JSON `Content-Type` automatically when the body is a `FormData` (used for employee create/update with photo upload).
- **`api/auth.ts`**: admin login/password are kept in `sessionStorage` (not a real token) and reused to build the Basic Auth header on every subsequent admin request — consistent with the server having no session state.
- **`pages/AdminPage`**: employee CRUD form + table, plus single/bulk QR code generation via `utils/qr.ts`.
- **`utils/qr.ts`**: renders a printable QR "card" (canvas: QR code + employee name) per employee pointing at `${origin}/employee/:id`, downloadable individually or as a zip (via `jszip`) for the whole roster. `origin` is `VITE_PUBLIC_APP_URL` if set, else `window.location.origin` — relevant when testing QR generation locally vs. what gets printed for production.
- **Styling**: CSS Modules per component (`*.module.css`) plus shared utility classes from `styles/global.css` (`.card`, `.btn`, `.btn-primary`, `.error`, `.success`, `.container`, `.page-title`) applied via className string concatenation — no CSS-in-JS.
- **Formatting note**: there's no Prettier config, and the codebase isn't uniform — `api/`, `types/`, and some utils use spaces + double quotes, while most `pages/`/`components/` files use tabs + single quotes. Match the style of the file you're editing rather than imposing one convention.
