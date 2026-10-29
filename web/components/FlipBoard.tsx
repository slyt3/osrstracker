"use client";

import { useMemo, useState } from "react";
import type { Row } from "@/lib/engine";
import { isLowLiquidity } from "@/lib/liquidity";

type SortKey = "margin" | "roi" | "profitLimit" | "hourlyVolume";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "margin", label: "Margin" },
  { key: "roi", label: "ROI" },
  { key: "profitLimit", label: "Profit / limit" },
  { key: "hourlyVolume", label: "Vol / h" },
];

const MAX_ROWS = 100;
const fmt = (n: number) => n.toLocaleString("en-US");

export default function FlipBoard({
  rows,
  ts,
  starred = [],
}: {
  rows: Row[];
  ts: number;
  starred?: number[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("margin");
  const [query, setQuery] = useState("");
  const [minMargin, setMinMargin] = useState<number>(1); // hide non-profitable by default
  const [minVolume, setMinVolume] = useState<number>(0);
  const [minRoi, setMinRoi] = useState<number>(0); // percent
  const [stars, setStars] = useState<Set<number>>(() => new Set(starred));

  async function toggleStar(id: number) {
    const on = stars.has(id);
    setStars((prev) => {
      const next = new Set(prev);
      if (on) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      const res = on
        ? await fetch(`/api/watchlist/${id}`, { method: "DELETE" })
        : await fetch(`/api/watchlist`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ itemId: id }),
          });
      if (!res.ok) throw new Error();
    } catch {
      // revert on failure
      setStars((prev) => {
        const next = new Set(prev);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  }

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
              <th aria-label="Watch" />
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
            {shown.map((r) => {
              const on = stars.has(r.itemId);
              const thin = isLowLiquidity(r);
              return (
                <tr key={r.itemId} className={thin ? "thin" : undefined}>
                  <td className="starcell">
                    <button
                      className={"star" + (on ? " on" : "")}
                      onClick={() => toggleStar(r.itemId)}
                      aria-label={on ? "Remove from watchlist" : "Add to watchlist"}
                      aria-pressed={on}
                      title={on ? "Remove from watchlist" : "Add to watchlist"}
                    >
                      {on ? "★" : "☆"}
                    </button>
                  </td>
                  <td className="left">
                    <a href={`/item/${r.itemId}`}>{r.name}</a>
                  </td>
                  <td className="tnum">{fmt(r.buy)}</td>
                  <td className="tnum">{fmt(r.sell)}</td>
                  <td className="tnum" style={{ color: "var(--faint)" }}>{fmt(r.tax)}</td>
                  <td className={"tnum " + (r.margin > 0 ? "pos" : "neg")}>{fmt(r.margin)}</td>
                  <td className="tnum">{(r.roi * 100).toFixed(2)}%</td>
                  <td className="tnum">{fmt(r.profitLimit)}</td>
                  <td className="tnum">
                    {thin && (
                      <span className="thin-flag" title="Low volume — this margin may be stale and hard to fill">⚠ </span>
                    )}
                    {fmt(r.hourlyVolume)}
                  </td>
                  <td className="tnum">{r.buyLimit ? fmt(r.buyLimit) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
