import Link from "next/link";
import type { Row } from "@/lib/engine";

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const gp = (n: number) => {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + "b";
  if (a >= 1e6) return s + (a / 1e6).toFixed(2) + "m";
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + "k";
  return s + a;
};

// A ranked, icon-led list of flips for the Deals and Market pages.
export default function DealList({ title, note, rows }: { title: string; note: string; rows: Row[] }) {
  return (
    <section className="deal-col">
      <div className="deal-head">
        <h3>{title}</h3>
        <span>{note}</span>
      </div>
      <div className="ge-flips">
        {rows.map((r, i) => (
          <div className="ge-flip deal" key={r.itemId}>
            <span className="rank">{i + 1}</span>
            <span className="ic">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={icon(r.itemId)} alt={r.name} loading="lazy" /></span>
            <span>
              <Link href={`/item/${r.itemId}`} className="nm">{r.name}</Link>
              {r.members ? <span className="mtag" title="Members only">P</span> : null}
              <span className="sub">vol {gp(r.hourlyVolume)}/h</span>
            </span>
            <span className="fig"><span className="k">MARGIN</span><span className="v mg">+{gp(r.margin)}</span></span>
            <span className="fig roi"><span className="k">ROI</span><span className="v roi">{(r.roi * 100).toFixed(1)}%</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}
