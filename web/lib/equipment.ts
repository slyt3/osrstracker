import { prisma } from "@/lib/prisma";

// One equipable item's full bonus set, for the /gear comparison table. Mirrors
// the EquipmentStats model; populated by scripts/ingest-equipment.mjs.
export type GearRow = {
  itemId: number;
  name: string;
  slot: string;
  members: boolean;
  tradeable: boolean;
  aStab: number;
  aSlash: number;
  aCrush: number;
  aMagic: number;
  aRange: number;
  dStab: number;
  dSlash: number;
  dCrush: number;
  dMagic: number;
  dRange: number;
  str: number;
  rStr: number;
  mDmg: number;
  prayer: number;
  weaponType: string | null;
  attackSpeed: number | null;
};

// All equipable items with their bonuses. The table does its own sorting and
// filtering client-side, so we hand it the whole set (ordered by name). The
// base64 `icon` is deliberately NOT selected here — it would bloat the payload
// by megabytes; sprites are fetched per-item via /api/item-icon/[id]. Returns
// null if the query fails (e.g. the ingest hasn't run / DB unreachable).
export async function getGearRows(): Promise<GearRow[] | null> {
  try {
    return await prisma.equipmentStats.findMany({
      orderBy: { name: "asc" },
      select: {
        itemId: true, name: true, slot: true, members: true, tradeable: true,
        aStab: true, aSlash: true, aCrush: true, aMagic: true, aRange: true,
        dStab: true, dSlash: true, dCrush: true, dMagic: true, dRange: true,
        str: true, rStr: true, mDmg: true, prayer: true,
        weaponType: true, attackSpeed: true,
      },
    });
  } catch {
    return null;
  }
}
