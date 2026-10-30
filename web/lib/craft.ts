import { prisma } from "@/lib/prisma";
import { getBoard } from "@/lib/engine";
import { geTax } from "@/lib/tax";

export interface CraftRow {
  recipeId: string;
  outputItemId: number;
  outputName: string;
  outputQty: number;
  method: string; // facility or variant subject
  members: boolean;
  cost: number; // buy all inputs (at the bid)
  revenue: number; // sell output (at the ask)
  tax: number; // GE tax on the sale
  profit: number; // revenue - tax - cost
  outputVolume: number; // output traded /h — proxy for how many people make/use it
  minInputVolume: number; // scarcest input's /h
  inputs: { itemId: number | null; name: string; qty: number }[];
}

// Joins recipes (DB) to live prices (engine board) and computes make-cost vs
// sell-after-tax. Only recipes whose output AND every input are priceable are
// returned. Null if the engine is unreachable.
export async function getCraftRows(): Promise<CraftRow[] | null> {
  let board;
  try {
    board = await getBoard();
  } catch {
    return null;
  }
  const price = new Map<number, { buy: number; sell: number; vol: number }>();
  for (const r of board.rows) price.set(r.itemId, { buy: r.buy, sell: r.sell, vol: r.hourlyVolume });

  const recipes = await prisma.recipe.findMany({ include: { materials: true } });
  const out: CraftRow[] = [];

  for (const rec of recipes) {
    if (rec.outputItemId == null) continue;
    if (rec.materials.length === 0) continue;
    const op = price.get(rec.outputItemId);
    if (!op || op.sell <= 0) continue;

    let cost = 0;
    let minVol = Infinity;
    let priceable = true;
    for (const m of rec.materials) {
      if (m.itemId == null) { priceable = false; break; }
      const mp = price.get(m.itemId);
      if (!mp || mp.buy <= 0) { priceable = false; break; }
      cost += m.qty * mp.buy;
      minVol = Math.min(minVol, mp.vol);
    }
    if (!priceable) continue;

    const revenue = rec.outputQty * op.sell;
    const tax = geTax(op.sell) * rec.outputQty;
    out.push({
      recipeId: rec.id,
      outputItemId: rec.outputItemId,
      outputName: rec.outputName,
      outputQty: rec.outputQty,
      method: rec.facilities || rec.subject || "",
      members: rec.members,
      cost,
      revenue,
      tax,
      profit: revenue - tax - cost,
      outputVolume: op.vol,
      minInputVolume: minVol === Infinity ? 0 : minVol,
      inputs: rec.materials.map((m) => ({ itemId: m.itemId, name: m.name, qty: m.qty })),
    });
  }

  out.sort((a, b) => b.profit - a.profit);
  return out;
}
