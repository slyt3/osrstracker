// Load equipment bonuses for every player-equipable item into EquipmentStats,
// for the /gear comparison table. Source: osrsreboxed-db (the maintained fork
// of the defunct osrsbox-db) — items-complete.json, an object keyed by item id.
// Wipe-and-reload. Needs DATABASE_URL in the environment.
//
//   node scripts/ingest-equipment.mjs
//
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UA = "osrstracker/0.1 (equipment ingest; https://osrstracker.site)";
const SRC =
  "https://raw.githubusercontent.com/0xNeffarion/osrsreboxed-db/master/docs/items-complete.json";

const i = (v) => Math.round(Number(v) || 0);

async function main() {
  console.log("downloading items-complete.json (~48 MB)…");
  const res = await fetch(SRC, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const all = await res.json();
  const items = Array.isArray(all) ? all : Object.values(all);
  console.log(`parsed ${items.length} items; selecting equipable…`);

  const rows = [];
  for (const d of items) {
    const eq = d?.equipment;
    // Keep real, player-equipable gear only — skip notes, placeholders and the
    // duplicate id entries the db carries for charged/variant states.
    if (!d?.equipable_by_player || !eq || !eq.slot) continue;
    if (d.noted || d.placeholder || d.duplicate) continue;

    const w = d.weapon; // present only for weapons
    rows.push({
      itemId: d.id,
      name: d.name ?? `Item ${d.id}`,
      slot: eq.slot,
      members: !!d.members,
      tradeable: !!d.tradeable_on_ge,
      aStab: i(eq.attack_stab),
      aSlash: i(eq.attack_slash),
      aCrush: i(eq.attack_crush),
      aMagic: i(eq.attack_magic),
      aRange: i(eq.attack_ranged),
      dStab: i(eq.defence_stab),
      dSlash: i(eq.defence_slash),
      dCrush: i(eq.defence_crush),
      dMagic: i(eq.defence_magic),
      dRange: i(eq.defence_ranged),
      str: i(eq.melee_strength),
      rStr: i(eq.ranged_strength),
      mDmg: i(eq.magic_damage),
      prayer: i(eq.prayer),
      weaponType: w?.weapon_type ?? null,
      attackSpeed: w?.attack_speed != null ? i(w.attack_speed) : null,
      // The sprite ships in the dump as a base64 PNG — store it so we serve
      // icons from our own DB instead of hotlinking a CDN.
      icon: typeof d.icon === "string" && d.icon.length > 0 ? d.icon : null,
    });
  }

  console.log(`reloading DB (${rows.length} equipable items)…`);
  await prisma.equipmentStats.deleteMany({});
  for (let k = 0; k < rows.length; k += 1000) {
    await prisma.equipmentStats.createMany({ data: rows.slice(k, k + 1000), skipDuplicates: true });
  }
  console.log(`done: ${await prisma.equipmentStats.count()} items in DB`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
