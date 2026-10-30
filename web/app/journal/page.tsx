import { getBoard } from "@/lib/engine";
import { getTrades, computePnl } from "@/lib/trades";
import { geTax } from "@/lib/tax";
import JournalForm from "@/components/JournalForm";
import JournalTrades from "@/components/JournalTrades";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journal — OSRS Tracker",
  description: "Log your buys and sells and track realized profit after tax.",
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const signed = (n: number) => (n >= 0 ? "+" : "−") + fmt(Math.abs(n));

export default async function JournalPage() {
  const [trades, board] = await Promise.all([
    getTrades().catch(() => []),
    getBoard().catch(() => null),
  ]);

  const names: Record<number, string> = {};
  const sell: Record<number, number> = {};
  for (const r of board?.rows ?? []) {
    names[r.itemId] = r.name;
    sell[r.itemId] = r.sell;
  }
  const items = (board?.rows ?? []).map((r) => ({ id: r.itemId, name: r.name }));

  const pnl = computePnl(trades);

  return (
    <main>
      <div className="container page-head">
        <h1>Journal &amp; P&amp;L</h1>
        <p>Log your buys and sells — realized profit is computed average-cost, after the 2% tax.</p>
      </div>

      <div className="container">
        <div className="item-stats">
          <div className="s"><div className="l">Realized P&amp;L</div>
            <div className={"v " + (pnl.realized >= 0 ? "pos" : "neg")}>{signed(pnl.realized)}</div></div>
          <div className="s"><div className="l">Tax paid</div><div className="v">{fmt(pnl.taxPaid)}</div></div>
          <div className="s"><div className="l">Trades</div><div className="v">{pnl.tradeCount}</div></div>
        </div>

        <JournalForm items={items} />

        {pnl.items.length > 0 && (
          <>
            <p className="eyebrow" style={{ margin: "2rem 0 0.8rem" }}>By item</p>
            <div className="board-scroll">
              <table className="board">
                <thead>
                  <tr>
                    <th className="left">Item</th>
                    <th>Held</th>
                    <th>Avg cost</th>
                    <th>Realized</th>
                    <th>Unrealized</th>
                  </tr>
                </thead>
                <tbody>
                  {pnl.items.map((it) => {
                    const cur = sell[it.itemId];
                    const unreal =
                      it.held > 0 && cur ? it.held * (cur - it.avgCost) - geTax(cur) * it.held : null;
                    return (
                      <tr key={it.itemId}>
                        <td className="left"><a href={`/item/${it.itemId}`}>{names[it.itemId] ?? `#${it.itemId}`}</a></td>
                        <td className="tnum">{fmt(it.held)}</td>
                        <td className="tnum">{it.held > 0 ? fmt(it.avgCost) : "—"}</td>
                        <td className={"tnum " + (it.realized >= 0 ? "pos" : "neg")}>{signed(it.realized)}</td>
                        <td className={"tnum " + (unreal === null ? "" : unreal >= 0 ? "pos" : "neg")}>
                          {unreal === null ? "—" : signed(unreal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="eyebrow" style={{ margin: "2rem 0 0.8rem" }}>Trade log</p>
        <JournalTrades trades={trades} names={names} />
      </div>
    </main>
  );
}
