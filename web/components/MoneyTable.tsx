"use client";

import { useMemo, useState } from "react";
import SortTable, { type Col } from "@/components/SortTable";

export type Maker = { kind: string; isFlip: boolean; itemId: number; name: string; per: string; profit: number; volume: number };

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const gp = (n: number) => {
  const a = Math.abs(n), s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + Math.round(a);
};

export default function MoneyTable({ makers }: { makers: Maker[] }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const types = useMemo(() => ["all", ...Array.from(new Set(makers.map((m) => m.kind))).sort()], [makers]);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return makers.filter((m) => (type === "all" || m.kind === type) && (s === "" || m.name.toLowerCase().includes(s)));
  }, [makers, q, type]);

  const cols: Col<Maker>[] = [
    { key: "kind", label: "Type", sortVal: (m) => m.kind, render: (m) => <span className={"mm-kind" + (m.isFlip ? " flip" : "")}>{m.kind}</span> },
    {
      key: "name", label: "What", sortVal: (m) => m.name,
      render: (m) => (
        <span className="bd-item">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="bd-ic" src={icon(m.itemId)} alt="" loading="lazy" width={24} height={24} />
          <a href={`/item/${m.itemId}`}>{m.name}</a>
        </span>
      ),
    },
    { key: "profit", label: "Profit", num: true, sortVal: (m) => m.profit, render: (m) => <span className="pos lit" title={fmt(m.profit)}>+{gp(m.profit)}</span> },
    { key: "per", label: "Basis", opt: true, sortVal: (m) => m.per, render: (m) => <span style={{ color: "var(--faint)" }}>{m.per}</span> },
    { key: "volume", label: "Vol/h", num: true, sortVal: (m) => m.volume, render: (m) => gp(m.volume) },
  ];

  return (
    <div>
      <div className="controls">
        <input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <label>Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((t) => <option key={t} value={t}>{t === "all" ? "All types" : t}</option>)}
          </select>
        </label>
      </div>
      <p className="meta">{rows.length} ways to make money · click a column to sort</p>
      <SortTable rows={rows} cols={cols} rowKey={(m, i) => m.kind + m.itemId + i} initialKey="profit" />
    </div>
  );
}
