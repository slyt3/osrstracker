import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId, ensureDevUser } from "@/lib/user";

// GET /api/watchlist  -> { itemIds: number[] }
export async function GET() {
  const userId = await currentUserId();
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    select: { itemId: true },
  });
  return NextResponse.json({ itemIds: items.map((i) => i.itemId) });
}

// POST /api/watchlist  { itemId }  -> add (idempotent)
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const itemId = Number(body?.itemId);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "invalid itemId" }, { status: 400 });
  }
  await ensureDevUser(); // until auth lands, every write is owned by the dev user
  const userId = await currentUserId();
  await prisma.watchlistItem.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: {},
    create: { userId, itemId },
  });
  return NextResponse.json({ ok: true });
}
