import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ONE_YEAR = "public, max-age=31536000, immutable";
const cdn = (id: number) => `https://static.runelite.net/cache/item/icon/${id}.png`;

// Serves an item sprite stored in the DB as a base64 PNG (from the equipment
// ingest). Item icons never change, so it's cached hard. If we don't have the
// sprite (not equipment, or ingest hasn't run), we redirect to the CDN so the
// image still renders.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId < 0) {
    return new Response("bad id", { status: 400 });
  }

  let icon: string | null = null;
  try {
    const row = await prisma.equipmentStats.findUnique({ where: { itemId }, select: { icon: true } });
    icon = row?.icon ?? null;
  } catch {
    // DB unreachable — fall through to the CDN redirect.
  }

  if (!icon) return Response.redirect(cdn(itemId), 302);

  const body = Buffer.from(icon, "base64");
  return new Response(body, {
    headers: { "Content-Type": "image/png", "Cache-Control": ONE_YEAR },
  });
}
