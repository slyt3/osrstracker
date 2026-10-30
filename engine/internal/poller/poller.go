// Package poller drives the engine's background refresh loop: on an interval
// it pulls the latest prices, volume and item mapping from the price source,
// runs the pure flip engine, and stores the ranked board in the cache. This is
// the "computed once, served to all" step — see architecture.md.
package poller

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/osrstracker/engine/internal/cache"
	"github.com/osrstracker/engine/internal/flip"
	"github.com/osrstracker/engine/internal/source"
)

// mappingTTL bounds how often the (rarely-changing) /mapping is refetched.
const mappingTTL = time.Hour

// Poller refreshes the board cache from a PriceSource.
type Poller struct {
	src      source.PriceSource
	board    *cache.Board
	interval time.Duration
	sortBy   flip.SortBy

	// exempt marks items the GE tax does not apply to (bonds, energy potions,
	// low-level food/ammo/teleports/tools). Empty for now.
	// TODO(M1+): populate from the known exempt list / ItemMeta.
	exempt map[source.ItemID]bool

	// cached mapping, refreshed at most every mappingTTL
	mapping     []source.Mapping
	mappingSeen time.Time

	// rolling price history + first-seen store for change/spike/new enrichment
	trk *tracker
}

// New builds a poller. interval is how often prices are refreshed (~60s).
func New(src source.PriceSource, board *cache.Board, interval time.Duration) *Poller {
	path := os.Getenv("FIRST_SEEN_PATH")
	if path == "" {
		path = "firstseen.json"
	}
	return &Poller{
		src:      src,
		board:    board,
		interval: interval,
		sortBy:   flip.ByMargin,
		exempt:   map[source.ItemID]bool{},
		trk:      newTracker(path),
	}
}

// Run polls immediately, then on every tick until ctx is cancelled.
func (p *Poller) Run(ctx context.Context) {
	if err := p.pollOnce(ctx); err != nil {
		log.Printf("poller: initial poll failed: %v", err)
	}
	ticker := time.NewTicker(p.interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			log.Println("poller: stopped")
			return
		case <-ticker.C:
			if err := p.pollOnce(ctx); err != nil {
				log.Printf("poller: poll failed: %v", err)
			}
		}
	}
}

// pollOnce fetches a fresh snapshot, recomputes the board, and stores it.
// The mapping is only refetched when stale, to keep requests light.
func (p *Poller) pollOnce(ctx context.Context) error {
	if err := p.refreshMapping(ctx); err != nil {
		return err
	}
	latest, err := p.src.GetLatest(ctx)
	if err != nil {
		return err
	}
	volume, err := p.src.GetHourly(ctx)
	if err != nil {
		return err
	}
	rows := flip.Compute(latest, volume, p.mapping, p.exempt, flip.Options{SortBy: p.sortBy})
	now := time.Now()
	p.trk.update(rows, now)
	p.trk.enrich(rows, now)
	p.board.Set(rows)
	log.Printf("poller: board updated (%d rows)", len(rows))
	return nil
}

func (p *Poller) refreshMapping(ctx context.Context) error {
	if p.mapping != nil && time.Since(p.mappingSeen) < mappingTTL {
		return nil
	}
	mapping, err := p.src.GetMapping(ctx)
	if err != nil {
		// Keep serving with the old mapping if we have one; only fail cold.
		if p.mapping != nil {
			log.Printf("poller: mapping refresh failed, using cached: %v", err)
			return nil
		}
		return err
	}
	p.mapping = mapping
	p.mappingSeen = time.Now()
	return nil
}
