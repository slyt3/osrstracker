import { getBoard } from "@/lib/engine";
import FlipBoard from "@/components/FlipBoard";

// The live flip board — public, no auth. Live data, so render per request.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flip board — OSRS Tracker",
  description: "Live Grand Exchange flips ranked by margin, ROI and profit-per-limit.",
};

export default async function BoardPage() {
  const board = await getBoard().catch(() => null);

  return (
    <main>
      <div className="container page-head">
        <p className="eyebrow">Grand Exchange</p>
        <h1>Flip board</h1>
        <p>Every item ranked by profit — margins are after the 2% GE tax.</p>
      </div>

      <div className="container">
        {board === null ? (
          <p className="notice">
            The price engine is unreachable right now. Try again in a moment.
          </p>
        ) : board.rows.length === 0 ? (
          <p className="notice" style={{ background: "rgba(240,169,62,.08)", borderColor: "var(--border-2)", color: "var(--muted)" }}>
            No rows yet — the poller is warming up. Give it a minute.
          </p>
        ) : (
          <FlipBoard rows={board.rows} ts={board.ts} />
        )}
      </div>
    </main>
  );
}
