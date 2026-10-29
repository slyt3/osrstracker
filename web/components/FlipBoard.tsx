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

      <div className="board-scroll">
        <table className="board">
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
                <td className="tnum">{fmt(r.buy)}</td>
                <td className="tnum">{fmt(r.sell)}</td>
                <td className="tnum" style={{ color: "var(--faint)" }}>{fmt(r.tax)}</td>
                <td className={"tnum " + (r.margin > 0 ? "pos" : "neg")}>{fmt(r.margin)}</td>
                <td className="tnum">{(r.roi * 100).toFixed(2)}%</td>
                <td className="tnum">{fmt(r.profitLimit)}</td>
                <td className="tnum">{fmt(r.hourlyVolume)}</td>
                <td className="tnum">{r.buyLimit ? fmt(r.buyLimit) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
