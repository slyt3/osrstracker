import { getGearRows } from "@/lib/equipment";
import GearTable from "@/components/GearTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gear stats — OSRS Tracker",
  description:
    "Every equipable OSRS item with its full attack, defence and strength bonuses in one sortable table — rank weapons by crush, armour by ranged attack, and more.",
};

export default async function GearPage() {
  const rows = await getGearRows();

  return (
    <main>
      <div className="container page-head">
        <h1>Gear stats</h1>
        <p>
          Every weapon, piece of armour and worn item with its full bonuses in one place. Sort by any stat to find the
          best in slot — the highest crush weapon, the most ranged attack armour, the biggest prayer bonus — without
          opening a wiki page for each one.
        </p>
      </div>

      <div className="container">
        {rows === null ? (
          <p className="notice">
            The gear data isn&apos;t loaded yet. Run <span className="mono">npm run ingest:equipment</span> to populate it.
          </p>
        ) : rows.length === 0 ? (
          <p className="notice">No equipment loaded yet — run the equipment ingest to fill this table.</p>
        ) : (
          <GearTable rows={rows} />
        )}
      </div>
    </main>
  );
}
