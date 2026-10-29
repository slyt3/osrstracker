// Package alerts runs the background alert checker: on an interval it loads
// active alerts, evaluates them against the current board, and on a firing it
// posts a Discord embed and records an AlertEvent (with a per-alert cooldown so
// it doesn't spam). See architecture.md.
package alerts

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/osrstracker/engine/internal/cache"
	"github.com/osrstracker/engine/internal/db"
	"github.com/osrstracker/engine/internal/flip"
	"github.com/osrstracker/engine/internal/source"
)

// embedColor is the brand gold (0xE3A13A) as a Discord color int.
const embedColor = 0xE3A13A

type Checker struct {
	db         *db.DB
	board      *cache.Board
	webhookURL string
	siteURL    string
	interval   time.Duration
	cooldown   time.Duration
	client     *http.Client
}

func NewChecker(database *db.DB, board *cache.Board, webhookURL, siteURL string, interval, cooldown time.Duration) *Checker {
	return &Checker{
		db:         database,
		board:      board,
		webhookURL: webhookURL,
		siteURL:    strings.TrimRight(siteURL, "/"),
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

// --- Discord embed ---

type embedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline"`
}

type embed struct {
	Title       string       `json:"title"`
	URL         string       `json:"url,omitempty"`
	Description string       `json:"description"`
	Color       int          `json:"color"`
	Fields      []embedField `json:"fields"`
	Footer      struct {
		Text string `json:"text"`
	} `json:"footer"`
	Timestamp string `json:"timestamp"`
}

func (c *Checker) notify(ctx context.Context, a db.Alert, r flip.Row, val float64) {
	kindLabel := map[string]string{"margin": "Margin", "price": "Price", "roi": "ROI"}[a.Kind]
	if kindLabel == "" {
		kindLabel = a.Kind
	}
	desc := fmt.Sprintf("%s %s %s reached", kindLabel, a.Op, formatThreshold(a.Kind, a.Threshold))
	log.Printf("alerts: FIRED %s — %s (now %s)", r.Name, desc, formatThreshold(a.Kind, val))

	if c.webhookURL == "" {
		return
	}

	e := embed{
		Title:       r.Name,
		Description: desc,
		Color:       embedColor,
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Fields: []embedField{
			{Name: "Margin", Value: comma(r.Margin) + " gp", Inline: true},
			{Name: "ROI", Value: fmt.Sprintf("%.2f%%", r.ROI*100), Inline: true},
			{Name: "Volume", Value: comma(r.HourlyVolume) + " / h", Inline: true},
			{Name: "Buy", Value: comma(r.Buy), Inline: true},
			{Name: "Sell", Value: comma(r.Sell), Inline: true},
			{Name: "Buy limit", Value: limitStr(r.BuyLimit), Inline: true},
		},
	}
	e.Footer.Text = "OSRS Tracker"
	if c.siteURL != "" {
		e.URL = c.siteURL + "/item/" + strconv.Itoa(int(r.ItemID))
	}

	body, _ := json.Marshal(map[string]any{"embeds": []embed{e}})
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
	if resp.StatusCode >= 300 {
		log.Printf("alerts: discord returned %d", resp.StatusCode)
	}
}

// formatThreshold renders a value in the units of its alert kind.
func formatThreshold(kind string, v float64) string {
	if kind == "roi" {
		return fmt.Sprintf("%.2f%%", v)
	}
	return comma(int64(v)) + " gp"
}

func limitStr(n int64) string {
	if n <= 0 {
		return "—"
	}
	return comma(n)
}

// comma formats an integer with thousands separators.
func comma(n int64) string {
	neg := n < 0
	if neg {
		n = -n
	}
	s := strconv.FormatInt(n, 10)
	var b strings.Builder
	pre := len(s) % 3
	if pre == 0 {
		pre = 3
	}
	b.WriteString(s[:pre])
	for i := pre; i < len(s); i += 3 {
		b.WriteByte(',')
		b.WriteString(s[i : i+3])
	}
	if neg {
		return "-" + b.String()
	}
	return b.String()
}
