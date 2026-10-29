import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/user";

// DELETE /api/trades/:id -> remove one of the current user's trades
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const userId = await currentUserId();
  await prisma.trade.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
