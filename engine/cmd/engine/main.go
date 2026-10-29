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

	"github.com/osrstracker/engine/internal/alerts"
	"github.com/osrstracker/engine/internal/api"
	"github.com/osrstracker/engine/internal/cache"
	"github.com/osrstracker/engine/internal/db"
	"github.com/osrstracker/engine/internal/poller"
	"github.com/osrstracker/engine/internal/source"
)

func main() {
	addr := envOr("ENGINE_ADDR", ":8080")
	userAgent := envOr("WIKI_USER_AGENT", "osrstracker (dev; contact: set WIKI_USER_AGENT)")
	interval := envDuration("POLL_INTERVAL", 60*time.Second)

	// Wire the dependencies: a price source, a board cache, and the HTTP API.
	src := source.NewWikiPriceSource(userAgent)
	board := cache.NewBoard()
	srv := &http.Server{
		Addr:    addr,
		Handler: api.NewRouter(board, src),
	}

	// ctx cancels on SIGINT/SIGTERM and drives the background poller.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Background: refresh the board from the Wiki on an interval.
	p := poller.New(src, board, interval)
	go p.Run(ctx)

	// Background: alert checker (only when a database is configured).
	if dsn := os.Getenv("DATABASE_URL"); dsn != "" {
		database, err := db.Connect(ctx, dsn)
		if err != nil {
			log.Printf("alerts: db connect failed, checker disabled: %v", err)
		} else {
			defer database.Close()
			checker := alerts.NewChecker(
				database, board,
				os.Getenv("DISCORD_WEBHOOK_URL"),
				envOr("SITE_URL", "https://osrstracker.site"),
				envDuration("ALERT_INTERVAL", 60*time.Second),
				envDuration("ALERT_COOLDOWN", 30*time.Minute),
			)
			go checker.Run(ctx)
		}
	} else {
		log.Println("alerts: DATABASE_URL not set, checker disabled")
	}

	// Foreground: serve HTTP.
	go func() {
		log.Printf("engine listening on %s (poll interval %s)", addr, interval)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("http server: %v", err)
		}
	}()

	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
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

func envDuration(key string, fallback time.Duration) time.Duration {
	if v := os.Getenv(key); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
		log.Printf("invalid %s=%q, using %s", key, v, fallback)
	}
	return fallback
}
