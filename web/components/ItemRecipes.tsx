import type { CraftRow } from "@/lib/craft";

const icon = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const signed = (n: number) => (n >= 0 ? "+" : "−") + fmt(Math.abs(n));

// "How to make it" — shown on an item page when the item is a crafting output.
export default function ItemRecipes({ rows }: { rows: CraftRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section style={{ marginTop: "2.4rem" }}>
      <h2 style={{ fontSize: "clamp(1.3rem,2.6vw,1.7rem)", marginBottom: "1rem" }}>How to make it</h2>
      <div className="irec-list">
        {rows.map((r) => (
          <div className="panel irec" key={r.recipeId}>
            <div className="irec-head">
              <span className="irec-method">{r.method || "Recipe"}</span>
              {r.outputQty > 1 && <span className="irec-qty">makes {r.outputQty}</span>}
              {r.skills.length > 0 && (
                <span className="cr-levels">{r.skills.map((s, k) => <span key={k} className="cr-lv">{s.name} {s.level || ""}</span>)}</span>
              )}
              {r.members ? <span className="mtag" title="Members only">P</span> : <span className="ftag" title="Free to play">F2P</span>}
            </div>

            <div className="cr-recipe" aria-label="Ingredients (click to check a price)">
              {r.inputs.map((i, k) =>
                i.itemId != null ? (
                  <a className="cr-ing" key={k} href={`/item/${i.itemId}`} title={`${i.qty}× ${i.name} — ${fmt(i.qty * i.buy)} gp now`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={icon(i.itemId)} alt="" loading="lazy" width={16} height={16} />
                    <span className="q">{i.qty}×</span> {i.name} <span className="px">{fmt(i.qty * i.buy)}</span>
                  </a>
                ) : (
                  <span className="cr-ing" key={k}><span className="q">{i.qty}×</span> {i.name}</span>
                ),
              )}
            </div>

            <div className="irec-figs">
              <span>Cost to make <b className="tnum">{fmt(r.cost)}</b></span>
              <span>Sell after tax <b className="tnum">{fmt(r.revenue - r.tax)}</b></span>
              <span>Profit <b className={"tnum " + (r.profit >= 0 ? "pos lit" : "neg")}>{signed(r.profit)}</b></span>
              <span>Sold / h <b className="tnum">{fmt(r.outputVolume)}</b></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
