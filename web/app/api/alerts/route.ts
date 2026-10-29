import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId, ensureDevUser } from "@/lib/user";
import { getAlerts, ALERT_KINDS, ALERT_OPS } from "@/lib/alerts";

// GET /api/alerts -> current user's alerts
export async function GET() {
  return NextResponse.json({ alerts: await getAlerts() });
}

// POST /api/alerts { itemId, kind, op, threshold } -> create
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const itemId = Number(b?.itemId);
  const kind = b?.kind;
  const op = b?.op;
  const threshold = Number(b?.threshold);

  if (!Number.isInteger(itemId) || itemId <= 0) return bad("invalid itemId");
  if (!ALERT_KINDS.includes(kind)) return bad("invalid kind");
  if (!ALERT_OPS.includes(op)) return bad("invalid op");
  if (!Number.isFinite(threshold)) return bad("invalid threshold");

  await ensureDevUser();
  const userId = await currentUserId();
  const alert = await prisma.alert.create({
    data: { userId, itemId, kind, op, threshold, channel: "discord", active: true },
  });
  return NextResponse.json({ ok: true, id: alert.id });
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
