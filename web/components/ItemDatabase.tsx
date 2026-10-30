"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Row } from "@/lib/engine";

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => n.toLocaleString("en-US");
const gp = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
};

type SortKey = "name" | "buy" | "sell";

export default function ItemDatabase({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");
  const [sort, setSort] = useState<SortKey>("name");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        (q === "" || r.name.toLowerCase().includes(q)) &&
        (members === "all" || (members === "p2p" ? r.members : !r.members)),
    );
    out.sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b[sort] - a[sort]));
    return out.slice(0, 250);
  }, [rows, query, members, sort]);

  return (
    <div>
      <div className="controls">
        <input type="search" placeholder="Search items…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search items" />
        <label>
          Members
          <select value={members} onChange={(e) => setMembers(e.target.value as "all" | "p2p" | "f2p")}>
            <option value="all">All</option>
            <option value="p2p">Members</option>
            <option value="f2p">F2P</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="name">Name (A–Z)</option>
            <option value="buy">Buy price</option>
            <option value="sell">Sell price</option>
          </select>
        </label>
      </div>
      <p className="meta">Showing {shown.length} of {fmt(rows.length)} items</p>
      <div className="idb-grid">
        {shown.map((r) => (
          <Link key={r.itemId} href={`/item/${r.itemId}`} className="idb-item">
            <span className="idb-ic">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={icon(r.itemId)} alt="" loading="lazy" /></span>
            <span className="idb-body">
              <span className="idb-name">{r.name}{r.members ? <span className="mtag" title="Members only">P</span> : null}</span>
              <span className="idb-price tnum">{gp(r.buy)} <span className="idb-sep">/</span> {gp(r.sell)}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
