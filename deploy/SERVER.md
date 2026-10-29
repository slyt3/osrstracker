# Production server (KVM2)

How the live box is set up. This records the current state so it can be
rebuilt or handed off. See [../architecture.md](../architecture.md) for the
intended production topology.

> **Secrets are NOT in this repo.** The database password and any app secrets
> live only in env files on the server (`chmod 600`, owned by the app user).
> This doc gives the *shape* of the config, not the values.

## Host

| | |
|---|---|
| Provider | KVM2 VPS |
| OS | Debian 13 (trixie) |
| Login user | `<SERVER_USER>` (sudo) |
| IPv4 | `<SERVER_IP>` |
| IPv6 | `<SERVER_IPV6>` |
| Domain | `osrstracker.site` (+ `www.`) |

### DNS (at the registrar / Hostinger zone)

| Type | Name | Content |
|---|---|---|
| A | `@` | `<SERVER_IP>` |
| AAAA | `@` | `<SERVER_IPV6>` |
| CNAME | `www` | `osrstracker.site` |

## PostgreSQL

- **PostgreSQL 17** (`postgresql@17-main`), listening on **127.0.0.1:5432 only**
  (not exposed to the internet).
- Database **`osrstracker`**, owned by role **`osrs`** (login, password set on the
  server).

App connection string (password redacted — see server env):

```
DATABASE_URL="postgresql://osrs:<PASSWORD>@localhost:5432/osrstracker?schema=public"
```

Recreate the role/db:

```bash
sudo -u postgres psql -c "CREATE ROLE osrs LOGIN PASSWORD '<PASSWORD>';"
sudo -u postgres psql -c "CREATE DATABASE osrstracker OWNER osrs;"
```

Create the tables from `web/`:

```bash
cd web && DATABASE_URL=... npx prisma migrate deploy
```

## Web (nginx + TLS)

- Vhost: `/etc/nginx/sites-available/osrstracker.site` (symlinked into
  `sites-enabled/`).
- TLS: **Let's Encrypt** cert for `osrstracker.site` + `www.`, auto-renewing via
  certbot's systemd timer. HTTP is 301-redirected to HTTPS.
- **Serves the app** by proxying `https://osrstracker.site` → `127.0.0.1:3000`
  (the Next.js service). The previous static-placeholder vhost is kept as
  `/etc/nginx/sites-available/osrstracker.site.placeholder.bak`.

Cert issued originally with:

```bash
sudo certbot --nginx -d osrstracker.site -d www.osrstracker.site \
  --non-interactive --agree-tos --register-unsafely-without-email --redirect
```

## App deployment (live)

The app runs as the dedicated **`osrstracker`** system user (nologin), under
two systemd services, proxied by nginx:

| Service | Runs | Port | Path |
|---|---|---|---|
| `osrstracker-engine` | the Go binary | `:8080` | `/home/osrstracker/engine/engine` |
| `osrstracker-web` | `next start` | `:3000` | `/home/osrstracker/web` |

Env files (chmod 600, owned by `osrstracker`):
`/home/osrstracker/engine/.env` (`ENGINE_ADDR`, `WIKI_USER_AGENT`,
`POLL_INTERVAL`, `DATABASE_URL`) and `/home/osrstracker/web/.env`
(`DATABASE_URL`, `ENGINE_URL=http://localhost:8080`).

Unit files: `/etc/systemd/system/osrstracker-{engine,web}.service` (both
`enable`d). Manage with `systemctl {status,restart} osrstracker-engine` etc.;
logs via `journalctl -u osrstracker-web`.

### How it was deployed / how to redeploy

The server has **Node 24 but no Go**, so the engine is cross-compiled locally
and shipped as a binary; the web app is built on the server.

```bash
# engine: cross-compile to a static linux binary, upload, replace, restart
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o engine-linux ./cmd/engine
#   scp engine-linux -> /home/osrstracker/engine/engine ; chmod +x ; chown osrstracker
sudo systemctl restart osrstracker-engine

# web: upload source (git archive HEAD web), then on the server as osrstracker:
cd /home/osrstracker/web
npm ci
npx prisma generate
npx prisma migrate deploy   # apply any new migrations
npm run build
sudo systemctl restart osrstracker-web
```

> SFTP on this box is chrooted to the login user's home, so uploads land in
> `/home/<SERVER_USER>/` and are then `sudo cp`'d into place.

### Database schema

Under Prisma migrations. The tables were originally created with `db push`,
then the init migration was baselined (`prisma migrate resolve --applied
20261029120000_init`), so the DB now tracks history. Apply future schema
changes with `npx prisma migrate deploy` (part of the redeploy steps above).

## Other

- `/var/www/future-site/` — reserved placeholder web root for a possible second
  site (no vhost points at it yet).
