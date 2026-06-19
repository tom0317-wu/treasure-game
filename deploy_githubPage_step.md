# 部署到 GitHub Pages — 步驟說明

本文件說明如何將此 React 前端部署到 GitHub Pages，並讓它呼叫已在 Vercel 上運行的 Express 後端 API。

---

## 架構說明

| 層級 | 平台 | URL |
|------|------|-----|
| 前端 (React SPA) | GitHub Pages | https://tom0317-wu.github.io/treasure-game/ |
| 後端 API (Express + SQLite) | Vercel | https://claudecodetreasuregame-initial-pearl-five.vercel.app |

GitHub Pages 只能托管靜態檔案，無法執行 Node.js。因此前端與後端必須分開部署，前端透過 CORS 跨域呼叫 Vercel 上的 API。

---

## 前置需求

| 工具 | 安裝指令 | 確認指令 |
|------|----------|----------|
| Node.js | https://nodejs.org | `node -v` |
| Git | https://git-scm.com | `git --version` |
| GitHub CLI (gh) | `winget install --id GitHub.cli -e` | `gh --version` |

---

## 步驟一：安裝 GitHub CLI 並登入

```powershell
# 安裝 GitHub CLI（Windows）
winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements

# 重新整理 PATH（讓當前終端機認得 gh 指令）
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# 登入 GitHub（會開啟瀏覽器完成授權）
gh auth login --hostname github.com --git-protocol https --web

# 確認登入狀態
gh auth status
```

---

## 步驟二：初始化 Git Repository 並建立 GitHub Repo

```powershell
# 設定 git 使用者資訊
git config user.email "tom0317@gmail.com"
git config user.name "tom0317-wu"

# 初始化 git repo（若尚未初始化）
git init

# 加入所有檔案並提交
git add .
git commit -m "Initial commit - treasure game"

# 在 GitHub 建立 public repo 並推送（一行完成）
gh repo create treasure-game --public --source=. --remote=origin --push
```

這個指令會自動：
- 在 GitHub 建立名為 `treasure-game` 的公開 repository
- 設定 `origin` 遠端
- 將本機程式碼推送到 GitHub

---

## 步驟三：了解程式碼修改內容（首次設定時已完成）

以下修改讓專案可以在 GitHub Pages 正確運作：

### 3.1 後端加入 CORS 支援（`server/index.ts`）
```typescript
import cors from 'cors';
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tom0317-wu.github.io',
  ],
  credentials: true,
}));
```

### 3.2 前端 API 路徑改為可設定（`src/lib/api.ts`）
```typescript
const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
```
- 本機開發：使用預設 `/api`（由 Vite proxy 轉發到 Express）
- GitHub Pages：由 build script 注入完整 Vercel URL

### 3.3 Vite 設定加入動態 base path（`vite.config.ts`）
```typescript
base: process.env.VITE_BASE_PATH ?? '/',
```
GitHub Pages 部署在子路徑 `/treasure-game/`，所以需要設定 `base`，否則靜態資源路徑會錯誤。

### 3.4 新增 npm scripts（`package.json`）
```json
"build:github": "cross-env VITE_BASE_PATH=/treasure-game/ VITE_API_BASE_URL=https://claudecodetreasuregame-initial-pearl-five.vercel.app/api vite build",
"deploy:github": "npm run build:github && gh-pages -d build"
```

---

## 步驟四：安裝相依套件

```powershell
npm install cors gh-pages cross-env
npm install --save-dev @types/cors
```

| 套件 | 用途 |
|------|------|
| `cors` | 允許 GitHub Pages 跨域呼叫 Vercel API |
| `gh-pages` | 將 `build/` 資料夾推送到 `gh-pages` 分支 |
| `cross-env` | 在 Windows 上設定環境變數（npm script 使用） |

---

## 步驟五：部署到 GitHub Pages

```powershell
npm run deploy:github
```

這個指令會：
1. 以 GitHub Pages 設定 build React app（注入 base path 和 Vercel API URL）
2. 將 `build/` 資料夾推送到 GitHub 的 `gh-pages` 分支
3. GitHub Pages 自動偵測 `gh-pages` 分支並啟用

**等待約 1～2 分鐘**讓 GitHub Pages CDN 更新，然後開啟：

**https://tom0317-wu.github.io/treasure-game/**

---

## 步驟六：部署後端 CORS 修正到 Vercel

每次修改 `server/index.ts` 後，要重新部署 Vercel 讓 CORS 設定生效：

```powershell
vercel --prod --yes
```

---

## 日後更新流程

修改程式碼後，執行以下指令更新 GitHub Pages：

```powershell
# 提交修改
git add .
git commit -m "描述你的修改"
git push origin master

# 重新部署 GitHub Pages
npm run deploy:github
```

若後端有修改，同時執行：
```powershell
vercel --prod --yes
```

---

## 使用自訂指令快速部署

專案內建 Claude Code 自訂指令，在 Claude Code 終端機輸入 `/deploy_githubPage` 即可自動完成所有部署步驟。

---

## 重要限制

> **SQLite 資料持久性**：Vercel 使用無伺服器架構，資料庫存放在 `/tmp/game.db`。當 Vercel function 冷啟動時，資料可能會重置（用戶帳號和分數歸零）。若需永久儲存，建議遷移至 [Supabase](https://supabase.com)、[PlanetScale](https://planetscale.com) 或 [Neon](https://neon.tech)。
