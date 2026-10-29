import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container" style={{ padding: "2.6rem 24px", display: "flex", flexWrap: "wrap", gap: "1.6rem", justifyContent: "space-between" }}>
        <div style={{ maxWidth: "40ch" }}>
          <Wordmark size={22} />
          <p style={{ margin: "0.8rem 0 0" }}>
            Live Grand Exchange prices and profitable flips for Old School RuneScape.
          </p>
        </div>
        <nav style={{ display: "flex", gap: "2.6rem" }}>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            <Link href="/board">Flip board</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            <a href="https://prices.runescape.wiki" target="_blank" rel="noopener noreferrer">Price data: OSRS Wiki</a>
            <a href="https://oldschool.runescape.wiki/w/Grand_Exchange" target="_blank" rel="noopener noreferrer">About the GE</a>
          </div>
        </nav>
      </div>
      <hr className="rule" />
      <div className="container" style={{ padding: "1.2rem 24px", fontSize: "0.78rem", color: "var(--faint)" }}>
        Not affiliated with or endorsed by Jagex. Old School RuneScape is a trademark of Jagex Ltd.
        Price data from the OSRS Wiki (CC BY-NC-SA). © {new Date().getFullYear()} OSRS Tracker.
      </div>
    </footer>
  );
}
