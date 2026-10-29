import { getBoard } from "@/lib/engine";

// The flip board — public, no auth. Server component: fetches the board from
// the Go engine at request time. Filters and ranking toggles land in M1.
export default async function Home() {
  const board = await getBoard().catch(() => null);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>OSRS Tracker</h1>
      <p>Live Grand Exchange flip board.</p>

      {board === null ? (
        <p style={{ color: "#b45309" }}>
          Engine unreachable. Start the Go service and set <code>ENGINE_URL</code>.
        </p>
      ) : board.rows.length === 0 ? (
        <p>No rows yet — the poller has not produced a board (M1).</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Buy</th>
              <th>Sell</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {board.rows.map((r) => (
              <tr key={r.itemId}>
                <td>{r.name}</td>
                <td>{r.buy}</td>
                <td>{r.sell}</td>
                <td>{r.margin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
