import Link from "next/link";
import { Chart, ArrowRight } from "@/components/Icons";

// Per-item detail + price chart — public. Chart lands in M2.
export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <div className="container page-head">
        <p className="eyebrow"><Link href="/board">← Back to board</Link></p>
        <h1>Item #{id}</h1>
        <p>Price history and flip detail.</p>
      </div>

      <div className="container">
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <div className="ico" style={{ margin: "0 auto 1rem" }}><Chart /></div>
          <h3 style={{ fontFamily: "var(--font-sans)", margin: "0 0 .4rem" }}>Price chart coming soon</h3>
          <p style={{ color: "var(--muted)", margin: "0 0 1.4rem" }}>
            Per-item price history is on the way (milestone M2).
          </p>
          <Link className="btn btn-ghost" href="/board">Browse the board <ArrowRight /></Link>
        </div>
      </div>
    </main>
  );
}
