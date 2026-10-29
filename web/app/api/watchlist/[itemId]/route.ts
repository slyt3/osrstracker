import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/user";

// DELETE /api/watchlist/:itemId  -> remove (idempotent)
export async function DELETE(_req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId: raw } = await params;
  const itemId = Number(raw);
  if (!Number.isInteger(itemId)) {
    return NextResponse.json({ error: "invalid itemId" }, { status: 400 });
  }
  const userId = await currentUserId();
  await prisma.watchlistItem.deleteMany({ where: { userId, itemId } });
  return NextResponse.json({ ok: true });
}
