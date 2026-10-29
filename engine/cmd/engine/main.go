// Command engine is the OSRS Tracker data service: it polls the OSRS Wiki
// real-time API, computes the flip board, and serves public HTTP endpoints.
//
// In v1 it serves only public data (/board, /timeseries) and runs background
// jobs. It never authenticates a user request — all per-user work lives in the
// Next.js web app. See architecture.md.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/osrstracker/engine/internal/api"
	"github.com/osrstracker/engine/internal/cache"
	"github.com/osrstracker/engine/internal/source"
)

func main() {
	addr := envOr("ENGINE_ADDR", ":8080")
	userAgent := envOr("WIKI_USER_AGENT", "osrstracker (dev; contact: set WIKI_USER_AGENT)")

	// Wire the dependencies: a price source, a board cache, and the HTTP API.
	src := source.NewWikiPriceSource(userAgent)
	board := cache.NewBoard()
	srv := &http.Server{
		Addr:    addr,
		Handler: api.NewRouter(board, src),
	}

	// TODO(M1): start the poller goroutine here — poll src every ~60s, run the
	// flip engine, and store the result in board.

	// Graceful shutdown on SIGINT/SIGTERM.
	go func() {
		log.Printf("engine listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("http server: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("shutdown: %v", err)
	}
	log.Println("engine stopped")
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
