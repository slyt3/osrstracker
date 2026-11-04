"use client";

import { useRef, useState } from "react";
import type { TimeseriesPoint } from "@/lib/engine";

// Hand-rolled inline SVG chart — no charting dependency. Sell (ask) and buy
// (bid) over time: short gaps bridged, longer ones broken; light smoothing and
// a smooth curve for a clean read; a soft area under the sell line; direct
// end-of-line value labels; a time-aware axis and a full hover tooltip.

const W = 860;
const H = 340;
const PAD = { top: 16, right: 66, bottom: 30, left: 58 };
const SELL = "var(--gold)";
const BUY = "var(--chart-buy)";

const compact = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(Math.round(n));
};
const full = (n: number) => n.toLocaleString("en-US");

// "nice" rounded numbers for axis ticks
function niceNum(x: number, round: boolean): number {
  if (x <= 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const f = x / 10 ** exp;
  const nf = round ? (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) : f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * 10 ** exp;
}
function niceTicks(min: number, max: number, count = 5) {
  const range = niceNum(max - min || 1, false);
  const step = niceNum(range / (count - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.5; v += step) ticks.push(v);
  return { niceMin, niceMax, ticks };
}

// bridge short gaps (<= maxGap missing buckets) by linear interpolation; longer
// gaps stay null so a real break in trading still shows as a break.
function bridge(arr: (number | null)[], maxGap: number): (number | null)[] {
  const out = arr.slice();
  let i = 0;
  while (i < out.length) {
    if (out[i] != null) { i++; continue; }
    let j = i;
    while (j < out.length && out[j] == null) j++;
    const a = out[i - 1], b = out[j];
    if (a != null && b != null && j - i <= maxGap) {
      for (let k = i; k < j; k++) out[k] = a + (b - a) * ((k - i + 1) / (j - i + 1));
    }
    i = j;
  }
  return out;
}
// centered moving average over window w, preserving gaps (nulls)
function smoothArr(arr: (number | null)[], w: number): (number | null)[] {
  if (w <= 1) return arr.slice();
  const h = Math.floor(w / 2);
  return arr.map((v, i) => {
    if (v == null) return null;
    let s = 0, c = 0;
    for (let k = i - h; k <= i + h; k++) { const x = arr[k]; if (x != null) { s += x; c++; } }
    return c ? s / c : null;
  });
}

export default function PriceChart({ points, hourlyVolume }: { points: TimeseriesPoint[]; hourlyVolume?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [smooth, setSmooth] = useState(true);

  const n = points.length;
  if (n < 2) return <p className="notice">Not enough price history for this item yet.</p>;

  // a side is plottable only when it has a price AND trades in that bucket (else gap)
  const sellRaw = points.map((p) => (p.avgHighPrice > 0 && p.highPriceVolume > 0 ? p.avgHighPrice : null));
  const buyRaw = points.map((p) => (p.avgLowPrice > 0 && p.lowPriceVolume > 0 ? p.avgLowPrice : null));
  const vol = points.map((p) => (p.highPriceVolume || 0) + (p.lowPriceVolume || 0));

  const maxGap = Math.max(2, Math.round(n / 60));
  const w = smooth ? Math.min(9, Math.max(1, Math.round(n / 50))) : 1;
  const sell = smoothArr(bridge(sellRaw, maxGap), w);
  const buy = smoothArr(bridge(buyRaw, maxGap), w);

  const vals = [...sell, ...buy].filter((x): x is number => x != null);
  if (vals.length < 2) return <p className="notice">Not enough price history for this item yet.</p>;
  let dMin = Math.min(...vals);
  let dMax = Math.max(...vals);
  if (dMin === dMax) { dMin *= 0.99; dMax *= 1.01; }
  const pad = (dMax - dMin) * 0.1;
  const { niceMin, niceMax, ticks } = niceTicks(dMin - pad, dMax + pad, 5);
  dMin = niceMin; dMax = niceMax;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const baseY = H - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (n - 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - dMin) / (dMax - dMin)) * plotH;

  // split a series into continuous runs of [x,y] points (breaks at nulls)
  const runsOf = (arr: (number | null)[]) => {
    const runs: [number, number][][] = [];
    let cur: [number, number][] = [];
    arr.forEach((v, i) => {
      if (v == null) { if (cur.length) runs.push(cur); cur = []; }
      else cur.push([x(i), y(v)]);
    });
    if (cur.length) runs.push(cur);
    return runs;
  };
  // Catmull-Rom → cubic bezier segments (no leading move), so the stroke reads
  // as a smooth curve.
  const curveSegs = (pts: [number, number][]) => {
    let d = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
    }
    return d.trim();
  };
  const moveTo = (p: [number, number]) => `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const linePath = (arr: (number | null)[]) =>
    runsOf(arr).map((pts) => (pts.length === 1 ? moveTo(pts[0]) : `${moveTo(pts[0])} ${curveSegs(pts)}`)).join(" ");
  const areaPath = (arr: (number | null)[]) =>
    runsOf(arr)
      .filter((pts) => pts.length >= 2)
      .map((pts) => `M${pts[0][0].toFixed(1)} ${baseY.toFixed(1)} L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} ${curveSegs(pts)} L${pts[pts.length - 1][0].toFixed(1)} ${baseY.toFixed(1)} Z`)
      .join(" ");

  // time-aware, de-duplicated x labels
  const spanSec = points[n - 1].timestamp - points[0].timestamp;
  const fmtX =
    spanSec <= 2 * 86400
      ? (ts: number) => new Date(ts * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : spanSec <= 70 * 86400
        ? (ts: number) => new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : (ts: number) => new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  const rawIdx = Array.from(new Set(Array.from({ length: 6 }, (_, k) => Math.round((k * (n - 1)) / 5))));
  const seen = new Set<string>();
  const xTicks: { i: number; lab: string }[] = [];
  for (const i of rawIdx) { const lab = fmtX(points[i].timestamp); if (!seen.has(lab)) { seen.add(lab); xTicks.push({ i, lab }); } }

  const lastDefined = (arr: (number | null)[]) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return i; return -1; };
  const sEnd = lastDefined(sell), bEnd = lastDefined(buy);
  // nudge the two end-labels apart if they'd collide
  let sLabY = sEnd >= 0 ? y(sell[sEnd]!) : 0;
  let bLabY = bEnd >= 0 ? y(buy[bEnd]!) : 0;
  if (sEnd >= 0 && bEnd >= 0 && Math.abs(sLabY - bLabY) < 17) {
    const mid = (sLabY + bLabY) / 2;
    if (sLabY <= bLabY) { sLabY = mid - 9; bLabY = mid + 9; } else { sLabY = mid + 9; bLabY = mid - 9; }
  }

  const fmtDateTime = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vbX = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((vbX - PAD.left) / plotW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const hp = hover !== null ? points[hover] : null;
  const hSell = hp && hp.avgHighPrice > 0 ? hp.avgHighPrice : null; // raw bucket value for the tooltip
  const hBuy = hp && hp.avgLowPrice > 0 ? hp.avgLowPrice : null;
  const hSellLine = hover !== null ? sell[hover] : null; // smoothed value for the on-line dot
  const hBuyLine = hover !== null ? buy[hover] : null;

  return (
    <div style={{ position: "relative" }}>
      <div className="chart-legend">
        <span><i style={{ background: SELL }} /> Sell (ask)</span>
        <span><i style={{ background: BUY }} /> Buy (bid)</span>
        <label className="chart-smooth">
          <input type="checkbox" checked={smooth} onChange={(e) => setSmooth(e.target.checked)} /> Smooth
        </label>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="pricechart"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Price history chart"
      >
        <defs>
          <linearGradient id="pc-sellfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={SELL} stopOpacity={0.16} />
            <stop offset="1" stopColor={SELL} stopOpacity={0} />
          </linearGradient>
        </defs>
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 10} y={y(v) + 4} textAnchor="end" className="axis">{compact(v)}</text>
          </g>
        ))}
        {xTicks.map(({ i, lab }, k) => (
          <text key={k} x={x(i)} y={H - 9} textAnchor={k === 0 ? "start" : k === xTicks.length - 1 ? "end" : "middle"} className="axis">
            {lab}
          </text>
        ))}
        {/* area under the sell line, then the two curves (gaps break the path) */}
        <path d={areaPath(sell)} fill="url(#pc-sellfill)" />
        <path d={linePath(buy)} fill="none" stroke={BUY} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={linePath(sell)} fill="none" stroke={SELL} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
        {/* end-of-line markers + direct value labels */}
        {bEnd >= 0 && (
          <g>
            <circle cx={x(bEnd)} cy={y(buy[bEnd]!)} r={4} fill={BUY} stroke="var(--panel)" strokeWidth={2} />
            <text x={x(bEnd) + 9} y={bLabY + 4} className="pc-end" fill="var(--text)">{compact(buy[bEnd]!)}</text>
          </g>
        )}
        {sEnd >= 0 && (
          <g>
            <circle cx={x(sEnd)} cy={y(sell[sEnd]!)} r={4} fill={SELL} stroke="var(--panel)" strokeWidth={2} />
            <text x={x(sEnd) + 9} y={sLabY + 4} className="pc-end" fill="var(--text)">{compact(sell[sEnd]!)}</text>
          </g>
        )}
        {/* hover crosshair + on-line dots */}
        {hp && (
          <g>
            <line x1={x(hover!)} x2={x(hover!)} y1={PAD.top} y2={baseY} stroke="var(--line-2)" strokeWidth={1} />
            {hBuyLine != null && <circle cx={x(hover!)} cy={y(hBuyLine)} r={4} fill={BUY} stroke="var(--panel)" strokeWidth={2} />}
            {hSellLine != null && <circle cx={x(hover!)} cy={y(hSellLine)} r={4} fill={SELL} stroke="var(--panel)" strokeWidth={2} />}
          </g>
        )}
      </svg>
      {hp && (
        <div className="chart-tip" style={{ left: `${Math.min(86, Math.max(10, (x(hover!) / W) * 100))}%` }}>
          <div className="when">{fmtDateTime(hp.timestamp)}</div>
          <div><span style={{ color: SELL }}>Sell</span> <b className="mono">{hSell != null ? full(hSell) : "—"}</b></div>
          <div><span style={{ color: BUY }}>Buy</span> <b className="mono">{hBuy != null ? full(hBuy) : "—"}</b></div>
          <div><span style={{ color: "var(--faint)" }}>Spread</span> <b className="mono">{hSell != null && hBuy != null ? full(hSell - hBuy) : "—"}</b></div>
          <div><span style={{ color: "var(--faint)" }}>Volume</span> <b className="mono">{full(vol[hover!])}</b></div>
        </div>
      )}
    </div>
  );
}
