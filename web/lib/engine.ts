// Client for the Go engine's public API. Shapes mirror the Go structs; once
// codegen lands these import from contract/ instead of being declared here.

const ENGINE_URL = process.env.ENGINE_URL ?? "http://localhost:8080";

export interface Row {
  itemId: number;
  name: string;
  members: boolean;
  buy: number;
  sell: number;
  tax: number;
  margin: number;
  roi: number;
  buyLimit: number;
  profitLimit: number;
  hourlyVolume: number;
}

export interface BoardResponse {
  ts: number;
  rows: Row[];
}

export interface TimeseriesPoint {
  timestamp: number;
  avgHighPrice: number;
  avgLowPrice: number;
  highPriceVolume: number;
  lowPriceVolume: number;
}

export interface TimeseriesResponse {
  id: number;
  timestep: string;
  points: TimeseriesPoint[];
}

export const TIMESTEPS = ["5m", "1h", "6h", "24h"] as const;
export type Timestep = (typeof TIMESTEPS)[number];

/** Live board, uncached — for the board page. */
export async function getBoard(): Promise<BoardResponse> {
  const res = await fetch(`${ENGINE_URL}/board`, { cache: "no-store" });
  if (!res.ok) throw new Error(`engine /board: ${res.status}`);
  return res.json() as Promise<BoardResponse>;
}

/** Board cached 60s — for pages that only need a lookup (landing, item meta). */
async function getBoardCached(): Promise<BoardResponse> {
  const res = await fetch(`${ENGINE_URL}/board`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`engine /board: ${res.status}`);
  return res.json() as Promise<BoardResponse>;
}

/** Top profitable, reasonably-liquid flips — for the landing hero. */
export async function getTopFlips(n = 6): Promise<Row[]> {
  const data = await getBoardCached();
  return data.rows
    .filter((r) => r.margin > 0 && r.hourlyVolume > 500)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, n);
}

/** One item's current board row (name + prices), or null if not on the board. */
export async function getBoardRow(id: number): Promise<Row | null> {
  const data = await getBoardCached();
  return data.rows.find((r) => r.itemId === id) ?? null;
}

/** Price history for one item. Cached 60s (the engine also caches). */
export async function getTimeseries(id: number, timestep: Timestep): Promise<TimeseriesResponse> {
  const res = await fetch(`${ENGINE_URL}/timeseries/${id}?timestep=${timestep}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`engine /timeseries: ${res.status}`);
  return res.json() as Promise<TimeseriesResponse>;
}
