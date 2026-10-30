import { getBoard } from "@/lib/engine";
import { getCraftRows } from "@/lib/craft";
import MoneyTable, { type Maker } from "@/components/MoneyTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Money makers — OSRS Tracker",
  description: "One ranking across activities: flipping and every crafting method, by profit per action after tax.",
};

export default async function MoneyPage() {
  const [board, crafts] = await Promise.all([getBoard().catch(() => null), getCraftRows().catch(() => null)]);

  const makers: Maker[] = [];
  if (board) {
    for (const r of board.rows) {
      if (r.margin > 0 && r.buyLimit > 0 && r.hourlyVolume >= 100) {
        makers.push({ kind: "Flip", isFlip: true, itemId: r.itemId, name: r.name, per: "per item", profit: r.margin, volume: r.hourlyVolume });
      }
    }
  }
  if (crafts) {
    for (const c of crafts) {
      if (c.profit > 0 && c.outputVolume >= 20) {
        makers.push({ kind: c.skills[0]?.name || "Craft", isFlip: false, itemId: c.outputItemId, name: c.outputName, per: "per craft", profit: c.profit, volume: c.outputVolume });
      }
    }
  }
  makers.sort((a, b) => b.profit - a.profit);

  return (
    <main>
      <div className="container page-head">
        <h1>Money makers</h1>
        <p>Flipping and every crafting method in one ranking, by profit per action after the 2% tax.</p>
      </div>
      <div className="container">
        {!board && !crafts ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : (
          <MoneyTable makers={makers.slice(0, 300)} />
        )}
        <p className="meta" style={{ marginTop: "1rem" }}>Profit is per single action (one flip or one craft), after tax. Sort by volume to gauge throughput.</p>
      </div>
    </main>
  );
}
