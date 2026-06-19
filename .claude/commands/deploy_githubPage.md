# Deploy to GitHub Pages

Deploy the React frontend to GitHub Pages. The Express/SQLite backend stays on Vercel and is called cross-origin.

**Live URL:** https://tom0317-wu.github.io/treasure-game/
**Backend (Vercel):** https://claudecodetreasuregame-initial-pearl-five.vercel.app

## Pre-flight checks

### 1. Verify gh CLI is installed and logged in
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
gh auth status
```
If not logged in: tell the user to run `! gh auth login --hostname github.com --git-protocol https --web`

### 2. Verify git remote is set
```powershell
git remote -v
```
Expected: origin pointing to `https://github.com/tom0317-wu/treasure-game.git`

If missing, run:
```powershell
git remote add origin https://github.com/tom0317-wu/treasure-game.git
```

## Deploy

### 3. Commit any pending changes
```powershell
git add .
git commit -m "Update for GitHub Pages deployment"
git push origin master
```
If nothing to commit, skip this step.

### 4. Build and deploy to GitHub Pages
```powershell
npm run deploy:github
```

This single command:
- Builds the React app with `VITE_BASE_PATH=/treasure-game/` and `VITE_API_BASE_URL=https://claudecodetreasuregame-initial-pearl-five.vercel.app/api`
- Pushes the `build/` output to the `gh-pages` branch on GitHub

GitHub Pages is configured to serve from the `gh-pages` branch (already set up).

## Report

After deployment completes, tell the user the live URL:

**https://tom0317-wu.github.io/treasure-game/**

GitHub Pages may take 1–2 minutes to update after the first deployment. If the page shows a 404, wait a moment and refresh.

> **Note:** User accounts and scores are stored in SQLite on Vercel's `/tmp` filesystem, which resets on cold starts. For persistent storage, migrate to Supabase, PlanetScale, or Neon.
