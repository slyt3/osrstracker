import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" aria-label="OSRS Tracker home"><Wordmark /></Link>
        <nav className="nav">
          <Link className="link hide-sm" href="/board">Flip board</Link>
          <Link className="link hide-sm" href="/craft">Craft</Link>
          <Link className="link hide-sm" href="/watchlist">Watchlist</Link>
          <Link className="link hide-sm" href="/journal">Journal</Link>
          <Link className="link hide-sm" href="/alerts">Alerts</Link>
          <Link className="link hide-sm" href="/pricing">Pricing</Link>
          <Link className="btn btn-gold" href="/board">Open the board</Link>
        </nav>
      </div>
    </header>
  );
}
