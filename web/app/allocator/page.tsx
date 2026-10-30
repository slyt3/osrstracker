import { getBoard } from "@/lib/engine";
import Allocator from "@/components/Allocator";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Capital allocator — OSRS Tracker",
  description: "Enter your bankroll and get the best allocation across flips within buy limits — maximum after-tax profit for your gp.",
};

export default async function AllocatorPage() {
  const board = await getBoard().catch(() => null);
  return (
    <main>
      <div className="container page-head">
        <h1>Capital allocator</h1>
        <p>Tell it your gp — it spreads it across the best flips within buy limits for the most after-tax profit.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : board.rows.length === 0 ? (
          <p className="notice">No items yet — the poller is warming up. Give it a minute.</p>
        ) : (
          <Allocator rows={board.rows} />
        )}
      </div>
    </main>
  );
}
