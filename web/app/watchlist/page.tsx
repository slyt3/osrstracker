import Link from "next/link";
import { getBoard } from "@/lib/engine";
import { getWatchlistIds } from "@/lib/watchlist";
import Watchlist from "@/components/Watchlist";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Watchlist — OSRS Tracker",
  description: "Items you're tracking, with live margins after tax.",
};

export default async function WatchlistPage() {
  const [board, ids] = await Promise.all([
    getBoard().catch(() => null),
    getWatchlistIds().catch(() => [] as number[]),
  ]);

  const idSet = new Set(ids);
  const rows = (board?.rows ?? []).filter((r) => idSet.has(r.itemId));

  return (
    <main>
      <div className="container page-head">
        <p className="eyebrow">Your items</p>
        <h1>Watchlist</h1>
        <p>
          Items you&apos;re tracking, with live margins after tax.{" "}
          <Link href="/board" className="back">Browse the board →</Link>
        </p>
      </div>

      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : (
          <Watchlist rows={rows} />
        )}
      </div>
    </main>
  );
}
