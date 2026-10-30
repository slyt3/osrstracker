"use client";

import { useRef, useState } from "react";
import type { TimeseriesPoint } from "@/lib/engine";

// Hand-rolled inline SVG chart — no charting dependency. Sell (ask) and buy
// (bid) over time: breaks at gaps, optional median smoothing, volume-weighted
// dots, round axes, and a full hover tooltip.

const W = 820;
const H = 360;
const PAD = { top: 18, right: 18, bottom: 34, left: 72 };

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

// rolling median over a 3-bucket window, preserving nulls (gaps)
function median3(arr: (number | null)[]): (number | null)[] {
  return arr.map((v, i) => {
    if (v == null) return null;
    const w = [arr[i - 1], arr[i], arr[i + 1]].filter((x): x is number => x != null).sort((a, b) => a - b);
    return w[Math.floor(w.length / 2)];
  });
}

export default function PriceChart({ points, hourlyVolume }: { points: TimeseriesPoint[]; hourlyVolume?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const lowVol = (hourlyVolume ?? Infinity) < 100;
  const [smooth, setSmooth] = useState(lowVol);

  const n = points.length;
  if (n < 2) return <p className="notice">Not enough price history for this item yet.</p>;

  // a side is plottable only when it has a price AND trades in that bucket (else gap)
  const sellRaw = points.map((p) => (p.avgHighPrice > 0 && p.highPriceVolume > 0 ? p.avgHighPrice : null));
  const buyRaw = points.map((p) => (p.avgLowPrice > 0 && p.lowPriceVolume > 0 ? p.avgLowPrice : null));
  const vol = points.map((p) => (p.highPriceVolume || 0) + (p.lowPriceVolume || 0));
  const maxVol = Math.max(1, ...vol);

  const sell = smooth ? median3(sellRaw) : sellRaw;
  const buy = smooth ? median3(buyRaw) : buyRaw;

  const vals = [...sell, ...buy].filter((x): x is number => x != null);
  if (vals.length < 2) return <p className="notice">Not enough price history for this item yet.</p>;
  let dMin = Math.min(...vals);
  let dMax = Math.max(...vals);
  if (dMin === dMax) { dMin *= 0.99; dMax *= 1.01; }
  const pad = (dMax - dMin) * 0.08; // small padding above & below
  const { niceMin, niceMax, ticks } = niceTicks(dMin - pad, dMax + pad, 5);
  dMin = niceMin; dMax = niceMax;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (n - 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - dMin) / (dMax - dMin)) * plotH;

  const path = (arr: (number | null)[]) => {
    let d = "";
    let pen = false;
    arr.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
      pen = true;
    });
    return d.trim();
  };

  // 6 evenly-spaced date labels
  const labelCount = Math.min(6, n);
  const xTickIdx = Array.from(new Set(Array.from({ length: labelCount }, (_, k) => Math.round((k * (n - 1)) / (labelCount - 1)))));
  const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
  const hSell = hp && hp.avgHighPrice > 0 ? hp.avgHighPrice : null;
  const hBuy = hp && hp.avgLowPrice > 0 ? hp.avgLowPrice : null;
  const dot = (v: number, i: number, color: string) => {
    const r = 1.4 + 2.8 * (vol[i] / maxVol);
    const o = 0.25 + 0.75 * (vol[i] / maxVol);
    return <circle cx={x(i)} cy={y(v)} r={r} fill={color} opacity={o} />;
  };

  return (
    <div style={{ position: "relative" }}>
      <div className="chart-legend">
        <span><i style={{ background: "var(--gold)" }} /> Sell (ask)</span>
        <span><i style={{ background: "var(--muted)" }} /> Buy (bid)</span>
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
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 10} y={y(v) + 4} textAnchor="end" className="axis">{compact(v)}</text>
          </g>
        ))}
        {xTickIdx.map((i, k) => (
          <text key={k} x={x(i)} y={H - 8} textAnchor={k === 0 ? "start" : k === xTickIdx.length - 1 ? "end" : "middle"} className="axis">
            {fmtDate(points[i].timestamp)}
          </text>
        ))}
        {/* lines (gaps break the path) */}
        <path d={path(buy)} fill="none" stroke="var(--muted)" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
        <path d={path(sell)} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* volume-weighted dots */}
        {buy.map((v, i) => (v != null ? <g key={"b" + i}>{dot(v, i, "var(--muted)")}</g> : null))}
        {sell.map((v, i) => (v != null ? <g key={"s" + i}>{dot(v, i, "var(--gold)")}</g> : null))}
        {/* hover crosshair */}
        {hp && (
          <g>
            <line x1={x(hover!)} x2={x(hover!)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--line-2)" strokeWidth={1} />
            {hSell != null && <circle cx={x(hover!)} cy={y(hSell)} r={4} fill="var(--gold)" />}
            {hBuy != null && <circle cx={x(hover!)} cy={y(hBuy)} r={4} fill="var(--muted)" />}
          </g>
        )}
      </svg>
      {hp && (
        <div className="chart-tip" style={{ left: `${Math.min(88, Math.max(12, (x(hover!) / W) * 100))}%` }}>
          <div className="when">{fmtDateTime(hp.timestamp)}</div>
          <div><span style={{ color: "var(--gold)" }}>Sell</span> <b className="mono">{hSell != null ? full(hSell) : "—"}</b></div>
          <div><span style={{ color: "var(--muted)" }}>Buy</span> <b className="mono">{hBuy != null ? full(hBuy) : "—"}</b></div>
          <div><span style={{ color: "var(--faint)" }}>Spread</span> <b className="mono">{hSell != null && hBuy != null ? full(hSell - hBuy) : "—"}</b></div>
          <div><span style={{ color: "var(--faint)" }}>Volume</span> <b className="mono">{full(vol[hover!])}</b></div>
        </div>
      )}
    </div>
  );
}
