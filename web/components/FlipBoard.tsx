"use client";

import { useMemo, useState } from "react";
import type { Row } from "@/lib/engine";
import { isLowLiquidity } from "@/lib/liquidity";

type SortKey = "margin" | "roi" | "profitLimit" | "hourlyVolume";

const COLUMNS: { key: SortKey; label: string; opt?: boolean }[] = [
  { key: "margin", label: "Margin" },
  { key: "roi", label: "ROI" },
  { key: "profitLimit", label: "Profit / limit", opt: true },
  { key: "hourlyVolume", label: "Vol / h" },
];

const MAX_ROWS = 100;
const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => n.toLocaleString("en-US");
// compact gp so wide columns (21,761,339) become narrow (21.76m)
const gp = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + a;
};

export default function FlipBoard({
  rows,
  ts,
  starred = [],
  categories = {},
}: {
  rows: Row[];
  ts: number;
  starred?: number[];
  categories?: Record<number, string>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("margin");
  const [query, setQuery] = useState("");
  const [minMargin, setMinMargin] = useState<number>(1); // hide non-profitable by default
  const [minVolume, setMinVolume] = useState<number>(100); // hide thin/junk items by default
  const [minRoi, setMinRoi] = useState<number>(0); // percent
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");
  const [category, setCategory] = useState<string>("all");
  const [stars, setStars] = useState<Set<number>>(() => new Set(starred));

  const categoryList = useMemo(
    () => Array.from(new Set(Object.values(categories))).sort(),
    [categories],
  );

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
        (members === "all" || (members === "p2p" ? r.members : !r.members)) &&
        (category === "all" || categories[r.itemId] === category) &&
        (q === "" || r.name.toLowerCase().includes(q)),
    );
    out.sort((a, b) => b[sortKey] - a[sortKey]);
    return out;
  }, [rows, sortKey, query, minMargin, minVolume, minRoi, members, category, categories]);

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
        <label>
          Members
          <select value={members} onChange={(e) => setMembers(e.target.value as "all" | "p2p" | "f2p")}>
            <option value="all">All</option>
            <option value="p2p">Members</option>
            <option value="f2p">F2P</option>
          </select>
        </label>
        {categoryList.length > 0 && (
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All</option>
              {categoryList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
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
              <th className="col-opt">Tax</th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => setSortKey(c.key)}
                  className={"sortable" + (sortKey === c.key ? " active" : "") + (c.opt ? " col-opt" : "")}
                  aria-sort={sortKey === c.key ? "descending" : "none"}
                  title={`Sort by ${c.label}`}
                >
                  {c.label} {sortKey === c.key ? "▼" : ""}
                </th>
              ))}
              <th className="col-opt">Limit</th>
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
                    <span className="bd-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="bd-ic" src={icon(r.itemId)} alt="" loading="lazy" width={24} height={24} />
                      <a href={`/item/${r.itemId}`}>{r.name}</a>
                      {r.members ? <span className="mtag" title="Members only">P</span> : null}
                    </span>
                  </td>
                  <td className="tnum" title={fmt(r.buy)}>{gp(r.buy)}</td>
                  <td className="tnum" title={fmt(r.sell)}>{gp(r.sell)}</td>
                  <td className="tnum col-opt" style={{ color: "var(--faint)" }} title={fmt(r.tax)}>{gp(r.tax)}</td>
                  <td className={"tnum " + (r.margin > 0 ? (thin ? "pos" : "pos lit") : "neg")} title={fmt(r.margin)}>{gp(r.margin)}</td>
                  <td className="tnum">{(r.roi * 100).toFixed(2)}%</td>
                  <td className="tnum col-opt" title={fmt(r.profitLimit)}>{gp(r.profitLimit)}</td>
                  <td className="tnum" title={fmt(r.hourlyVolume)}>
                    {thin && (
                      <span className="thin-flag" title="Low volume — this margin may be stale and hard to fill">⚠ </span>
                    )}
                    {gp(r.hourlyVolume)}
                  </td>
                  <td className="tnum col-opt">{r.buyLimit ? fmt(r.buyLimit) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
