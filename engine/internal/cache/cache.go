// Package cache holds the computed flip board in memory. The board is identical
// for every user, so it is computed once by the poller and served to all
// traffic. (Redis can replace this later without changing callers.)
package cache

import (
	"sync"
	"time"

	"github.com/osrstracker/engine/internal/flip"
)

// Board is a concurrency-safe snapshot of the latest computed flip board.
type Board struct {
	mu   sync.RWMutex
	ts   time.Time
	rows []flip.Row
}

// NewBoard returns an empty board.
func NewBoard() *Board { return &Board{} }

// Set replaces the current snapshot. Called by the poller.
func (b *Board) Set(rows []flip.Row) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.rows = rows
	b.ts = time.Now()
}

// Snapshot returns the current rows and the time they were computed.
func (b *Board) Snapshot() (time.Time, []flip.Row) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.ts, b.rows
}
