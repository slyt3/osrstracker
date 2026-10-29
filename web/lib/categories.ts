import { prisma } from "@/lib/prisma";

// itemId -> category label, for the board's category filter.
export async function getCategoryMap(): Promise<Record<number, string>> {
  const rows = await prisma.itemCategory.findMany();
  const map: Record<number, string> = {};
  for (const r of rows) map[r.itemId] = r.category;
  return map;
}
