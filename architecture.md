# OSRS Tracker — Architecture

Onboarding doc for developers. Explains how the system is put together and where
every piece of code lives. Read [plan.md](./plan.md) first for *what* we're building.

---

## High-level shape

Two services, one database. A **hybrid** so each language does what it's best at:

```
                 ┌─────────────────────────────────────────────┐
  Cloudflare ──▶ │ nginx (TLS, reverse proxy)                   │
                 └───────────────┬──────────────────┬───────────┘
                                 │                  │
              yourdomain.com     │                  │  api.yourdomain.com
                                 ▼                  ▼
                        ┌──────────────┐    ┌──────────────────────┐
                        │  web (Next.js)│    │  engine (Go)         │
                        │  UI + auth    │    │  poller + flip engine│
                        │  + billing    │◀──▶│  + /board + /live(ws)│
                        │  + per-user   │    │  + alert checker     │
                        └───────┬───────┘    └──────────┬───────────┘
                                │                       │
                                └────────┬──────────────┘
                                         ▼
                                   ┌───────────┐
                                   │ PostgreSQL│   (schema owned by Prisma)
                                   └───────────┘
                                         ▲
                                         │ polls every ~60s
                                   OSRS Wiki real-time API
```

### Who owns what

| Concern | Lives in | Why |
|---|---|---|
| Poll Wiki, compute flips, cache board, websockets, alert checker | **engine (Go)** | concurrency + throughput; one fast binary |
| UI, auth, billing, watchlist/journal pages, per-user API | **web (Next.js)** | best ecosystem for SaaS (Auth.js, Stripe, Prisma) |
| DB schema + migrations | **web/prisma** | single source of truth for the data model |
| Live prices | **cache (in engine)**, never the DB | identical for all users → cache once, serve to everyone |

**Key simplification:** in v1 the Go engine serves only **public** data (`/board`,
`/timeseries`) and runs **background** jobs (poller, alerts). It never authenticates
a user request — all per-user work stays in Next.js. So there's no cross-language
session handling to build.

## Two boundaries that keep it clean

1. **`PriceSource` interface** (in the engine). Methods: `GetLatest`, `GetHourly`,
   `GetMapping`, `GetTimeseries`. v1 implementation = `WikiPriceSource`. If we ever
   need our own data feed (for the paid tier), we add a second implementation and
   change one line.

2. **`flip` engine** — a **pure** package: `(prices, mapping, taxRules, opts) → []Row`.
   No I/O, fully unit-tested. Ranking toggles = a `sortBy` option; capital-aware =
   a `bankroll` option. The GE tax rules live here as data.

## Data flow (flip board)

```
engine poller ──(every 60s)──▶ Wiki /latest + /1h + /mapping
      │
      ▼
 flip engine computes rows (margin after tax, roi, profit, volume)
      │
      ▼
  board cache (JSON)  ──GET /board──▶  nginx/Cloudflare (cached ~30s)  ──▶  web UI
```
The board is the same for everyone, so one computation serves all traffic — this is
why it scales cheaply.

## Folder structure

```
osrstracker/
├─ engine/                 # Go service — data, flip logic, realtime
│  ├─ cmd/engine/          #   main.go — process entrypoint, wiring
│  ├─ internal/
│  │  ├─ source/           #   PriceSource interface + WikiPriceSource
│  │  ├─ flip/             #   pure flip engine: tax, ranking, allocator (+ tests)
│  │  ├─ cache/            #   board cache (in-memory now, Redis later)
│  │  ├─ api/              #   HTTP handlers: /board, /timeseries, /live (websocket)
│  │  ├─ alerts/           #   background alert checker
│  │  └─ db/               #   pgx/sqlc queries (reads Alert, ItemMeta)
│  └─ go.mod
│
├─ web/                    # Next.js app — UI + accounts
│  ├─ app/                 #   routes:
│  │  ├─ page.tsx          #     /            flip board (public)
│  │  ├─ item/[id]/        #     /item/:id    chart + detail (public)
│  │  ├─ watchlist/        #     per-user (auth)
│  │  ├─ journal/          #     per-user P&L (auth)
│  │  ├─ settings/billing/ #     Stripe
│  │  └─ api/              #     per-user API routes (use Prisma)
│  ├─ components/          #   UI components (table, chart, filters)
│  ├─ lib/                 #   engine API client, prisma client, auth helpers
│  ├─ prisma/              #   schema.prisma + migrations  ← OWNS the database
│  └─ package.json
│
├─ contract/               # TS types generated from Go structs (shared JSON shapes)
├─ deploy/                 # nginx config, systemd units, docker-compose (local dev)
├─ architecture.md         # this file
├─ plan.md                 # product plan & roadmap
└─ .gitignore
```

## Data model (Prisma)

Prices are **not** stored — only your own records persist.

```prisma
model User          { id  email  plan(free|pro)  stripeCustomerId  ... }
model WatchlistItem { id  userId  itemId  note }
model Alert         { id  userId  itemId  kind(margin|price|roi)  op  threshold  channel  active }
model Trade         { id  userId  itemId  side(buy|sell)  qty  price  tax  ts }   // journal / P&L
model ItemMeta      { itemId  name  members  buyLimit  exempt }                   // cached /mapping
model AlertEvent    { id  alertId  firedAt  priceAtFire }
```

Every per-user row has `userId` from day one (backed by a dev user until auth — see
[plan.md](./plan.md)).

## API contract (engine → web)

| Route | Returns |
|---|---|
| `GET /board` | `{ ts, rows: Row[] }` — the ranked flip board |
| `GET /timeseries/:id?timestep=5m` | price history points for one item |
| `WS /live` | pushes board diffs as prices update |

`Row` and the timeseries point are defined as **Go structs with json tags**;
TypeScript types are generated into `contract/` so the shapes never drift.

## Local development

```
docker-compose up        # Postgres
cd web && pnpm dev        # Next.js on :3000
cd engine && go run ./cmd/engine   # Go service on :8080
```
`web` reads `ENGINE_URL=http://localhost:8080`.

## Deployment (KVM2)

- **Cloudflare** — DNS, CDN, TLS, caches `/board`.
- **nginx** — reverse proxy; `yourdomain.com → web:3000`, `api.yourdomain.com → engine:8080`.
- **Postgres** — local to the box.
- **web** and **engine** — each a `systemd` service (engine) / `pm2` or `systemd` (web).
- **Let's Encrypt** — TLS certificates.

One VPS comfortably runs all of v1; the board's cache-once-serve-all design means
traffic growth hits the cache/CDN, not the database.
