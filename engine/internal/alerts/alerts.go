// Package alerts runs the background alert checker: on an interval it loads
// active alerts, evaluates them against the current board, and on a firing it
// posts to Discord and records an AlertEvent (with a per-alert cooldown so it
// doesn't spam). See architecture.md.
package alerts

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/osrstracker/engine/internal/cache"
	"github.com/osrstracker/engine/internal/db"
	"github.com/osrstracker/engine/internal/flip"
	"github.com/osrstracker/engine/internal/source"
)

type Checker struct {
	db         *db.DB
	board      *cache.Board
	webhookURL string
	interval   time.Duration
	cooldown   time.Duration
	client     *http.Client
}

func NewChecker(database *db.DB, board *cache.Board, webhookURL string, interval, cooldown time.Duration) *Checker {
	return &Checker{
		db:         database,
		board:      board,
		webhookURL: webhookURL,
		interval:   interval,
		cooldown:   cooldown,
		client:     &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *Checker) Run(ctx context.Context) {
	ticker := time.NewTicker(c.interval)
	defer ticker.Stop()
	log.Printf("alerts: checker running (interval %s, cooldown %s, discord=%v)", c.interval, c.cooldown, c.webhookURL != "")
	for {
		select {
		case <-ctx.Done():
			log.Println("alerts: stopped")
			return
		case <-ticker.C:
			if err := c.check(ctx); err != nil {
				log.Printf("alerts: check failed: %v", err)
			}
		}
	}
}

func (c *Checker) check(ctx context.Context) error {
	alerts, err := c.db.ActiveAlerts(ctx)
	if err != nil {
		return err
	}
	if len(alerts) == 0 {
		return nil
	}
	_, rows := c.board.Snapshot()
	byID := make(map[source.ItemID]flip.Row, len(rows))
	for _, r := range rows {
		byID[r.ItemID] = r
	}

	for _, a := range alerts {
		row, ok := byID[source.ItemID(a.ItemID)]
		if !ok {
			continue
		}
		val, price := evaluate(a.Kind, row)
		if !fires(a.Op, val, a.Threshold) {
			continue
		}
		// cooldown: skip if it fired recently
		if last, ok, err := c.db.LastFired(ctx, a.ID); err == nil && ok && time.Since(last) < c.cooldown {
			continue
		}
		if err := c.db.InsertAlertEvent(ctx, a.ID, price); err != nil {
			log.Printf("alerts: record event for %s: %v", a.ID, err)
			continue
		}
		c.notify(ctx, a, row, val)
	}
	return nil
}

// evaluate returns the comparison value for the alert kind, plus the price to
// record. For price/roi the reference is the current sell (ask) price.
func evaluate(kind string, r flip.Row) (value float64, price int64) {
	switch kind {
	case "roi":
		return r.ROI * 100, r.Sell
	case "price":
		return float64(r.Sell), r.Sell
	default: // margin
		return float64(r.Margin), r.Sell
	}
}

func fires(op string, v, threshold float64) bool {
	switch op {
	case ">=":
		return v >= threshold
	case "<=":
		return v <= threshold
	case ">":
		return v > threshold
	case "<":
		return v < threshold
	case "=", "==":
		return v == threshold
	}
	return false
}

func (c *Checker) notify(ctx context.Context, a db.Alert, r flip.Row, val float64) {
	unit := ""
	if a.Kind == "roi" {
		unit = "%"
	}
	msg := fmt.Sprintf("🔔 **%s** — %s is %s%s (alert: %s %s%s)",
		r.Name, a.Kind, trimFloat(val), unit, a.Op, trimFloat(a.Threshold), unit)
	log.Printf("alerts: FIRED %s", msg)
	if c.webhookURL == "" {
		return
	}
	body, _ := json.Marshal(map[string]string{"content": msg})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.webhookURL, bytes.NewReader(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.client.Do(req)
	if err != nil {
		log.Printf("alerts: discord post failed: %v", err)
		return
	}
	resp.Body.Close()
}

func trimFloat(f float64) string {
	return fmt.Sprintf("%.0f", f)
}
