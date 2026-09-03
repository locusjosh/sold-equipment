# sold-equipment

Smart Sold Equipment pipeline + warehouse installs board. Replaces the Zapier EQUIP SOLD Zap with a Next.js app: ingest, ops auto-approve, warehouse board, and Slack/ST/requisition stubs (dry-run when env unset).

Design notes: docs/ (auto-approve v1, history patterns, Zap blueprint).

## Quick start (demo — no secrets)

```bash
cp .env.example .env
bun install
bun run db:push
bun run db:seed
bun run dev
```

Also works with Node package scripts: install, db:push, db:seed, dev, test, build.

Open http://localhost:3000

- Sold queue: /sold
- Warehouse: /warehouse
- Rules: /rules
- Re-seed: GET /api/demo/seed

## Scripts

- dev / build / start — Next.js
- test — Vitest rule-engine unit tests
- db:push — Prisma push SQLite schema
- db:seed — Seed 8 sold estimates + warehouse stub

## Environment

See .env.example. Demo only needs DATABASE_URL="file:./dev.db".

Optional (console dry-run if unset):

- ST_TENANT_ID, ST_CLIENT_ID, ST_CLIENT_SECRET, ST_APP_KEY
- SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_D2D_CHANNEL_ID (default C023D32SLLR)

Do not commit real ServiceTitan secrets.

## How this replaces EQUIP SOLD Zap

| Zap step | This app |
|----------|----------|
| Outlook poll + Code extract | POST /api/sold/ingest |
| Slack ops Approve / Decline | Rule engine auto or /sold/[id] override |
| Zapier Tables + installs webhook | Prisma Install + /warehouse + /api/installs |
| Warehouse Ready / Not Ready | Status pills + /api/installs/loaded |
| Requisition after both green | integrations/requisition stub |

v1 rules: SAFE 2T/2.5T/3T GLX+HXS pairs; Rise Broadway condenser-only (+A2L); Park Mesa / Griffin walls; escalate Hue97 (unless A5AC+HXS), Indigo/GLZS/HP Closet, tonnage mismatch, unknown SKUs; never escalate solely for job N/A.

## Migration notes

1. Keep Zap published until ST sold events hit ingest.
2. Wire automation to POST /api/sold/ingest with estimateId, locationName, jobNumber, skus, total.
3. /api/installs accepts the old webhook payload shape (array ok).
4. Slack buttons can come later; v1 dry-runs text and stores slackTs.
5. Swap SQLite to Postgres via Prisma provider + DATABASE_URL for production.

## Stack

Next.js App Router, TypeScript, Tailwind, Prisma, SQLite, Vitest
