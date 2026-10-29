import Link from "next/link";
import { getBoardRow, getTimeseries, TIMESTEPS, type Timestep } from "@/lib/engine";
import PriceChart from "@/components/PriceChart";
import AlertForm from "@/components/AlertForm";

export const revalidate = 60;

const full = (n: number) => n.toLocaleString("en-US");

export default async function ItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { id: idStr } = await params;
  const { range: rangeParam } = await searchParams;
  const id = Number(idStr);
  const range: Timestep = (TIMESTEPS as readonly string[]).includes(rangeParam ?? "")
    ? (rangeParam as Timestep)
    : "1h";

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <main>
        <div className="container page-head">
          <Link className="back" href="/board">← Back to board</Link>
          <h1 style={{ marginTop: "0.8rem" }}>Unknown item</h1>
        </div>
      </main>
    );
  }

  const [row, series] = await Promise.all([
    getBoardRow(id).catch(() => null),
    getTimeseries(id, range).catch(() => null),
  ]);

  const name = row?.name ?? `Item #${id}`;

  return (
    <main>
      <div className="container page-head">
        <Link className="back" href="/board">← Back to board</Link>
        <h1 style={{ marginTop: "0.8rem" }}>{name}</h1>
        <p>Grand Exchange price history.</p>
      </div>

      <div className="container">
        {row && (
          <div className="item-stats">
            <div className="s"><div className="l">Buy</div><div className="v">{full(row.buy)}</div></div>
            <div className="s"><div className="l">Sell</div><div className="v">{full(row.sell)}</div></div>
            <div className="s"><div className="l">Margin (after tax)</div>
              <div className={"v " + (row.margin > 0 ? "pos" : "neg")}>{full(row.margin)}</div></div>
            <div className="s"><div className="l">ROI</div><div className="v">{(row.roi * 100).toFixed(2)}%</div></div>
            <div className="s"><div className="l">Buy limit</div><div className="v">{row.buyLimit ? full(row.buyLimit) : "—"}</div></div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 0 1rem", flexWrap: "wrap", gap: "0.8rem" }}>
          <span className="eyebrow" style={{ margin: 0 }}>Price history</span>
          <div className="ranges">
            {TIMESTEPS.map((t) => (
              <Link key={t} href={`/item/${id}?range=${t}`} className={t === range ? "on" : ""}>{t}</Link>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem" }}>
          {series && series.points.length > 0 ? (
            <PriceChart points={series.points} />
          ) : (
            <p className="notice">Price history is unavailable right now. Try another range or come back shortly.</p>
          )}
        </div>

        <p className="eyebrow" style={{ margin: "2rem 0 0.8rem" }}>Set an alert</p>
        <AlertForm itemId={id} />
      </div>
    </main>
  );
}
