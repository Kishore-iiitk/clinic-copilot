# Ward Copilot — Frontend

React + Vite SPA. Deploy to **Vercel**.

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:3001
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL of the backend API (no trailing slash). E.g. `https://ward-copilot-api.onrender.com` |

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Deploy to Vercel

1. Connect this repo on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add `VITE_API_URL` env var pointing to your Render backend URL
7. Deploy — SPA routing is handled by `vercel.json`
