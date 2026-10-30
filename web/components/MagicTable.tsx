"use client";

import { useMemo, useState } from "react";
import SortTable, { type Col } from "@/components/SortTable";

export type AlchItem = { itemId: number; name: string; members: boolean; buy: number; highAlch: number; profit: number; volume: number };

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const gp = (n: number) => {
  const a = Math.abs(n), s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + Math.round(a);
};

export default function MagicTable({ items, nat }: { items: AlchItem[]; nat: number }) {
  const [q, setQ] = useState("");
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");
  const [minProfit, setMinProfit] = useState(1);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter(
      (it) =>
        it.profit >= minProfit &&
        (members === "all" || (members === "p2p" ? it.members : !it.members)) &&
        (s === "" || it.name.toLowerCase().includes(s)),
    );
  }, [items, q, members, minProfit]);

  const cols: Col<AlchItem>[] = [
    {
      key: "name", label: "Item", sortVal: (r) => r.name,
      render: (r) => (
        <span className="bd-item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="bd-ic" src={icon(r.itemId)} alt="" loading="lazy" width={24} height={24} />
          <a href={`/item/${r.itemId}`}>{r.name}</a>
          {r.members ? <span className="mtag" title="Members only">P</span> : null}
        </span>
      ),
    },
    { key: "buy", label: "Buy", num: true, sortVal: (r) => r.buy, render: (r) => <span title={fmt(r.buy)}>{gp(r.buy)}</span> },
    { key: "highAlch", label: "High alch", num: true, sortVal: (r) => r.highAlch, render: (r) => <span title={fmt(r.highAlch)}>{gp(r.highAlch)}</span> },
    { key: "nat", label: "Nature", num: true, opt: true, render: () => <span style={{ color: "var(--faint)" }}>−{gp(nat)}</span> },
    { key: "profit", label: "Profit / cast", num: true, sortVal: (r) => r.profit, render: (r) => <span className="pos lit" title={fmt(r.profit)}>+{gp(r.profit)}</span> },
    { key: "volume", label: "Vol/h", num: true, sortVal: (r) => r.volume, render: (r) => gp(r.volume) },
  ];

  return (
    <div>
      <div className="controls">
        <input type="search" placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search items" />
        <label>Min profit<input type="number" value={minProfit} step={1} onChange={(e) => setMinProfit(Number(e.target.value) || 0)} /></label>
        <label>Members
          <select value={members} onChange={(e) => setMembers(e.target.value as "all" | "p2p" | "f2p")}>
            <option value="all">All</option>
            <option value="p2p">P2P</option>
            <option value="f2p">F2P</option>
          </select>
        </label>
      </div>
      <p className="meta">{rows.length} items alch for profit · nature rune {fmt(nat)} gp · click a column to sort</p>
      <SortTable rows={rows} cols={cols} rowKey={(r) => String(r.itemId)} initialKey="profit" />
    </div>
  );
}
