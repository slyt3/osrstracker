// Package alerts runs the background alert checker (M4): it reads active Alert
// rows, compares them against the current board, and records AlertEvents /
// dispatches notifications. Stubbed until M4.
package alerts

// Checker evaluates alerts against the latest prices on an interval.
type Checker struct{}

// NewChecker returns a stub checker.
func NewChecker() *Checker { return &Checker{} }

// TODO(M4): Run(ctx) — on a ticker, load active alerts, evaluate against the
// board snapshot, write AlertEvent rows and fan out to email/Discord/push.
