"use client";

import { useMemo, useState } from "react";
import type { Row } from "@/lib/engine";

type SortKey = "margin" | "roi" | "profitLimit" | "hourlyVolume";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "margin", label: "Margin" },
  { key: "roi", label: "ROI" },
  { key: "profitLimit", label: "Profit / limit" },
  { key: "hourlyVolume", label: "Vol / h" },
];

const MAX_ROWS = 100;
const fmt = (n: number) => n.toLocaleString("en-US");

export default function FlipBoard({ rows, ts }: { rows: Row[]; ts: number }) {
  const [sortKey, setSortKey] = useState<SortKey>("margin");
  const [query, setQuery] = useState("");
  const [minMargin, setMinMargin] = useState<number>(1); // hide non-profitable by default
  const [minVolume, setMinVolume] = useState<number>(0);
  const [minRoi, setMinRoi] = useState<number>(0); // percent

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        r.margin >= minMargin &&
        r.hourlyVolume >= minVolume &&
        r.roi * 100 >= minRoi &&
        (q === "" || r.name.toLowerCase().includes(q)),
    );
    out.sort((a, b) => b[sortKey] - a[sortKey]);
    return out;
  }, [rows, sortKey, query, minMargin, minVolume, minRoi]);

  const shown = filtered.slice(0, MAX_ROWS);
  const updated = ts ? new Date(ts * 1000).toLocaleTimeString() : "—";

  return (
    <div>
      <div className="controls">
        <input
          type="search"
          placeholder="Search item…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search item name"
        />
        <label>
          Min margin
          <input type="number" value={minMargin} min={0} step={1}
            onChange={(e) => setMinMargin(Number(e.target.value) || 0)} />
        </label>
        <label>
          Min vol/h
          <input type="number" value={minVolume} min={0} step={100}
            onChange={(e) => setMinVolume(Number(e.target.value) || 0)} />
        </label>
        <label>
          Min ROI %
          <input type="number" value={minRoi} min={0} step={0.5}
            onChange={(e) => setMinRoi(Number(e.target.value) || 0)} />
        </label>
      </div>

      <p className="meta">
        Showing {shown.length} of {fmt(filtered.length)} matching ({fmt(rows.length)} total) · updated {updated}
      </p>

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th className="left">Item</th>
              <th>Buy</th>
              <th>Sell</th>
              <th>Tax</th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => setSortKey(c.key)}
                  className={"sortable" + (sortKey === c.key ? " active" : "")}
                  aria-sort={sortKey === c.key ? "descending" : "none"}
                  title={`Sort by ${c.label}`}
                >
                  {c.label} {sortKey === c.key ? "▼" : ""}
                </th>
              ))}
              <th>Limit</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.itemId}>
                <td className="left">
                  <a href={`/item/${r.itemId}`}>{r.name}</a>
                </td>
                <td>{fmt(r.buy)}</td>
                <td>{fmt(r.sell)}</td>
                <td>{fmt(r.tax)}</td>
                <td className={r.margin > 0 ? "pos" : "neg"}>{fmt(r.margin)}</td>
                <td>{(r.roi * 100).toFixed(2)}%</td>
                <td>{fmt(r.profitLimit)}</td>
                <td>{fmt(r.hourlyVolume)}</td>
                <td>{r.buyLimit ? fmt(r.buyLimit) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .controls { display:flex; flex-wrap:wrap; gap:.75rem; align-items:flex-end; margin:1rem 0; }
        .controls input[type=search] { min-width:12rem; }
        .controls label { display:flex; flex-direction:column; font-size:.75rem; color:var(--muted); gap:.2rem; }
        .controls input { padding:.4rem .5rem; border:1px solid var(--border); border-radius:6px;
          background:var(--card); color:inherit; font:inherit; }
        .controls input[type=number] { width:7rem; }
        .meta { font-size:.8rem; color:var(--muted); margin:.25rem 0 .75rem; }
        .scroll { overflow-x:auto; border:1px solid var(--border); border-radius:8px; }
        table { border-collapse:collapse; width:100%; font-variant-numeric:tabular-nums; font-size:.9rem; }
        th, td { padding:.45rem .6rem; text-align:right; white-space:nowrap; }
        th.left, td.left { text-align:left; }
        thead th { position:sticky; top:0; background:var(--card); border-bottom:1px solid var(--border);
          font-weight:600; }
        th.sortable { cursor:pointer; user-select:none; }
        th.active { color:var(--accent); }
        tbody tr:nth-child(even) { background:var(--stripe); }
        td a { color:inherit; text-decoration:none; }
        td a:hover { text-decoration:underline; }
        .pos { color:var(--pos); }
        .neg { color:var(--neg); }
      `}</style>
    </div>
  );
}
