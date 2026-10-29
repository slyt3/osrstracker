import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId, ensureDevUser } from "@/lib/user";
import { geTax } from "@/lib/tax";
import { getTrades } from "@/lib/trades";

// GET /api/trades -> current user's trades (oldest first)
export async function GET() {
  return NextResponse.json({ trades: await getTrades() });
}

// POST /api/trades { itemId, side, qty, price } -> record a trade
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const itemId = Number(b?.itemId);
  const side = b?.side;
  const qty = Number(b?.qty);
  const price = Number(b?.price);

  if (!Number.isInteger(itemId) || itemId <= 0) return bad("invalid itemId");
  if (side !== "buy" && side !== "sell") return bad("side must be buy or sell");
  if (!Number.isInteger(qty) || qty <= 0) return bad("qty must be a positive integer");
  if (!Number.isInteger(price) || price < 0) return bad("price must be a non-negative integer");

  const tax = side === "sell" ? geTax(price) * qty : 0;

  await ensureDevUser();
  const userId = await currentUserId();
  const trade = await prisma.trade.create({ data: { userId, itemId, side, qty, price, tax } });
  return NextResponse.json({ ok: true, id: trade.id });
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
