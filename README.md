#  Clinic Copilot

**The AI safety net for the busiest wards.**

Clinic Copilot watches every patient's vitals against *their own* baseline, flags who's trending toward trouble before it becomes an emergency, and turns a nurse's voice into a doctor-ready SOAP note — in English or Tamil. Built for the reality of Tier 2/3 Indian hospitals: high patient loads, thin staffing, and paper charts that can't keep up.

No more digging through a stack of vitals sheets to notice a slow decline. If a patient is worsening, Clinic Copilot already knows — and already explained why.

---

##  Features

| | |
|---|---|
| 🟢🟠🔴 **Risk Badges** | Green / Amber / Red, computed from rolling deltas vs each patient's own baseline — not a one-size-fits-all threshold |
| 🩺 **Doctor View** | Voice dictation → AI-structured SOAP notes, an AI "Why Flagged?" explanation for every alert, and one-tap Tamil translation |
| 💉 **Nurse View** | Inline vitals entry form, quick observation notes, alert reasons surfaced inline — built for speed at the bedside |
| ⏩ **Simulate Shift** | One click advances vitals for the whole ward — two patients deteriorate over time, so you can watch the early-warning system work end-to-end |
| 🚨 **Live Alerts Feed** | Every Amber/Red patient across the ward, auto-sorted by severity, in one glanceable screen |

---

## Repository Structure

```
ward-copilot/
├── frontend/    # React + Vite — deploy to Vercel
└── backend/     # Express + Drizzle + PostgreSQL — deploy to Render
```

---

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

---

## ☁️ Deployment

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

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, TanStack Query, Wouter, Framer Motion, Recharts |
| Backend | Node.js, Express 5, Drizzle ORM, PostgreSQL |
| AI | Groq (`llama-3.3-70b-versatile` for reasoning, `llama-3.1-8b-instant` for translation) |
| Deployment | Vercel (frontend) · Render (backend + Postgres) |

---

## 🔗 Live Demo

**[clinic-copilot-five.vercel.app](https://clinic-copilot-five.vercel.app)**

Built in 24 hours. Try **Simulate Shift** on the ward view to watch a patient deteriorate live.
