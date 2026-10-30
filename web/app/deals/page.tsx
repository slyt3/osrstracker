import { getBoard, type Row } from "@/lib/engine";
import DealList from "@/components/DealList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daily deals — OSRS Tracker",
  description: "Hand-picked OSRS flips right now: best ROI, best profit per buy limit, best cheap flips, and the most liquid margins.",
};

const by = (k: keyof Row) => (a: Row, b: Row) => (b[k] as number) - (a[k] as number);

export default async function DealsPage() {
  const board = await getBoard().catch(() => null);
  const rows = board?.rows ?? [];
  const profitable = rows.filter((r) => r.margin > 0);

  const bestRoi = profitable.filter((r) => r.hourlyVolume >= 200).sort((a, b) => b.roi - a.roi).slice(0, 8);
  const bestPerLimit = profitable.filter((r) => r.hourlyVolume >= 100).sort(by("profitLimit")).slice(0, 8);
  const bestCheap = profitable.filter((r) => r.buy < 1_000_000 && r.hourlyVolume >= 100).sort(by("margin")).slice(0, 8);
  const mostLiquid = profitable.sort(by("hourlyVolume")).slice(0, 8);

  return (
    <main>
      <div className="container page-head">
        <h1>Daily deals</h1>
        <p>The flips worth a look right now — all live, all after the 2% tax.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : rows.length === 0 ? (
          <p className="notice">No deals yet — the poller is warming up. Give it a minute.</p>
        ) : (
          <div className="deal-grid">
            <DealList title="Best ROI" note="return on gp, liquid items" rows={bestRoi} />
            <DealList title="Most profit per buy limit" note="biggest total per restock" rows={bestPerLimit} />
            <DealList title="Best flips under 1m" note="low entry cost" rows={bestCheap} />
            <DealList title="Most liquid margins" note="fills fast, high volume" rows={mostLiquid} />
          </div>
        )}
      </div>
    </main>
  );
}
