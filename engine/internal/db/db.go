// Package db holds the engine's read-side database access (pgx/sqlc). The
// schema itself is owned by Prisma in web/prisma — the engine only reads the
// tables it needs (Alert, ItemMeta). Stubbed until the engine first needs the
// DB (M4 alert checker).
package db

// TODO(M4): add a pgxpool connection and typed queries for Alert / ItemMeta.
// Connection string comes from DATABASE_URL (shared with the web app).
