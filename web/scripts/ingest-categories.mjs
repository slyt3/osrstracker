// Assign a primary category to each GE item from the OSRS Wiki's category pages.
// Priority order: the first category (in CATEGORIES order) that contains an item
// wins, so an item in several categories gets the most specific/useful one.
// Wipe-and-reload. Needs DATABASE_URL in the environment.
//
//   node scripts/ingest-categories.mjs
//
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UA = "osrstracker/0.1 (category ingest; https://osrstracker.site)";
const WIKI = "https://oldschool.runescape.wiki/api.php";
const PRICES = "https://prices.runescape.wiki/api/v1/osrs/mapping";

// label -> Wiki category title. Ordered: specific first.
const CATEGORIES = [
  ["Fish", "Fish"],
  ["Food", "Food"],
  ["Potions", "Potions"],
  ["Herbs", "Herbs"],
  ["Seeds", "Seeds"],
  ["Logs", "Logs"],
  ["Ores", "Ores"],
  ["Bars", "Metal bars"],
  ["Runes", "Runes"],
  ["Ammunition", "Ammunition"],
  ["Arrows", "Arrows"],
  ["Bolts", "Bolts"],
  ["Gems", "Gems"],
  ["Helmets", "Helmets"],
  ["Platebodies", "Platebodies"],
  ["Platelegs", "Platelegs"],
  ["Shields", "Shields"],
  ["Capes", "Capes"],
  ["Amulets", "Amulets"],
  ["Rings", "Rings"],
  ["Gloves", "Gloves"],
  ["Boots", "Boots"],
  ["Bones", "Bones"],
];

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function categoryMembers(title) {
  const names = [];
  let cmcontinue = "";
  do {
    const u = new URL(WIKI);
    u.searchParams.set("action", "query");
    u.searchParams.set("list", "categorymembers");
    u.searchParams.set("cmtitle", `Category:${title}`);
    u.searchParams.set("cmtype", "page");
    u.searchParams.set("cmlimit", "500");
    u.searchParams.set("format", "json");
    if (cmcontinue) u.searchParams.set("cmcontinue", cmcontinue);
    const d = await fetchJSON(u.toString());
    for (const m of d?.query?.categorymembers ?? []) names.push(m.title);
    cmcontinue = d?.continue?.cmcontinue ?? "";
  } while (cmcontinue);
  return names;
}

async function main() {
  console.log("loading item id mapping…");
  const mapping = await fetchJSON(PRICES);
  const idByName = new Map();
  for (const m of mapping) if (m?.name) idByName.set(m.name.toLowerCase(), m.id);

  const assigned = new Map(); // itemId -> category (first wins)
  for (const [label, title] of CATEGORIES) {
    const names = await categoryMembers(title);
    let hits = 0;
    for (const name of names) {
      const id = idByName.get(name.toLowerCase());
      if (id != null && !assigned.has(id)) {
        assigned.set(id, label);
        hits++;
      }
    }
    console.log(`  ${label} (Category:${title}): ${names.length} members, ${hits} new items`);
  }

  const rows = [...assigned].map(([itemId, category]) => ({ itemId, category }));
  console.log(`reloading DB (${rows.length} items categorized)…`);
  await prisma.itemCategory.deleteMany({});
  for (let i = 0; i < rows.length; i += 1000) {
    await prisma.itemCategory.createMany({ data: rows.slice(i, i + 1000), skipDuplicates: true });
  }
  console.log(`done: ${await prisma.itemCategory.count()} items in DB`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
