# Ward Copilot

AI clinical documentation and early-warning dashboard for hospital staff at Tier 2/3 Indian hospitals.

## Repository Structure

```
ward-copilot/
├── frontend/    # React + Vite — deploy to Vercel
└── backend/     # Express + Drizzle + PostgreSQL — deploy to Render
```

## Features

- **Risk badges** (Green / Amber / Red) computed from rolling deltas vs each patient's baseline
- **Doctor view** — Voice dictation → AI-structured SOAP notes, AI "Why Flagged?" explanation, Tamil translation
- **Nurse view** — Inline vitals entry form, quick observation notes, alert reasons
- **Simulate Shift** — advances vitals for all patients, two patients deteriorate over time as a demo
- **Live Alerts feed** — shows all Amber/Red patients sorted by severity

## Quick Start (Local)

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and GROQ_API_KEY
npm run dev            # runs on http://localhost:3001

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:3001
npm run dev            # runs on http://localhost:5173
```

## Deployment

### Backend → Render

1. Create a new **Web Service** on Render, point it to this repo, root directory: `backend`
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Add environment variables:
   - `DATABASE_URL` — from a Render PostgreSQL instance (or any Postgres host)
   - `GROQ_API_KEY` — your Groq API key
   - `NODE_ENV=production`
   - `CORS_ORIGIN` — your Vercel frontend URL (e.g. `https://ward-copilot.vercel.app`)
5. After first deploy, run `npm run db:push` via Render Shell to create the schema

### Frontend → Vercel

1. Import this repo on Vercel, set root directory to `frontend`
2. Framework: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://ward-copilot-api.onrender.com`)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, TanStack Query, Wouter, Framer Motion, Recharts |
| Backend | Node.js, Express 5, Drizzle ORM, PostgreSQL |
| AI | Groq (`llama-3.3-70b-versatile` for reasoning, `llama-3.1-8b-instant` for translation) |
| Deployment | Vercel (frontend) · Render (backend + Postgres) |
