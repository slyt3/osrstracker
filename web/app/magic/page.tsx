import { getBoard } from "@/lib/engine";
import { geTax } from "@/lib/tax";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Magic conversions — OSRS Tracker",
  description: "High Alchemy profit on every item: alch value minus the buy price and a nature rune, live.",
};

const NATURE_RUNE = 561;
const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const gp = (n: number) => {
  const a = Math.abs(n), s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + Math.round(a);
};

export default async function MagicPage() {
  const board = await getBoard().catch(() => null);
  const rows = board?.rows ?? [];
  const nat = rows.find((r) => r.itemId === NATURE_RUNE)?.buy ?? 0;

  const alch = rows
    .filter((r) => r.highAlch > 0 && r.buy > 0 && r.itemId !== NATURE_RUNE)
    .map((r) => ({ r, profit: r.highAlch - r.buy - nat }))
    .filter((x) => x.profit > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 80);

  return (
    <main>
      <div className="container page-head">
        <h1>Magic conversions</h1>
        <p>High Alchemy profit — alch value minus the buy price and one nature rune ({nat ? fmt(nat) : "—"} gp). Instant, no GE tax.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : alch.length === 0 ? (
          <p className="notice">Nothing alchs for profit at current prices (nature rune {fmt(nat)} gp).</p>
        ) : (
          <div className="board-scroll">
            <table className="board">
              <thead>
                <tr><th className="left">Item</th><th>Buy</th><th>High alch</th><th className="col-opt">Nature</th><th>Profit / cast</th><th>Vol/h</th></tr>
              </thead>
              <tbody>
                {alch.map(({ r, profit }) => (
                  <tr key={r.itemId}>
                    <td className="left">
                      <span className="bd-item">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="bd-ic" src={icon(r.itemId)} alt="" loading="lazy" width={24} height={24} />
                        <a href={`/item/${r.itemId}`}>{r.name}</a>
                        {r.members ? <span className="mtag" title="Members only">P</span> : null}
                      </span>
                    </td>
                    <td className="tnum" title={fmt(r.buy)}>{gp(r.buy)}</td>
                    <td className="tnum" title={fmt(r.highAlch)}>{gp(r.highAlch)}</td>
                    <td className="tnum col-opt" style={{ color: "var(--faint)" }}>−{gp(nat)}</td>
                    <td className="tnum pos lit" title={fmt(profit)}>+{gp(profit)}</td>
                    <td className="tnum">{gp(r.hourlyVolume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="meta" style={{ marginTop: "1rem" }}>Assumes a fire staff (no fire runes counted). Alchemy has no GE tax; the buy side is the live insta-sell price.</p>
      </div>
    </main>
  );
}
