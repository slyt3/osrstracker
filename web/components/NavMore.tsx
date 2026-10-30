"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/money", label: "Money makers" },
  { href: "/allocator", label: "Capital allocator" },
  { href: "/board", label: "Full board" },
  { href: "/items", label: "Items" },
  { href: "/craft", label: "Craft" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/journal", label: "Journal" },
  { href: "/pricing", label: "Pricing" },
];

// A small accessible "More" dropdown for secondary nav, so the bar stays light.
export default function NavMore() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="nav-more" ref={ref}>
      <button
        type="button"
        className="link nav-more-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        More
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={"caret" + (open ? " up" : "")}>
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="nav-more-menu" role="menu">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} role="menuitem" className="nav-more-item" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
