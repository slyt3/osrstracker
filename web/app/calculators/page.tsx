import Calculators from "@/components/Calculators";

export const metadata = {
  title: "Calculators — OSRS Tracker",
  description: "Free OSRS Grand Exchange calculators: GE tax, flip profit after tax, and break-even sell price.",
};

export default function CalculatorsPage() {
  return (
    <main>
      <div className="container page-head">
        <h1>Calculators</h1>
        <p>The flip math, worked for you — every figure uses the real 2% GE tax.</p>
      </div>
      <div className="container">
        <Calculators />
      </div>
    </main>
  );
}
