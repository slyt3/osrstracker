package poller

import (
	"testing"
	"time"

	"github.com/osrstracker/engine/internal/flip"
)

func rowsAt(sell int64) []flip.Row { return []flip.Row{{ItemID: 1, Sell: sell}} }

func TestChange1hAndFirstSeen(t *testing.T) {
	tr := newTracker("") // "" disables file persistence
	tr.seeded = true     // simulate an existing baseline (post-first-run)

	base := time.Now().Add(-2 * time.Hour)
	tr.update(rowsAt(100), base)
	r := rowsAt(100)
	tr.enrich(r, base)
	if r[0].FirstSeen != base.Unix() {
		t.Fatalf("firstSeen = %d, want %d", r[0].FirstSeen, base.Unix())
	}

	later := base.Add(time.Hour)
	tr.update(rowsAt(120), later)
	r2 := rowsAt(120)
	tr.enrich(r2, later)
	if r2[0].Change1h < 19 || r2[0].Change1h > 21 {
		t.Fatalf("change1h = %v, want ~20", r2[0].Change1h)
	}
}

func TestNewItemBackdatedThenFresh(t *testing.T) {
	tr := newTracker("") // seeded=false: first run backdates the baseline
	base := time.Now().Add(-1 * time.Hour)
	tr.update(rowsAt(100), base)
	r := rowsAt(100)
	tr.enrich(r, base)
	if r[0].FirstSeen > base.Add(-newWindow).Unix() {
		t.Fatalf("initial items should be backdated out of the new window, got %d", r[0].FirstSeen)
	}

	later := base.Add(30 * time.Minute)
	rows := []flip.Row{{ItemID: 1, Sell: 100}, {ItemID: 2, Sell: 50}}
	tr.update(rows, later)
	r2 := []flip.Row{{ItemID: 2, Sell: 50}}
	tr.enrich(r2, later)
	if r2[0].FirstSeen != later.Unix() {
		t.Fatalf("new item firstSeen = %d, want %d (now)", r2[0].FirstSeen, later.Unix())
	}
}

func TestSpike(t *testing.T) {
	tr := newTracker("")
	start := time.Now().Add(-3 * time.Hour)
	for i := 0; i < 8; i++ {
		tr.update(rowsAt(100), start.Add(time.Duration(i)*snapInterval))
	}
	now := start.Add(10 * snapInterval)
	tr.update(rowsAt(150), now)

	big := rowsAt(150) // 50% above median of 100
	tr.enrich(big, now)
	if !big[0].Spike {
		t.Fatalf("expected spike flag for +50%% move")
	}
	small := rowsAt(105) // within threshold
	tr.enrich(small, now)
	if small[0].Spike {
		t.Fatalf("did not expect spike for +5%% move")
	}
}
