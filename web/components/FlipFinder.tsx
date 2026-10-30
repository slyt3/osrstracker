"use client";

import { useEffect, useMemo, useState } from "react";
import type { Row } from "@/lib/engine";
import { isLowLiquidity } from "@/lib/liquidity";

type ColKey = "buy" | "sell" | "roi" | "chg" | "vol" | "limit";
const COLS: { key: ColKey; label: string }[] = [
  { key: "buy", label: "Buy" },
  { key: "sell", label: "Sell" },
  { key: "roi", label: "ROI" },
  { key: "chg", label: "Chg 1h" },
  { key: "vol", label: "Vol/h" },
  { key: "limit", label: "Limit" },
];

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => n.toLocaleString("en-US");
const gp = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + a;
};

type PresetId = "suggested" | "perhour" | "risers" | "fallers" | "margins" | "value" | "volume" | "limits" | "all";

// realistic gp/hour: margin × the units you can actually move per hour, which is
// the smaller of your buy-limit refill rate (limit / 4h) and the market's volume.
const perHour = (r: Row) => r.margin * Math.min(r.buyLimit / 4, r.hourlyVolume);

// Each preset is a filter + a sort over the live board.
const PRESETS: { id: PresetId; label: string; hint: string; filter: (r: Row) => boolean; sort: (a: Row, b: Row) => number }[] = [
  { id: "suggested", label: "Suggested", hint: "profitable, liquid, sane entry cost", filter: (r) => r.margin > 0 && r.hourlyVolume >= 300 && r.buy <= 50_000_000, sort: (a, b) => b.profitLimit - a.profitLimit },
  { id: "perhour", label: "Profit / hour", hint: "realistic gp/hr: margin × fillable units", filter: (r) => r.margin > 0 && r.buyLimit > 0 && r.hourlyVolume >= 50, sort: (a, b) => perHour(b) - perHour(a) },
  { id: "risers", label: "Risers (1h)", hint: "biggest 1h price rise", filter: (r) => r.change1h > 0 && r.hourlyVolume >= 100, sort: (a, b) => b.change1h - a.change1h },
  { id: "fallers", label: "Fallers (1h)", hint: "biggest 1h price drop", filter: (r) => r.change1h < 0 && r.hourlyVolume >= 100, sort: (a, b) => a.change1h - b.change1h },
  { id: "margins", label: "Highest margins", hint: "biggest gp per flip", filter: (r) => r.margin > 0 && r.hourlyVolume >= 50, sort: (a, b) => b.margin - a.margin },
  { id: "value", label: "High value", hint: "expensive items, profitable", filter: (r) => r.margin > 0 && r.buy >= 1_000_000, sort: (a, b) => b.buy - a.buy },
  { id: "volume", label: "High volume", hint: "trades fast", filter: (r) => r.margin > 0, sort: (a, b) => b.hourlyVolume - a.hourlyVolume },
  { id: "limits", label: "Best per GE limit", hint: "margin × buy limit", filter: (r) => r.margin > 0 && r.buyLimit > 0, sort: (a, b) => b.profitLimit - a.profitLimit },
  { id: "all", label: "All items", hint: "everything tradeable", filter: () => true, sort: (a, b) => b.hourlyVolume - a.hourlyVolume },
];

const MAX_ROWS = 100;

export default function FlipFinder({ rows, categories = {} }: { rows: Row[]; categories?: Record<number, string> }) {
  const [preset, setPreset] = useState<PresetId>("suggested");
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");
  const [category, setCategory] = useState("all");
  const [volDir, setVolDir] = useState<null | "asc" | "desc">(null); // manual Vol/h sort (overrides preset)
  const [hideThin, setHideThin] = useState(false); // drop noisy sub-100/h items

  const categoryList = useMemo(() => Array.from(new Set(Object.values(categories))).sort(), [categories]);
  const active = PRESETS.find((p) => p.id === preset)!;

  // per-viewer column visibility (persisted; wrapped so private mode can't throw)
  const [cols, setCols] = useState<Record<ColKey, boolean>>({ buy: true, sell: true, roi: true, chg: true, vol: true, limit: true });
  useEffect(() => {
    try {
      const s = localStorage.getItem("ff-cols");
      if (s) setCols((c) => ({ ...c, ...JSON.parse(s) }));
    } catch {}
  }, []);
  function toggleCol(k: ColKey) {
    setCols((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      try { localStorage.setItem("ff-cols", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const shown = useMemo(() => {
    // better search: case-insensitive, every whitespace-separated term must match
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const out = rows.filter(
      (r) =>
        active.filter(r) &&
        (!hideThin || !isLowLiquidity(r)) &&
        (members === "all" || (members === "p2p" ? r.members : !r.members)) &&
        (category === "all" || categories[r.itemId] === category) &&
        (terms.length === 0 || terms.every((t) => r.name.toLowerCase().includes(t))),
    );
    if (volDir) out.sort((a, b) => (volDir === "desc" ? b.hourlyVolume - a.hourlyVolume : a.hourlyVolume - b.hourlyVolume));
    else out.sort(active.sort);
    return out.slice(0, MAX_ROWS);
  }, [rows, active, query, members, category, categories, volDir, hideThin]);

  return (
    <div>
      <div className="ff-tabs" role="tablist" aria-label="Flip presets">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={preset === p.id}
            className={"ff-tab" + (preset === p.id ? " on" : "")}
            onClick={() => { setPreset(p.id); setVolDir(null); }}
            title={p.hint}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="controls">
        <input type="search" placeholder="Search items… (e.g. dragon bones)" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search items" />
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
            Tag
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All tags</option>
              {categoryList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="col-toggles" role="group" aria-label="Show or hide columns">
        <span className="ct-label">Columns</span>
        {COLS.map((c) => (
          <label key={c.key} className="ct">
            <input type="checkbox" checked={cols[c.key]} onChange={() => toggleCol(c.key)} /> {c.label}
          </label>
        ))}
        <span style={{ width: 1, height: "1rem", background: "var(--line-2)" }} aria-hidden="true" />
        <label className="ct"><input type="checkbox" checked={hideThin} onChange={(e) => setHideThin(e.target.checked)} /> Hide low volume</label>
      </div>

      <p className="meta">{active.label} · {active.hint} · showing {shown.length}</p>

      <div className="board-scroll">
        <table className="board">
          <thead>
            <tr>
              <th className="left">Item</th>
              {cols.buy && <th>Buy</th>}
              {cols.sell && <th>Sell</th>}
              <th>Margin</th>
              {cols.roi && <th>ROI</th>}
              {cols.chg && <th title="Price change over the last hour">Chg 1h</th>}
              {cols.vol && (
                <th className={"sortable" + (volDir ? " active" : "")} onClick={() => setVolDir((d) => (d === "desc" ? "asc" : "desc"))} title="Click to sort by volume (high/low)">
                  Vol/h {volDir === "desc" ? "▼" : volDir === "asc" ? "▲" : ""}
                </th>
              )}
              {cols.limit && <th className="col-opt">Limit</th>}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const thin = isLowLiquidity(r);
              return (
                <tr key={r.itemId} className={thin ? "thin" : undefined}>
                  <td className="left">
                    <span className="bd-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="bd-ic" src={icon(r.itemId)} alt="" loading="lazy" width={24} height={24} />
                      <a href={`/item/${r.itemId}`}>{r.name}</a>
                      {r.members ? <span className="mtag" title="Members only">P</span> : null}
                      {r.spike ? <span title="Price spike vs its recent norm" style={{ marginLeft: "0.35rem", color: "var(--loss)" }}>⚡</span> : null}
                    </span>
                  </td>
                  {cols.buy && <td className="tnum" title={fmt(r.buy)}>{gp(r.buy)}</td>}
                  {cols.sell && <td className="tnum" title={fmt(r.sell)}>{gp(r.sell)}</td>}
                  <td className={"tnum " + (r.margin > 0 ? (thin ? "pos" : "pos lit") : "neg")} title={fmt(r.margin)}>{r.margin > 0 ? "+" : ""}{gp(r.margin)}</td>
                  {cols.roi && <td className="tnum">{(r.roi * 100).toFixed(1)}%</td>}
                  {cols.chg && <td className={"tnum " + (r.change1h > 0 ? "pos lit" : r.change1h < 0 ? "neg" : "")}>{r.change1h > 0 ? "+" : ""}{r.change1h.toFixed(1)}%</td>}
                  {cols.vol && <td className="tnum" title={fmt(r.hourlyVolume)}>{thin && <span className="thin-flag" title="Low volume — margin may be stale">⚠ </span>}{gp(r.hourlyVolume)}</td>}
                  {cols.limit && <td className="tnum col-opt">{r.buyLimit ? fmt(r.buyLimit) : "—"}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
