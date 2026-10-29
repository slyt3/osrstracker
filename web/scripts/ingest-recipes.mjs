// Ingest OSRS production/crafting recipes from the Wiki's `recipe` bucket into
// Postgres (Recipe + RecipeMaterial). Wipe-and-reload — run periodically, since
// recipes change with game updates. Needs DATABASE_URL in the environment.
//
//   node scripts/ingest-recipes.mjs
//
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UA = "osrstracker/0.1 (recipe ingest; https://osrstracker.site)";
const WIKI = "https://oldschool.runescape.wiki/api.php";
const PRICES = "https://prices.runescape.wiki/api/v1/osrs/mapping";
const PAGE = 5000;

const toInt = (v, fallback = null) => {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
};

async function fetchJSON(url, label) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  return res.json();
}

async function loadItemIds() {
  const mapping = await fetchJSON(PRICES, "mapping");
  const byName = new Map();
  for (const m of mapping) if (m?.name) byName.set(m.name.toLowerCase(), m.id);
  return byName;
}

async function fetchRecipePage(offset) {
  const query =
    `bucket('recipe').select('page_name_sub','production_json')` +
    `.where('source_template','recipe').limit(${PAGE}).offset(${offset}).run()`;
  const url = `${WIKI}?action=bucket&format=json&query=${encodeURIComponent(query)}`;
  const data = await fetchJSON(url, `recipes offset ${offset}`);
  return data.bucket ?? [];
}

async function chunkedCreate(model, rows, size = 1000) {
  for (let i = 0; i < rows.length; i += size) {
    await model.createMany({ data: rows.slice(i, i + size) });
  }
}

async function main() {
  console.log("loading item id mapping…");
  const idByName = await loadItemIds();
  const idOf = (name) => (name ? idByName.get(name.toLowerCase()) ?? null : null);

  console.log("fetching recipes…");
  const recipes = [];
  const materials = [];
  let offset = 0, scanned = 0, skipped = 0;

  for (;;) {
    const page = await fetchRecipePage(offset);
    if (page.length === 0) break;
    for (const row of page) {
      scanned++;
      let p;
      try { p = JSON.parse(row.production_json); } catch { skipped++; continue; }
      const output = p?.output;
      if (!output || typeof output !== "object" || !output.name) { skipped++; continue; }

      const id = randomUUID();
      recipes.push({
        id,
        subject: row.page_name_sub ?? "",
        outputName: output.name,
        outputItemId: idOf(output.name),
        outputQty: toInt(output.quantity, 1),
        members: !!p.members,
        facilities: typeof p.facilities === "string" && p.facilities ? p.facilities : null,
        skillsJson: Array.isArray(p.skills) && p.skills.length ? JSON.stringify(p.skills) : null,
        ticks: toInt(p.ticks, null),
        raw: row.production_json,
      });
      for (const m of Array.isArray(p.materials) ? p.materials : []) {
        if (!m?.name) continue;
        materials.push({ id: randomUUID(), recipeId: id, name: m.name, itemId: idOf(m.name), qty: toInt(m.quantity, 1) });
      }
    }
    if (page.length < PAGE) break;
    offset += PAGE;
  }

  const resolved = recipes.filter((r) => r.outputItemId !== null).length;
  console.log(`scanned ${scanned}, keeping ${recipes.length} recipes (${skipped} skipped), ${materials.length} materials; ${resolved} outputs resolved to item ids`);

  console.log("reloading DB…");
  await prisma.$transaction([
    prisma.recipeMaterial.deleteMany({}),
    prisma.recipe.deleteMany({}),
  ]);
  await chunkedCreate(prisma.recipe, recipes);
  await chunkedCreate(prisma.recipeMaterial, materials);

  const [rc, mc] = await Promise.all([prisma.recipe.count(), prisma.recipeMaterial.count()]);
  console.log(`done: ${rc} recipes, ${mc} materials in DB`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
