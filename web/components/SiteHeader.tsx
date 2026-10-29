import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" aria-label="OSRS Tracker home"><Wordmark /></Link>
        <nav className="nav">
          <Link className="link hide-sm" href="/board">Flip board</Link>
          <Link className="link hide-sm" href="/pricing">Pricing</Link>
          <Link className="btn btn-gold" href="/board">Open the board</Link>
        </nav>
      </div>
    </header>
  );
}
