package source

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// wikiBaseURL is the OSRS Wiki real-time prices API. The API requires a
// descriptive User-Agent and asks that callers use the bulk endpoints.
const wikiBaseURL = "https://prices.runescape.wiki/api/v1/osrs"

// WikiPriceSource is the v1 PriceSource backed by the OSRS Wiki API.
type WikiPriceSource struct {
	base      string
	userAgent string
	client    *http.Client
}

// NewWikiPriceSource builds a source. userAgent must be descriptive (the Wiki
// API rejects or throttles generic agents).
func NewWikiPriceSource(userAgent string) *WikiPriceSource {
	return &WikiPriceSource{
		base:      wikiBaseURL,
		userAgent: userAgent,
		client:    &http.Client{Timeout: 15 * time.Second},
	}
}

var _ PriceSource = (*WikiPriceSource)(nil)

// getJSON issues a GET with the required User-Agent and decodes into out.
func (w *WikiPriceSource) getJSON(ctx context.Context, path string, out any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, w.base+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", w.userAgent)
	resp, err := w.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("wiki %s: status %d", path, resp.StatusCode)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

func (w *WikiPriceSource) GetLatest(ctx context.Context) (map[ItemID]Price, error) {
	var body struct {
		Data map[string]Price `json:"data"`
	}
	if err := w.getJSON(ctx, "/latest", &body); err != nil {
		return nil, err
	}
	return keyByItemID(body.Data), nil
}

func (w *WikiPriceSource) GetHourly(ctx context.Context) (map[ItemID]Volume, error) {
	var body struct {
		Data map[string]Volume `json:"data"`
	}
	if err := w.getJSON(ctx, "/1h", &body); err != nil {
		return nil, err
	}
	return keyByItemID(body.Data), nil
}

func (w *WikiPriceSource) GetMapping(ctx context.Context) ([]Mapping, error) {
	var out []Mapping
	if err := w.getJSON(ctx, "/mapping", &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (w *WikiPriceSource) GetTimeseries(ctx context.Context, id ItemID, timestep string) ([]TimeseriesPoint, error) {
	var body struct {
		Data []TimeseriesPoint `json:"data"`
	}
	path := fmt.Sprintf("/timeseries?id=%d&timestep=%s", id, timestep)
	if err := w.getJSON(ctx, path, &body); err != nil {
		return nil, err
	}
	return body.Data, nil
}

// keyByItemID converts the Wiki's string-keyed maps into ItemID-keyed maps.
func keyByItemID[V any](in map[string]V) map[ItemID]V {
	out := make(map[ItemID]V, len(in))
	for k, v := range in {
		var id int
		if _, err := fmt.Sscanf(k, "%d", &id); err == nil {
			out[ItemID(id)] = v
		}
	}
	return out
}
