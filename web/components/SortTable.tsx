"use client";

import { useMemo, useState, type ReactNode } from "react";

export type Col<T> = {
  key: string;
  label: string;
  num?: boolean;               // right-align + numeric sort, desc first
  opt?: boolean;               // col-opt (hidden on narrow screens)
  title?: string;
  sortVal?: (r: T) => number | string; // omit to make the column unsortable
  render: (r: T) => ReactNode;
};

// A generic click-to-sort table using the shared .board styling. Filtering is
// the caller's job (pass already-filtered rows); this owns sorting + render.
export default function SortTable<T>({
  rows,
  cols,
  rowKey,
  initialKey,
  initialDir = "desc",
  max = 200,
}: {
  rows: T[];
  cols: Col<T>[];
  rowKey: (r: T, i: number) => string;
  initialKey?: string;
  initialDir?: "asc" | "desc";
  max?: number;
}) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialKey);
  const [dir, setDir] = useState<"asc" | "desc">(initialDir);

  const sorted = useMemo(() => {
    const col = cols.find((c) => c.key === sortKey);
    if (!col?.sortVal) return rows.slice(0, max);
    const sv = col.sortVal;
    const out = [...rows].sort((a, b) => {
      const va = sv(a), vb = sv(b);
      if (typeof va === "number" && typeof vb === "number") return dir === "desc" ? vb - va : va - vb;
      return dir === "desc" ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });
    return out.slice(0, max);
  }, [rows, cols, sortKey, dir, max]);

  const click = (c: Col<T>) => {
    if (!c.sortVal) return;
    if (sortKey === c.key) setDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(c.key); setDir(c.num ? "desc" : "asc"); }
  };

  return (
    <div className="board-scroll">
      <table className="board">
        <thead>
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                title={c.title ?? (c.sortVal ? `Sort by ${c.label}` : undefined)}
                onClick={() => click(c)}
                className={[c.num ? "" : "left", c.opt ? "col-opt" : "", c.sortVal ? "sortable" : "", sortKey === c.key ? "active" : ""].join(" ").trim()}
                aria-sort={sortKey === c.key ? (dir === "desc" ? "descending" : "ascending") : undefined}
              >
                {c.label}{sortKey === c.key ? (dir === "desc" ? " ▼" : " ▲") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={rowKey(r, i)}>
              {cols.map((c) => (
                <td key={c.key} className={[c.num ? "tnum" : "left", c.opt ? "col-opt" : ""].join(" ").trim()}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
