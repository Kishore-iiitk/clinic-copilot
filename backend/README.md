# Ward Copilot — Backend

Express 5 + Drizzle ORM + PostgreSQL API server. Deploy to **Render**.

## Local Development

```bash
npm install
cp .env.example .env
# Edit .env: fill in DATABASE_URL and GROQ_API_KEY
npm run db:push  # creates tables in your Postgres DB
npm run dev      # runs on http://localhost:3001 with hot reload
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `GROQ_API_KEY` | ✅ | Groq API key for LLM features |
| `PORT` | auto | Port to listen on (Render sets this automatically) |
| `NODE_ENV` | — | Set to `production` on Render |
| `CORS_ORIGIN` | — | Allowed frontend origin (e.g. `https://ward-copilot.vercel.app`). Omit to allow all origins. |

## Scripts

```bash
npm run dev       # tsx watch — hot reload for development
npm run build     # esbuild bundle → dist/index.mjs
npm start         # run the compiled bundle
npm run db:push   # push Drizzle schema to Postgres (run once after deploy)
```

## Deploy to Render

1. Create a **PostgreSQL** database on Render; copy the Internal Database URL
2. Create a **Web Service**, root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add env vars: `DATABASE_URL`, `GROQ_API_KEY`, `NODE_ENV=production`, `CORS_ORIGIN=<vercel-url>`
6. After first deploy, open **Shell** and run `npm run db:push` to create the schema
   - The server seeds demo data automatically on first boot

## API Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/patients` | List all patients with risk |
| `GET` | `/api/patients/:id` | Patient detail + vitals history |
| `GET` | `/api/patients/:id/vitals` | Vitals history |
| `POST` | `/api/patients/:id/vitals` | Add a vitals reading |
| `GET` | `/api/patients/:id/notes` | Clinical notes |
| `POST` | `/api/patients/:id/notes` | Create a note |
| `GET` | `/api/alerts` | All Amber/Red patients |
| `POST` | `/api/ai/explain-risk` | LLM risk explanation |
| `POST` | `/api/ai/soap-note` | Voice transcript → SOAP note |
| `POST` | `/api/ai/translate` | English → Tamil translation |
| `POST` | `/api/simulate-shift` | Advance demo simulation |
