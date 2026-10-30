"use client";

import { useMemo, useState } from "react";
import type { CraftRow } from "@/lib/craft";

const MAX_ROWS = 150;
const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const gp = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(Math.round(n));
};
const signed = (n: number) => (n >= 0 ? "+" : "−") + fmt(Math.abs(n));

type SortKey = "profit" | "outputVolume";

// Skills the user can enter a level for; recipes needing another skill aren't gated.
const SKILLS = ["Crafting", "Smithing", "Fletching", "Herblore", "Cooking", "Magic"] as const;

export default function CraftTable({ rows }: { rows: CraftRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("profit");
  const [query, setQuery] = useState("");
  const [minProfit, setMinProfit] = useState<number>(1);
  const [minVol, setMinVol] = useState<number>(0);
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");
  const [method, setMethod] = useState("all");
  const [skill, setSkill] = useState("all");

  const methodList = useMemo(
    () => Array.from(new Set(rows.map((r) => r.method).filter(Boolean))).sort(),
    [rows],
  );

  // "your setup": bankroll + skill levels + the two gates
  const [gold, setGold] = useState<number>(0);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [onlyAfford, setOnlyAfford] = useState(false);
  const [onlyMakeable, setOnlyMakeable] = useState(false);

  const youLevel = (name: string) => levels[name.toLowerCase()] ?? 0;
  const canMake = (r: CraftRow) =>
    r.skills.every((s) => {
      const key = s.name.toLowerCase();
      if (!SKILLS.some((k) => k.toLowerCase() === key)) return true; // untracked skill: don't gate
      return youLevel(s.name) >= s.level;
    });
  const canAfford = (r: CraftRow) => (gold > 0 ? r.cost <= gold : true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        r.profit >= minProfit &&
        r.outputVolume >= minVol &&
        (members === "all" || (members === "p2p" ? r.members : !r.members)) &&
        (method === "all" || r.method === method) &&
        (skill === "all" || r.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())) &&
        (q === "" || r.outputName.toLowerCase().includes(q)) &&
        (!onlyAfford || canAfford(r)) &&
        (!onlyMakeable || canMake(r)),
    );
    out.sort((a, b) => b[sortKey] - a[sortKey]);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sortKey, query, minProfit, minVol, members, method, skill, onlyAfford, onlyMakeable, gold, levels]);

  const shown = filtered.slice(0, MAX_ROWS);

  return (
    <div>
      <div className="ff-tabs" role="tablist" aria-label="Skill">
        {["all", ...SKILLS].map((s) => (
          <button key={s} role="tab" aria-selected={skill === s} className={"ff-tab" + (skill === s ? " on" : "")} onClick={() => setSkill(s)}>
            {s === "all" ? "All skills" : s}
          </button>
        ))}
      </div>
      <div className="controls">
        <input type="search" placeholder="Search output…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search output item" />
        <label>Min profit<input type="number" value={minProfit} step={1} onChange={(e) => setMinProfit(Number(e.target.value) || 0)} /></label>
        <label>Min sold/h<input type="number" value={minVol} min={0} step={10} onChange={(e) => setMinVol(Number(e.target.value) || 0)} /></label>
        <label>Members
          <select value={members} onChange={(e) => setMembers(e.target.value as "all" | "p2p" | "f2p")}>
            <option value="all">All</option>
            <option value="p2p">P2P</option>
            <option value="f2p">F2P</option>
          </select>
        </label>
        {methodList.length > 0 && (
          <label>Method
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="all">All methods</option>
              {methodList.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="craft-setup">
        <span className="cs-title">Your setup</span>
        <label className="cs-gold">gp<input type="number" min={0} placeholder="bankroll" value={gold || ""} onChange={(e) => setGold(Number(e.target.value) || 0)} /></label>
        {SKILLS.map((s) => (
          <label key={s} className="cs-lv">{s.slice(0, 4)}
            <input type="number" min={1} max={99} placeholder="lv" value={levels[s.toLowerCase()] || ""}
              onChange={(e) => setLevels((p) => ({ ...p, [s.toLowerCase()]: Number(e.target.value) || 0 }))} />
          </label>
        ))}
        <label className="cs-chk"><input type="checkbox" checked={onlyMakeable} onChange={(e) => setOnlyMakeable(e.target.checked)} /> Only what I can make</label>
        <label className="cs-chk"><input type="checkbox" checked={onlyAfford} onChange={(e) => setOnlyAfford(e.target.checked)} /> Only affordable</label>
      </div>

      <p className="meta">Showing {shown.length} of {fmt(filtered.length)} profitable recipes ({fmt(rows.length)} priceable total)</p>

      <div className="board-scroll">
        <table className="board">
          <thead>
            <tr>
              <th className="left">Make &amp; recipe</th>
              <th className="left">Needs</th>
              <th className="left col-opt">Method</th>
              <th>Cost</th>
              <th>Sell (net)</th>
              <th className={"sortable" + (sortKey === "profit" ? " active" : "")} onClick={() => setSortKey("profit")}>Profit {sortKey === "profit" ? "▼" : ""}</th>
              <th className={"sortable" + (sortKey === "outputVolume" ? " active" : "")} onClick={() => setSortKey("outputVolume")} title="Units of the output traded per hour — how many players make/sell this">Sold /h {sortKey === "outputVolume" ? "▼" : ""}</th>
              <th className="col-opt" title="Slowest ingredient to buy per hour — how fast you can actually source the materials">Inputs /h</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const makeLabel = r.outputQty > 1 ? `${r.outputQty}× ${r.outputName}` : r.outputName;
              const blocked = (!canMake(r)) || !canAfford(r);
              return (
                <tr key={r.recipeId} className={blocked ? "cant" : undefined}>
                  <td className="left">
                    <span className="cr-make">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="cr-ic" src={icon(r.outputItemId)} alt="" loading="lazy" width={28} height={28} />
                      <span className="cr-make-body">
                        <span className="cr-out">
                          <a href={`/item/${r.outputItemId}`}>{makeLabel}</a>
                          {r.members ? <span className="mtag" title="Members only">P</span> : <span className="ftag" title="Free to play">F2P</span>}
                        </span>
                        <span className="cr-recipe" aria-label="Ingredients (click to check a price)">
                          {r.inputs.map((i, k) =>
                            i.itemId != null ? (
                              <a className="cr-ing" key={k} href={`/item/${i.itemId}`} title={`${i.qty}× ${i.name} — ${fmt(i.qty * i.buy)} gp now`}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={icon(i.itemId)} alt="" loading="lazy" width={16} height={16} />
                                <span className="q">{i.qty}×</span> {i.name} <span className="px">{gp(i.qty * i.buy)}</span>
                              </a>
                            ) : (
                              <span className="cr-ing" key={k}><span className="q">{i.qty}×</span> {i.name}</span>
                            ),
                          )}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="left">
                    {r.skills.length === 0 ? <span style={{ color: "var(--faint)" }}>—</span> : (
                      <span className="cr-levels">
                        {r.skills.map((s, k) => {
                          const tracked = SKILLS.some((x) => x.toLowerCase() === s.name.toLowerCase());
                          const miss = tracked && youLevel(s.name) > 0 && youLevel(s.name) < s.level;
                          return <span key={k} className={"cr-lv" + (miss ? " miss" : "")}>{s.name} {s.level || ""}</span>;
                        })}
                      </span>
                    )}
                  </td>
                  <td className="left col-opt" style={{ color: "var(--muted)" }}>{r.method || "—"}</td>
                  <td className="tnum" title={gold > 0 && r.cost > gold ? "Over your bankroll" : undefined}>{fmt(r.cost)}</td>
                  <td className="tnum">{fmt(r.revenue - r.tax)}</td>
                  <td className={"tnum " + (r.profit >= 0 ? "pos lit" : "neg")}>{signed(r.profit)}</td>
                  <td className="tnum">{fmt(r.outputVolume)}</td>
                  <td className="tnum col-opt">{fmt(r.minInputVolume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
