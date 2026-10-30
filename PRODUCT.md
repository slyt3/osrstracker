# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Old School RuneScape players who **merch** (trade on the Grand Exchange for
profit) rather than grind for it. They range from casual flippers checking a
few items to dedicated merchers managing a bankroll across many positions.
Primary situation: second screen or alt-tab while playing — they want to know
*what to buy and sell right now*, and whether a tempting margin is real or a
trap. Assumed desktop-first with meaningful mobile use (checking prices away
from the game). *[Assumption: audience split and device mix are inferred from
the product's nature, not from analytics.]*

## Product Purpose

A live Grand Exchange decision tool. It polls real OSRS market data, computes
**margins after the 2% GE tax**, and ranks every tradeable item by profit, ROI
and profit-per-buy-limit so a player can find a flip in seconds. Supporting
features: per-item price charts, a watchlist, a journal with real P&L, Discord
alerts, and a crafting-profit view. Success = the player trusts the number on
the board enough to act on it, and comes back every session.

## Positioning

The number you see is the number you keep. Unlike raw price trackers, every
margin is **net of the exact GE tax** (2%, rounded down, 50 gp floor, 5m cap,
exempt list) and weighted by **buy limit and real trade volume** — so fat but
unfillable spreads on illiquid items are flagged, not celebrated. It is honest
about liquidity where competitors show gross spreads that never fill.

## Operating Context

- Data comes from the **OSRS Wiki real-time prices** feed, refreshed every 60s.
- Core semantics (authoritative): `high` = insta-buy (ask), `low` = insta-sell
  (bid); a patient flipper buys at `low`, sells at `high`;
  `margin = high − low − tax`.
- Key routes: `/` landing, `/board` (the flip board), `/item/[id]` (chart +
  alert), `/watchlist`, `/journal`, `/alerts`, `/craft`, `/pricing`.
- Live and deployed at **https://osrstracker.site** (behind an HTTP Basic Auth
  gate during development). Go engine + Next.js app + PostgreSQL.
- Per-user data (watchlist, journal, alerts) is currently a single global
  "dev-user" list until real auth lands.

## Capabilities and Constraints

- Free today: flip board, price charts, watchlist, journal/P&L, crafting profit.
- Planned as Pro (not yet gated): alerts, capital allocator.
- Terminology to keep exact: **gp** (gold pieces), **margin**, **ROI**,
  **buy limit**, **vol/h**, **F2P / Members (P2P)**, **flip**, **merch**, **tax**.
- Data legality: the Wiki data is **CC BY-NC-SA (NonCommercial)** — a hard
  constraint on any future paid tier until cleared with the OSRS Wiki team.
- Figures must read as real market data: tabular, monospaced, precise.
- Not yet built: live websocket push, real auth, billing.

## Brand Commitments

- Name: **OSRS Tracker**. Existing logo mark: a coin ring with an upward arrow
  ("a coin, going up"), single-colour, in `web/components/Logo.tsx`.
- Voice: blunt, specific, no marketing fluff; honest about limitations and
  liquidity traps. Speaks the player's language (gp, merch, flip), not SaaS.
- Hard constraint from the owner: **must not read as generic AI-generated
  design** — no purple gradients, no identical grey-shadow card grids, no
  all-caps eyebrow on every heading, no fade-up-everything motion.
- **Corrected preference (owner feedback, overrides earlier notes):** the owner
  read warm/fantasy palettes — wood, parchment, carved stone, coin-gold, glow —
  as "AI slop" and rejected them. The identity is **modern, cool and flat**:
  "Graphite & Signal" — a cool graphite ground, near-white type, hairline
  structure, and one flat signal accent (green = gain, red = loss). No gold, no
  glow, no bevels, no gradient-as-decoration. OSRS affinity now lives in the
  product's language and the green/red gains-signal, not in medieval dressing.

## Evidence on Hand

- Real live market data via the engine `/board` and `/timeseries` endpoints —
  the landing and board render actual current flips, not mock rows. Use real
  data, never lorem/fake item rows.
- Real OSRS item names, prices, volumes, buy limits from the live feed.
- No testimonials, user counts, revenue, or press exist — **do not fabricate**
  social proof, ratings, or "trusted by" claims.
- Pricing tiers shown on `/pricing` are **proposed**, not transacting — no real
  billing exists yet; do not imply active paid subscriptions.

## Product Principles

1. **Honesty over hype.** Show the real after-tax number and flag the catch
   (liquidity, buy limit, stale spread) rather than burying it.
2. **Decide in seconds.** The player's job is "what do I flip now" — the board
   and its ranking are the product; everything else supports that glance.
3. **Speak RuneScape.** Native player vocabulary and the game's own visual
   world; never generic fintech/SaaS dressing.
4. **Live, not static.** Numbers are current to the last 60s and must feel it.
5. **Earn the return visit.** Watchlist, journal and alerts make it a habit,
   not a one-off lookup.

## Accessibility & Inclusion

- Must work down to 360px wide; the board is dense data and needs a considered
  responsive strategy (column priority), not just horizontal scroll.
- Visible keyboard focus and sufficient contrast required (AGENTS.md Step 3).
- Respect `prefers-reduced-motion` for all motion.
