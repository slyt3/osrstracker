// GE tax on a single item sold at `price`, mirroring the engine's flip.Tax:
// 2% rounded down, nothing under 50 gp, capped at 5,000,000 per item.
// (Exempt items aren't handled yet — ItemMeta isn't populated.)
export function geTax(price: number): number {
  if (price < 50) return 0;
  return Math.min(Math.floor(price * 0.02), 5_000_000);
}
