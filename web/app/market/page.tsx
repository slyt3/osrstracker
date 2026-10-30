import { getBoard, type Row } from "@/lib/engine";
import DealList from "@/components/DealList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Market watch — OSRS Tracker",
  description: "A live snapshot of the OSRS Grand Exchange: how many items are profitable right now, the biggest margins, and the most traded.",
};

const gp = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(Math.round(n));
};
function median(ns: number[]): number {
  if (ns.length === 0) return 0;
  const s = [...ns].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

export default async function MarketPage() {
  const board = await getBoard().catch(() => null);
  const rows = board?.rows ?? [];
  const profitable = rows.filter((r) => r.margin > 0);
  const liquid = rows.filter((r) => r.hourlyVolume >= 100);
  const members = rows.filter((r) => r.members).length;

  const stats = [
    { l: "Items tracked", v: rows.length ? rows.length.toLocaleString("en-US") : "—" },
    { l: "Profitable now", v: profitable.length ? profitable.length.toLocaleString("en-US") : "—" },
    { l: "Liquid (100+/h)", v: liquid.length ? liquid.length.toLocaleString("en-US") : "—" },
    { l: "Median margin", v: gp(median(profitable.map((r) => r.margin))) },
    { l: "Members / F2P", v: rows.length ? `${Math.round((members / rows.length) * 100)}% / ${Math.round((1 - members / rows.length) * 100)}%` : "—" },
    { l: "Updated", v: board ? new Date(board.ts * 1000).toLocaleTimeString("en-GB", { hour12: false }) : "—" },
  ];

  const biggest = [...profitable].sort((a, b) => b.margin - a.margin).slice(0, 8);
  const traded = [...rows].filter((r) => r.margin > 0).sort((a, b) => b.hourlyVolume - a.hourlyVolume).slice(0, 8);

  return (
    <main>
      <div className="container page-head">
        <h1>Market watch</h1>
        <p>A live snapshot of the Grand Exchange — refreshed every 60 seconds, all margins after tax.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : rows.length === 0 ? (
          <p className="notice">No data yet — the poller is warming up. Give it a minute.</p>
        ) : (
          <>
            <div className="stat-grid">
              {stats.map((s) => (
                <div className="stat" key={s.l}>
                  <span className="stat-v tnum">{s.v}</span>
                  <span className="stat-l">{s.l}</span>
                </div>
              ))}
            </div>
            <div className="deal-grid" style={{ marginTop: "2.2rem" }}>
              <DealList title="Biggest margins" note="highest gp per flip, after tax" rows={biggest} />
              <DealList title="Most traded" note="highest hourly volume, profitable" rows={traded} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
