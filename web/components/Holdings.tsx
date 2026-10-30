"use client";

import { useEffect, useMemo, useState } from "react";
import type { Row } from "@/lib/engine";
import { geTax } from "@/lib/tax";

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const signed = (n: number) => (n >= 0 ? "+" : "−") + fmt(Math.abs(n));

type Lot = { itemId: number; qty: number; buy: number };

export default function Holdings({ rows }: { rows: Row[] }) {
  const byId = useMemo(() => new Map(rows.map((r) => [r.itemId, r])), [rows]);
  const byName = useMemo(() => new Map(rows.map((r) => [r.name.toLowerCase(), r])), [rows]);

  const [lots, setLots] = useState<Lot[]>([]);
  const [q, setQ] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [buy, setBuy] = useState<number>(0);

  useEffect(() => {
    try {
      const s = localStorage.getItem("osrs-holdings");
      if (s) setLots(JSON.parse(s));
    } catch {}
  }, []);
  const save = (next: Lot[]) => {
    setLots(next);
    try { localStorage.setItem("osrs-holdings", JSON.stringify(next)); } catch {}
  };

  function add() {
    const row = byName.get(q.trim().toLowerCase());
    if (!row || qty <= 0) return;
    save([...lots, { itemId: row.itemId, qty, buy: buy > 0 ? buy : row.buy }]);
    setQ(""); setQty(1); setBuy(0);
  }

  const totals = lots.reduce(
    (t, l) => {
      const r = byId.get(l.itemId);
      if (!r) return t;
      const pnl = l.qty * (r.sell - l.buy - geTax(r.sell));
      t.cost += l.qty * l.buy; t.value += l.qty * r.sell; t.pnl += pnl;
      return t;
    },
    { cost: 0, value: 0, pnl: 0 },
  );

  return (
    <div>
      <div className="controls">
        <label>Item
          <input list="hold-items" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Dragon bones" style={{ minWidth: "13rem" }} />
          <datalist id="hold-items">{rows.slice(0, 2000).map((r) => <option key={r.itemId} value={r.name} />)}</datalist>
        </label>
        <label>Qty<input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value) || 0)} /></label>
        <label>Buy price <span style={{ textTransform: "none", color: "var(--faint)" }}>(blank = now)</span>
          <input type="number" min={0} value={buy || ""} placeholder="now" onChange={(e) => setBuy(Number(e.target.value) || 0)} /></label>
        <button className="btn btn-gold" onClick={add} style={{ alignSelf: "flex-end" }}>Add holding</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", margin: "1.4rem 0" }}>
        <div className="stat"><span className="stat-v tnum">{fmt(totals.value)}</span><span className="stat-l">value now (at sell)</span></div>
        <div className="stat"><span className="stat-v tnum">{fmt(totals.cost)}</span><span className="stat-l">cost basis</span></div>
        <div className="stat"><span className="stat-v tnum" style={{ color: totals.pnl >= 0 ? "var(--gain)" : "var(--loss)" }}>{signed(totals.pnl)}</span><span className="stat-l">unrealised P&amp;L (after tax)</span></div>
      </div>

      {lots.length === 0 ? (
        <p className="notice">No holdings yet. Add what you&apos;re sitting on to track live, after-tax P&amp;L. Stored in this browser only.</p>
      ) : (
        <div className="board-scroll">
          <table className="board">
            <thead>
              <tr><th className="left">Item</th><th>Qty</th><th>Buy</th><th>Sell now</th><th>P&amp;L (after tax)</th><th aria-label="Remove" /></tr>
            </thead>
            <tbody>
              {lots.map((l, i) => {
                const r = byId.get(l.itemId);
                const pnl = r ? l.qty * (r.sell - l.buy - geTax(r.sell)) : 0;
                return (
                  <tr key={i}>
                    <td className="left">
                      <span className="bd-item">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="bd-ic" src={icon(l.itemId)} alt="" loading="lazy" width={24} height={24} />
                        <a href={`/item/${l.itemId}`}>{r?.name ?? `Item #${l.itemId}`}</a>
                      </span>
                    </td>
                    <td className="tnum">{fmt(l.qty)}</td>
                    <td className="tnum">{fmt(l.buy)}</td>
                    <td className="tnum">{r ? fmt(r.sell) : "—"}</td>
                    <td className={"tnum " + (pnl >= 0 ? "pos lit" : "neg")}>{signed(pnl)}</td>
                    <td className="starcell"><button className="star" title="Remove" aria-label="Remove holding" onClick={() => save(lots.filter((_, j) => j !== i))}>×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
