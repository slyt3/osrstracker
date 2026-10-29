"use client";

import { useState } from "react";

// Create an alert for one item. Lives on the item page.
export default function AlertForm({ itemId }: { itemId: number }) {
  const [kind, setKind] = useState<"margin" | "price" | "roi">("margin");
  const [op, setOp] = useState<">=" | "<=">(">=");
  const [threshold, setThreshold] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const t = Number(threshold);
    if (!Number.isFinite(t)) return setMsg({ ok: false, text: "Enter a threshold." });
    setBusy(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId, kind, op, threshold: t }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Failed");
      setThreshold("");
      setMsg({ ok: true, text: `Alert set: ${kind} ${op} ${t}${kind === "roi" ? "%" : ""}. Manage it on the Alerts page.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed to create alert" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="journal-form" onSubmit={submit}>
      <label>
        Alert when
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="margin">Margin</option>
          <option value="price">Price</option>
          <option value="roi">ROI %</option>
        </select>
      </label>
      <label>
        Is
        <select value={op} onChange={(e) => setOp(e.target.value as typeof op)}>
          <option value=">=">at least (≥)</option>
          <option value="<=">at most (≤)</option>
        </select>
      </label>
      <label>
        Threshold
        <input type="number" step="any" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="0" />
      </label>
      <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? "Setting…" : "Set alert"}</button>
      {msg && <p className={msg.ok ? "jf-ok" : "jf-err"}>{msg.text}</p>}
    </form>
  );
}
