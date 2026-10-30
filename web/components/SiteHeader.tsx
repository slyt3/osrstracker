import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import NavMore from "@/components/NavMore";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" aria-label="OSRS Tracker home"><Wordmark /></Link>
        <nav className="nav">
          <Link className="link hide-sm" href="/board">Board</Link>
          <Link className="link hide-sm" href="/market">Market</Link>
          <Link className="link hide-sm" href="/deals">Deals</Link>
          <Link className="link hide-sm" href="/calculators">Calculators</Link>
          <NavMore />
          <Link className="btn btn-gold" href="/board">Find flips</Link>
        </nav>
      </div>
    </header>
  );
}
