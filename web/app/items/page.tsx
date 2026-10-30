import { getBoard } from "@/lib/engine";
import ItemDatabase from "@/components/ItemDatabase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Item database — OSRS Tracker",
  description: "Every tradeable OSRS item with live buy and sell prices — search and open any item's chart.",
};

export default async function ItemsPage() {
  const board = await getBoard().catch(() => null);
  return (
    <main>
      <div className="container page-head">
        <h1>Item database</h1>
        <p>Every tradeable item with live prices. Search one to open its chart and set an alert.</p>
      </div>
      <div className="container">
        {board === null ? (
          <p className="notice">The price engine is unreachable right now. Try again in a moment.</p>
        ) : board.rows.length === 0 ? (
          <p className="notice">No items yet — the poller is warming up. Give it a minute.</p>
        ) : (
          <ItemDatabase rows={board.rows} />
        )}
      </div>
    </main>
  );
}
