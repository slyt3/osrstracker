import Link from "next/link";
import { getTopFlips } from "@/lib/engine";
import { Chart, Star, Coin, Bell, Scales, Book } from "@/components/Icons";

// Static-ish marketing page, revalidated every 60s so the hero shows real
// current flips. The live board lives at /board.
export const revalidate = 60;

function gp(n: number): string {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "+";
  if (a >= 1e9) return `${s}${(a / 1e9).toFixed(1)}b`;
  if (a >= 1e6) return `${s}${(a / 1e6).toFixed(1)}m`;
  if (a >= 1e3) return `${s}${(a / 1e3).toFixed(1)}k`;
  return `${s}${a}`;
}

const features = [
  { icon: Chart, title: "Flip board", tier: "Free", body: "Every tradeable item ranked by profit — margin after tax, ROI and profit-per-limit. Sort and filter instantly." },
  { icon: Star, title: "Price charts", tier: "Free", body: "Per-item price history, so you can read the trend before committing your gp." },
  { icon: Coin, title: "Watchlist", tier: "Free", body: "Star the items you care about and keep them one glance away." },
  { icon: Bell, title: "Alerts", tier: "Pro", body: "Get pinged when an item hits your target margin, price or ROI." },
  { icon: Scales, title: "Capital allocator", tier: "Pro", body: "Tell it your bankroll; it tells you what to flip for the best return." },
  { icon: Book, title: "Journal & P&L", tier: "Free", body: "Log real buys and sells and watch your profit add up over time." },
];

export default async function Landing() {
  const top = await getTopFlips(6).catch(() => []);

  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>
              Buy low, sell high,<br />
              <span className="hl">keep the margin.</span>
            </h1>
            <p className="lead">
              The Grand Exchange flip board for Old School RuneScape. Every margin is
              computed after the 2% GE tax — so the number you see is the number you keep.
            </p>
            <div className="actions">
              <Link className="btn btn-gold" href="/board">Open the flip board</Link>
              <Link className="btn btn-ghost" href="/pricing">Pricing</Link>
            </div>
            <div className="facts">
              <span><b>~4,500</b> items</span><span className="sep">·</span>
              <span>refreshed every <b>60s</b></span><span className="sep">·</span>
              <span>margins after the <b>2%</b> tax</span>
            </div>
          </div>

          {/* real current top flips */}
          <div className="card ticker">
            <div className="t-head">
              <span><span className="dot" />Top flips, live</span>
              <span>margin</span>
            </div>
            {top.length === 0 ? (
              <div className="t-empty">Board is warming up — open it in a moment.</div>
            ) : (
              top.map((r) => (
                <div className="t-row" key={r.itemId}>
                  <span className="nm">{r.name}</span>
                  <span className="mg pos">{gp(r.margin)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <div className="container"><hr className="rule" /></div>

      <section>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What you get</p>
            <h2>Built for merching, not grinding</h2>
            <p>The board and charts are free. Pro adds the automation that saves you from refreshing prices all day.</p>
          </div>
          <div className="feature-list">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div className="feature-item" key={f.title}>
                  <span className="fi-ico"><Icon width={20} height={20} /></span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </div>
                  {f.tier === "Pro" ? <span className="fi-tag">Pro</span> : <span className="fi-free">Free</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>From the GE to your bank</h2>
          </div>
          <div className="flow">
            <div className="flow-item">
              <h3>Poll the Grand Exchange</h3>
              <p>Prices and trade volume straight from the OSRS Wiki real-time feed, every 60 seconds.</p>
            </div>
            <div className="flow-item">
              <h3>Do the tax math</h3>
              <p>Margins computed after the 2% GE tax — rounded down, capped at 5m, exemptions included.</p>
            </div>
            <div className="flow-item">
              <h3>Flip the top row</h3>
              <p>Rank by margin, ROI or profit-per-limit, filter for liquidity, and go make gp.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="panel tax">
            <div>
              <p className="eyebrow">The 2% everyone forgets</p>
              <h2 style={{ fontSize: "clamp(1.4rem,2.6vw,1.9rem)" }}>Real profit is after tax</h2>
              <p style={{ color: "var(--muted)", margin: "0.7rem 0 0", maxWidth: "46ch" }}>
                The GE takes 2% of every sale — rounded down, none under 50 gp, capped at 5,000,000
                per item, with a fixed exempt list. It&apos;s in every number here.
              </p>
            </div>
            <div className="formula">
              margin = sell − buy − <b>tax(sell)</b><br />
              roi&nbsp;&nbsp;&nbsp;= margin ÷ buy<br />
              /limit = margin × <b>buy limit</b>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container" style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,3.4vw,2.3rem)", maxWidth: "18ch" }}>
            Find your next flip in <span className="hl">one click</span>.
          </h2>
          <p style={{ color: "var(--muted)", margin: "0.7rem 0 1.5rem" }}>No account needed to browse the board.</p>
          <Link className="btn btn-gold" href="/board">Open the flip board</Link>
        </div>
      </section>
    </main>
  );
}
