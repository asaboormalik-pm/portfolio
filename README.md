# portfolio

Product Portfolio covering the work i have done during the last 10 years of my professional experience.

Interactive portfolio platform — Phase 1a (Core foundation) of the project brief: landing/segmentation, STAR-M case studies, consultation estimator + contact form, and the Owner Configuration Console, on a tenant-aware data model.

## Stack

Next.js 16 (App Router, Cache Components) · Postgres via Drizzle ORM · Auth.js (single seeded owner) · Resend for notifications (optional).

## Local setup

```bash
npm install
cp .env.example .env.local      # fill AUTH_SECRET, OWNER_EMAIL, OWNER_PASSWORD
npm run db:start                # embedded Postgres on :5433 — leave running
npm run db:migrate
npm run db:seed                 # seeds the tenant from the original static page content
npm run dev                     # http://localhost:3000, console at /console
```

`npm run db:seed -- --reset` wipes and reseeds the tenant.

## Where things live

| Path | What |
| --- | --- |
| `src/db/schema.ts` | Tenant-aware schema — every content table has `tenant_id` |
| `src/lib/content.ts` | Cached public reads, tagged per tenant |
| `src/app/(site)` | Public site: `/`, `/work`, `/consulting`, `/recruiters` |
| `src/app/console` | Owner console; every action goes through `requireOwner()` (`src/lib/dal.ts`) |
| `drizzle/` | Generated SQL migrations (`npm run db:generate` after schema changes) |

Console saves call `updateTag` on the tenant's cache tag, so edits are live without a deploy.

## Deploying

Set `DATABASE_URL` (Neon/Supabase), `TENANT_SLUG`, `AUTH_SECRET`, and optionally `RESEND_API_KEY` + `NOTIFY_FROM`. Run `db:migrate` and `db:seed` against the production database once. Off Vercel, also set `AUTH_TRUST_HOST=true`.

`abdul-saboor-portfolio_3.html` is the original static page, kept for reference; its content now lives in the database.
