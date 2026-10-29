import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/user";

export interface Alert {
  id: string;
  itemId: number;
  kind: "margin" | "price" | "roi";
  op: string;
  threshold: number;
  active: boolean;
}

export const ALERT_KINDS = ["margin", "price", "roi"] as const;
export const ALERT_OPS = [">=", "<="] as const;

export async function getAlerts(): Promise<Alert[]> {
  const userId = await currentUserId();
  const rows = await prisma.alert.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return rows.map((r) => ({
    id: r.id,
    itemId: r.itemId,
    kind: r.kind,
    op: r.op,
    threshold: r.threshold,
    active: r.active,
  }));
}
