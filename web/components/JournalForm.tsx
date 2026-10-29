"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Log a trade. `items` feeds a datalist so you can type an item name; a raw
// numeric id also works.
export default function JournalForm({ items }: { items: { id: number; name: string }[] }) {
  const router = useRouter();
  const [item, setItem] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const byName = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) m.set(it.name.toLowerCase(), it.id);
    return m;
  }, [items]);

  function resolveItemId(input: string): number | null {
    const s = input.trim();
    if (/^\d+$/.test(s)) return Number(s);
    const id = byName.get(s.toLowerCase());
    return id ?? null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const itemId = resolveItemId(item);
    if (itemId === null) return setErr("Pick an item from the list (or enter its id).");
    const q = Number(qty), p = Number(price);
    if (!Number.isInteger(q) || q <= 0) return setErr("Quantity must be a positive whole number.");
    if (!Number.isInteger(p) || p < 0) return setErr("Price must be a whole number of gp.");

    setBusy(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId, side, qty: q, price: p }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Failed to log trade");
      setItem(""); setQty(""); setPrice("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to log trade");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="journal-form" onSubmit={submit}>
      <label>
        Item
        <input list="jf-items" value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Abyssal whip" />
        <datalist id="jf-items">
          {items.slice(0, 2000).map((it) => <option key={it.id} value={it.name} />)}
        </datalist>
      </label>
      <label>
        Side
        <select value={side} onChange={(e) => setSide(e.target.value as "buy" | "sell")}>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </label>
      <label>
        Qty
        <input type="number" min={1} step={1} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1" />
      </label>
      <label>
        Price (gp)
        <input type="number" min={0} step={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
      </label>
      <button className="btn btn-gold" disabled={busy} type="submit">{busy ? "Logging…" : "Log trade"}</button>
      {err && <p className="jf-err">{err}</p>}
    </form>
  );
}
