"use client";

import { useMemo, useState } from "react";
import type { CraftRow } from "@/lib/craft";

const MAX_ROWS = 150;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const signed = (n: number) => (n >= 0 ? "+" : "−") + fmt(Math.abs(n));

type SortKey = "profit" | "outputVolume";

export default function CraftTable({ rows }: { rows: CraftRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("profit");
  const [query, setQuery] = useState("");
  const [minProfit, setMinProfit] = useState<number>(1);
  const [minVol, setMinVol] = useState<number>(0);
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        r.profit >= minProfit &&
        r.outputVolume >= minVol &&
        (members === "all" || (members === "p2p" ? r.members : !r.members)) &&
        (q === "" || r.outputName.toLowerCase().includes(q)),
    );
    out.sort((a, b) => b[sortKey] - a[sortKey]);
    return out;
  }, [rows, sortKey, query, minProfit, minVol, members]);

  const shown = filtered.slice(0, MAX_ROWS);

  return (
    <div>
      <div className="controls">
        <input type="search" placeholder="Search output…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search output item" />
        <label>Min profit<input type="number" value={minProfit} step={1} onChange={(e) => setMinProfit(Number(e.target.value) || 0)} /></label>
        <label>Min out vol/h<input type="number" value={minVol} min={0} step={10} onChange={(e) => setMinVol(Number(e.target.value) || 0)} /></label>
        <label>Members
          <select value={members} onChange={(e) => setMembers(e.target.value as "all" | "p2p" | "f2p")}
            style={{ padding: ".5rem .6rem", border: "1px solid var(--line-2)", borderRadius: 7, background: "var(--bg)", color: "var(--text)", font: "inherit" }}>
            <option value="all">All</option>
            <option value="p2p">Members</option>
            <option value="f2p">F2P</option>
          </select>
        </label>
      </div>

      <p className="meta">Showing {shown.length} of {fmt(filtered.length)} profitable recipes ({fmt(rows.length)} priceable total)</p>

      <div className="board-scroll">
        <table className="board">
          <thead>
            <tr>
              <th className="left">Make</th>
              <th className="left">Method</th>
              <th>Cost</th>
              <th>Sell (net)</th>
              <th className={"sortable" + (sortKey === "profit" ? " active" : "")} onClick={() => setSortKey("profit")}>Profit {sortKey === "profit" ? "▼" : ""}</th>
              <th className={"sortable" + (sortKey === "outputVolume" ? " active" : "")} onClick={() => setSortKey("outputVolume")}>Out vol/h {sortKey === "outputVolume" ? "▼" : ""}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const inputs = r.inputs.map((i) => `${i.qty}× ${i.name}`).join(", ");
              const makeLabel = r.outputQty > 1 ? `${r.outputQty}× ${r.outputName}` : r.outputName;
              return (
                <tr key={r.recipeId}>
                  <td className="left" title={`Inputs: ${inputs}`}>
                    <a href={`/item/${r.outputItemId}`}>{makeLabel}</a>
                    {r.members ? <span className="mtag" title="Members only"> P</span> : null}
                  </td>
                  <td className="left" style={{ color: "var(--muted)" }}>{r.method || "—"}</td>
                  <td className="tnum">{fmt(r.cost)}</td>
                  <td className="tnum">{fmt(r.revenue - r.tax)}</td>
                  <td className={"tnum " + (r.profit >= 0 ? "pos" : "neg")}>{signed(r.profit)}</td>
                  <td className="tnum">{fmt(r.outputVolume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
