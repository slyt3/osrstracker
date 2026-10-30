import { getBoard } from "@/lib/engine";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New items — OSRS Tracker",
  description: "Items that have recently started trading on the Grand Exchange.",
};

const NEW_WINDOW = 14 * 24 * 3600; // 14 days
const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const gp = (n: number) => {
  const a = Math.abs(n), s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + Math.round(a);
};
const when = (ts: number) => new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default async function NewItemsPage() {
  const board = await getBoard().catch(() => null);
  const now = Math.floor(Date.now() / 1000);
  const fresh = (board?.rows ?? [])
    .filter((r) => r.firstSeen > 0 && now - r.firstSeen < NEW_WINDOW)
    .sort((a, b) => b.firstSeen - a.firstSeen)
    .slice(0, 100);

  return (
    <main>
      <div className="container page-head">
        <h1>New items</h1>
        <p>Items that started trading in the last 14 days. Tracked from when the engine first sees them.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : fresh.length === 0 ? (
          <p className="notice">No new items in the last 14 days. This fills in as the Grand Exchange adds items — the engine stamps each the first time it appears.</p>
        ) : (
          <div className="board-scroll">
            <table className="board">
              <thead>
                <tr><th className="left">Item</th><th className="left">First seen</th><th>Buy</th><th>Sell</th><th>Margin</th><th>Vol/h</th></tr>
              </thead>
              <tbody>
                {fresh.map((r) => (
                  <tr key={r.itemId}>
                    <td className="left">
                      <span className="bd-item">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="bd-ic" src={icon(r.itemId)} alt="" loading="lazy" width={24} height={24} />
                        <a href={`/item/${r.itemId}`}>{r.name}</a>
                        {r.members ? <span className="mtag" title="Members only">P</span> : null}
                      </span>
                    </td>
                    <td className="left" style={{ color: "var(--muted)" }}>{when(r.firstSeen)}</td>
                    <td className="tnum">{gp(r.buy)}</td>
                    <td className="tnum">{gp(r.sell)}</td>
                    <td className={"tnum " + (r.margin > 0 ? "pos lit" : "neg")}>{r.margin > 0 ? "+" : ""}{gp(r.margin)}</td>
                    <td className="tnum">{gp(r.hourlyVolume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
