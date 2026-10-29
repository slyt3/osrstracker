# OSRS Tracker

Track live Old School RuneScape Grand Exchange prices and find profitable flips.

- **What & why:** [plan.md](./plan.md)
- **How it's built:** [architecture.md](./architecture.md)

Two services, one database:

- `engine/` — Go service: polls the OSRS Wiki API, computes the flip board, serves public endpoints.
- `web/` — Next.js app: UI, accounts, billing, per-user features.
- `deploy/` — local `docker-compose.yml` (Postgres) and (later) production config.
- `contract/` — shared JSON types generated from the Go structs.

## Local development

```sh
# 1. Postgres
cd deploy && docker compose up -d

# 2. Web (Next.js on :3000)
cd web
cp .env.example .env            # edit if needed
npm install
npm run db:generate
npm run db:migrate              # creates the schema
npm run dev

# 3. Engine (Go on :8080)
cd engine
cp .env.example .env            # set a descriptive WIKI_USER_AGENT
go run ./cmd/engine
go test ./...                   # flip-engine tests
```

`web` reads `ENGINE_URL` to reach the engine. The flip board is empty until the
poller lands in **M1** — see the roadmap in [plan.md](./plan.md).
