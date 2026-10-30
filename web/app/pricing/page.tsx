import Link from "next/link";
import { Check } from "@/components/Icons";

export const metadata = {
  title: "Pricing — OSRS Tracker",
  description: "Free core forever. Pro adds alerts, the capital allocator and full analytics.",
};

const free = [
  "Full flip board — every filter & ranking toggle",
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
      <div className="container page-head">
        <h1>The data is free. Pay for the shortcuts.</h1>
        <p style={{ maxWidth: "54ch" }}>
          The flip board and charts stay free. Pro is the automation that saves you from
          watching prices all day.
        </p>
      </div>

      <div className="container" style={{ paddingTop: "1.5rem" }}>
        <div className="plans">
          <div className="card plan">
            <div className="ptop"><span className="tier">Free</span></div>
            <div className="price">0<small> gp forever</small></div>
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.94rem" }}>Everything you need to start flipping.</p>
            <ul>{free.map((f) => <li key={f}><Check /> {f}</li>)}</ul>
            <Link className="btn btn-ghost" href="/board" style={{ width: "100%", justifyContent: "center" }}>
              Open the board
            </Link>
          </div>

          <div className="card plan pro">
            <div className="ptop"><span className="tier">Pro</span><span className="rec">Early-bird soon</span></div>
            <div className="price">Soon<small> · pricing TBA</small></div>
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.94rem" }}>For the serious merchant.</p>
            <ul>{pro.map((f) => <li key={f}><Check /> {f}</li>)}</ul>
            <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} disabled>
              Coming soon
            </button>
          </div>
        </div>

        <p style={{ color: "var(--faint)", fontSize: "0.85rem", maxWidth: "62ch", margin: "2.4rem auto 0", textAlign: "center" }}>
          Price data comes from the community-run OSRS Wiki (CC BY-NC-SA). We charge for our
          computed value and convenience, never for the raw data.
        </p>
      </div>
    </main>
  );
}
