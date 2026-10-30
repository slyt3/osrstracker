"use client";

import { useMemo, useState } from "react";
import type { Row } from "@/lib/engine";

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const gpc = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + Math.round(a);
};

// Greedy allocation: spend on the highest return-on-gp first, capped at each
// item's buy limit, until the bankroll runs out. Optimal for a linear budget
// with per-item caps, and the honest answer to "what do I do with X gp?".
export default function Allocator({ rows }: { rows: Row[] }) {
  const [gold, setGold] = useState<number>(10_000_000);
  const [minVol, setMinVol] = useState<number>(200);
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");

  const plan = useMemo(() => {
    const candidates = rows
      .filter(
        (r) =>
          r.margin > 0 && r.buyLimit > 0 && r.buy > 0 &&
          r.hourlyVolume >= minVol &&
          (members === "all" || (members === "p2p" ? r.members : !r.members)),
      )
      .sort((a, b) => b.roi - a.roi);

    let budget = gold;
    const picks: { r: Row; qty: number; spend: number; profit: number }[] = [];
    for (const r of candidates) {
      if (budget < r.buy) continue;
      const qty = Math.min(r.buyLimit, Math.floor(budget / r.buy));
      if (qty <= 0) continue;
      const spend = qty * r.buy;
      picks.push({ r, qty, spend, profit: qty * r.margin });
      budget -= spend;
      if (budget < 1) break;
    }
    const spend = picks.reduce((s, p) => s + p.spend, 0);
    const profit = picks.reduce((s, p) => s + p.profit, 0);
    return { picks, spend, profit, leftover: gold - spend, roi: spend > 0 ? (profit / spend) * 100 : 0 };
  }, [rows, gold, minVol, members]);

  return (
    <div>
      <div className="controls">
        <label>Your bankroll (gp)
          <input type="number" min={0} step={100000} value={gold} onChange={(e) => setGold(Math.max(0, Number(e.target.value) || 0))} style={{ width: "11rem" }} />
        </label>
        <label>Min vol/h
          <input type="number" min={0} step={50} value={minVol} onChange={(e) => setMinVol(Number(e.target.value) || 0)} />
        </label>
        <label>Members
          <select value={members} onChange={(e) => setMembers(e.target.value as "all" | "p2p" | "f2p")}>
            <option value="all">All</option>
            <option value="p2p">P2P</option>
            <option value="f2p">F2P</option>
          </select>
        </label>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: "1.6rem" }}>
        <div className="stat"><span className="stat-v tnum">{gpc(plan.spend)}</span><span className="stat-l">gp deployed</span></div>
        <div className="stat"><span className="stat-v tnum" style={{ color: "var(--gain)" }}>+{gpc(plan.profit)}</span><span className="stat-l">profit after tax</span></div>
        <div className="stat"><span className="stat-v tnum">{plan.roi.toFixed(1)}%</span><span className="stat-l">return on deployed</span></div>
        <div className="stat"><span className="stat-v tnum">{gpc(plan.leftover)}</span><span className="stat-l">left over</span></div>
      </div>

      {plan.picks.length === 0 ? (
        <p className="notice">Enter a bankroll (and ease the min-volume filter) to see an allocation.</p>
      ) : (
        <div className="board-scroll">
          <table className="board">
            <thead>
              <tr>
                <th className="left">Buy</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Spend</th>
                <th>Margin/ea</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {plan.picks.map(({ r, qty, spend, profit }) => (
                <tr key={r.itemId}>
                  <td className="left">
                    <span className="bd-item">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="bd-ic" src={icon(r.itemId)} alt="" loading="lazy" width={24} height={24} />
                      <a href={`/item/${r.itemId}`}>{r.name}</a>
                      {r.members ? <span className="mtag" title="Members only">P</span> : null}
                    </span>
                  </td>
                  <td className="tnum">{fmt(qty)}</td>
                  <td className="tnum" title={fmt(r.buy)}>{gpc(r.buy)}</td>
                  <td className="tnum" title={fmt(spend)}>{gpc(spend)}</td>
                  <td className="tnum pos lit">+{gpc(r.margin)}</td>
                  <td className="tnum pos lit" title={fmt(profit)}>+{gpc(profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="meta" style={{ marginTop: "1rem" }}>
        Allocates to the highest return-on-gp first, capped at each item&apos;s 4-hour buy limit. Margins are after the 2% tax.
      </p>
    </div>
  );
}
