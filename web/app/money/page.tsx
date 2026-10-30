import { getBoard } from "@/lib/engine";
import { getCraftRows } from "@/lib/craft";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Money makers — OSRS Tracker",
  description: "One ranking across activities: flipping and every crafting method, by profit per action after tax.",
};

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const gp = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + Math.round(a);
};

type Maker = { kind: string; isFlip: boolean; itemId: number; name: string; per: string; profit: number; volume: number };

export default async function MoneyPage() {
  const [board, crafts] = await Promise.all([getBoard().catch(() => null), getCraftRows().catch(() => null)]);

  const makers: Maker[] = [];
  if (board) {
    for (const r of board.rows) {
      if (r.margin > 0 && r.buyLimit > 0 && r.hourlyVolume >= 100) {
        makers.push({ kind: "Flip", isFlip: true, itemId: r.itemId, name: r.name, per: "per item", profit: r.margin, volume: r.hourlyVolume });
      }
    }
  }
  if (crafts) {
    for (const c of crafts) {
      if (c.profit > 0 && c.outputVolume >= 20) {
        const kind = c.skills[0]?.name || "Craft";
        makers.push({ kind, isFlip: false, itemId: c.outputItemId, name: c.outputName, per: "per craft", profit: c.profit, volume: c.outputVolume });
      }
    }
  }
  makers.sort((a, b) => b.profit - a.profit);
  const shown = makers.slice(0, 80);

  return (
    <main>
      <div className="container page-head">
        <h1>Money makers</h1>
        <p>Flipping and every crafting method in one ranking, by profit per action after the 2% tax.</p>
      </div>
      <div className="container">
        {!board && !crafts ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : (
          <div className="board-scroll">
            <table className="board">
              <thead>
                <tr>
                  <th className="left">Type</th>
                  <th className="left">What</th>
                  <th>Profit</th>
                  <th className="col-opt">Basis</th>
                  <th>Vol/h</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((m, i) => (
                  <tr key={m.kind + m.itemId + i}>
                    <td className="left"><span className={"mm-kind" + (m.isFlip ? " flip" : "")}>{m.kind}</span></td>
                    <td className="left">
                      <span className="bd-item">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="bd-ic" src={icon(m.itemId)} alt="" loading="lazy" width={24} height={24} />
                        <a href={`/item/${m.itemId}`}>{m.name}</a>
                      </span>
                    </td>
                    <td className="tnum pos lit" title={fmt(m.profit)}>+{gp(m.profit)}</td>
                    <td className="tnum col-opt" style={{ color: "var(--faint)" }}>{m.per}</td>
                    <td className="tnum">{gp(m.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="meta" style={{ marginTop: "1rem" }}>Profit is per single action (one flip or one craft), after tax. Sort larger operations by volume to gauge throughput.</p>
      </div>
    </main>
  );
}
