import { getBoard } from "@/lib/engine";
import FlipBoard from "@/components/FlipBoard";

// The board is live data, so render on every request rather than prerendering
// at build time (a build-time prerender bakes in whatever the engine returned
// then — including "unreachable" if the engine wasn't up during the build).
export const dynamic = "force-dynamic";

// The flip board — public, no auth. Server component: fetches the board from
// the Go engine, then hands the rows to a client component that filters and
// ranks them in the browser.
export default async function Home() {
  const board = await getBoard().catch(() => null);

  return (
    <main>
      <h1>OSRS Tracker</h1>
      <p>Live Grand Exchange flip board — buy low, sell high (after the 2% GE tax).</p>

      {board === null ? (
        <p style={{ color: "var(--neg)" }}>
          Engine unreachable. Start the Go service and set <code>ENGINE_URL</code>.
        </p>
      ) : board.rows.length === 0 ? (
        <p>No rows yet — the poller has not produced a board. Give it a minute.</p>
      ) : (
        <FlipBoard rows={board.rows} ts={board.ts} />
      )}
    </main>
  );
}
