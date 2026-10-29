# OSRS Tracker — Handoff / Context

Durable context for a fresh session (or a new teammate). Read this first, then
[plan.md](./plan.md) (what & why), [architecture.md](./architecture.md) (how
it's built), and [deploy/SERVER.md](./deploy/SERVER.md) (the live server).

---

## TL;DR

A web app for Old School RuneScape players: a live Grand Exchange **flip board**
(buy low / sell high, margins after the 2% GE tax), per-item **price charts**, a
**watchlist**, a **journal with P&L**, and **Discord alerts**.

- **Stack:** Go engine (`engine/`, data + flip math + alerts) + Next.js app
  (`web/`, UI + per-user features) + PostgreSQL (schema owned by Prisma in
  `web/prisma`).
- **It is deployed and live at https://osrstracker.site** on the user's KVM2 VPS.
- **Git:** everything is committed on branch `master`. There is **no git remote
  and nothing has been pushed** — the user pushes manually, only when they say so.

---

## Status (roadmap from plan.md)

| Milestone | State |
|---|---|
| M0 skeleton (Go + Next + Postgres/Prisma) | ✅ done, live |
| M1 flip board (poller + flip engine + `/board` + UI) | ✅ done, live |
| M2 per-item price charts (`/timeseries` + `/item/[id]`) | ✅ done, live |
| M3 watchlist + journal/P&L | ✅ done, live |
| M4 alerts (Discord) | ✅ done, live & delivering to Discord (webhook URL set in the engine's `.env` on the server, not in the repo) |
| M4 live websocket (`/live`) | ⬜ **not done** (deferred; the board refreshes per request) |
| M5 capital allocator | ⬜ |
| M6 auth (replace dev user) | ⬜ |
| M7 Stripe billing + Pro gating | ⬜ |

### Per-user data is "dev-user" backed until M6
Every per-user row (`WatchlistItem`, `Alert`, `Trade`) carries a `userId`. Until
auth lands, `web/lib/user.ts` resolves `currentUserId()` to a hardcoded
`dev-user` (auto-created on first write via `ensureDevUser()`). So the watchlist/
journal/alerts are currently a **single global list**. M6 = swap that stub for a
real session; no schema or query changes needed.

---

## Live deployment (KVM2)

Full detail in [deploy/SERVER.md](./deploy/SERVER.md). Essentials:

- **Server:** Debian 13 VPS, IPv4 `<SERVER_IP>`, IPv6 `<SERVER_IPV6>`.
  SSH user `<SERVER_USER>` (has sudo). Domain `osrstracker.site` (+`www`), DNS at
  Hostinger, HTTPS via Let's Encrypt (auto-renew).
- **Runs as the `osrstracker` system user**, two systemd services behind nginx:
  - `osrstracker-engine` — Go binary at `/home/osrstracker/engine/engine`, serves `:8080`.
  - `osrstracker-web` — `next start`, app at `/home/osrstracker/web`, serves `:3000`.
  - nginx proxies `https://osrstracker.site` → `127.0.0.1:3000` (the web app).
  - PostgreSQL 17 local (`osrstracker` db, role `osrs`), **localhost-only**.
- **The engine is NOT publicly exposed** (only nginx→web is). Engine `:8080` is
  reached by the web app over localhost.
- Manage: `sudo systemctl restart osrstracker-{engine,web}`, logs via
  `sudo journalctl -u osrstracker-engine -f`.

### Discord alerts — live
`DISCORD_WEBHOOK_URL` is set in `/home/osrstracker/engine/.env` (not in the repo —
it's a secret), so firings post to the user's Discord channel. To change the
target channel, replace that value and restart the engine.

---

## Repo layout

```
engine/   Go service (stdlib + pgx). cmd/engine = entrypoint.
          internal/{source,flip,cache,poller,api,alerts,db}
web/      Next.js 15 + React 19 + Prisma 6. app/ routes, components/, lib/, prisma/
deploy/   docker-compose (local Postgres) + SERVER.md (production)
contract/ (placeholder) Go→TS type codegen boundary
```
Key engine pieces: `flip/` is a **pure** package (tax + ranking, unit-tested);
`source/` has the `PriceSource` interface + `WikiPriceSource`; `poller/` refreshes
the board every 60s; `alerts/` + `db/` are the M4 Discord checker (pgx).

Key web routes: `/` landing, `/board`, `/item/[id]` (chart + alert form),
`/watchlist`, `/journal`, `/alerts`, `/pricing`. API under `/api/{watchlist,trades,alerts}`.

---

## Local toolchain (Windows dev machine)

- **Node 24 + npm** are installed system-wide. `pnpm`, **Go**, and **Docker are
  NOT installed.**
- The Go engine was built using a **portable Go downloaded into the session
  scratchpad** (`go1.23.4`). That scratchpad is **session-specific and does not
  persist** — a new session must re-download Go to build/cross-compile the engine:
  ```
  curl -sSL -o go.zip https://go.dev/dl/go1.23.4.windows-amd64.zip && unzip to <scratchpad>/goroot
  export GOROOT=<scratchpad>/goroot/go PATH=$GOROOT/bin:$PATH GOTOOLCHAIN=local
  export GOCACHE=<scratchpad>/gocache GOPATH=<scratchpad>/gopath
  ```
  Use **Go 1.23** (not newer) because `go.mod` pins `pgx v5.7.2` for 1.23
  compatibility; `pgx` latest needs Go ≥1.25.
- Line endings: Git warns `LF will be replaced by CRLF` constantly — harmless.

---

## Deploy workflow (the exact recipe)

The server has **Node but no Go and no Docker**, so:
**engine is cross-compiled locally and shipped as a binary; web is built on the
server.** SSH is done over **paramiko** (Python) because there's no `sshpass`;
helper scripts live in the session scratchpad (`ssh_run.py`, `sftp_put.py`), and
the SSH/sudo password is passed via the `SSH_PASS` env var (NOT stored in the
repo — ask the user; it's the same password for sudo via `sudo -S`).

**Gotcha:** the server's SFTP is **chrooted to the login user's home**, so uploads
must use a **relative path** (lands in `/home/<SERVER_USER>/`), then `sudo cp`/`tar` into
place.

### Engine redeploy
```
# locally, with portable Go env set:
cd engine && GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o engine-linux ./cmd/engine
# upload engine-linux to /home/<SERVER_USER>/ (sftp, relative path), then on server:
sudo install -o osrstracker -g osrstracker -m 0755 /home/<SERVER_USER>/engine-linux /home/osrstracker/engine/engine
sudo systemctl restart osrstracker-engine
```

### Web redeploy
```
# locally: package tracked web files
git archive --format=tar -o web.tar HEAD web
# upload web.tar to /home/<SERVER_USER>/ (sftp relative), then on server:
sudo tar -xf /home/<SERVER_USER>/web.tar -C /home/osrstracker   # preserves .env + node_modules
sudo chown -R osrstracker:osrstracker /home/osrstracker/web
sudo -u osrstracker env HOME=/home/osrstracker bash -lc \
  'cd /home/osrstracker/web && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build'
sudo systemctl restart osrstracker-web
```
(`npm ci` only needed when deps change. `migrate deploy` applies new migrations.)

**Permission classifier:** some server-mutating commands get auto-denied
(anything it reads as DNS/cert/dangerous). `certbot` was run by the user by hand
once. If a combined command is denied, split it into smaller steps.

---

## Hard-won gotchas (don't rediscover these)

1. **Buy/sell semantics (OSRS Wiki, authoritative):** `high` = insta-buy price
   (ask), `low` = insta-sell price (bid). A patient flipper **buys at `low`,
   sells at `high`**; `margin = high − low − tax`. The flip engine uses
   `buy = Low, sell = High`. (M0 originally had these inverted — fixed in `flip`.)
   Big spreads on cheap items = **low liquidity / stale `high`/`low` from
   different times**, not real profit; that's why volume filters exist.
2. **GE tax:** 2% of sale, rounded down, none under 50 gp, capped 5,000,000/item.
   Implemented in `engine/internal/flip/flip.go` (`Tax`) and `web/lib/tax.ts`
   (`geTax`). **Exempt-item list is NOT handled yet** (`ItemMeta.exempt` unused).
3. **pgx + Prisma DSN:** Prisma puts `?schema=public` on `DATABASE_URL`; libpq
   rejects it (`unrecognized configuration parameter "schema"`). `engine/internal/db`
   `Connect` strips it before dialing.
4. **Next.js ISR vs live data:** the board must be `export const dynamic =
   "force-dynamic"` (and fetch `cache:"no-store"`), or it gets prerendered at
   build time with a stale/"engine unreachable" board. The landing uses
   `revalidate = 60` to show real top flips.
5. **Prisma `@default(cuid())` is client-side**, not a DB default — raw SQL inserts
   (e.g. the engine writing `AlertEvent`) must generate the `id` themselves.
6. **Wiki API needs a descriptive `User-Agent`.** Do **not** put the user's
   personal email in it (or any outbound request) without being asked — a generic
   descriptive UA is used (`WIKI_USER_AGENT`).
7. **Schema is under Prisma migrations** now (baselined init migration). Use
   `prisma migrate deploy`, not `db push`.

---

## Recipes (crafting data)

`Recipe` + `RecipeMaterial` tables hold ~5.7k OSRS production recipes scraped
from the Wiki's **`recipe` bucket** (`api.php?action=bucket`). Ingested by
`web/scripts/ingest-recipes.mjs` (wipe-and-reload; resolves item names → ids via
the prices `/mapping`). Re-run after game updates:
```
cd /home/osrstracker/web && set -a && . ./.env && set +a && node scripts/ingest-recipes.mjs
```
The **crafting-profit** page (`/craft`) joins recipes to live prices
(cost vs. sell-after-tax + volume), via `web/lib/craft.ts`.

`ItemCategory` table maps ~1k items to a primary category (Fish, Helmets, …),
built by `scripts/ingest-categories.mjs` from the Wiki's category pages (edit the
`CATEGORIES` list to add more). Powers the board's Category filter. Re-run:
`npm run ingest:categories` (same env-sourcing as recipes). Note: OSRS's own GE
API gives NO per-item categories (everything is "Default"), hence the Wiki source.

## Outstanding TODOs

- Set `DISCORD_WEBHOOK_URL` to actually deliver alerts (user must provide URL).
- M4 remainder: `/live` websocket for push board updates.
- Populate `ItemMeta` (members flag, GE buy limit, **exempt flag**) so tax
  exemptions and a members filter work; engine `db` could upsert it from `/mapping`.
- Optional UX: flag low-volume / stale-spread items on the board/chart (user asked
  about confusing big spreads on illiquid items).
- Legal: the Wiki data is **CC BY-NC-SA (NonCommercial)** — before charging for
  Pro, clear it with the OSRS Wiki team (see plan.md).
- Consider Go→TS codegen for `contract/` (shapes are currently hand-declared in
  `web/lib/engine.ts`).

---

## Working style the user expects

- **Small, feature-scoped commits** (conventional-commit style), each verified.
- **Verify for real** (build/test/run), not just "looks right". Engine: `go test
  ./...`; web: `npm run build`; then end-to-end against the live site.
- Commit messages end with the co-author trailer the session was given.
- **Do not push** unless the user explicitly says to.
- Design: the user strongly dislikes "AI slop" — the site uses a restrained
  "stone & gold" theme (Space Grotesk + JetBrains Mono, flat surfaces, one gold
  accent, mono figures). Keep that discipline; see `web/app/globals.css`.
```
Commit trailer currently in use:
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```
