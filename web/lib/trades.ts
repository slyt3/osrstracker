import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/user";

export interface Trade {
  id: string;
  itemId: number;
  side: "buy" | "sell";
  qty: number;
  price: number;
  tax: number;
  ts: string; // ISO
}

/** Current user's trades, oldest first (chronological order for P&L). */
export async function getTrades(): Promise<Trade[]> {
  const userId = await currentUserId();
  const rows = await prisma.trade.findMany({ where: { userId }, orderBy: { ts: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    itemId: r.itemId,
    side: r.side,
    qty: r.qty,
    price: r.price,
    tax: r.tax,
    ts: r.ts.toISOString(),
  }));
}

export interface PnlItem {
  itemId: number;
  held: number; // units still held
  avgCost: number; // average cost basis per unit of held position
  realized: number; // realized profit after tax
}

export interface Pnl {
  items: PnlItem[];
  realized: number; // total realized profit after tax
  taxPaid: number;
  tradeCount: number;
}

// Average-cost realized P&L. Trades must be in chronological order.
export function computePnl(trades: Trade[]): Pnl {
  const pos = new Map<number, { held: number; basis: number; realized: number }>();
  let taxPaid = 0;

  for (const t of trades) {
    const p = pos.get(t.itemId) ?? { held: 0, basis: 0, realized: 0 };
    if (t.side === "buy") {
      p.held += t.qty;
      p.basis += t.qty * t.price;
    } else {
      taxPaid += t.tax;
      const avg = p.held > 0 ? p.basis / p.held : 0;
      const soldFromHeld = Math.min(t.qty, p.held);
      const costOfSold = avg * soldFromHeld;
      const proceeds = t.qty * t.price - t.tax;
      p.realized += proceeds - costOfSold;
      p.held = Math.max(0, p.held - t.qty);
      p.basis = avg * p.held;
    }
    pos.set(t.itemId, p);
  }

  const items: PnlItem[] = [];
  let realized = 0;
  for (const [itemId, p] of pos) {
    realized += p.realized;
    items.push({ itemId, held: p.held, avgCost: p.held > 0 ? p.basis / p.held : 0, realized: p.realized });
  }
  items.sort((a, b) => b.realized - a.realized);

  return { items, realized, taxPaid, tradeCount: trades.length };
}
