import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/user";

// Server-side read of the current user's watchlist (item ids). Used by the
// board (to light up stars) and the watchlist page.
export async function getWatchlistIds(): Promise<number[]> {
  const userId = await currentUserId();
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    select: { itemId: true },
  });
  return items.map((i) => i.itemId);
}
