package poller

import (
	"encoding/json"
	"os"
	"sort"
	"strconv"
	"time"

	"github.com/osrstracker/engine/internal/flip"
	"github.com/osrstracker/engine/internal/source"
)

// The tracker keeps a rolling in-memory history of sell prices (to derive the
// 1h price change and spike flag) plus a persisted first-seen time per item
// (to flag newly-added items). It is owned by the Poller and touched only from
// the poll goroutine, so it needs no locking.
const (
	snapInterval    = 10 * time.Minute // cadence of recorded snapshots
	maxSnaps        = 150              // ~25h of history at snapInterval
	changeTarget    = time.Hour        // the 1h change window
	spikeThreshold  = 0.30             // sell >30% off its median reads as a spike
	minSpikeHistory = 6                // need this many points before flagging
	newWindow       = 14 * 24 * time.Hour
)

type snap struct {
	t    time.Time
	sell map[source.ItemID]int64
}

type tracker struct {
	history   []snap
	firstSeen map[source.ItemID]int64 // itemID -> unix secs
	path      string                  // firstSeen persistence file ("" = disabled)
	lastSnap  time.Time
	seeded    bool // true once we have a baseline (loaded file or first poll)
}

func newTracker(path string) *tracker {
	t := &tracker{firstSeen: map[source.ItemID]int64{}, path: path}
	t.load()
	if len(t.firstSeen) > 0 {
		t.seeded = true
	}
	return t
}

func (t *tracker) load() {
	if t.path == "" {
		return
	}
	b, err := os.ReadFile(t.path)
	if err != nil {
		return // first run or unreadable: start empty
	}
	raw := map[string]int64{}
	if json.Unmarshal(b, &raw) != nil {
		return
	}
	for k, v := range raw {
		if id, err := strconv.Atoi(k); err == nil {
			t.firstSeen[source.ItemID(id)] = v
		}
	}
}

func (t *tracker) save() {
	if t.path == "" {
		return
	}
	raw := make(map[string]int64, len(t.firstSeen))
	for id, v := range t.firstSeen {
		raw[strconv.Itoa(int(id))] = v
	}
	if b, err := json.Marshal(raw); err == nil {
		tmp := t.path + ".tmp"
		if os.WriteFile(tmp, b, 0o644) == nil {
			_ = os.Rename(tmp, t.path)
		}
	}
}

// update records first-seen times for any new items and appends a price
// snapshot (at most one per snapInterval).
func (t *tracker) update(rows []flip.Row, now time.Time) {
	// On the very first run (no persisted baseline) backdate the whole initial
	// set so nothing looks "new". Only items that appear in later polls get the
	// real timestamp and count as new.
	stamp := now.Unix()
	if !t.seeded {
		stamp = now.Add(-2 * newWindow).Unix()
	}
	changed := false
	for _, r := range rows {
		if _, ok := t.firstSeen[r.ItemID]; !ok {
			t.firstSeen[r.ItemID] = stamp
			changed = true
		}
	}
	t.seeded = true
	if changed {
		t.save()
	}

	if !t.lastSnap.IsZero() && now.Sub(t.lastSnap) < snapInterval {
		return
	}
	s := snap{t: now, sell: make(map[source.ItemID]int64, len(rows))}
	for _, r := range rows {
		s.sell[r.ItemID] = r.Sell
	}
	t.history = append(t.history, s)
	if len(t.history) > maxSnaps {
		t.history = t.history[len(t.history)-maxSnaps:]
	}
	t.lastSnap = now
}

// enrich fills Change1h, Spike and FirstSeen on each row from the history.
func (t *tracker) enrich(rows []flip.Row, now time.Time) {
	// snapshot nearest to (now - 1h), for the % change
	var best *snap
	var bestDiff time.Duration
	for i := range t.history {
		age := now.Sub(t.history[i].t)
		diff := age - changeTarget
		if diff < 0 {
			diff = -diff
		}
		if best == nil || diff < bestDiff {
			best, bestDiff = &t.history[i], diff
		}
	}

	for i := range rows {
		r := &rows[i]
		r.FirstSeen = t.firstSeen[r.ItemID]
		if best != nil {
			if old, ok := best.sell[r.ItemID]; ok && old > 0 {
				r.Change1h = float64(r.Sell-old) / float64(old) * 100
			}
		}
		// spike: current sell vs its median across history
		vals := make([]int64, 0, len(t.history))
		for j := range t.history {
			if v, ok := t.history[j].sell[r.ItemID]; ok && v > 0 {
				vals = append(vals, v)
			}
		}
		if len(vals) >= minSpikeHistory {
			sort.Slice(vals, func(a, b int) bool { return vals[a] < vals[b] })
			med := vals[len(vals)/2]
			if med > 0 {
				dev := float64(r.Sell-med) / float64(med)
				if dev < 0 {
					dev = -dev
				}
				r.Spike = dev > spikeThreshold
			}
		}
	}
}
