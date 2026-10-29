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
- **Currently serves a static placeholder** at `/var/www/osrstracker.site/`.

### Switching from placeholder to the live app

The vhost has both blocks; the proxy block is commented out. To serve the app
(running on `:3000`), comment the static `root`/`index`/`location /` block and
uncomment the `proxy_pass http://127.0.0.1:3000` block, then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Cert issued originally with:

```bash
sudo certbot --nginx -d osrstracker.site -d www.osrstracker.site \
  --non-interactive --agree-tos --register-unsafely-without-email --redirect
```

## Deploying the app (outline)

Mirrors how the previous site on this box was run (systemd + node, proxied by
nginx). For osrstracker:

1. Build `web/` (`npm ci && npm run build`) and run it with `npm start` on
   `:3000` under a systemd service owned by a dedicated app user.
2. Build `engine/` (`go build -o engine ./cmd/engine`) and run it on `:8080`
   under its own systemd service; set `WIKI_USER_AGENT` and `DATABASE_URL`.
3. Point nginx at the app (see the proxy switch above). If the Go engine is
   exposed publicly, add an `api.osrstracker.site` vhost → `:8080`.

Example systemd unit (web):

```ini
[Unit]
Description=OSRS Tracker web (Next.js)
After=network.target postgresql.service

[Service]
Type=simple
User=osrstracker
WorkingDirectory=/home/osrstracker/web
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=2
EnvironmentFile=/home/osrstracker/web/.env   # DATABASE_URL, ENGINE_URL (chmod 600)
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

## Other

- `/var/www/future-site/` — reserved placeholder web root for a possible second
  site (no vhost points at it yet).
