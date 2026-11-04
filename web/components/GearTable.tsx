"use client";

import { useMemo, useState } from "react";
import SortTable, { type Col } from "@/components/SortTable";
import type { GearRow } from "@/lib/equipment";

// Sprites come from our own DB (the ingest stores each icon as base64) via a
// cached route; it redirects to the CDN for anything we don't have.
const icon = (id: number) => `/api/item-icon/${id}`;

// Slots in the order the in-game worn-equipment panel reads them.
const SLOT_ORDER = ["head", "cape", "neck", "ammo", "weapon", "2h", "body", "shield", "legs", "hands", "feet", "ring"];
const slotRank = (s: string) => { const k = SLOT_ORDER.indexOf(s); return k === -1 ? 99 : k; };
const slotLabel = (s: string) => (s === "2h" ? "2h weapon" : s.charAt(0).toUpperCase() + s.slice(1));

// Game-style signed bonus: +82, −6, or a quiet 0. Suffix lets magic damage read "+5%".
const bonus = (n: number, suffix = "") =>
  n === 0 ? <span className="gt-zero">0{suffix}</span> : <>{(n > 0 ? "+" : "−") + Math.abs(n) + suffix}</>;

type StatKey =
  | "aStab" | "aSlash" | "aCrush" | "aMagic" | "aRange"
  | "str" | "rStr" | "mDmg"
  | "dStab" | "dSlash" | "dCrush" | "dMagic" | "dRange"
  | "prayer" | "attackSpeed";

type Stat = { key: StatKey; label: string; title: string; suffix?: string };

// Every toggleable stat column, grouped the way the friend asked — attack
// bonuses by style, strength bonuses, defence bonuses, and the rest.
const GROUPS: { id: string; label: string; stats: Stat[] }[] = [
  { id: "attack", label: "Attack", stats: [
    { key: "aStab", label: "Stab", title: "Stab attack bonus" },
    { key: "aSlash", label: "Slash", title: "Slash attack bonus" },
    { key: "aCrush", label: "Crush", title: "Crush attack bonus" },
    { key: "aMagic", label: "Magic", title: "Magic attack bonus" },
    { key: "aRange", label: "Range", title: "Ranged attack bonus" },
  ] },
  { id: "strength", label: "Strength", stats: [
    { key: "str", label: "Str", title: "Melee strength bonus" },
    { key: "rStr", label: "Rng str", title: "Ranged strength bonus" },
    { key: "mDmg", label: "Mage dmg", title: "Magic damage bonus", suffix: "%" },
  ] },
  { id: "defence", label: "Defence", stats: [
    { key: "dStab", label: "D-stab", title: "Stab defence bonus" },
    { key: "dSlash", label: "D-slash", title: "Slash defence bonus" },
    { key: "dCrush", label: "D-crush", title: "Crush defence bonus" },
    { key: "dMagic", label: "D-mage", title: "Magic defence bonus" },
    { key: "dRange", label: "D-range", title: "Ranged defence bonus" },
  ] },
  { id: "other", label: "Other", stats: [
    { key: "prayer", label: "Prayer", title: "Prayer bonus" },
    { key: "attackSpeed", label: "Speed", title: "Attack speed in ticks (lower is faster) — weapons only" },
  ] },
];
const ALL_STATS = GROUPS.flatMap((g) => g.stats);

// Shown by default: attack + strength + prayer. Defence and speed start hidden.
const DEFAULT_ON = new Set<StatKey>(["aStab", "aSlash", "aCrush", "aMagic", "aRange", "str", "rStr", "mDmg", "prayer"]);

function statCol(s: Stat): Col<GearRow> {
  if (s.key === "attackSpeed") {
    return {
      key: s.key, label: s.label, title: s.title, num: true,
      // Non-weapons have no speed; keep them at the bottom whichever direction.
      sortVal: (r) => (r.attackSpeed == null ? Number.MAX_SAFE_INTEGER : r.attackSpeed),
      render: (r) => (r.attackSpeed == null ? <span className="gt-zero">—</span> : r.attackSpeed),
    };
  }
  return {
    key: s.key, label: s.label, title: s.title, num: true,
    sortVal: (r) => r[s.key] as number,
    render: (r) => bonus(r[s.key] as number, s.suffix),
  };
}

const nameCol: Col<GearRow> = {
  key: "name", label: "Item", title: "Sort by name",
  sortVal: (r) => r.name,
  render: (r) => (
    <span className="gt-item">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="gt-ic" src={icon(r.itemId)} alt="" loading="lazy" width={26} height={26} />
      {r.tradeable ? <a href={`/item/${r.itemId}`}>{r.name}</a> : <span>{r.name}</span>}
      {r.members ? <span className="mtag" title="Members only">P</span> : null}
    </span>
  ),
};

const slotCol: Col<GearRow> = {
  key: "slot", label: "Slot", title: "Sort by slot",
  sortVal: (r) => slotRank(r.slot),
  render: (r) => <span className="gt-slot">{slotLabel(r.slot)}</span>,
};

export default function GearTable({ rows }: { rows: GearRow[] }) {
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState("all");
  const [members, setMembers] = useState<"all" | "p2p" | "f2p">("all");
  const [shownStats, setShownStats] = useState<Set<StatKey>>(() => new Set(DEFAULT_ON));

  const slots = useMemo(
    () => Array.from(new Set(rows.map((r) => r.slot))).sort((a, b) => slotRank(a) - slotRank(b)),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (q === "" || r.name.toLowerCase().includes(q)) &&
        (slot === "all" || r.slot === slot) &&
        (members === "all" || (members === "p2p" ? r.members : !r.members)),
    );
  }, [rows, query, slot, members]);

  // Name and slot are always shown; the rest follow the checkboxes, in group order.
  const cols = useMemo(
    () => [nameCol, slotCol, ...ALL_STATS.filter((s) => shownStats.has(s.key)).map(statCol)],
    [shownStats],
  );

  const toggleStat = (k: StatKey) =>
    setShownStats((prev) => { const next = new Set(prev); next.has(k) ? next.delete(k) : next.add(k); return next; });
  const setGroup = (stats: Stat[], on: boolean) =>
    setShownStats((prev) => {
      const next = new Set(prev);
      for (const s of stats) { if (on) next.add(s.key); else next.delete(s.key); }
      return next;
    });

  return (
    <div>
      <div className="controls">
        <input type="search" placeholder="Search gear…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search gear by name" />
        <label>
          Slot
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            <option value="all">All slots</option>
            {slots.map((s) => <option key={s} value={s}>{slotLabel(s)}</option>)}
          </select>
        </label>
        <label>
          Members
          <select value={members} onChange={(e) => setMembers(e.target.value as "all" | "p2p" | "f2p")}>
            <option value="all">All</option>
            <option value="p2p">Members</option>
            <option value="f2p">F2P</option>
          </select>
        </label>
      </div>

      <fieldset className="gt-cols">
        <legend>Columns</legend>
        {GROUPS.map((g) => {
          const on = g.stats.filter((s) => shownStats.has(s.key)).length;
          const all = on === g.stats.length;
          return (
            <div key={g.id} className="gt-colgroup">
              <button
                type="button"
                className={"gt-grouptoggle" + (all ? " all" : on ? " some" : "")}
                aria-pressed={all}
                onClick={() => setGroup(g.stats, !all)}
                title={all ? `Hide all ${g.label.toLowerCase()} columns` : `Show all ${g.label.toLowerCase()} columns`}
              >
                {g.label} <span className="gt-count">{on}/{g.stats.length}</span>
              </button>
              <div className="gt-checks">
                {g.stats.map((s) => (
                  <label key={s.key} className="gt-check" title={s.title}>
                    <input type="checkbox" checked={shownStats.has(s.key)} onChange={() => toggleStat(s.key)} />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </fieldset>

      <p className="meta">
        Showing {Math.min(filtered.length, 400).toLocaleString("en-US")} of {filtered.length.toLocaleString("en-US")} items.
        Click any stat to rank by it — click again to flip the order.
      </p>

      <SortTable<GearRow>
        rows={filtered}
        cols={cols}
        rowKey={(r) => String(r.itemId)}
        initialKey="name"
        initialDir="asc"
        max={400}
      />
    </div>
  );
}
