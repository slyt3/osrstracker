// Package db is the engine's read/write access to the shared Postgres database.
// The schema is owned by Prisma (web/prisma); the engine only touches the
// tables it needs for alerts (Alert, AlertEvent). Identifiers are quoted
// camelCase to match Prisma's generated schema.
package db

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/url"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DB struct{ pool *pgxpool.Pool }

// Connect opens a pooled connection and verifies it. The `schema` query
// parameter (a Prisma convention) is stripped — libpq rejects it as an unknown
// runtime setting; tables live in the default `public` schema anyway.
func Connect(ctx context.Context, dsn string) (*DB, error) {
	if u, err := url.Parse(dsn); err == nil {
		q := u.Query()
		if q.Has("schema") {
			q.Del("schema")
			u.RawQuery = q.Encode()
			dsn = u.String()
		}
	}
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return &DB{pool: pool}, nil
}

func (d *DB) Close() { d.pool.Close() }

// Alert is one active user alert.
type Alert struct {
	ID        string
	ItemID    int
	Kind      string // margin | price | roi
	Op        string // >= | <= | > | <
	Threshold float64
}

// ActiveAlerts returns all alerts currently armed.
func (d *DB) ActiveAlerts(ctx context.Context) ([]Alert, error) {
	rows, err := d.pool.Query(ctx,
		`SELECT id, "itemId", kind::text, op, threshold FROM "Alert" WHERE active = true`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Alert
	for rows.Next() {
		var a Alert
		if err := rows.Scan(&a.ID, &a.ItemID, &a.Kind, &a.Op, &a.Threshold); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

// LastFired returns when an alert most recently fired, if ever.
func (d *DB) LastFired(ctx context.Context, alertID string) (time.Time, bool, error) {
	var t time.Time
	err := d.pool.QueryRow(ctx,
		`SELECT "firedAt" FROM "AlertEvent" WHERE "alertId" = $1 ORDER BY "firedAt" DESC LIMIT 1`,
		alertID).Scan(&t)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return time.Time{}, false, nil
		}
		return time.Time{}, false, err
	}
	return t, true, nil
}

// InsertAlertEvent records a firing. The id is generated here because Prisma's
// cuid() default is client-side, not a DB default.
func (d *DB) InsertAlertEvent(ctx context.Context, alertID string, priceAtFire int64) error {
	_, err := d.pool.Exec(ctx,
		`INSERT INTO "AlertEvent" (id, "alertId", "firedAt", "priceAtFire") VALUES ($1, $2, now(), $3)`,
		newID(), alertID, priceAtFire)
	return err
}

func newID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return "ae_" + hex.EncodeToString(b)
}
