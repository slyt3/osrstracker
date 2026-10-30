"use client";

import { useState } from "react";
import { geTax } from "@/lib/tax";

const fmt = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString("en-US") : "—");

function Field({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label>
      {label}
      <input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
    </label>
  );
}

export default function Calculators() {
  // GE tax
  const [sale, setSale] = useState(1_000_000);
  const tax = geTax(sale);

  // flip profit
  const [buy, setBuy] = useState(1000);
  const [sell, setSell] = useState(1100);
  const [qty, setQty] = useState(1);
  const taxPer = geTax(sell);
  const marginPer = sell - buy - taxPer;
  const totalProfit = marginPer * qty;
  const roi = buy ? (marginPer / buy) * 100 : 0;

  // break-even sell price for a given buy price (smallest sell that nets >= 0 after tax)
  const [cost, setCost] = useState(1000);
  let be = Math.max(cost, Math.ceil(cost / 0.98));
  while (be - cost - geTax(be) < 0) be++;

  return (
    <div className="tools-grid">
      <div className="panel calc">
        <h3>GE Tax Calculator</h3>
        <p className="calc-note">2% of the sale, rounded down, nothing under 50&nbsp;gp, capped at 5m per item.</p>
        <div className="calc-fields">
          <Field label="Sale price (gp)" value={sale} onChange={setSale} />
        </div>
        <dl className="calc-out">
          <div><dt>Tax paid</dt><dd className="tnum neg">−{fmt(tax)}</dd></div>
          <div><dt>You receive</dt><dd className="tnum">{fmt(sale - tax)}</dd></div>
        </dl>
      </div>

      <div className="panel calc">
        <h3>Flip Profit Calculator</h3>
        <p className="calc-note">Margin after tax, per item and across the whole flip.</p>
        <div className="calc-fields three">
          <Field label="Buy (gp)" value={buy} onChange={setBuy} />
          <Field label="Sell (gp)" value={sell} onChange={setSell} />
          <Field label="Quantity" value={qty} onChange={setQty} />
        </div>
        <dl className="calc-out">
          <div><dt>Tax / item</dt><dd className="tnum neg">−{fmt(taxPer)}</dd></div>
          <div><dt>Margin / item</dt><dd className={"tnum " + (marginPer >= 0 ? "pos lit" : "neg")}>{marginPer >= 0 ? "+" : "−"}{fmt(Math.abs(marginPer))}</dd></div>
          <div><dt>ROI</dt><dd className="tnum" style={{ color: "var(--gold)" }}>{roi.toFixed(2)}%</dd></div>
          <div><dt>Total profit</dt><dd className={"tnum " + (totalProfit >= 0 ? "pos lit" : "neg")}>{totalProfit >= 0 ? "+" : "−"}{fmt(Math.abs(totalProfit))}</dd></div>
        </dl>
      </div>

      <div className="panel calc">
        <h3>Break-even Calculator</h3>
        <p className="calc-note">The lowest sell price that still breaks even after tax, for a given buy price.</p>
        <div className="calc-fields">
          <Field label="Buy price (gp)" value={cost} onChange={setCost} />
        </div>
        <dl className="calc-out">
          <div><dt>Break-even sell</dt><dd className="tnum">{fmt(be)}</dd></div>
          <div><dt>Tax at that price</dt><dd className="tnum neg">−{fmt(geTax(be))}</dd></div>
        </dl>
      </div>
    </div>
  );
}
