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
  inputs: { itemId: number | null; name: string; qty: number; buy: number }[]; // buy = current unit price
  skills: { name: string; level: number }[]; // required skills + levels to make it
}

// Parse the wiki's raw skills array (shape varies) into {name, level}.
function parseSkills(json: string | null): { name: string; level: number }[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    const out: { name: string; level: number }[] = [];
    for (const el of arr) {
      if (el == null) continue;
      if (typeof el === "string") { out.push({ name: el, level: 0 }); continue; }
      if (Array.isArray(el)) { out.push({ name: String(el[0] ?? ""), level: Number(el[1]) || 0 }); continue; }
      const name = el.name ?? el.skill ?? el.Skill ?? "";
      const level = Number(el.level ?? el.lvl ?? el.Level ?? 0) || 0;
      if (name) out.push({ name: String(name), level });
    }
    return out;
  } catch {
    return [];
  }
}

// Joins recipes (DB) to live prices (engine board) and computes make-cost vs
// sell-after-tax. Only recipes whose output AND every input are priceable are
// returned. Null if the engine is unreachable.
type PriceMap = Map<number, { buy: number; sell: number; vol: number }>;
type RecipeWithMaterials = {
  id: string; outputItemId: number | null; outputName: string; outputQty: number;
  facilities: string | null; subject: string; members: boolean; skillsJson: string | null;
  materials: { itemId: number | null; name: string; qty: number }[];
};

function priceMap(board: { rows: { itemId: number; buy: number; sell: number; hourlyVolume: number }[] }): PriceMap {
  const price: PriceMap = new Map();
  for (const r of board.rows) price.set(r.itemId, { buy: r.buy, sell: r.sell, vol: r.hourlyVolume });
  return price;
}

// Compute one recipe's economics against live prices, or null if unpriceable.
function toCraftRow(rec: RecipeWithMaterials, price: PriceMap): CraftRow | null {
  if (rec.outputItemId == null || rec.materials.length === 0) return null;
  const op = price.get(rec.outputItemId);
  if (!op || op.sell <= 0) return null;

  let cost = 0;
  let minVol = Infinity;
  for (const m of rec.materials) {
    if (m.itemId == null) return null;
    const mp = price.get(m.itemId);
    if (!mp || mp.buy <= 0) return null;
    cost += m.qty * mp.buy;
    minVol = Math.min(minVol, mp.vol);
  }

  const revenue = rec.outputQty * op.sell;
  const tax = geTax(op.sell) * rec.outputQty;
  return {
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
    inputs: rec.materials.map((m) => ({
      itemId: m.itemId,
      name: m.name,
      qty: m.qty,
      buy: (m.itemId != null ? price.get(m.itemId)?.buy : 0) ?? 0,
    })),
    skills: parseSkills(rec.skillsJson),
  };
}

export async function getCraftRows(): Promise<CraftRow[] | null> {
  let board;
  try {
    board = await getBoard();
  } catch {
    return null;
  }
  const price = priceMap(board);
  const recipes = await prisma.recipe.findMany({ include: { materials: true } });
  const out = recipes.map((rec) => toCraftRow(rec, price)).filter((r): r is CraftRow => r !== null);
  out.sort((a, b) => b.profit - a.profit);
  return out;
}

/** Recipes that PRODUCE the given item (for the item page's "how to make it"). */
export async function getCraftRowsForItem(id: number): Promise<CraftRow[]> {
  let board;
  try {
    board = await getBoard();
  } catch {
    return [];
  }
  const price = priceMap(board);
  const recipes = await prisma.recipe.findMany({ where: { outputItemId: id }, include: { materials: true } });
  const out = recipes.map((rec) => toCraftRow(rec, price)).filter((r): r is CraftRow => r !== null);
  out.sort((a, b) => b.profit - a.profit);
  return out;
}
