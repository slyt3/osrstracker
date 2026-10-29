import type { Row } from "@/lib/engine";

// Below this hourly traded volume, a margin is unreliable: `high` and `low` are
// just the last insta-buy / insta-sell, which on thin items can be far apart and
// from very different times — so the spread (and thus the margin) may be stale.
export const LOW_VOLUME = 100;

export function isLowLiquidity(r: Pick<Row, "hourlyVolume">): boolean {
  return r.hourlyVolume < LOW_VOLUME;
}
