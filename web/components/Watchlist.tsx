"use client";

import { useState } from "react";
import type { Row } from "@/lib/engine";

const fmt = (n: number) => n.toLocaleString("en-US");

// Focused watchlist table with a remove (★) action per row. Shows every
// starred item regardless of margin, unlike the board's default filter.
export default function Watchlist({ rows: initial }: { rows: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);

  async function remove(id: number) {
    const prev = rows;
    setRows((r) => r.filter((x) => x.itemId !== id)); // optimistic
    try {
      const res = await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setRows(prev); // revert
    }
  }

  if (rows.length === 0) {
    return <p className="notice">Nothing on your watchlist. Star items on the board to track them here.</p>;
  }

  return (
    <div className="board-scroll">
      <table className="board">
        <thead>
          <tr>
            <th aria-label="Remove" />
            <th className="left">Item</th>
            <th>Buy</th>
            <th>Sell</th>
            <th>Tax</th>
            <th>Margin</th>
            <th>ROI</th>
            <th>Limit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.itemId}>
              <td className="starcell">
                <button className="star on" onClick={() => remove(r.itemId)} title="Remove from watchlist" aria-label="Remove from watchlist">★</button>
              </td>
              <td className="left"><a href={`/item/${r.itemId}`}>{r.name}</a></td>
              <td className="tnum">{fmt(r.buy)}</td>
              <td className="tnum">{fmt(r.sell)}</td>
              <td className="tnum" style={{ color: "var(--faint)" }}>{fmt(r.tax)}</td>
              <td className={"tnum " + (r.margin > 0 ? "pos" : "neg")}>{fmt(r.margin)}</td>
              <td className="tnum">{(r.roi * 100).toFixed(2)}%</td>
              <td className="tnum">{r.buyLimit ? fmt(r.buyLimit) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
