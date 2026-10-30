import { getCraftRows } from "@/lib/craft";
import CraftTable from "@/components/CraftTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crafting profit — OSRS Tracker",
  description: "What's profitable to make: cost to buy the inputs vs. sell the output after the 2% tax.",
};

export default async function CraftPage() {
  const rows = await getCraftRows();

  return (
    <main>
      <div className="container page-head">
        <h1>Crafting profit</h1>
        <p>Buy the inputs, make the item, sell the output — profit is after the 2% GE tax. Watch the volume: a fat margin you can only make a few of isn&apos;t worth much.</p>
      </div>

      <div className="container">
        {rows === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : rows.length === 0 ? (
          <p className="notice">No priceable recipes right now.</p>
        ) : (
          <CraftTable rows={rows} />
        )}
      </div>
    </main>
  );
}
