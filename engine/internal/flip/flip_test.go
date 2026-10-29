package flip

import "testing"

func TestTax(t *testing.T) {
	tests := []struct {
		name   string
		sell   int64
		exempt bool
		want   int64
	}{
		{"below min sale is free", 49, false, 0},
		{"at min sale is taxed", 50, false, 1},   // floor(50*0.02)=1
		{"rounds down", 149, false, 2},           // floor(149*0.02)=2
		{"typical", 1000, false, 20},             // 2%
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
