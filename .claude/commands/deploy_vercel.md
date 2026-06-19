# Deploy to Vercel

Deploy this full-stack Express + React project to Vercel and return the live URL.

## Pre-flight checks

### 1. Check Vercel CLI
```powershell
vercel --version
```
If not found, install it:
```powershell
npm install -g vercel
```

### 2. Check login
```powershell
vercel whoami
```
If not logged in, tell the user to run `! vercel login` in the terminal to complete browser login, then re-run `/deploy_vercel`.

### 3. Verify vercel.json is correct
The project root must have a `vercel.json` with this exact content (the version that actually works — do NOT use the old single-builder config):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/index.ts" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```
If missing or different, overwrite it with the content above.

### 4. Verify server/index.ts exports the app
`server/index.ts` must:
- Export `export default app` at the bottom (required for Vercel serverless)
- NOT call `app.listen()` unconditionally — it must be guarded with `if (!process.env.VERCEL)`

### 5. Verify server/db.ts uses /tmp for the database
`server/db.ts` must use `/tmp/game.db` in production (Vercel's filesystem is read-only except `/tmp`):
```typescript
const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/game.db'
  : path.join(__dirname, 'game.db');
```

## Deploy

Run:
```powershell
vercel --prod --yes
```

Vercel will automatically run `npm run build` on their servers — no need to build locally first.

## Report

After deployment completes, extract the **Aliased** production URL from the output (looks like `https://<project-name>.vercel.app`) and show it to the user.

> **Note:** This app uses SQLite with `/tmp/game.db`. Vercel's serverless filesystem is ephemeral — user accounts and scores may reset on cold starts. For persistent storage, migrate to Supabase, PlanetScale, or Neon.
