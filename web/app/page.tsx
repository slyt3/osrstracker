import Link from "next/link";
import { getLandingFeed } from "@/lib/engine";
import { Chart, Star, Coin, Scales, Book } from "@/components/Icons";

// GE-tracker-style data landing: hero + live ticker + ranked top flips with
// real OSRS item icons + feature grid. Real current numbers, revalidated 60s.
export const revalidate = 60;

function gp(n: number): string {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + a;
}
const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;

const FEATURES = [
  { Icon: Chart, title: "Flip board", tier: "Free", body: "Every item ranked by margin, ROI and profit-per-limit — all after the 2% tax." },
  { Icon: Star, title: "Price charts", tier: "Free", body: "Per-item history so you read the trend before committing gp." },
  { Icon: Coin, title: "Watchlist", tier: "Free", body: "Star the items you care about and keep them one glance away." },
  { Icon: Scales, title: "Capital allocator", tier: "Pro", body: "Tell it your bankroll; it suggests what to flip for the best return." },
  { Icon: Book, title: "Journal & P&L", tier: "Free", body: "Log real buys and sells and watch your profit add up over time." },
];

function GoldCoin({ className, size = 220 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="52" fill="#c8901f" />
      <circle cx="60" cy="60" r="52" stroke="#8a5f12" strokeWidth="3" />
      <circle cx="60" cy="60" r="43" fill="#ffc24a" />
      <circle cx="60" cy="60" r="43" stroke="#ffdd8a" strokeWidth="2" />
      <circle cx="60" cy="60" r="31" stroke="#b9811f" strokeWidth="2.5" fill="none" opacity="0.7" />
      {/* a small rune star struck in the face */}
      <path d="M60 40 L64 56 L80 60 L64 64 L60 80 L56 64 L40 60 L56 56 Z" fill="#8a5f12" opacity="0.85" />
      {/* sweeping shine */}
      <path className="shine" d="M34 30 L46 24 L74 86 L62 92 Z" fill="#fff6df" opacity="0.2" />
    </svg>
  );
}

export default async function Landing() {
  const feed = await getLandingFeed(16).catch(() => null);
  const rows = feed?.rows ?? [];
  const updated = feed ? new Date(feed.ts * 1000).toLocaleTimeString("en-GB", { hour12: false }) : null;
  const total = feed?.total ?? 0;
  const topFlips = rows.slice(0, 8);
  const ticker = rows.slice(0, 12);

  return (
    <main>
      {/* ---- hero ---- */}
      <section className="ge-hero">
        <div className="container ge-hero-grid">
          <div>
            <h1>
              The Grand Exchange, <span className="hl">after tax.</span>
            </h1>
            <p className="lead">
              A live OSRS flip tracker that nets the 2% GE tax and weights every margin by buy
              limit and real trade volume — so the profit you see is the profit you keep.
            </p>
            <div className="actions">
              <Link className="btn btn-gold" href="/board">Find flips now</Link>
              <Link className="btn btn-ghost" href="/pricing">Pricing</Link>
            </div>
            <div className="facts">
              <span><b>{total ? total.toLocaleString("en-US") : "4,500+"}</b> items tracked</span>
              <span>refresh <b>60s</b></span>
              <span>margins after <b>2%</b> tax</span>
              <span><b>no signup</b> to browse</span>
            </div>
          </div>
          <div className="ge-coins" aria-hidden="true">
            <GoldCoin className="ge-coin ge-coin--main" size={220} />
            <GoldCoin className="ge-coin ge-coin--s1" size={64} />
            <GoldCoin className="ge-coin ge-coin--s2" size={48} />
          </div>
        </div>
      </section>

      {/* ---- live ticker ---- */}
      <div className="ge-ticker" aria-label="Live top movers">
        <div className="ge-ticker-inner">
          {(ticker.length ? [...ticker, ...ticker] : []).map((r, i) => (
            <span className="ge-tick" key={`${r.itemId}-${i}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon(r.itemId)} alt="" loading="lazy" />
              <span className="nm">{r.name}</span>
              <span className="mg pos lit">+{gp(r.margin)}</span>
            </span>
          ))}
          {ticker.length === 0 && (
            <span className="ge-tick"><span className="nm">Feed warming up — live prices appear within a minute.</span></span>
          )}
        </div>
      </div>

      {/* ---- top flips ranked ---- */}
      <section className="ge-top">
        <div className="container">
          <div className="ge-top-head">
            <h2>Top flips right now</h2>
            <span className="sub">
              {updated ? `live · updated ${updated}` : "reconnecting…"} · after 2% tax
            </span>
          </div>
          <div className="ge-flips">
            {topFlips.length === 0 ? (
              <div className="ge-flip" style={{ gridTemplateColumns: "1fr" }}>
                <span className="nm" style={{ color: "var(--faint)" }}>Board is warming up — open it in a moment.</span>
              </div>
            ) : (
              topFlips.map((r, i) => (
                <div className="ge-flip" key={r.itemId}>
                  <span className="rank">{i + 1}</span>
                  <span className="ic">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={icon(r.itemId)} alt={r.name} loading="lazy" />
                  </span>
                  <span>
                    <Link href={`/item/${r.itemId}`} className="nm">{r.name}</Link>
                    {r.members ? <span className="mtag" title="Members only">P</span> : null}
                    <span className="sub">vol {gp(r.hourlyVolume)}/h</span>
                  </span>
                  <span className="fig buy">
                    <span className="k">BUY / SELL</span>
                    <span className="v">{gp(r.buy)} → {gp(r.sell)}</span>
                  </span>
                  <span className="fig">
                    <span className="k">MARGIN</span>
                    <span className="v mg">+{gp(r.margin)}</span>
                  </span>
                  <span className="fig roi">
                    <span className="k">ROI</span>
                    <span className="v roi">{(r.roi * 100).toFixed(1)}%</span>
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="ge-top-more">
            <Link className="btn btn-ghost" href="/board">View all flips →</Link>
          </div>
        </div>
      </section>

      {/* ---- feature grid ---- */}
      <section>
        <div className="container">
          <div className="section-head">
            <h2>Built for merching, not grinding</h2>
            <p>The board and charts are free. Pro adds the automation that saves you refreshing prices all day.</p>
          </div>
          <div className="ge-features">
            {FEATURES.map(({ Icon, title, body, tier }) => (
              <div className="ge-feat" key={title}>
                <span className="fi"><Icon width={22} height={22} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
                {tier === "Pro" ? <span className="tag">Pro</span> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- honest does / doesn't ---- */}
      <section>
        <div className="container">
          <div className="section-head">
            <h2>What it does, and what it doesn&apos;t</h2>
          </div>
          <div className="honest">
            <div className="hon-col does">
              <h3>What it does</h3>
              <ul>
                <li>Ranks every tradeable item by margin, ROI or profit-per-buy-limit.</li>
                <li>Subtracts the exact GE tax (2%, rounded down, 50gp floor, 5m cap) from every number.</li>
                <li>Flags thin, low-volume items so a stale spread doesn&apos;t look like free gp.</li>
                <li>Charts each item&apos;s price history, keeps a watchlist, and logs real P&amp;L.</li>
                <li>Pings Discord when an item hits your target — if you want it to.</li>
              </ul>
            </div>
            <div className="hon-col doesnt">
              <h3>What it doesn&apos;t</h3>
              <ul>
                <li>Promise profit. It shows the math; the flip is still yours to make.</li>
                <li>Invent prices. Numbers are the Wiki real-time feed, refreshed every 60 seconds.</li>
                <li>Auto-buy or touch your account. It reads public prices, nothing more.</li>
                <li>Hide the catches. Low liquidity, buy limits and tax are shown, not buried.</li>
                <li>Nag you to sign up. The board and charts are free and open.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- tax math ---- */}
      <section>
        <div className="container">
          <div className="panel tax">
            <div>
              <h2 style={{ fontSize: "clamp(1.5rem,2.8vw,2rem)" }}>The arithmetic, in the open</h2>
              <p style={{ color: "var(--muted)", margin: "0.7rem 0 0", maxWidth: "46ch" }}>
                The GE takes 2% of every sale — rounded down, nothing under 50 gp, capped at
                5,000,000 per item. It&apos;s in every number here. No asterisks.
              </p>
            </div>
            <div className="formula">
              margin = sell − buy − <b>tax(sell)</b>
              <br />
              roi&nbsp;&nbsp;&nbsp;= margin ÷ buy
              <br />
              /limit = margin × <b>buy&nbsp;limit</b>
            </div>
          </div>
        </div>
      </section>

      {/* ---- close ---- */}
      <section className="ge-close">
        <div className="container">
          <h2>Find your next flip in one click.</h2>
          <p>No signup, no card, no email. The numbers are live right now.</p>
          <Link className="btn btn-gold" href="/board">Open the flip board</Link>
        </div>
      </section>
    </main>
  );
}
