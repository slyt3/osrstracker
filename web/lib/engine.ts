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
    // The board is cached hard at the edge; keep it fresh-ish here.
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`engine /board: ${res.status}`);
  return res.json() as Promise<BoardResponse>;
}
