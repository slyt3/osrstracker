// Small inline icon set (stroke-based, currentColor). Kept local so the brand
// isn't tied to an icon-font dependency.
import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const Coin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="12" rx="8" ry="8" />
    <path d="M12 7.5v9M9.5 9.5c0-1 1.1-1.6 2.5-1.6s2.5.7 2.5 1.7-1 1.5-2.5 1.6-2.5.6-2.5 1.6 1.1 1.7 2.5 1.7 2.5-.6 2.5-1.6" />
  </svg>
);

export const Chart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 19V5M4 19h16" />
    <path d="M7 15l3-4 3 2 4-6" />
  </svg>
);

export const Star = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.9 6.9 19.2l1-5.7-4.1-4 5.7-.8z" />
  </svg>
);

export const Bell = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const Scales = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3v18M7 21h10" />
    <path d="M5 7h14M5 7l-2.5 5a2.5 2.5 0 0 0 5 0L5 7zM19 7l-2.5 5a2.5 2.5 0 0 0 5 0L19 7z" />
  </svg>
);

export const Book = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
    <path d="M17 7h2v13H8" />
  </svg>
);

export const Bolt = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M13 3L5 13h6l-1 8 8-10h-6z" />
  </svg>
);

export const Check = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base({ width: 18, height: 18, ...p })}>
    <path d="M4 12l5 5L20 6" />
  </svg>
);

export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base({ width: 18, height: 18, ...p })}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
