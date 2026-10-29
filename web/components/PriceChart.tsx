"use client";

import { useRef, useState } from "react";
import type { TimeseriesPoint } from "@/lib/engine";

// Hand-rolled inline SVG chart — no charting dependency. Two lines (buy at the
// bid, sell at the ask) over time, with a hover crosshair + tooltip.

const W = 820;
const H = 340;
const PAD = { top: 18, right: 18, bottom: 30, left: 66 };

const compact = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
};
const full = (n: number) => n.toLocaleString("en-US");

export default function PriceChart({ points }: { points: TimeseriesPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  // Usable points: need at least one of the two prices.
  const pts = points.filter((p) => p.avgHighPrice > 0 || p.avgLowPrice > 0);
  if (pts.length < 2) {
    return <p className="notice">Not enough price history for this item yet.</p>;
  }

  const vals: number[] = [];
  for (const p of pts) {
    if (p.avgHighPrice > 0) vals.push(p.avgHighPrice);
    if (p.avgLowPrice > 0) vals.push(p.avgLowPrice);
  }
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (min === max) { min *= 0.99; max *= 1.01; }
  const pad = (max - min) * 0.08;
  min -= pad; max += pad;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (pts.length - 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * plotH;

  const line = (key: "avgHighPrice" | "avgLowPrice") => {
    let d = "";
    let started = false;
    pts.forEach((p, i) => {
      const v = p[key];
      if (v > 0) {
        d += `${started ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
        started = true;
      }
    });
    return d.trim();
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min));
  const xTickIdx = [0, Math.floor((pts.length - 1) / 2), pts.length - 1];
  const fmtDate = (ts: number) =>
    new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtDateTime = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vbX = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((vbX - PAD.left) / plotW) * (pts.length - 1));
    setHover(Math.max(0, Math.min(pts.length - 1, i)));
  };

  const hp = hover !== null ? pts[hover] : null;

  return (
    <div style={{ position: "relative" }}>
      <div className="chart-legend">
        <span><i style={{ background: "var(--gold)" }} /> Sell (ask)</span>
        <span><i style={{ background: "var(--muted)" }} /> Buy (bid)</span>
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
        {/* gridlines + y labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 10} y={y(v) + 4} textAnchor="end" className="axis">{compact(v)}</text>
          </g>
        ))}
        {/* x labels */}
        {xTickIdx.map((i, k) => (
          <text key={k} x={x(i)} y={H - 8} textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} className="axis">
            {fmtDate(pts[i].timestamp)}
          </text>
        ))}
        {/* lines */}
        <path d={line("avgLowPrice")} fill="none" stroke="var(--muted)" strokeWidth={1.6} strokeLinejoin="round" />
        <path d={line("avgHighPrice")} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinejoin="round" />
        {/* hover crosshair */}
        {hp && (
          <g>
            <line x1={x(hover!)} x2={x(hover!)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--line-2)" strokeWidth={1} />
            {hp.avgHighPrice > 0 && <circle cx={x(hover!)} cy={y(hp.avgHighPrice)} r={3.5} fill="var(--gold)" />}
            {hp.avgLowPrice > 0 && <circle cx={x(hover!)} cy={y(hp.avgLowPrice)} r={3.5} fill="var(--muted)" />}
          </g>
        )}
      </svg>
      {hp && (
        <div className="chart-tip" style={{ left: `${Math.min(88, Math.max(12, (x(hover!) / W) * 100))}%` }}>
          <div className="when">{fmtDateTime(hp.timestamp)}</div>
          <div><span style={{ color: "var(--gold)" }}>Sell</span> <b className="mono">{hp.avgHighPrice > 0 ? full(hp.avgHighPrice) : "—"}</b></div>
          <div><span style={{ color: "var(--muted)" }}>Buy</span> <b className="mono">{hp.avgLowPrice > 0 ? full(hp.avgLowPrice) : "—"}</b></div>
        </div>
      )}
    </div>
  );
}
