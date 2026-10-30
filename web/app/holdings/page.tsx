import { getBoard } from "@/lib/engine";
import Holdings from "@/components/Holdings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Holdings — OSRS Tracker",
  description: "Track what you're holding with live, after-tax unrealised profit and loss. Stored in your browser.",
};

export default async function HoldingsPage() {
  const board = await getBoard().catch(() => null);
  return (
    <main>
      <div className="container page-head">
        <h1>Holdings</h1>
        <p>What you&apos;re sitting on, marked to the live price with after-tax P&amp;L. Private to this browser.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : board.rows.length === 0 ? (
          <p className="notice">No prices yet — the poller is warming up. Give it a minute.</p>
        ) : (
          <Holdings rows={board.rows} />
        )}
      </div>
    </main>
  );
}
