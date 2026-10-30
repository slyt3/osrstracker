"use client";

import { useEffect, useState } from "react";

const KEY = "cookie-consent";
const CLARITY_ID = "z5wa61ui2m";

// Loads Microsoft Clarity once, only after consent.
function loadClarity() {
  const w = window as unknown as { __clarityLoaded?: boolean };
  if (w.__clarityLoaded) return;
  w.__clarityLoaded = true;
  (function (c: Record<string, unknown>, l: Document, a: string, r: string, i: string) {
    c[a] = c[a] || function (...args: unknown[]) {
      ((c[a] as { q?: unknown[] }).q = (c[a] as { q?: unknown[] }).q || []).push(args);
    };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window as unknown as Record<string, unknown>, document, "clarity", "script", CLARITY_ID);
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem(KEY); } catch {}
    if (v === "accepted") { loadClarity(); return; }
    if (v === "declined") return;
    setOpen(true);
  }, []);

  const decide = (accepted: boolean) => {
    try { localStorage.setItem(KEY, accepted ? "accepted" : "declined"); } catch {}
    if (accepted) loadClarity();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="cc-overlay" role="dialog" aria-modal="true" aria-labelledby="cc-title">
      <div className="cc-modal">
        <h2 id="cc-title">Cookies</h2>
        <p>
          We use cookies for anonymous usage analytics (Microsoft Clarity) to see how the flip
          tools get used and make them better. No ads, and we never sell your data.
        </p>
        <div className="cc-actions">
          <button className="btn btn-gold" onClick={() => decide(true)}>Accept</button>
          <button className="btn btn-ghost" onClick={() => decide(false)}>Decline</button>
        </div>
      </div>
    </div>
  );
}
