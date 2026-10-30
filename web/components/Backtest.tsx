import type { TimeseriesPoint } from "@/lib/engine";
import { geTax } from "@/lib/tax";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// Backtest-lite: across the buckets actually traded this interval, what would a
// buy-low / sell-high flip have netted after tax? Honest stats, no projection.
export default function Backtest({ points }: { points: TimeseriesPoint[] }) {
  let sum = 0, cnt = 0, best = -Infinity, profitable = 0;
  for (const p of points) {
    if (p.avgHighPrice > 0 && p.avgLowPrice > 0 && p.highPriceVolume > 0 && p.lowPriceVolume > 0) {
      const m = p.avgHighPrice - p.avgLowPrice - geTax(p.avgHighPrice);
      sum += m; cnt++; if (m > best) best = m; if (m > 0) profitable++;
    }
  }
  if (cnt < 2) return null;
  const avg = sum / cnt;
  const pct = (profitable / cnt) * 100;

  return (
    <section style={{ marginTop: "1.6rem" }}>
      <h2 style={{ fontSize: "clamp(1.2rem,2.4vw,1.5rem)", marginBottom: "0.9rem" }}>Over this interval</h2>
      <div className="item-stats">
        <div className="s"><div className="l">Avg margin (after tax)</div><div className={"v " + (avg >= 0 ? "pos lit" : "neg")}>{avg >= 0 ? "+" : "−"}{fmt(Math.abs(avg))}</div></div>
        <div className="s"><div className="l">Best bucket</div><div className="v pos lit">+{fmt(best)}</div></div>
        <div className="s"><div className="l">Buckets profitable</div><div className="v">{pct.toFixed(0)}%</div></div>
        <div className="s"><div className="l">Buckets traded</div><div className="v">{fmt(cnt)}</div></div>
      </div>
      <p className="meta">A buy-low / sell-high flip each traded bucket, netted of the 2% tax. Past behaviour, not a projection.</p>
    </section>
  );
}
