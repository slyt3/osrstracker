import Link from "next/link";
import { getBoard } from "@/lib/engine";
import { getAlerts } from "@/lib/alerts";
import AlertList from "@/components/AlertList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Alerts — OSRS Tracker",
  description: "Get pinged on Discord when an item hits your target margin, price or ROI.",
};

export default async function AlertsPage() {
  const [alerts, board] = await Promise.all([
    getAlerts().catch(() => []),
    getBoard().catch(() => null),
  ]);

  const names: Record<number, string> = {};
  for (const r of board?.rows ?? []) names[r.itemId] = r.name;

  return (
    <main>
      <div className="container page-head">
        <p className="eyebrow">Notifications</p>
        <h1>Alerts</h1>
        <p>
          Get pinged on Discord when an item hits your target. Set an alert from any{" "}
          <Link href="/board" className="back">item page</Link>.
        </p>
      </div>

      <div className="container">
        <AlertList alerts={alerts} names={names} />
        <p style={{ color: "var(--faint)", fontSize: "0.85rem", marginTop: "1.2rem", maxWidth: "62ch" }}>
          Alerts are checked against live prices every minute, with a cooldown so you aren&apos;t spammed.
          Delivery goes to the configured Discord webhook.
        </p>
      </div>
    </main>
  );
}
