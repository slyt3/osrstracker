// Per-item detail + price chart — public, no auth. Chart lands in M2.
export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Item #{id}</h1>
      <p>Price chart and detail coming in M2.</p>
    </main>
  );
}
