// Package flip is the pure flip engine: given prices, mapping, tax rules and
// options it returns ranked board rows. It performs no I/O and is fully unit
// tested. See architecture.md ("two boundaries that keep it clean").
package flip

import (
	"sort"

	"github.com/osrstracker/engine/internal/source"
)

// GE tax rules, authoritative values from the OSRS Wiki (raised from 1% to 2%
// on 2025-05-29). These live here as data so the rules are testable and easy
// to amend if Jagex changes them again.
const (
	TaxRate    = 0.02       // 2% of sale price
	TaxMinSale = 50         // sales below 50 gp are not taxed at all
	TaxCap     = 5_000_000  // tax is capped at 5m per item
)

// Tax returns the GE tax charged on a single-item sale at sellPrice, rounded
// down, with the min-sale floor and per-item cap applied. Exempt items (bonds,
// energy potions, low-level food/ammo/teleports/tools) pay no tax.
func Tax(sellPrice int64, exempt bool) int64 {
	if exempt || sellPrice < TaxMinSale {
		return 0
	}
	t := int64(float64(sellPrice) * TaxRate) // truncates toward zero == floor for positives
	if t > TaxCap {
		return TaxCap
	}
	return t
}

// Row is one item on the flip board. It is defined with json tags because the
// TypeScript contract type in contract/ is generated from this struct.
type Row struct {
	ItemID       source.ItemID `json:"itemId"`
	Name         string        `json:"name"`
	Buy          int64         `json:"buy"`          // instabuy (what you pay)
	Sell         int64         `json:"sell"`         // instasell (what you receive)
	Tax          int64         `json:"tax"`          // GE tax on the sale
	Margin       int64         `json:"margin"`       // sell - buy - tax
	ROI          float64       `json:"roi"`          // margin / buy
	BuyLimit     int64         `json:"buyLimit"`     // GE 4h limit
	ProfitLimit  int64         `json:"profitLimit"`  // margin * buyLimit
	HourlyVolume int64         `json:"hourlyVolume"` // liquidity from /1h
}

// SortBy selects the board ranking.
type SortBy string

const (
	ByMargin      SortBy = "margin"
	ByROI         SortBy = "roi"
	ByProfitLimit SortBy = "profitLimit"
)

// Options controls the computation. Bankroll (capital-aware allocation) is
// wired in a later milestone.
type Options struct {
	SortBy   SortBy
	Bankroll int64 // 0 == ignore
}

// Compute builds the ranked board from the latest prices, volume and mapping.
func Compute(
	latest map[source.ItemID]source.Price,
	volume map[source.ItemID]source.Volume,
	mapping []source.Mapping,
	exempt map[source.ItemID]bool,
	opts Options,
) []Row {
	rows := make([]Row, 0, len(mapping))
	for _, m := range mapping {
		p, ok := latest[m.ID]
		if !ok || p.High == 0 || p.Low == 0 {
			continue
		}
		buy := p.High
		sell := p.Low
		tax := Tax(sell, exempt[m.ID])
		margin := sell - buy - tax
		var roi float64
		if buy > 0 {
			roi = float64(margin) / float64(buy)
		}
		rows = append(rows, Row{
			ItemID:       m.ID,
			Name:         m.Name,
			Buy:          buy,
			Sell:         sell,
			Tax:          tax,
			Margin:       margin,
			ROI:          roi,
			BuyLimit:     m.BuyLimit,
			ProfitLimit:  margin * m.BuyLimit,
			HourlyVolume: volume[m.ID].HighVolume + volume[m.ID].LowVolume,
		})
	}
	sortRows(rows, opts.SortBy)
	return rows
}

func sortRows(rows []Row, by SortBy) {
	switch by {
	case ByROI:
		sort.SliceStable(rows, func(i, j int) bool { return rows[i].ROI > rows[j].ROI })
	case ByProfitLimit:
		sort.SliceStable(rows, func(i, j int) bool { return rows[i].ProfitLimit > rows[j].ProfitLimit })
	default: // ByMargin
		sort.SliceStable(rows, func(i, j int) bool { return rows[i].Margin > rows[j].Margin })
	}
}
