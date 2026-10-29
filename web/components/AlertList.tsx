"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Alert } from "@/lib/alerts";

export default function AlertList({
  alerts,
  names,
}: {
  alerts: Alert[];
  names: Record<number, string>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    setBusy(id);
    try {
      await fetch(`/api/alerts/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (alerts.length === 0) {
    return <p className="notice">No alerts yet. Open an item and set one from its page.</p>;
  }

  return (
    <div className="board-scroll">
      <table className="board">
        <thead>
          <tr>
            <th className="left">Item</th>
            <th className="left">Condition</th>
            <th className="left">Channel</th>
            <th aria-label="Remove" />
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id}>
              <td className="left"><a href={`/item/${a.itemId}`}>{names[a.itemId] ?? `#${a.itemId}`}</a></td>
              <td className="left tnum">{a.kind} {a.op} {a.threshold.toLocaleString("en-US")}{a.kind === "roi" ? "%" : ""}</td>
              <td className="left">Discord</td>
              <td className="starcell">
                <button className="star" onClick={() => remove(a.id)} disabled={busy === a.id} title="Delete alert" aria-label="Delete alert">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
