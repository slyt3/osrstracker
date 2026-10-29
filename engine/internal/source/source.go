// Package source defines the PriceSource boundary and its OSRS Wiki
// implementation. Swapping in a different data feed (e.g. for the paid tier)
// means adding a second implementation of PriceSource — see architecture.md.
package source

import "context"

// Item IDs are OSRS Grand Exchange item numbers.
type ItemID int

// Price is a single buy/sell snapshot for one item from the /latest endpoint.
type Price struct {
	High     int64 `json:"high"`     // most recent insta-sell (buy) price
	HighTime int64 `json:"highTime"` // unix seconds
	Low      int64 `json:"low"`      // most recent insta-buy (sell) price
	LowTime  int64 `json:"lowTime"`  // unix seconds
}

// Volume carries trade liquidity from the /5m or /1h endpoints.
type Volume struct {
	AvgHighPrice int64 `json:"avgHighPrice"`
	AvgLowPrice  int64 `json:"avgLowPrice"`
	HighVolume   int64 `json:"highPriceVolume"`
	LowVolume    int64 `json:"lowPriceVolume"`
}

// Mapping is static item metadata from /mapping.
type Mapping struct {
	ID       ItemID `json:"id"`
	Name     string `json:"name"`
	Members  bool   `json:"members"`
	BuyLimit int64  `json:"limit"` // GE buy limit per 4h window; 0 if unknown
}

// TimeseriesPoint is one point of per-item price history from /timeseries.
type TimeseriesPoint struct {
	Timestamp    int64 `json:"timestamp"`
	AvgHighPrice int64 `json:"avgHighPrice"`
	AvgLowPrice  int64 `json:"avgLowPrice"`
	HighVolume   int64 `json:"highPriceVolume"`
	LowVolume    int64 `json:"lowPriceVolume"`
}

// PriceSource is the single boundary between the engine and the outside price
// data. All methods use bulk endpoints where possible (no per-item fan-out).
type PriceSource interface {
	GetLatest(ctx context.Context) (map[ItemID]Price, error)
	GetHourly(ctx context.Context) (map[ItemID]Volume, error)
	GetMapping(ctx context.Context) ([]Mapping, error)
	GetTimeseries(ctx context.Context, id ItemID, timestep string) ([]TimeseriesPoint, error)
}
