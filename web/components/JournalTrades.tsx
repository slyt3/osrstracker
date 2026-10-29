"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Trade } from "@/lib/trades";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function JournalTrades({
  trades,
  names,
}: {
  trades: Trade[];
  names: Record<number, string>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    setBusy(id);
    try {
      await fetch(`/api/trades/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (trades.length === 0) {
    return <p className="notice">No trades logged yet. Record a buy or sell above.</p>;
  }

  // newest first for display
  const rows = [...trades].reverse();

  return (
    <div className="board-scroll">
      <table className="board">
        <thead>
          <tr>
            <th className="left">Date</th>
            <th className="left">Item</th>
            <th className="left">Side</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Tax</th>
            <th aria-label="Remove" />
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td className="left tnum" style={{ color: "var(--faint)" }}>
                {new Date(t.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </td>
              <td className="left"><a href={`/item/${t.itemId}`}>{names[t.itemId] ?? `#${t.itemId}`}</a></td>
              <td className="left" style={{ color: t.side === "buy" ? "var(--muted)" : "var(--gold)" }}>{t.side}</td>
              <td className="tnum">{fmt(t.qty)}</td>
              <td className="tnum">{fmt(t.price)}</td>
              <td className="tnum" style={{ color: "var(--faint)" }}>{t.tax ? fmt(t.tax) : "—"}</td>
              <td className="starcell">
                <button className="star" onClick={() => remove(t.id)} disabled={busy === t.id} title="Delete trade" aria-label="Delete trade">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
