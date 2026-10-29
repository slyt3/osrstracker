import Link from "next/link";
import { Coin, Chart, Star, Bell, Scales, Book, ArrowRight, Check } from "@/components/Icons";

// Static marketing landing page. The live board lives at /board.

const sample = [
  { name: "Twisted bow", margin: "+2.1m", roi: "1.8%" },
  { name: "Dragon claws", margin: "+480k", roi: "3.2%" },
  { name: "Abyssal whip", margin: "+38k", roi: "2.4%" },
  { name: "Nature rune", margin: "+9", roi: "4.6%" },
];

const features = [
  { icon: Chart, title: "Flip board", body: "Every tradeable item ranked by profit — margin after tax, ROI, and profit-per-limit. Sort and filter instantly." },
  { icon: Star, title: "Price charts", body: "Per-item price history so you can see trends before you commit your gp." },
  { icon: Coin, title: "Watchlist", body: "Star the items you care about and keep them one glance away.", tag: null },
  { icon: Bell, title: "Alerts", body: "Get pinged when an item hits your target margin, price or ROI.", tag: "Pro" },
  { icon: Scales, title: "Capital allocator", body: "Tell it your bankroll; it tells you what to flip for the best return.", tag: "Pro" },
  { icon: Book, title: "Journal & P&L", body: "Log real buys and sells and watch your profit add up over time." },
];

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="badge"><Coin width={14} height={14} /> Live GE data · refreshed every 60s</span>
            <h1 style={{ marginTop: "1.1rem" }}>
              Buy low. Sell high.<br />
              <span className="goldtext">Mind the tax.</span>
            </h1>
            <p className="sub">
              The Grand Exchange flip board for Old School RuneScape — real margins
              after the 2% GE tax, ranked so your next flip is the top row.
            </p>
            <div className="cta-row">
              <Link className="btn btn-gold" href="/board">Open the flip board <ArrowRight /></Link>
              <Link className="btn btn-ghost" href="/pricing">See pricing</Link>
            </div>
            <div className="stats">
              <div><div className="n goldtext tnum">4,500+</div><div className="l">items tracked</div></div>
              <div><div className="n goldtext tnum">60s</div><div className="l">refresh</div></div>
              <div><div className="n goldtext tnum">2%</div><div className="l">tax, handled</div></div>
            </div>
          </div>

          {/* sample board card */}
          <div className="card sample" aria-hidden="true">
            <div className="row head">
              <span>Item</span><span style={{ textAlign: "right" }}>Margin</span><span style={{ textAlign: "right" }}>ROI</span>
            </div>
            {sample.map((s) => (
              <div className="row" key={s.name}>
                <span className="item"><Coin width={16} height={16} style={{ color: "var(--gold)" }} /> {s.name}</span>
                <span className="tnum pos" style={{ textAlign: "right" }}>{s.margin}</span>
                <span className="tnum" style={{ textAlign: "right", color: "var(--muted)" }}>{s.roi}</span>
              </div>
            ))}
            <div className="row" style={{ justifyContent: "center", color: "var(--faint)", fontSize: ".8rem" }}>
              <span className="item" style={{ gridColumn: "1 / -1", justifyContent: "center" }}>…and 4,500 more, live</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container"><hr className="rule" /></div>

      {/* FEATURES */}
      <section>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Everything a flipper needs</p>
            <h2>Tools for the merch, not the grind</h2>
            <p>Free to use the board and charts. Pro adds the automation that saves you from refreshing all day.</p>
          </div>
          <div className="features">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div className="card feature" key={f.title}>
                  <div className="ico"><Icon /></div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  {f.tag ? <span className="tag">{f.tag}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>From the GE to your bank in three steps</h2>
          </div>
          <div className="steps">
            <div className="card step">
              <div className="num">1</div>
              <h3>We poll the Grand Exchange</h3>
              <p>Prices and trade volume pulled straight from the OSRS Wiki real-time feed every 60 seconds.</p>
            </div>
            <div className="card step">
              <div className="num">2</div>
              <h3>We do the tax math</h3>
              <p>Margins are computed after the 2% GE tax — rounded down, capped at 5m, exemptions included.</p>
            </div>
            <div className="card step">
              <div className="num">3</div>
              <h3>You flip the top row</h3>
              <p>Rank by margin, ROI or profit-per-limit, filter for liquidity, and go make some gp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TAX BAND */}
      <section>
        <div className="container">
          <div className="band">
            <div className="grid">
              <div>
                <p className="eyebrow">The 2% that trips everyone up</p>
                <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", margin: "0 0 .8rem" }}>
                  Real profit is <span className="goldtext">after</span> tax
                </h2>
                <p style={{ color: "var(--muted)", margin: 0 }}>
                  The Grand Exchange takes 2% of every sale (rounded down, none under 50 gp,
                  capped at 5,000,000 per item, with a fixed exempt list). We bake it into every
                  number — so the margin you see is the margin you keep.
                </p>
              </div>
              <div className="formula">
                margin&nbsp;&nbsp;&nbsp;= sell − buy − <b>tax(sell)</b><br />
                roi&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= margin ÷ buy<br />
                profit&nbsp;&nbsp;= margin × <b>buy&nbsp;limit</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", margin: "0 0 .8rem" }}>
            Your next flip is <span className="goldtext">one click</span> away
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: "46ch", margin: "0 auto 1.6rem" }}>
            No account needed to browse the board. Dive in.
          </p>
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-gold" href="/board">Open the flip board <ArrowRight /></Link>
            <Link className="btn btn-ghost" href="/pricing">Compare plans <Check /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
