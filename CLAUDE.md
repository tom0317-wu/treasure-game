# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server (frontend only, port 5173)
npm run dev:server   # start Express backend with hot-reload (port 3001)
npm run build        # production build → ./build/
npm run start        # run production server (serves built frontend + API)
```

There are no tests configured in this project.

## Architecture

This is a full-stack TypeScript app: a React SPA (Vite) + an Express/SQLite backend.

**Frontend** (`src/`)
- `App.tsx` — single-page game component. Owns all game state (`boxes`, `score`, `gameEnded`). Calls `openBox()` on click, saves score via `lib/api.ts` when a game ends and the user is authenticated.
- `hooks/useAuth.ts` — auth state hook. Reads/writes `auth_token` and `auth_username` from `localStorage`. Exposes `signup`, `signin`, `logout`, `playAsGuest`.
- `lib/api.ts` — thin fetch wrappers for `/api/auth` and `/api/scores` endpoints.
- `components/AuthDialog.tsx` — modal that gates the game. Shown when neither `auth.user` nor `auth.isGuest` is set.
- `components/ui/` — shadcn/ui component library (do not modify these directly).
- `components/figma/ImageWithFallback.tsx` — image helper used by Figma-generated code.

**Backend** (`server/`)
- `index.ts` — Express app. Mounts `/api/auth` and `/api/scores`. In production, also serves the static Vite build.
- `db.ts` — better-sqlite3 connection, schema creation (`users`, `scores` tables), and typed prepared-statement exports (`queries.*`).
- `auth.ts` — bcrypt password hashing + JWT sign/verify helpers.
- `routes/authRoutes.ts` — `POST /api/auth/signup`, `POST /api/auth/signin`.
- `routes/scoreRoutes.ts` — `POST /api/scores` (save), `GET /api/scores/me` (history + best).
- `server/game.db` — SQLite file committed to the repo (WAL mode).

**Styling**: Tailwind CSS with an amber/treasure theme. Global styles in `src/styles/globals.css` and `src/index.css`.

**Key data flow**: `useAuth` → `AuthDialog` controls access → `App` plays game → on game end, `saveScore(score, token)` POSTs to backend → stored in SQLite `scores` table.

**Auth**: JWT tokens issued on signup/signin, stored in `localStorage`, sent as `Authorization: Bearer <token>` on score-save requests.

## Dev setup note

In development, the Vite dev server (`:5173`) proxies `/api` requests to the Express server (`:3001`). You must run both `npm run dev` and `npm run dev:server` simultaneously for full functionality.
