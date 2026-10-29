import Link from "next/link";

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
        <Link className="back" href="/board">← Back to board</Link>
        <h1 style={{ marginTop: "0.8rem" }}>Item #{id}</h1>
        <p>Price history and flip detail.</p>
      </div>

      <div className="container">
        <div className="panel" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <p style={{ color: "var(--gold)", fontWeight: 600, margin: "0 0 0.4rem" }}>Price chart — coming soon</p>
          <p style={{ color: "var(--muted)", margin: "0 0 1.4rem" }}>Per-item price history is on the way (milestone M2).</p>
          <Link className="btn btn-ghost" href="/board">Browse the board</Link>
        </div>
      </div>
    </main>
  );
}
