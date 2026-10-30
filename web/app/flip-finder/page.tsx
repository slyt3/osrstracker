import { getBoard } from "@/lib/engine";
import { getCategoryMap } from "@/lib/categories";
import FlipFinder from "@/components/FlipFinder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flip finder — OSRS Tracker",
  description: "Find your next OSRS flip fast: suggested picks, highest margins, high value, high volume, best per GE limit — all after the 2% tax.",
};

export default async function FlipFinderPage() {
  const [board, categories] = await Promise.all([
    getBoard().catch(() => null),
    getCategoryMap().catch(() => ({}) as Record<number, string>),
  ]);

  return (
    <main>
      <div className="container page-head">
        <h1>Flip finder</h1>
        <p>Pick a preset, search, or filter by tag — every margin is after the 2% GE tax.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : board.rows.length === 0 ? (
          <p className="notice">No items yet — the poller is warming up. Give it a minute.</p>
        ) : (
          <FlipFinder rows={board.rows} categories={categories} />
        )}
      </div>
    </main>
  );
}
