// Package api exposes the engine's public HTTP endpoints. These serve public
// data only and never authenticate a user — per-user work lives in the web app.
package api

import (
	"encoding/json"
	"net/http"

	"github.com/osrstracker/engine/internal/cache"
	"github.com/osrstracker/engine/internal/flip"
	"github.com/osrstracker/engine/internal/source"
)

// NewRouter wires the public routes. The timeseries route and the /live
// websocket are filled in later milestones.
func NewRouter(board *cache.Board, src source.PriceSource) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("GET /board", handleBoard(board))
	// TODO(M2): GET /timeseries/{id}
	// TODO(M4): GET /live (websocket)
	return mux
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// boardResponse matches the API contract: { ts, rows }.
type boardResponse struct {
	TS   int64      `json:"ts"`
	Rows []flip.Row `json:"rows"`
}

func handleBoard(board *cache.Board) http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		ts, rows := board.Snapshot()
		if rows == nil {
			rows = []flip.Row{} // serve [] rather than null before the first poll
		}
		writeJSON(w, http.StatusOK, boardResponse{TS: ts.Unix(), Rows: rows})
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
