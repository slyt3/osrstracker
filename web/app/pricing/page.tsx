import Link from "next/link";
import { Check, ArrowRight } from "@/components/Icons";

export const metadata = {
  title: "Pricing — OSRS Tracker",
  description: "Free core forever. Pro adds alerts, the capital allocator and full analytics.",
};

const free = [
  "Full flip board with every filter & ranking toggle",
  "Per-item price charts",
  "Small watchlist",
  "Basic trade journal",
];

const pro = [
  "Everything in Free",
  "Alerts — email, Discord & push",
  "Capital allocator (flip for your bankroll)",
  "Unlimited watchlist",
  "Full P&L analytics & CSV export",
  "Faster board refresh",
];

export default function Pricing() {
  return (
    <main>
      <div className="container page-head" style={{ textAlign: "center" }}>
        <p className="eyebrow" style={{ marginInline: "auto" }}>Pricing</p>
        <h1>The data is free. Pay for the shortcuts.</h1>
        <p style={{ maxWidth: "52ch", margin: "0 auto" }}>
          The flip board and charts stay free forever. Pro is for the automation that
          saves you from watching prices all day.
        </p>
      </div>

      <div className="container" style={{ display: "flex", justifyContent: "center", paddingTop: "1.5rem" }}>
        <div className="plans">
          <div className="card plan">
            <span className="badge">Free</span>
            <div className="price">0<small> gp / forever</small></div>
            <p style={{ color: "var(--muted)", margin: 0 }}>Everything you need to start flipping.</p>
            <ul>
              {free.map((f) => <li key={f}><Check /> {f}</li>)}
            </ul>
            <Link className="btn btn-ghost" href="/board" style={{ width: "100%", justifyContent: "center" }}>
              Open the board <ArrowRight />
            </Link>
          </div>

          <div className="card plan pro">
            <span className="badge" style={{ color: "var(--gold-bright)", borderColor: "var(--gold-deep)" }}>Pro</span>
            <div className="price goldtext">Soon<small style={{ color: "var(--faint)" }}> · early-bird pricing</small></div>
            <p style={{ color: "var(--muted)", margin: 0 }}>For the serious merchant.</p>
            <ul>
              {pro.map((f) => <li key={f}><Check /> {f}</li>)}
            </ul>
            <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} disabled>
              Coming soon
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ textAlign: "center", marginTop: "2.4rem" }}>
        <p style={{ color: "var(--faint)", fontSize: ".85rem", maxWidth: "60ch", margin: "0 auto" }}>
          Price data comes from the community-run OSRS Wiki (CC BY-NC-SA). We charge for our
          computed value and convenience, never for the raw data.
        </p>
      </div>
    </main>
  );
}
