// Client for the Go engine's public API. Shapes mirror the Go structs; once
// codegen lands these import from contract/ instead of being declared here.

const ENGINE_URL = process.env.ENGINE_URL ?? "http://localhost:8080";

export interface Row {
  itemId: number;
  name: string;
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

export async function getBoard(): Promise<BoardResponse> {
  const res = await fetch(`${ENGINE_URL}/board`, {
    // Always fetch live; the engine already serves a cached, in-memory board.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`engine /board: ${res.status}`);
  return res.json() as Promise<BoardResponse>;
}

/** Top profitable, reasonably-liquid flips — for the landing hero. Cached 60s. */
export async function getTopFlips(n = 6): Promise<Row[]> {
  const res = await fetch(`${ENGINE_URL}/board`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`engine /board: ${res.status}`);
  const data = (await res.json()) as BoardResponse;
  return data.rows
    .filter((r) => r.margin > 0 && r.hourlyVolume > 500)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, n);
}
