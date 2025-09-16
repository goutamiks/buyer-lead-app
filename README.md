This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



# Buyer Lead Intake

A tiny Next.js (App Router) app to **capture, list, search/filter, import/export, and manage buyer leads** with **Prisma migrations**, **Zod validation (client + server)**, and **magic-link auth** (or demo login).

---

## Setup

### Prerequisites

* Node 18+
* npm/pnpm
* **Dev DB:** SQLite (default)
* **Prod DB:** Postgres/Supabase (optional)

### 1) Install

```bash
git clone https://github.com/<you>/buyer-lead-app.git
cd buyer-lead-app
npm install
```

### 2) Environment (`.env.local`)

```env
# --- Database ---
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
# For Postgres/Supabase in prod:
# DATABASE_PROVIDER=postgresql
# DATABASE_URL="postgresql://user:pass@host:5432/db"

# --- NextAuth (Email magic link) ---
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-me-32-bytes   # e.g. `openssl rand -base64 32`

# Email (choose a working SMTP)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your@email.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="Buyer Leads <no-reply@yourdomain.com>"

```

### 3) Migrate & (optionally) Seed

```bash
npx prisma migrate dev --name init
npm run seed      # optional: creates a demo user + sample buyers
```

### 4) Run Locally

```bash
npm run dev
# open http://localhost:3000
```

> **Login:** Use the magic link on `/login`, or enable `DEMO_MODE=true` and sign in with `demo@local / demo`.

---

## Design Notes

### Validation (where it lives & how it’s used)

* **Single source of truth:** Zod schemas live in `lib/zodSchemas.ts`.
* **Client:** React Hook Form + Zod resolver for instant field errors and a11y announcements.
* **Server:** The same Zod schema validates payloads in route handlers/server actions.
* **Rules covered:**

  * `fullName` 2–80 chars; `phone` digits 10–15; optional `email` must be valid
  * `budgetMax ≥ budgetMin` when both present
  * `bhk` **required** only if `propertyType ∈ {Apartment, Villa}`
  * `notes ≤ 1000 chars`; `tags` normalized to `string[]`
  * **Strict enums** for all enum fields; unknown → error (incl. CSV)

### SSR vs Client (where work happens)

* **`/buyers` (List):** **SSR** with real server pagination (10/pg), URL-synced filters (`city, propertyType, status, timeline`) and debounced search over `fullName|phone|email`. Sorting is `updatedAt desc` on the server.
  This keeps results authoritative, shareable via URL, and fast on reload.
* **Forms (`/buyers/new`, `/buyers/[id]`):** client form UX, server creates/updates.
  Edit submits a hidden `updatedAt` to enforce concurrency (see below).

### Ownership Enforcement (and auth)

* **Auth:** NextAuth (Email magic link) or demo login.
* **Read:** any authenticated user can read all buyers.
* **Write:** only the **owner** can edit/delete (`ownerId === session.user.id`); optional `admin` role can edit all.
* **Where enforced:** **server-side** in route handlers (never trusted on client).
* **History (`buyer_history`):** every create/update computes a minimal **diff** `{ field: {old, new} }`, recorded with `changedBy` and `changedAt`. Detail page shows last 5 entries.
* **Concurrency:** optimistic check using `updatedAt`; if stale, respond with a friendly **“Record changed, please refresh.”**

### Import / Export (behavior & safety)

* **Import:** `/import` accepts CSV (≤ 200 rows) with exact headers.
  Each row runs through the same **Zod** schema. Unknown enums → errors.
  Only valid rows are inserted inside **one transaction**; UI shows an **error table** with `row# + message`.
* **Export:** `/api/buyers/export.csv` streams the **current filtered list** (respects filters/search/sort).

### Data Model (high level)

* `buyers` table includes all required fields; `tags` stored as **JSON** (portable across SQLite/Postgres).
* `buyer_history` records diffs for audit.
* Prisma migrations are used for all schema changes.

### Safety & Quality

* **Rate limit** on create/update (per IP/user) to prevent spam.
* **Error boundary** + empty states for list/detail.
* **A11y:** labeled inputs, focus management, errors announced with `aria-live`.
* **Test:** at least one unit test (e.g., CSV row validator or budget rule).

---

## What’s Done vs Skipped (and Why)

### ✅ Done

* CRUD for buyers with **Zod validation** on both client & server
* **SSR list** with real pagination, URL-synced filters, debounced search, sort by `updatedAt desc`
* **View/Edit** with optimistic **concurrency check** (`updatedAt`)
* **Ownership checks** on server; optional admin override
* **Buyer history** with diffs (last 5 shown in UI)
* **CSV Import** (≤200 rows): row-level errors, valid subset inserted in a **transaction**
* **CSV Export** that respects current filters/search/sort
* **Rate limiting** on create/update
* **Error boundary**, empty states, and **accessibility** basics
* **1 unit test** (validator)

### 🟡 Implemented as optional / partial

* **Tag chips with typeahead** (enabled if `ENABLE_TAG_TYPEAHEAD=true`)
* **Status quick-actions** dropdown in list rows
* **Basic full-text search**: Postgres recommended; SQLite falls back to `LIKE`

### ⏭️ Skipped (intentionally)

* **File uploads** for `attachmentUrl` (storage wiring deferred) — reduces scope
* **Advanced roles/multi-tenant** — not required by brief
* **Complex filters on notes** in SQLite — reserved for Postgres FTS
* **Background jobs/queues** — unnecessary for assignment scale

> Skips keep the app focused on the rubric: correctness, SSR data access, validation/ownership, and import/export safety with migrations.

