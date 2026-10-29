package api

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/osrstracker/engine/internal/source"
)

// allowedTimesteps are the step values the OSRS Wiki /timeseries endpoint
// accepts. We validate against this set rather than forwarding arbitrary input.
var allowedTimesteps = map[string]bool{"5m": true, "1h": true, "6h": true, "24h": true}

const tsTTL = 60 * time.Second

// tsCache is a tiny TTL cache keyed by "id|timestep", so repeat views of the
// same item don't hammer the Wiki.
type tsCache struct {
	mu      sync.Mutex
	entries map[string]tsEntry
}

type tsEntry struct {
	at     time.Time
	points []source.TimeseriesPoint
}

func newTSCache() *tsCache { return &tsCache{entries: map[string]tsEntry{}} }

func (c *tsCache) get(key string) ([]source.TimeseriesPoint, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.entries[key]
	if !ok || time.Since(e.at) > tsTTL {
		return nil, false
	}
	return e.points, true
}

func (c *tsCache) set(key string, points []source.TimeseriesPoint) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.entries[key] = tsEntry{at: time.Now(), points: points}
}

// timeseriesResponse is the API contract for GET /timeseries/{id}.
type timeseriesResponse struct {
	ID       int                      `json:"id"`
	Timestep string                   `json:"timestep"`
	Points   []source.TimeseriesPoint `json:"points"`
}

func handleTimeseries(src source.PriceSource, c *tsCache) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(r.PathValue("id"))
		if err != nil || id <= 0 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid item id"})
			return
		}
		timestep := r.URL.Query().Get("timestep")
		if timestep == "" {
			timestep = "5m"
		}
		if !allowedTimesteps[timestep] {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid timestep"})
			return
		}

		key := strconv.Itoa(id) + "|" + timestep
		points, ok := c.get(key)
		if !ok {
			points, err = src.GetTimeseries(r.Context(), source.ItemID(id), timestep)
			if err != nil {
				writeJSON(w, http.StatusBadGateway, map[string]string{"error": "upstream unavailable"})
				return
			}
			c.set(key, points)
		}
		if points == nil {
			points = []source.TimeseriesPoint{}
		}
		writeJSON(w, http.StatusOK, timeseriesResponse{ID: id, Timestep: timestep, Points: points})
	}
}
