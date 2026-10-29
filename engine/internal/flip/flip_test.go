package flip

import (
	"testing"

	"github.com/osrstracker/engine/internal/source"
)

func TestTax(t *testing.T) {
	tests := []struct {
		name   string
		sell   int64
		exempt bool
		want   int64
	}{
		{"below min sale is free", 49, false, 0},
		{"at min sale is taxed", 50, false, 1}, // floor(50*0.02)=1
		{"rounds down", 149, false, 2},         // floor(149*0.02)=2
		{"typical", 1000, false, 20},           // 2%
		{"exempt item pays nothing", 1_000_000, true, 0},
		{"cap applies", 1_000_000_000, false, TaxCap}, // 2% = 20m, capped at 5m
		{"just under cap boundary", 250_000_000, false, 5_000_000},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := Tax(tt.sell, tt.exempt); got != tt.want {
				t.Errorf("Tax(%d, exempt=%v) = %d, want %d", tt.sell, tt.exempt, got, tt.want)
			}
		})
	}
}

func TestCompute(t *testing.T) {
	mapping := []source.Mapping{
		{ID: 1, Name: "Item A", BuyLimit: 100, Members: true},
		{ID: 2, Name: "Item B", BuyLimit: 10},
		{ID: 3, Name: "No price", BuyLimit: 5}, // dropped: no latest entry
	}
	latest := map[source.ItemID]source.Price{
		// buy at Low, sell at High
		1: {High: 250, Low: 200},  // tax=floor(250*.02)=5, margin=250-200-5=45
		2: {High: 1000, Low: 900}, // tax=20, margin=1000-900-20=80
	}
	volume := map[source.ItemID]source.Volume{
		1: {HighVolume: 30, LowVolume: 70}, // 100
		2: {HighVolume: 5, LowVolume: 5},   // 10
	}
	exempt := map[source.ItemID]bool{}

	byID := func(rows []Row) map[source.ItemID]Row {
		m := map[source.ItemID]Row{}
		for _, r := range rows {
			m[r.ItemID] = r
		}
		return m
	}

	rows := Compute(latest, volume, mapping, exempt, Options{SortBy: ByMargin})
	if len(rows) != 2 {
		t.Fatalf("expected 2 rows (item 3 has no price), got %d", len(rows))
	}
	m := byID(rows)
	if m[1].Buy != 200 || m[1].Sell != 250 || m[1].Tax != 5 || m[1].Margin != 45 {
		t.Errorf("item 1: got buy=%d sell=%d tax=%d margin=%d", m[1].Buy, m[1].Sell, m[1].Tax, m[1].Margin)
	}
	if m[1].ProfitLimit != 45*100 {
		t.Errorf("item 1 profitLimit: got %d want %d", m[1].ProfitLimit, 45*100)
	}
	if m[1].HourlyVolume != 100 {
		t.Errorf("item 1 volume: got %d want 100", m[1].HourlyVolume)
	}
	if m[2].Margin != 80 {
		t.Errorf("item 2 margin: got %d want 80", m[2].Margin)
	}
	if !m[1].Members || m[2].Members {
		t.Errorf("members flag: item1=%v (want true), item2=%v (want false)", m[1].Members, m[2].Members)
	}

	// Ranking: margin -> B(80) first; roi -> A(0.225) first; profitLimit -> A(4500) first.
	if got := Compute(latest, volume, mapping, exempt, Options{SortBy: ByMargin}); got[0].ItemID != 2 {
		t.Errorf("ByMargin: expected item 2 first, got %d", got[0].ItemID)
	}
	if got := Compute(latest, volume, mapping, exempt, Options{SortBy: ByROI}); got[0].ItemID != 1 {
		t.Errorf("ByROI: expected item 1 first, got %d", got[0].ItemID)
	}
	if got := Compute(latest, volume, mapping, exempt, Options{SortBy: ByProfitLimit}); got[0].ItemID != 1 {
		t.Errorf("ByProfitLimit: expected item 1 first, got %d", got[0].ItemID)
	}
}
