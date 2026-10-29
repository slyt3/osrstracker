# OSRS Tracker — Plan & Roadmap

A web app for Old School RuneScape players to **track live Grand Exchange prices
and find profitable flips** (buy low, resell high).

> Status: **live.** M0–M3 are built and deployed at https://osrstracker.site;
> M4 is half done (alerts yes, websocket not yet). The site is behind a password
> for now and all data is a single shared **dev user** until M6. See
> [HANDOFF.md](./HANDOFF.md) for the current state and
> [deploy/SERVER.md](./deploy/SERVER.md) for the server.

---

## What it does

- **Flip board** — live, sortable/filterable list of every item ranked by flip profit.
- **Price charts** — per-item price history.
- **Watchlist** — star items you care about.
- **Journal / P&L** — record your real buys & sells, track profit over time.
- **Alerts** — get notified when an item hits a target margin/price.
- **Capital allocator** — "given X gp, here's what to flip."

## Decisions locked

| Decision | Choice |
|---|---|
| Data source | OSRS Wiki real-time API (free, bulk, crowdsourced via RuneLite) |
| Stack | **Hybrid**: Go service (data + flip engine + realtime) + Next.js app (UI + accounts) |
| Database | PostgreSQL, schema owned by Prisma (in `web/`) |
| Hosting | Your KVM2 VPS + domain, behind nginx + Cloudflare |
| Money | Free core; paid "Pro" tier for premium features |

## The money model

The raw price data is **free** and stays free. The **Pro subscription** charges for
*our* computed value and convenience, not the data itself:

| Free | Pro |
|---|---|
| Flip board, filters, all ranking toggles | Alerts (email / Discord / push) |
| Price charts | Capital allocator |
| Small watchlist, basic journal | Unlimited watchlist, full P&L analytics, export, faster refresh |

### ⚠️ License to-do (before charging money)
The Wiki data is **CC BY-NC-SA 3.0** — the **NC = NonCommercial**. A paid product on
top of it is legally gray. **Action item:** message the OSRS Wiki team in their
`#api-discussion` Discord, explain the plan, and get their OK before the Pro tier
goes live. The data layer is designed to be swappable if we ever need our own feed.

## The GE tax (baked into the flip math)

From the OSRS Wiki (authoritative): **2%** of the sale price, **rounded down**,
**capped at 5,000,000 per item**, **none below 50 gp**, plus a fixed exempt list
(bonds, energy potions, low-level food/ammo/teleports/tools). Raised from 1% on
2025-05-29.

Flip math:
```
margin          = sellPrice - buyPrice - tax(sellPrice)
roi             = margin / buyPrice
profit per limit = margin * GE buy limit        (per 4h window)
profit per hour  = margin * min(limit-rate, hourly volume)   (realistic)
```

## Build order

Features first, **auth and payments last** — they're bolt-ons, not foundations.

> **One rule that keeps auth cheap later:** per-user tables (`WatchlistItem`,
> `Alert`, `Trade`) carry a `userId` from day one, backed by a hardcoded **dev
> user** until auth lands. Then we swap the stub for real sessions — no schema
> migration, no query rewrites. Features ship ungated; the Pro gate is a one-line
> guard added at the end.

| Milestone | Delivers | Status |
|---|---|---|
| **M0** | Repo skeleton: Next.js + Go both running, Postgres/Prisma wired, local dev works | ✅ done, live |
| **M1** | Flip board — Go poller + flip engine + `/board`, UI with filters & ranking toggles | ✅ done, live |
| **M2** | Per-item price charts (`/timeseries`) | ✅ done, live |
| **M3** | Watchlist + Journal / P&L *(dev user)* | ✅ done, live |
| **M4** | Alerts + live websocket updates *(dev user)* | 🟡 alerts done (Discord — needs a webhook URL to deliver); websocket ⬜ |
| **M5** | Capital allocator | ⬜ next up |
| **M6** | **Auth** — swap dev user for real accounts | ⬜ |
| **M7** | **Stripe** billing + free/Pro gating | ⬜ |

Also done beyond the milestones: a marketing **landing page + pricing page**, a
restrained custom **design** (not the stock AI look), a **baseline Prisma
migration**, and a **low-liquidity / stale-spread warning** on the board & item
pages. Not yet done from the spec above: the **`profit per hour`** metric and the
GE-tax **exempt-item list** (ItemMeta isn't populated).

**Deployment note:** the public board + charts can go live anytime (no auth).
Per-user features stay local/flagged-off until M6, or every visitor would share one
global journal.

> **Current reality:** the full app — including the per-user features — is
> already deployed, all backed by one shared **dev user** and gated behind a
> site-wide password. So today it's effectively a private, single-user instance;
> this is the trade-off noted above, accepted consciously until M6 auth.

## Data source cheat-sheet

| Endpoint | Use |
|---|---|
| `/latest` | current price per item (freshest, all items) |
| `/5m`, `/1h` | averages + trade **volume** (liquidity) |
| `/mapping` | item name, GE buy limit, members flag |
| `/timeseries?id=&timestep=` | price history for one item (charts) |

Base: `https://prices.runescape.wiki/api/v1/osrs` — requires a descriptive
`User-Agent`; use the **bulk** endpoints (no per-item requests).
