import Link from "next/link";
import { getLandingFeed } from "@/lib/engine";

// The landing IS the product: a live, time-stamped flip terminal pulling real
// current numbers. Revalidated every 60s so the feed is never stale.
export const revalidate = 60;

// compact gp: 21,761,339 -> 21.76m. Matches the board's formatting.
function gp(n: number): string {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + a;
}
const vol = (n: number) =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + "m" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n);

export default async function Landing() {
  const feed = await getLandingFeed(10).catch(() => null);
  const rows = feed?.rows ?? [];
  const updated = feed
    ? new Date(feed.ts * 1000).toLocaleTimeString("en-GB", { hour12: false })
    : null;
  const total = feed?.total ?? 0;

  return (
    <main>
      {/* ---- live terminal hero ---- */}
      <section className="term">
        <div className="container">
          <div className="term-bar">
            <span className="term-live">
              <span className={"blip" + (feed ? "" : " off")} />
              {feed ? "LIVE" : "OFFLINE"}
            </span>
            <span className="term-path">grand&nbsp;exchange / flip&nbsp;feed</span>
            <span className="term-when">
              {updated ? `updated ${updated}` : "reconnecting…"}
              <span className="sep"> · </span>60s
            </span>
          </div>

          <div className="term-lede">
            <h1>
              Flips that survive <span className="hl">the 2% tax</span>.
            </h1>
            <p>
              Not a list of fat spreads that never fill. Every row below is live, already
              nets the Grand Exchange tax, and is weighted by buy limit and real trade volume.
              If a margin isn&apos;t actually yours to keep, it isn&apos;t here.
            </p>
            <div className="actions">
              <Link className="btn btn-gold" href="/board">Open the full board →</Link>
              <Link className="btn btn-ghost" href="/pricing">What it costs</Link>
            </div>
          </div>

          {/* real current top flips, dense */}
          <div className="board-scroll term-board">
            <table className="board">
              <thead>
                <tr>
                  <th className="left">Item</th>
                  <th>Buy</th>
                  <th>Sell</th>
                  <th>Tax</th>
                  <th>Margin</th>
                  <th>ROI</th>
                  <th className="col-opt">Vol/h</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="left term-warming" colSpan={7}>
                      Feed is warming up — the board populates within a minute of the engine starting.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.itemId}>
                      <td className="left">
                        <Link href={`/item/${r.itemId}`}>{r.name}</Link>
                        {r.members ? <span className="mtag" title="Members only">P</span> : null}
                      </td>
                      <td className="tnum">{gp(r.buy)}</td>
                      <td className="tnum">{gp(r.sell)}</td>
                      <td className="tnum" style={{ color: "var(--faint)" }}>−{gp(r.tax)}</td>
                      <td className="tnum pos lit">+{gp(r.margin)}</td>
                      <td className="tnum">{(r.roi * 100).toFixed(1)}%</td>
                      <td className="tnum col-opt">{vol(r.hourlyVolume)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="term-foot">
            Top {rows.length} by margin, right now · {total.toLocaleString("en-US")} items tracked ·
            sourced from the OSRS Wiki real-time prices · no account needed to browse
          </p>
        </div>
      </section>

      {/* ---- honest "what it is / isn't" — the anti-sales-pitch ---- */}
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

      {/* ---- the tax math, shown not claimed ---- */}
      <section>
        <div className="container">
          <div className="panel tax">
            <div>
              <h2 style={{ fontSize: "clamp(1.5rem,2.8vw,2rem)" }}>The arithmetic, chiselled in</h2>
              <p style={{ color: "var(--muted)", margin: "0.7rem 0 0", maxWidth: "46ch" }}>
                The GE takes 2% of every sale — rounded down, nothing under 50 gp, capped at
                5,000,000 per item, with a fixed exempt list. It&apos;s in every number on the
                board. No asterisks.
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

      {/* ---- terse close ---- */}
      <section>
        <div
          className="container"
          style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem" }}
        >
          <h2 style={{ fontSize: "clamp(1.6rem,3.4vw,2.3rem)", maxWidth: "20ch" }}>
            Open the board and check the math yourself.
          </h2>
          <p style={{ color: "var(--muted)", margin: "0.7rem 0 1.5rem" }}>
            No signup, no card, no email. The numbers are live right now.
          </p>
          <Link className="btn btn-gold" href="/board">Open the flip board →</Link>
        </div>
      </section>
    </main>
  );
}
