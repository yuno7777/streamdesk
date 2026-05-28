# StreamDesk — Customer Support Ticket CRM

StreamDesk is an internal customer support ticketing CRM. Support staff can log, search, filter, and triage tickets through a Kanban board, record internal notes with canned-response snippets, review operational analytics, and export the ticket list to CSV or PDF.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, node-postgres (`pg`), and Neon Serverless PostgreSQL. Access is gated by a cookie-based session login enforced in middleware.

---

## Features

- **Dashboard** — at-a-glance stat cards (total / open / in-progress / closed), a performance area chart, status-distribution donut, and a live activity feed.
- **Tickets** — searchable, status-filtered list backed by a client-side cache for instant filtering; filters sync to the URL.
- **Kanban board** — drag-free status columns for triaging tickets by state.
- **Ticket detail** — full ticket view with a chronological notes timeline, quick-snippet canned responses (`/greet`, `/logs`, `/resolve`), and optimistic status updates.
- **Analytics** — resolution-time, volume, and satisfaction charts.
- **Exports** — download the (filtered) ticket list as **CSV**, or as a generated **PDF** table via `jspdf` / `jspdf-autotable`.
- **Auth** — session-cookie login page; all app routes are protected by middleware.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5.x |
| UI | React 19, Tailwind CSS 4.x |
| Charts | Recharts 3.x |
| PDF export | jsPDF + jspdf-autotable |
| Database | Neon Serverless PostgreSQL |
| DB client | `pg` (node-postgres), raw parameterized SQL — no ORM |
| Auth | Cookie session, enforced in `proxy.ts` middleware |

---

## Database Schema

Two tables, all access via parameterized SQL (no ORM). See [`scripts/migrate.sql`](scripts/migrate.sql).

### `tickets`
- `id` SERIAL PRIMARY KEY
- `ticket_id` VARCHAR(20) UNIQUE NOT NULL — auto-generated `TKT-001`, `TKT-002`, …
- `customer_name` TEXT NOT NULL
- `customer_email` TEXT NOT NULL
- `subject` TEXT NOT NULL
- `description` TEXT NOT NULL
- `status` TEXT NOT NULL DEFAULT `'Open'` — one of `Open`, `In Progress`, `Closed`
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

### `notes`
- `id` SERIAL PRIMARY KEY
- `ticket_id` VARCHAR(20) REFERENCES tickets(ticket_id) ON DELETE CASCADE
- `note_text` TEXT NOT NULL
- `created_at` TIMESTAMPTZ DEFAULT NOW()

---

## Getting Started

### Prerequisites
- Node.js 20.9+
- npm 10+
- A Neon (or any) PostgreSQL connection string

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file from the template
cp .env.example .env.local

# 3. Fill in the values in .env.local (see below)

# 4. Apply the database schema
psql "$DATABASE_URL" -f scripts/migrate.sql
```

### Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon/PostgreSQL connection URI (target database) |
| `SOURCE_DATABASE_URL` | Source DB URI — only needed for the one-off `npm run migrate` data copy |
| `BASIC_AUTH_USER` | Login username (defaults to `admin`) |
| `BASIC_AUTH_PASS` | Login password (defaults to `streamdesk2026`) |

> The credential env names are prefixed `BASIC_AUTH_` for historical reasons; authentication is actually a cookie-session login form, not HTTP Basic Auth.

### Run

```bash
npm run dev
```

Open `http://localhost:3000`. You'll be redirected to `/login` — sign in with the credentials from `.env.local` to reach the dashboard.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run migrate` | One-off data migration (`scripts/migrate-data.js`, reads `.env.local`) |

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import it in the Vercel dashboard.
3. Set `DATABASE_URL`, `BASIC_AUTH_USER`, and `BASIC_AUTH_PASS` in the project's environment variables.
4. Deploy.

---

## Notes

This is a prototype / portfolio project, not hardened for production. Notably, credentials are compared in plaintext against env values and the session cookie is a static value — fine for a demo, but real deployments would need proper password hashing and signed/expiring sessions.
