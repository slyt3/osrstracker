import Link from "next/link";
import { Coin, ArrowRight } from "@/components/Icons";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="wordmark" aria-label="OSRS Tracker home">
          <Coin className="mk" width={24} height={24} style={{ color: "var(--gold)" }} />
          OSRS&nbsp;<span className="mk">Tracker</span>
        </Link>
        <nav className="nav">
          <Link className="link hide-sm" href="/board">Flip board</Link>
          <Link className="link hide-sm" href="/pricing">Pricing</Link>
          <Link className="btn btn-gold" href="/board">
            Open the board <ArrowRight />
          </Link>
        </nav>
      </div>
    </header>
  );
}
