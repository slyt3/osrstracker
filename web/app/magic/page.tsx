import { getBoard } from "@/lib/engine";
import MagicTable, { type AlchItem } from "@/components/MagicTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Magic conversions — OSRS Tracker",
  description: "High Alchemy profit on every item: alch value minus the buy price and a nature rune, live.",
};

const NATURE_RUNE = 561;

export default async function MagicPage() {
  const board = await getBoard().catch(() => null);
  const rows = board?.rows ?? [];
  const nat = rows.find((r) => r.itemId === NATURE_RUNE)?.buy ?? 0;

  const items: AlchItem[] = rows
    .filter((r) => r.highAlch > 0 && r.buy > 0 && r.itemId !== NATURE_RUNE)
    .map((r) => ({ itemId: r.itemId, name: r.name, members: r.members, buy: r.buy, highAlch: r.highAlch, profit: r.highAlch - r.buy - nat, volume: r.hourlyVolume }))
    .filter((x) => x.profit > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 300);

  return (
    <main>
      <div className="container page-head">
        <h1>Magic conversions</h1>
        <p>High Alchemy profit — alch value minus the buy price and one nature rune. Instant, no GE tax.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : items.length === 0 ? (
          <p className="notice">Nothing alchs for profit at current prices.</p>
        ) : (
          <MagicTable items={items} nat={nat} />
        )}
        <p className="meta" style={{ marginTop: "1rem" }}>Assumes a fire staff (no fire runes counted). Alchemy has no GE tax; the buy side is the live insta-sell price.</p>
      </div>
    </main>
  );
}
